const express = require('express');
const mongoose = require('mongoose');
const Store = require('./store.model');
const SubscriptionPayment = require('./subscriptionPayment.model');
const Plan = require('../plans/plan.model');
const Products = require('../products/product.model');
const Order = require('../orders/order.model');
const User = require('../users/user.model');
const { verifyToken, requireRole } = require('../middleware/auth');
const { charge } = require('../utils/fakePayment');
const { slugify, escapeRegex, DAY, SUBSCRIPTION_DAYS, round2 } = require('../utils/helpers');
const router = express.Router();

const editableFields = ['name', 'tagline', 'description', 'category', 'logo', 'banner', 'themeColor', 'contactEmail', 'phone', 'city'];
const pick = (body) => Object.fromEntries(editableFields.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

const uniqueSlug = async (name) => {
    const base = slugify(name);
    let slug = base;
    let i = 2;
    while (await Store.exists({ slug })) slug = `${base}-${i++}`;
    return slug;
};

const vendorOnly = [verifyToken, requireRole('vendor', 'admin')];

const loadMyStore = async (req, res, next) => {
    const store = await Store.findOne({ owner: req.user._id }).populate('subscription.plan');
    if (!store) return res.status(404).send({ message: "You don't have a store yet" });
    req.store = store;
    next();
};

// ================= store owner =================

// open a store: pick a plan, pay the first month (fake), store goes to "pending"
router.post('/', verifyToken, async (req, res) => {
    if (await Store.exists({ owner: req.user._id })) {
        return res.status(400).send({ message: 'You already have a store in the mall' });
    }
    const { planId, card } = req.body;
    const data = pick(req.body);
    if (!data.name || data.name.trim().length < 2) return res.status(400).send({ message: 'Store name is required' });

    const plan = mongoose.isValidObjectId(planId) ? await Plan.findOne({ _id: planId, isActive: true }) : null;
    if (!plan) return res.status(400).send({ message: 'Please choose a valid plan' });

    const payment = await charge({ card, amount: plan.priceMonthly, description: `${plan.name} plan – first month` });
    if (!payment.success) return res.status(402).send({ message: payment.message });

    const now = new Date();
    const periodEnd = new Date(now.getTime() + SUBSCRIPTION_DAYS * DAY);
    const autoApprove = process.env.AUTO_APPROVE_STORES === 'true';

    const store = await Store.create({
        ...data,
        owner: req.user._id,
        slug: await uniqueSlug(data.name),
        contactEmail: data.contactEmail || req.user.email,
        status: autoApprove ? 'active' : 'pending',
        subscription: { plan: plan._id, currentPeriodEnd: periodEnd, startedAt: now },
    });

    await SubscriptionPayment.create({
        store: store._id, plan: plan._id, planName: plan.name, amount: plan.priceMonthly,
        periodStart: now, periodEnd, reference: payment.reference, cardLast4: payment.last4,
    });

    if (req.user.role === 'user') await User.updateOne({ _id: req.user._id }, { role: 'vendor' });

    res.status(201).send({
        message: autoApprove ? 'Your store is open!' : 'Payment received. Your store is waiting for approval by the mall.',
        store,
    });
});

// my store (with plan + usage)
router.get('/mine', ...vendorOnly, loadMyStore, async (req, res) => {
    const productCount = await Products.countDocuments({ store: req.store._id });
    res.send({
        store: req.store,
        productCount,
        subscriptionActive: req.store.isSubscriptionActive(),
        isOpen: req.store.isOpen(),
    });
});

// update my store details
router.patch('/mine', ...vendorOnly, loadMyStore, async (req, res) => {
    Object.assign(req.store, pick(req.body));
    await req.store.save();
    res.send({ message: 'Store updated', store: req.store });
});

// pay rent: renew the current plan or switch plan (fake payment)
router.post('/mine/subscription', ...vendorOnly, loadMyStore, async (req, res) => {
    const { planId, card } = req.body;
    const store = req.store;
    const currentPlanId = store.subscription.plan._id.toString();
    const targetId = planId || currentPlanId;

    const plan = mongoose.isValidObjectId(targetId) ? await Plan.findById(targetId) : null;
    if (!plan || (!plan.isActive && targetId !== currentPlanId)) {
        return res.status(400).send({ message: 'Please choose a valid plan' });
    }

    const productCount = await Products.countDocuments({ store: store._id });
    if (productCount > plan.productLimit) {
        return res.status(400).send({
            message: `The ${plan.name} plan allows ${plan.productLimit} products and you have ${productCount}. Remove some products first.`,
        });
    }

    const payment = await charge({ card, amount: plan.priceMonthly, description: `${plan.name} plan – monthly rent` });
    if (!payment.success) return res.status(402).send({ message: payment.message });

    const now = new Date();
    const isRenewal = targetId === currentPlanId;
    // Renewing adds 30 days to the end of the paid period; switching plan starts a fresh 30 days today.
    const start = isRenewal && store.subscription.currentPeriodEnd > now ? store.subscription.currentPeriodEnd : now;
    const periodEnd = new Date(start.getTime() + SUBSCRIPTION_DAYS * DAY);

    store.subscription.plan = plan._id;
    store.subscription.currentPeriodEnd = periodEnd;
    await store.save();

    await SubscriptionPayment.create({
        store: store._id, plan: plan._id, planName: plan.name, amount: plan.priceMonthly,
        periodStart: start, periodEnd, reference: payment.reference, cardLast4: payment.last4,
    });

    res.send({ message: isRenewal ? 'Rent paid. Thank you!' : `You're now on the ${plan.name} plan`, store: await store.populate('subscription.plan') });
});

// my rent receipts
router.get('/mine/payments', ...vendorOnly, loadMyStore, async (req, res) => {
    const payments = await SubscriptionPayment.find({ store: req.store._id }).sort({ createdAt: -1 });
    res.send(payments);
});

// dashboard numbers for the store owner
router.get('/mine/stats', ...vendorOnly, loadMyStore, async (req, res) => {
    const storeId = req.store._id;
    const since = new Date(Date.now() - 30 * DAY);

    const [productCount, lowStock, orderAgg, last30, recentOrders] = await Promise.all([
        Products.countDocuments({ store: storeId }),
        Products.countDocuments({ store: storeId, stock: { $lte: 3 } }),
        Order.aggregate([
            { $match: { store: storeId, status: { $ne: 'cancelled' } } },
            { $group: { _id: null, revenue: { $sum: '$subtotal' }, orders: { $sum: 1 } } },
        ]),
        Order.aggregate([
            { $match: { store: storeId, status: { $ne: 'cancelled' }, createdAt: { $gte: since } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$subtotal' }, orders: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]),
        Order.find({ store: storeId }).sort({ createdAt: -1 }).limit(5).populate('customer', 'username email'),
    ]);

    const pendingOrders = await Order.countDocuments({ store: storeId, status: { $in: ['paid', 'processing'] } });

    res.send({
        productCount,
        productLimit: req.store.subscription.plan.productLimit,
        lowStock,
        revenue: round2(orderAgg[0]?.revenue || 0),
        orders: orderAgg[0]?.orders || 0,
        pendingOrders,
        salesByDay: last30,
        recentOrders,
        subscriptionEnds: req.store.subscription.currentPeriodEnd,
        status: req.store.status,
    });
});

// ================= public (shoppers) =================

// all open stores in the mall
router.get('/', async (req, res) => {
    const { q, category, limit = 50 } = req.query;
    const filter = Store.openFilter();
    if (category && category !== 'all') filter.category = category.toLowerCase();
    if (q) filter.$or = [{ name: new RegExp(escapeRegex(q), 'i') }, { tagline: new RegExp(escapeRegex(q), 'i') }];

    const stores = await Store.find(filter)
        .select('name slug tagline logo banner category themeColor city createdAt')
        .sort({ createdAt: -1 })
        .limit(Math.min(parseInt(limit) || 50, 100))
        .lean();

    const counts = await Products.aggregate([
        { $match: { store: { $in: stores.map((s) => s._id) }, isActive: true } },
        { $group: { _id: '$store', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
    res.send(stores.map((s) => ({ ...s, productCount: countMap[s._id.toString()] || 0 })));
});

// store categories in use (for the store directory filter)
router.get('/categories', async (req, res) => {
    const categories = await Store.find(Store.openFilter()).distinct('category');
    res.send(categories.filter(Boolean).sort());
});

// one store's public profile
router.get('/:slug', async (req, res) => {
    const store = await Store.findOne({ slug: req.params.slug, ...Store.openFilter() })
        .select('name slug tagline description logo banner category themeColor contactEmail phone city createdAt');
    if (!store) return res.status(404).send({ message: 'This store is closed or does not exist' });
    res.send(store);
});

module.exports = router;

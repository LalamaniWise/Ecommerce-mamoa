const express = require('express');
const mongoose = require('mongoose');
const Store = require('../stores/store.model');
const SubscriptionPayment = require('../stores/subscriptionPayment.model');
const Products = require('../products/product.model');
const Order = require('../orders/order.model');
const User = require('../users/user.model');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { escapeRegex, round2, DAY, SUBSCRIPTION_DAYS } = require('../utils/helpers');
const router = express.Router();

// everything here is for the mall owner only
router.use(verifyToken, verifyAdmin);

// mall overview numbers
router.get('/stats', async (req, res) => {
    const now = new Date();
    const since = new Date(now.getTime() - 30 * DAY);

    const [storesByStatus, overdueStores, users, vendors, products, orderAgg, rentAgg, rent30, pendingStores] = await Promise.all([
        Store.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Store.countDocuments({ status: 'active', 'subscription.currentPeriodEnd': { $lte: now } }),
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ role: 'vendor' }),
        Products.countDocuments(),
        Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, sales: { $sum: '$total' }, orders: { $sum: 1 } } },
        ]),
        SubscriptionPayment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        SubscriptionPayment.aggregate([
            { $match: { status: 'paid', createdAt: { $gte: since } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Store.find({ status: 'pending' }).sort({ createdAt: 1 }).limit(5).populate('owner', 'username email').populate('subscription.plan', 'name'),
    ]);

    const byStatus = Object.fromEntries(storesByStatus.map((s) => [s._id, s.count]));
    res.send({
        stores: {
            active: byStatus.active || 0,
            pending: byStatus.pending || 0,
            suspended: byStatus.suspended || 0,
            rejected: byStatus.rejected || 0,
            overdue: overdueStores,
        },
        shoppers: users,
        vendors,
        products,
        orders: orderAgg[0]?.orders || 0,
        mallSales: round2(orderAgg[0]?.sales || 0),
        rentCollected: round2(rentAgg[0]?.total || 0),
        rentLast30Days: round2(rent30[0]?.total || 0),
        pendingStores,
    });
});

// all stores (any status)
router.get('/stores', async (req, res) => {
    const { status, q } = req.query;
    const filter = {};
    if (status === 'overdue') {
        filter.status = 'active';
        filter['subscription.currentPeriodEnd'] = { $lte: new Date() };
    } else if (status && status !== 'all') {
        filter.status = status;
    }
    if (q) filter.name = new RegExp(escapeRegex(q), 'i');

    const stores = await Store.find(filter)
        .sort({ createdAt: -1 })
        .populate('owner', 'username email')
        .populate('subscription.plan', 'name priceMonthly productLimit')
        .lean();

    const counts = await Products.aggregate([
        { $match: { store: { $in: stores.map((s) => s._id) } } },
        { $group: { _id: '$store', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
    res.send(stores.map((s) => ({ ...s, productCount: countMap[s._id.toString()] || 0 })));
});

// approve / suspend / reject a store
router.patch('/stores/:id/status', async (req, res) => {
    const { status, note } = req.body;
    if (!['active', 'suspended', 'rejected', 'pending'].includes(status)) {
        return res.status(400).send({ message: 'Invalid status' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).send({ message: 'Store not found' });
    const store = await Store.findByIdAndUpdate(req.params.id, { status, statusNote: note || '' }, { new: true });
    if (!store) return res.status(404).send({ message: 'Store not found' });
    res.send({ message: `Store is now ${status}`, store });
});

// give a store free days (e.g. a promotion or goodwill)
router.post('/stores/:id/extend', async (req, res) => {
    const days = Math.min(Math.max(parseInt(req.body.days) || SUBSCRIPTION_DAYS, 1), 365);
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).send({ message: 'Store not found' });
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).send({ message: 'Store not found' });
    const base = store.subscription.currentPeriodEnd > new Date() ? store.subscription.currentPeriodEnd : new Date();
    store.subscription.currentPeriodEnd = new Date(base.getTime() + days * DAY);
    await store.save();
    res.send({ message: `Added ${days} free days`, store });
});

// rent received from all stores
router.get('/payments', async (req, res) => {
    const payments = await SubscriptionPayment.find().sort({ createdAt: -1 }).limit(200).populate('store', 'name slug');
    res.send(payments);
});

module.exports = router;

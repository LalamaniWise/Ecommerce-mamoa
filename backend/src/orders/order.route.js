const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('./order.model');
const Products = require('../products/product.model');
const Store = require('../stores/store.model');
const { verifyToken, requireRole, verifyAdmin } = require('../middleware/auth');
const { charge } = require('../utils/fakePayment');
const { round2, VAT_RATE } = require('../utils/helpers');
const router = express.Router();

const makeNumber = () => 'MM-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();

// ================= shopper =================

// checkout: prices and stock are checked on the server, never trusted from the browser
router.post('/checkout', verifyToken, async (req, res) => {
    const { items, shippingAddress = {}, card } = req.body;

    if (!Array.isArray(items) || items.length === 0) return res.status(400).send({ message: 'Your cart is empty' });
    for (const field of ['fullName', 'phone', 'street', 'city', 'postalCode']) {
        if (!String(shippingAddress[field] || '').trim()) {
            return res.status(400).send({ message: 'Please complete your delivery address' });
        }
    }

    // merge duplicates and validate quantities
    const wanted = new Map();
    for (const it of items) {
        const qty = parseInt(it.quantity);
        if (!mongoose.isValidObjectId(it.productId) || !(qty >= 1 && qty <= 99)) {
            return res.status(400).send({ message: 'Invalid item in cart' });
        }
        wanted.set(it.productId, (wanted.get(it.productId) || 0) + qty);
    }

    const products = await Products.find({ _id: { $in: [...wanted.keys()] } }).populate('store');
    if (products.length !== wanted.size) {
        return res.status(400).send({ message: 'Some products in your cart no longer exist. Please refresh your cart.' });
    }

    const byStore = new Map();
    for (const p of products) {
        const qty = wanted.get(p._id.toString());
        if (!p.isActive || !p.store?.isOpen()) {
            return res.status(400).send({ message: `"${p.name}" is not available right now` });
        }
        if (p.stock < qty) {
            return res.status(400).send({ message: `Only ${p.stock} of "${p.name}" left in stock` });
        }
        const key = p.store._id.toString();
        if (!byStore.has(key)) byStore.set(key, []);
        byStore.get(key).push({ product: p._id, name: p.name, image: p.image, price: p.price, quantity: qty });
    }

    const groups = [...byStore.entries()].map(([storeId, lines]) => {
        const subtotal = round2(lines.reduce((s, l) => s + l.price * l.quantity, 0));
        const tax = round2(subtotal * VAT_RATE);
        return { storeId, lines, subtotal, tax, total: round2(subtotal + tax) };
    });
    const grandTotal = round2(groups.reduce((s, g) => s + g.total, 0));

    // reserve stock (atomic per product); roll back if anything fails
    const reserved = [];
    const releaseStock = () => Promise.all(reserved.map(([id, q]) => Products.updateOne({ _id: id }, { $inc: { stock: q } })));
    for (const [id, qty] of wanted) {
        const ok = await Products.findOneAndUpdate({ _id: id, stock: { $gte: qty } }, { $inc: { stock: -qty } });
        if (!ok) {
            await releaseStock();
            return res.status(409).send({ message: 'Stock changed while you were checking out. Please try again.' });
        }
        reserved.push([id, qty]);
    }

    const payment = await charge({ card, amount: grandTotal, description: 'Mall order' });
    if (!payment.success) {
        await releaseStock();
        return res.status(402).send({ message: payment.message });
    }

    const checkoutId = 'CO-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    const orders = await Order.insertMany(groups.map((g) => ({
        checkoutId,
        orderNumber: makeNumber(),
        customer: req.user._id,
        store: g.storeId,
        items: g.lines,
        subtotal: g.subtotal,
        tax: g.tax,
        total: g.total,
        status: 'paid',
        shippingAddress,
        payment: { method: 'fake-card', reference: payment.reference, cardLast4: payment.last4 },
        statusHistory: [{ status: 'paid' }],
    })));

    res.status(201).send({ message: 'Payment successful', checkoutId, total: grandTotal, reference: payment.reference, orders });
});

// my orders (shopper)
router.get('/mine', verifyToken, async (req, res) => {
    const orders = await Order.find({ customer: req.user._id })
        .sort({ createdAt: -1 })
        .populate('store', 'name slug logo');
    res.send(orders);
});

// one checkout's orders (order confirmation page)
router.get('/checkout/:checkoutId', verifyToken, async (req, res) => {
    const orders = await Order.find({ checkoutId: req.params.checkoutId, customer: req.user._id }).populate('store', 'name slug');
    if (!orders.length) return res.status(404).send({ message: 'Order not found' });
    res.send(orders);
});

// ================= store owner =================

router.get('/store', verifyToken, requireRole('vendor', 'admin'), async (req, res) => {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).send({ message: "You don't have a store yet" });
    const filter = { store: store._id };
    if (req.query.status && Order.STATUSES.includes(req.query.status)) filter.status = req.query.status;
    const orders = await Order.find(filter).sort({ createdAt: -1 }).populate('customer', 'username email');
    res.send(orders);
});

// store owner (or mall admin) moves an order along
const allowedNext = {
    paid: ['processing', 'shipped', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
};

router.patch('/:id/status', verifyToken, requireRole('vendor', 'admin'), async (req, res) => {
    const { status } = req.body;
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).send({ message: 'Order not found' });
    const order = await Order.findById(req.params.id).populate('store', 'owner');
    if (!order) return res.status(404).send({ message: 'Order not found' });

    const isOwner = order.store.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') return res.status(403).send({ message: 'This order belongs to another store' });

    if (!allowedNext[order.status]?.includes(status)) {
        return res.status(400).send({ message: `An order that is "${order.status}" can't be marked "${status}"` });
    }

    // put stock back when an order is cancelled (a real gateway would also refund here)
    if (status === 'cancelled') {
        await Promise.all(order.items.map((i) => Products.updateOne({ _id: i.product }, { $inc: { stock: i.quantity } })));
    }

    order.status = status;
    order.statusHistory.push({ status });
    await order.save();
    res.send({ message: `Order marked ${status}`, order });
});

// ================= mall admin =================

router.get('/', verifyToken, verifyAdmin, async (req, res) => {
    const filter = {};
    if (req.query.status && Order.STATUSES.includes(req.query.status)) filter.status = req.query.status;
    if (req.query.store && mongoose.isValidObjectId(req.query.store)) filter.store = req.query.store;
    const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .limit(200)
        .populate('customer', 'username email')
        .populate('store', 'name slug');
    res.send(orders);
});

module.exports = router;

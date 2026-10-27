const express = require('express');
const Plan = require('./plan.model');
const Store = require('../stores/store.model');
const { verifyToken, verifyAdmin, optionalAuth } = require('../middleware/auth');
const { slugify } = require('../utils/helpers');
const router = express.Router();

// public: plans shown on the "Open your store" pricing page
// (admins also see inactive plans)
router.get('/', optionalAuth, async (req, res) => {
    const filter = req.user?.role === 'admin' && req.query.all === 'true' ? {} : { isActive: true };
    const plans = await Plan.find(filter).sort({ sortOrder: 1, priceMonthly: 1 });
    res.send(plans);
});

const pickPlan = (body) => {
    const data = {};
    for (const key of ['name', 'description', 'priceMonthly', 'productLimit', 'features', 'highlighted', 'isActive', 'sortOrder']) {
        if (body[key] !== undefined) data[key] = body[key];
    }
    if (typeof data.features === 'string') {
        data.features = data.features.split('\n').map((f) => f.trim()).filter(Boolean);
    }
    return data;
};

router.post('/', verifyToken, verifyAdmin, async (req, res) => {
    const data = pickPlan(req.body);
    if (!data.name || data.priceMonthly === undefined || !data.productLimit) {
        return res.status(400).send({ message: 'Name, monthly price and product limit are required' });
    }
    data.slug = slugify(data.name);
    if (await Plan.exists({ slug: data.slug })) data.slug += '-' + Date.now().toString(36);
    const plan = await Plan.create(data);
    res.status(201).send(plan);
});

router.patch('/:id', verifyToken, verifyAdmin, async (req, res) => {
    const plan = await Plan.findByIdAndUpdate(req.params.id, pickPlan(req.body), { new: true, runValidators: true });
    if (!plan) return res.status(404).send({ message: 'Plan not found' });
    res.send(plan);
});

router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
    const inUse = await Store.countDocuments({ 'subscription.plan': req.params.id });
    if (inUse > 0) {
        return res.status(400).send({ message: `${inUse} store(s) use this plan. Deactivate it instead.` });
    }
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).send({ message: 'Plan not found' });
    res.send({ message: 'Plan deleted' });
});

module.exports = router;

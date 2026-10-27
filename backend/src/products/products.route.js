const express = require('express');
const mongoose = require('mongoose');
const Products = require('./product.model');
const Reviews = require('../Reviews/reviews.model');
const Store = require('../stores/store.model');
const { verifyToken, requireRole } = require('../middleware/auth');
const { escapeRegex } = require('../utils/helpers');
const router = express.Router();

const productFields = ['name', 'category', 'description', 'price', 'oldPrice', 'image', 'images', 'color', 'stock', 'isActive'];
const pick = (body) => Object.fromEntries(productFields.filter((k) => body[k] !== undefined && body[k] !== '').map((k) => [k, body[k]]));

const vendorOnly = [verifyToken, requireRole('vendor', 'admin')];

// Finds the product and checks the logged-in user may change it
// (the store owner, or the mall admin).
const loadOwnedProduct = async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).send({ message: 'Product not found' });
    const product = await Products.findById(req.params.id).populate('store', 'owner');
    if (!product) return res.status(404).send({ message: 'Product not found' });
    const isOwner = product.store?.owner?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
        return res.status(403).send({ message: 'This product belongs to another store' });
    }
    req.product = product;
    next();
};

// ================= public (shoppers) =================

// get all the products in the mall (only from open stores)
router.get('/', async (req, res) => {
    const { category, color, minPrice, maxPrice, q, store, sort, page = 1, limit = 12 } = req.query;

    const openStoreIds = await Store.openStoreIds();
    const filter = { isActive: true, store: { $in: openStoreIds } };

    if (store) {
        const s = mongoose.isValidObjectId(store)
            ? openStoreIds.find((id) => id.toString() === store)
            : (await Store.findOne({ slug: store, ...Store.openFilter() }).select('_id'))?._id;
        filter.store = s || null; // unknown or closed store -> no products
    }
    if (category && category !== 'all') filter.category = category.toLowerCase();
    if (color && color !== 'all') filter.color = color.toLowerCase();

    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min) || !isNaN(max)) {
        filter.price = {};
        if (!isNaN(min)) filter.price.$gte = min;
        if (!isNaN(max) && isFinite(max)) filter.price.$lte = max;
    }
    if (q) {
        const rx = new RegExp(escapeRegex(q), 'i');
        filter.$or = [{ name: rx }, { description: rx }, { category: rx }];
    }

    const sorts = {
        newest: { createdAt: -1 },
        'price-asc': { price: 1 },
        'price-desc': { price: -1 },
        rating: { rating: -1, reviewCount: -1 },
    };

    const perPage = Math.min(Math.max(parseInt(limit) || 12, 1), 60);
    const currentPage = Math.max(parseInt(page) || 1, 1);
    const totalProducts = await Products.countDocuments(filter);
    const products = await Products.find(filter)
        .sort(sorts[sort] || sorts.newest)
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .populate('store', 'name slug logo');

    res.status(200).send({ products, totalPages: Math.ceil(totalProducts / perPage), totalProducts });
});

// categories and colours in use (for the shop filters)
router.get('/meta/filters', async (req, res) => {
    const filter = { isActive: true, store: { $in: await Store.openStoreIds() } };
    const [categories, colors] = await Promise.all([
        Products.distinct('category', filter),
        Products.distinct('color', filter),
    ]);
    res.send({ categories: categories.filter(Boolean).sort(), colors: colors.filter(Boolean).sort() });
});

// ================= store owner =================

// my store's products (including hidden ones)
router.get('/mine/list', ...vendorOnly, async (req, res) => {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) return res.status(404).send({ message: "You don't have a store yet" });
    const products = await Products.find({ store: store._id }).sort({ createdAt: -1 });
    res.send(products);
});

// post a product
router.post('/create-product', ...vendorOnly, async (req, res) => {
    const store = await Store.findOne({ owner: req.user._id }).populate('subscription.plan');
    if (!store) return res.status(400).send({ message: 'Open a store before adding products' });
    if (['suspended', 'rejected'].includes(store.status)) {
        return res.status(403).send({ message: 'Your store is suspended. Contact the mall.' });
    }
    if (!store.isSubscriptionActive()) {
        return res.status(402).send({ message: 'Your rent is overdue. Pay your subscription to add products.' });
    }
    const count = await Products.countDocuments({ store: store._id });
    if (count >= store.subscription.plan.productLimit) {
        return res.status(403).send({
            message: `Your ${store.subscription.plan.name} plan allows ${store.subscription.plan.productLimit} products. Upgrade to add more.`,
        });
    }

    const data = pick(req.body);
    if (!data.name || data.price === undefined) return res.status(400).send({ message: 'Name and price are required' });

    const product = await Products.create({ ...data, store: store._id, author: req.user._id });
    res.status(201).send(product);
});

// update a product
router.patch('/update-product/:id', ...vendorOnly, loadOwnedProduct, async (req, res) => {
    Object.assign(req.product, pick(req.body));
    if (req.body.oldPrice === '' || req.body.oldPrice === null) req.product.oldPrice = undefined;
    await req.product.save();
    res.status(200).send({ message: 'Product updated successfully', product: req.product });
});

// delete a product
router.delete('/:id', ...vendorOnly, loadOwnedProduct, async (req, res) => {
    await req.product.deleteOne();
    await Reviews.deleteMany({ productId: req.product._id });
    res.status(200).send({ message: 'Product deleted successfully' });
});

// ================= public, by id (keep these last) =================

// get related products (same store first, then same category)
router.get('/related/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.send([]);
    const product = await Products.findById(req.params.id);
    if (!product) return res.status(404).send({ message: 'Product not found' });

    const openStoreIds = await Store.openStoreIds();
    const words = product.name.split(/\s+/).filter((w) => w.length > 2).map(escapeRegex);
    const or = [{ category: product.category }, { store: product.store }];
    if (words.length) or.push({ name: new RegExp(words.join('|'), 'i') });

    const related = await Products.find({
        _id: { $ne: product._id },
        isActive: true,
        store: { $in: openStoreIds },
        $or: or,
    }).limit(4).populate('store', 'name slug');
    res.status(200).send(related);
});

// get single product with reviews
router.get('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).send({ message: 'Product not found' });
    const product = await Products.findById(req.params.id).populate('store', 'name slug logo status subscription themeColor');
    if (!product || !product.store) return res.status(404).send({ message: 'Product not found' });

    const storeOpen = product.store.status === 'active' && product.store.subscription?.currentPeriodEnd > new Date();
    if (!storeOpen || !product.isActive) {
        return res.status(404).send({ message: 'This product is not available right now' });
    }
    const reviews = await Reviews.find({ productId: product._id }).sort({ createdAt: -1 }).populate('userId', 'username profileImage');

    const out = product.toObject();
    out.store = { _id: product.store._id, name: product.store.name, slug: product.store.slug, logo: product.store.logo };
    res.status(200).send({ product: out, reviews });
});

module.exports = router;

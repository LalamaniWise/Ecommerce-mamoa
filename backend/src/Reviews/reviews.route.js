const express = require('express');
const mongoose = require('mongoose');
const Reviews = require('./reviews.model');
const Products = require('../products/product.model');
const { verifyToken } = require('../middleware/auth');
const { round2 } = require('../utils/helpers');
const router = express.Router();

// post (or update) a review
router.post('/', verifyToken, async (req, res) => {
    const { productId, rating, comment } = req.body;
    const r = Number(rating);
    if (!mongoose.isValidObjectId(productId) || !(r >= 1 && r <= 5) || !comment?.trim()) {
        return res.status(400).send({ message: 'Please give a rating from 1 to 5 and a comment' });
    }
    const product = await Products.findById(productId);
    if (!product) return res.status(404).send({ message: 'Product not found' });

    const review = await Reviews.findOneAndUpdate(
        { userId: req.user._id, productId },
        { rating: r, comment: comment.trim() },
        { upsert: true, new: true, runValidators: true },
    );

    const [agg] = await Reviews.aggregate([
        { $match: { productId: product._id } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    product.rating = round2(agg?.avg || 0);
    product.reviewCount = agg?.count || 0;
    await product.save();

    res.status(201).send({ message: 'Thanks for your review!', review });
});

module.exports = router;

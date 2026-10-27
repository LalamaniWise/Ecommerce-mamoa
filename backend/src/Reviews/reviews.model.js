const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    comment: { type: String, required: true, maxlength: 1000 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true });

// one review per shopper per product (posting again updates it)
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Reviews = mongoose.model('Review', ReviewSchema);

module.exports = Reviews;

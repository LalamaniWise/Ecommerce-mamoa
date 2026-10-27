const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true, lowercase: true },
    description: String,
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0 },
    image: String,
    images: [String],
    color: { type: String, trim: true, lowercase: true },
    stock: { type: Number, default: 10, min: 0 },
    isActive: { type: Boolean, default: true }, // store owner can hide a product
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

ProductSchema.index({ name: 'text', description: 'text' });

const Products = mongoose.model('Product', ProductSchema);

module.exports = Products;

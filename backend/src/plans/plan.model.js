const mongoose = require('mongoose');

// A rental plan for a space in the mall (monthly subscription).
const PlanSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    priceMonthly: { type: Number, required: true, min: 0 },
    productLimit: { type: Number, required: true, min: 1 },
    features: [String],
    highlighted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Plan', PlanSchema);

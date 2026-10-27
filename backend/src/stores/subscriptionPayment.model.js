const mongoose = require('mongoose');

// Receipt for each month of rent a store owner pays the mall.
const SubscriptionPaymentSchema = new mongoose.Schema({
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    planName: String,
    amount: { type: Number, required: true },
    periodStart: Date,
    periodEnd: Date,
    reference: String,
    cardLast4: String,
    status: { type: String, enum: ['paid', 'failed'], default: 'paid' },
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionPayment', SubscriptionPaymentSchema);

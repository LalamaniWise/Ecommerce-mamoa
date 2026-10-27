const mongoose = require('mongoose');

// A shop that a business person rents inside the mall.
//   status       – set by the mall admin: pending -> active, or suspended / rejected
//   subscription – the monthly rent; the store is only visible to shoppers
//                  while status is "active" AND the subscription is paid up
const StoreSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, index: true },
    tagline: { type: String, maxlength: 120 },
    description: { type: String, maxlength: 2000 },
    category: { type: String, trim: true, lowercase: true },
    logo: String,
    banner: String,
    themeColor: { type: String, default: '#ed3849' },
    contactEmail: String,
    phone: String,
    city: String,

    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'rejected'],
        default: 'pending',
    },
    statusNote: String, // reason shown to the store owner when suspended/rejected

    subscription: {
        plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
        currentPeriodEnd: { type: Date, required: true },
        startedAt: { type: Date, default: Date.now },
    },
}, { timestamps: true });

StoreSchema.methods.isSubscriptionActive = function () {
    return !!this.subscription?.currentPeriodEnd && this.subscription.currentPeriodEnd > new Date();
};

// visible to shoppers?
StoreSchema.methods.isOpen = function () {
    return this.status === 'active' && this.isSubscriptionActive();
};

// filter for stores visible to shoppers
StoreSchema.statics.openFilter = () => ({
    status: 'active',
    'subscription.currentPeriodEnd': { $gt: new Date() },
});

StoreSchema.statics.openStoreIds = function () {
    return this.find(this.openFilter()).distinct('_id');
};

module.exports = mongoose.model('Store', StoreSchema);

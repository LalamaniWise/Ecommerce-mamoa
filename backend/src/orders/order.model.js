const mongoose = require('mongoose');

// One checkout can contain products from several stores.
// We save one Order per store (sharing the same checkoutId), so each
// store owner sees and ships only their own part of the purchase.
const OrderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    price: Number,
    quantity: { type: Number, min: 1 },
}, { _id: false });

const ORDER_STATUSES = ['paid', 'processing', 'shipped', 'delivered', 'cancelled'];

const OrderSchema = new mongoose.Schema({
    checkoutId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    items: [OrderItemSchema],
    subtotal: Number,
    tax: Number,
    total: Number,
    status: { type: String, enum: ORDER_STATUSES, default: 'paid' },
    shippingAddress: {
        fullName: String,
        phone: String,
        street: String,
        city: String,
        province: String,
        postalCode: String,
    },
    payment: {
        method: { type: String, default: 'fake-card' },
        reference: String,
        cardLast4: String,
    },
    statusHistory: [{ status: String, at: { type: Date, default: Date.now } }],
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);
Order.STATUSES = ORDER_STATUSES;
module.exports = Order;

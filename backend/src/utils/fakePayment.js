// FAKE payment gateway for development.
// It never stores card numbers; it only keeps the last 4 digits for receipts.
// Swap this file for PayFast / Paystack / Stripe when you go live —
// the routes only call charge() and read { success, reference, last4, message }.
//
// Test cards:
//   4242 4242 4242 4242  -> approved
//   4000 0000 0000 0002  -> declined
//   any other 12–19 digit number -> approved

const crypto = require('crypto');

const charge = async ({ card = {}, amount, description }) => {
    const number = String(card.number || '').replace(/\D/g, '');

    if (number.length < 12 || number.length > 19) {
        return { success: false, message: 'Enter a valid card number' };
    }
    if (!/^\d{2}\s*\/\s*\d{2}$/.test(String(card.expiry || ''))) {
        return { success: false, message: 'Enter the expiry date as MM/YY' };
    }
    if (!/^\d{3,4}$/.test(String(card.cvc || ''))) {
        return { success: false, message: 'Enter a valid CVC' };
    }
    if (!(amount >= 0)) {
        return { success: false, message: 'Invalid amount' };
    }
    if (number.endsWith('0002')) {
        return { success: false, message: 'Card declined (test card)' };
    }

    // simulate the gateway round-trip
    await new Promise((r) => setTimeout(r, 300));

    return {
        success: true,
        reference: 'FAKE-' + crypto.randomBytes(5).toString('hex').toUpperCase(),
        last4: number.slice(-4),
        amount,
        description,
    };
};

module.exports = { charge };

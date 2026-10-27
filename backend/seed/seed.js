// Fills the database with demo data: rental plans, the mall admin,
// a shopper, three open stores with products and one store waiting for approval.
//
//   npm run seed           -> adds anything missing (safe to run again)
//   npm run seed -- --reset -> WIPES users, stores, products, orders, plans first
//
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../src/users/user.model');
const Plan = require('../src/plans/plan.model');
const Store = require('../src/stores/store.model');
const SubscriptionPayment = require('../src/stores/subscriptionPayment.model');
const Products = require('../src/products/product.model');
const Order = require('../src/orders/order.model');
const Reviews = require('../src/Reviews/reviews.model');
const sample = require('./sampleProducts.json');
const { DAY, SUBSCRIPTION_DAYS } = require('../src/utils/helpers');

const PLANS = [
    {
        name: 'Starter', slug: 'starter', priceMonthly: 199, productLimit: 20, sortOrder: 1,
        description: 'Perfect for trying out the mall',
        features: ['Up to 20 products', 'Your own store page', 'Order management', 'Email support'],
    },
    {
        name: 'Business', slug: 'business', priceMonthly: 499, productLimit: 100, sortOrder: 2, highlighted: true,
        description: 'For growing shops',
        features: ['Up to 100 products', 'Your own store page', 'Order management', 'Sales dashboard', 'Featured on the mall home page'],
    },
    {
        name: 'Premium', slug: 'premium', priceMonthly: 999, productLimit: 500, sortOrder: 3,
        description: 'For established brands',
        features: ['Up to 500 products', 'Everything in Business', 'Priority support', 'Homepage banner slot'],
    },
];

const STORES = [
    {
        owner: { username: 'Thandi Mokoena', email: 'thandi@mamoa.co.za' },
        plan: 'business',
        store: {
            name: 'Mamoa Skincare', category: 'cosmetics', city: 'Pretoria', themeColor: '#ed3849',
            tagline: 'Natural skincare made in Atteridgeville',
            description: 'Lipsticks, foundations and skincare for every South African skin tone.',
            banner: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600&q=80&auto=format&fit=crop',
            logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80&auto=format&fit=crop',
        },
        categories: ['cosmetics'],
    },
    {
        owner: { username: 'Lerato Dlamini', email: 'lerato@mamoa.co.za' },
        plan: 'starter',
        store: {
            name: 'Kasi Couture', category: 'fashion', city: 'Johannesburg', themeColor: '#7c3aed',
            tagline: 'Dresses and outfits for every occasion',
            description: 'Locally designed evening wear, cocktail dresses and everyday pieces.',
            banner: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80&auto=format&fit=crop',
            logo: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&q=80&auto=format&fit=crop',
        },
        categories: ['dress'],
    },
    {
        owner: { username: 'Sipho Ndlovu', email: 'sipho@mamoa.co.za' },
        plan: 'premium',
        store: {
            name: 'Gold & Glow', category: 'jewellery', city: 'Durban', themeColor: '#b45309',
            tagline: 'Jewellery and accessories that shine',
            description: 'Necklaces, earrings, handbags and sunglasses.',
            banner: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80&auto=format&fit=crop',
            logo: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&q=80&auto=format&fit=crop',
        },
        categories: ['jewellery', 'accessories'],
    },
];

const PENDING_STORE = {
    owner: { username: 'Kabelo Mahlangu', email: 'kabelo@mamoa.co.za' },
    plan: 'starter',
    store: { name: 'Mzansi Sneakers', category: 'shoes', city: 'Pretoria', tagline: 'Fresh kicks, fair prices' },
};

const DEMO_PASSWORD = 'Password123!';

async function upsertUser({ username, email }, role, password = DEMO_PASSWORD) {
    let user = await User.findOne({ email });
    if (!user) {
        user = new User({ username, email, password, role });
        await user.save();
        console.log(`  + ${role.padEnd(6)} ${email}`);
    }
    return user;
}

async function upsertStore(def, plans, status) {
    const owner = await upsertUser(def.owner, 'vendor');
    let store = await Store.findOne({ owner: owner._id });
    if (store) return store;

    const plan = plans[def.plan];
    const now = new Date();
    const periodEnd = new Date(now.getTime() + SUBSCRIPTION_DAYS * DAY);
    store = await Store.create({
        ...def.store,
        owner: owner._id,
        slug: def.store.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        contactEmail: owner.email,
        status,
        subscription: { plan: plan._id, currentPeriodEnd: periodEnd, startedAt: now },
    });
    await SubscriptionPayment.create({
        store: store._id, plan: plan._id, planName: plan.name, amount: plan.priceMonthly,
        periodStart: now, periodEnd, reference: 'SEED-' + store.slug.toUpperCase(), cardLast4: '4242',
    });
    console.log(`  + store  ${store.name} (${status}, ${plan.name})`);

    for (const p of sample.filter((s) => def.categories.includes(s.category))) {
        await Products.create({
            name: p.name, category: p.category, description: p.description,
            price: p.price * 10, // sample prices are in dollars; make them sensible Rand amounts
            oldPrice: p.oldPrice ? p.oldPrice * 10 : undefined,
            image: p.image, color: p.color, stock: 25,
            store: store._id, author: owner._id,
        });
    }
    return store;
}

async function main() {
    if (!process.env.DB_URL) throw new Error('DB_URL is missing in backend/.env');
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to MongoDB');

    if (process.argv.includes('--reset')) {
        await Promise.all([User, Plan, Store, SubscriptionPayment, Products, Order, Reviews].map((m) => m.deleteMany({})));
        console.log('Database cleared');
    }

    const plans = {};
    for (const { slug, ...rest } of PLANS) {
        plans[slug] = await Plan.findOneAndUpdate({ slug }, { $setOnInsert: rest }, { upsert: true, new: true });
    }
    console.log('Plans ready: ' + Object.values(plans).map((p) => `${p.name} R${p.priceMonthly}`).join(', '));

    await upsertUser(
        { username: 'Mall Admin', email: process.env.SEED_ADMIN_EMAIL || 'admin@mamoa.co.za' },
        'admin',
        process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
    );
    await upsertUser({ username: 'Demo Shopper', email: 'shopper@mamoa.co.za' }, 'user');

    for (const def of STORES) await upsertStore(def, plans, 'active');
    await upsertStore(PENDING_STORE, plans, 'pending');

    console.log('\nDone. Log in with:');
    console.log(`  Mall admin : ${process.env.SEED_ADMIN_EMAIL || 'admin@mamoa.co.za'} / ${process.env.SEED_ADMIN_PASSWORD || 'Admin123!'}`);
    console.log(`  Store owner: thandi@mamoa.co.za / ${DEMO_PASSWORD}`);
    console.log(`  Shopper    : shopper@mamoa.co.za / ${DEMO_PASSWORD}`);
    await mongoose.disconnect();
}

main().catch(async (err) => {
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
});

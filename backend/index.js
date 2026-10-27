require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 3000;

// middleware setup
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());
app.use(cors({
    origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','),
    credentials: true,
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// all routes
app.use('/api/auth', require('./src/users/user.route'));
app.use('/api/plans', require('./src/plans/plan.route'));
app.use('/api/stores', require('./src/stores/store.route'));
app.use('/api/products', require('./src/products/products.route'));
app.use('/api/reviews', require('./src/Reviews/reviews.route'));
app.use('/api/orders', require('./src/orders/order.route'));
app.use('/api/uploads', require('./src/uploads/upload.route'));
app.use('/api/admin', require('./src/admin/admin.route'));

app.get('/', (req, res) => {
    res.send('Mamoa Mall API is running');
});

// unknown API route
app.use('/api', (req, res) => res.status(404).send({ message: 'Not found' }));

// any error thrown in a route ends up here (Express 5 forwards async errors)
app.use((err, req, res, next) => {
    if (err?.name === 'ValidationError') {
        return res.status(400).send({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
    }
    if (err?.code === 11000) {
        return res.status(409).send({ message: 'That already exists' });
    }
    console.error(err);
    res.status(500).send({ message: 'Something went wrong on the server' });
});

async function main() {
    if (!process.env.DB_URL) {
        console.error('DB_URL is missing. Copy backend/.env.example to backend/.env and fill it in.');
        process.exit(1);
    }
    await mongoose.connect(process.env.DB_URL);
    console.log('Mongodb is successfully connected');
    app.listen(port, () => console.log(`Mamoa Mall API listening on http://localhost:${port}`));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

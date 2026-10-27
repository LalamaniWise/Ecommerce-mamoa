const jwt = require('jsonwebtoken');
const User = require('../users/user.model');

const getSecret = () => {
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) throw new Error('JWT_SECRET_KEY is not set in .env');
    return secret;
};

// Creates a login token. Role is read fresh from the database on every request,
// so a customer who opens a store becomes a vendor without logging in again.
const generateToken = (userId) =>
    jwt.sign({ userId: userId.toString() }, getSecret(), { expiresIn: '7d' });

const readToken = (req) => {
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) return header.slice(7);
    return req.cookies?.token || null;
};

// Requires a logged-in user. Sets req.user.
const verifyToken = async (req, res, next) => {
    try {
        const token = readToken(req);
        if (!token) return res.status(401).send({ message: 'Please log in' });

        const decoded = jwt.verify(token, getSecret());
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) return res.status(401).send({ message: 'Account no longer exists' });

        req.user = user;
        req.userId = user._id;
        req.role = user.role;
        next();
    } catch (error) {
        return res.status(401).send({ message: 'Your session has expired, please log in again' });
    }
};

// Sets req.user when a valid token is present, but never blocks the request.
const optionalAuth = async (req, res, next) => {
    const token = readToken(req);
    if (!token) return next();
    try {
        const decoded = jwt.verify(token, getSecret());
        req.user = await User.findById(decoded.userId).select('-password');
    } catch (_) { /* ignore bad tokens on public routes */ }
    next();
};

// Usage: requireRole('admin') or requireRole('vendor', 'admin'). Must run after verifyToken.
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).send({ message: 'You are not authorized to perform this action' });
    }
    next();
};

const verifyAdmin = requireRole('admin');

module.exports = { generateToken, verifyToken, optionalAuth, requireRole, verifyAdmin };

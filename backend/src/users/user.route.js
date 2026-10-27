const express = require('express');
const User = require('./user.model');
const Store = require('../stores/store.model');
const { generateToken, verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

// register endpoint (every new account starts as a shopper)
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).send({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
        return res.status(400).send({ message: 'Password must be at least 6 characters' });
    }
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).send({ message: 'An account with this email already exists' });

    const user = new User({ email, username, password });
    await user.save();
    res.status(201).send({ message: 'User registration successfully' });
});

// login user end point
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).send({ message: 'Invalid email or password' });
    }
    const token = generateToken(user._id);
    res.cookie('token', token, cookieOptions);

    const store = user.role === 'vendor' ? await Store.findOne({ owner: user._id }).select('_id name slug status') : null;
    res.status(200).send({ message: 'logged in successfully', token, user: user.toPublic(), store });
});

// logout endpoint
router.post('/logout', (req, res) => {
    res.clearCookie('token', cookieOptions);
    res.status(200).send({ message: 'Logged out successfully' });
});

// the logged-in user (used to refresh role after opening a store)
router.get('/me', verifyToken, async (req, res) => {
    const store = await Store.findOne({ owner: req.user._id }).select('_id name slug status');
    res.send({ user: req.user.toPublic(), store });
});

// edit or update own profile
router.patch('/edit-profile', verifyToken, async (req, res) => {
    const user = await User.findById(req.user._id);
    const { username, profileImage, bio, profession, phone } = req.body;
    if (username !== undefined) user.username = username;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (bio !== undefined) user.bio = bio;
    if (profession !== undefined) user.profession = profession;
    if (phone !== undefined) user.phone = phone;
    await user.save();
    res.status(200).send({ message: 'Profile updated successfully', user: user.toPublic() });
});

// ---------- mall admin only ----------

// get all users
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
    const { role, q } = req.query;
    const filter = {};
    if (role && User.ROLES.includes(role)) filter.role = role;
    if (q) filter.$or = [{ email: new RegExp(escapeRegex(q), 'i') }, { username: new RegExp(escapeRegex(q), 'i') }];
    const users = await User.find(filter, 'username email role createdAt').sort({ createdAt: -1 });
    res.status(200).send(users);
});

// update user role
router.put('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
    const { role } = req.body;
    if (!User.ROLES.includes(role)) return res.status(400).send({ message: 'Invalid role' });
    if (req.params.id === req.user._id.toString() && role !== 'admin') {
        return res.status(400).send({ message: "You can't remove your own admin access" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('username email role');
    if (!user) return res.status(404).send({ message: 'User not found' });
    res.status(200).send({ message: 'User role updated successfully', user });
});

// delete a user
router.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
    if (req.params.id === req.user._id.toString()) {
        return res.status(400).send({ message: "You can't delete your own account here" });
    }
    const hasStore = await Store.exists({ owner: req.params.id });
    if (hasStore) return res.status(400).send({ message: 'This user owns a store. Suspend the store instead.' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send({ message: 'User not found' });
    res.status(200).send({ message: 'User deleted successfully' });
});

function escapeRegex(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

module.exports = router;

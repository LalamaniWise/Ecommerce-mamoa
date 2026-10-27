const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

// Roles:
//   user   – a shopper (default)
//   vendor – a business person who rents a store in the mall
//   admin  – the mall owner who manages stores, plans and users
const ROLES = ['user', 'vendor', 'admin'];

const userSchema = new Schema({
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ROLES, default: 'user' },
    profileImage: String,
    bio: { type: String, maxlength: 200 },
    profession: String,
    phone: String,
}, { timestamps: true });

// hashing password
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// match passwords
userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// what we send to the browser (never the password)
userSchema.methods.toPublic = function () {
    return {
        _id: this._id,
        email: this.email,
        username: this.username,
        role: this.role,
        profileImage: this.profileImage,
        bio: this.bio,
        profession: this.profession,
        phone: this.phone,
        createdAt: this.createdAt,
    };
};

const User = model('User', userSchema);
User.ROLES = ROLES;
module.exports = User;

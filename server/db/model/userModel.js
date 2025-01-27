const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        match: [/^([a-z0-9_\.-]+\@[a-z0-9\.-]+\.[a-z]{2,4})$/, 'Please provide a valid email address'],
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'user'],
        default: 'user', // Default to user for regular users
    },
    isFirstLogin: { type: Boolean, default: true },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

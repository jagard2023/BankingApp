const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'A user must have an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'A user must have a password'],
        select: false
    },
    balance: {
        type: Number,
        default: 0
    },
    accountNumber: {
        type: String,
        unique: true
    }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);

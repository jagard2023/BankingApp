require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

const User = require('../models/User');
const jwt = require('jsonwebtoken');

//Account creation (Sign up)
exports.signup = async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token, newUser });
    } catch (error) {
        res.status(400).json({ error });
    }
};

//Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({ message: 'Incorrect email or password' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(400).json({ error });
    }
};

//Logout
exports.logout = (req, res) => {
    // Implementation depends on how you handle JWT (httpOnly cookie vs. localStorage)
    // For cookies:
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ message: 'Logged out' });
};


//Deposit money
exports.deposit = async (req, res) => {
    try {
        const userId = req.user.id; 
        const amount = req.body.amount;

        if (amount <= 0) {
            return res.status(400).json({ msg: 'Amount should be positive' });
        }
        
        const user = await User.findById(userId);
        user.balance += amount;
        
        await user.save({ validateBeforeSave: false });

        res.status(200).json({ balance: user.balance });
    } catch (error) {
        res.status(400).json({ error });
    }
};


//Withdraw money
exports.withdraw = async (req, res) => {
    try {
        const userId = req.user.id; 
        const amount = req.body.amount;

        if (amount <= 0) {
            return res.status(400).json({ msg: 'Amount should be positive' });
        }
        
        const user = await User.findById(userId);
        if (user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }
        
        user.balance -= amount;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({ balance: user.balance });
    } catch (error) {
        res.status(400).json({ error });
    }
};

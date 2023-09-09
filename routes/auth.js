const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Register user
router.post('/register', async (req, res) => {
    
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ msg: 'Please provide both email and password' });
    }
    
    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash the password directly without separate salt generation
        bcrypt.hash(password, 10, async (err, hashedPassword) => {
            if(err) {
                return res.status(500).send('Error hashing password');
            }

            user = new User({
                email,
                password: hashedPassword,
                accountNumber: Date.now().toString()
            });

            await user.save();

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                JWT_SECRET,
                { expiresIn: '1h' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login user...Validating the request payload.
// Finding the user by email in your database.
// Comparing the provided password with the hashed password from the database.
// If all goes well, signing a JWT and sending it back to the client.
// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Please provide both email and password' });
    }

    try {
        let user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        console.log("Provided password:", password);
        console.log("Stored password:", user.password);
        
        
        // Compare using the callback-based approach
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error("Error during password comparison:", err);
                return res.status(500).send('Server error');
            }
            console.log("Password matches:", isMatch);

            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                JWT_SECRET,
                { expiresIn: '1h' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;

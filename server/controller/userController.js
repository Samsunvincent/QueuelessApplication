const User = require('../db/model/userModel');
const bcrypt = require('bcrypt')

// User registration (End User)
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validate fields
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role: 'user',  // End user role by default
            isFirstLogin: false  // No need for first login flag for regular users
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



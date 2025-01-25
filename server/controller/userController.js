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
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Add manager (Admin only)
exports.addManager = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Admin validation (You can check the logged-in user's role here)
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You are not an admin' });
        }

        // Validate fields
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if the manager already exists
        const existingManager = await User.findOne({ email });
        if (existingManager) {
            return res.status(400).json({ message: 'Manager already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new manager
        const newManager = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role: 'manager',  // Manager role
        });

        await newManager.save();

        res.status(201).json({ message: 'Manager added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

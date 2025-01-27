const User = require('../db/model/userModel');
const bcrypt = require('bcrypt')
const sendEmail = require('../utils/send-email').sendEmail
const addEmployeeEmailTemplate = require('../controller/email-templates/addManagerTemplate').addEmployeeEmailTemplate

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

        // Create new manager with isFirstLogin flag set
        const newManager = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role: 'manager',  // Manager role
            isFirstLogin: true  // Flag for first login
        });

        let emailTemplate = await addEmployeeEmailTemplate(name,email,{role : "manager"},password);
        sendEmail(email, "set the password",emailTemplate);

        await newManager.save();

        res.status(201).json({ message: 'Manager added successfully', manager: newManager });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
const User = require('../db/model/userModel');
const bcrypt = require('bcrypt')
const Product = require('../db/model/productModel')
const mongoose = require('mongoose');

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


exports.getProductsByQr = async (req, res) => {
    try {
        // Extract product ID from QR code filename
        const qrCodePath = req.params.qrCode;
        console.log("path",qrCodePath);  
        
        // Validate the QR code filename format
        if (!qrCodePath.startsWith("qr_") || !qrCodePath.endsWith(".png")) {
            return res.status(400).json({ message: "Invalid QR code filename format" });
        }

        // Extract product ID
        const productId = qrCodePath.replace("qr_", "").replace(".png", "");

        // Validate product ID (ensure it's a valid MongoDB ObjectId)
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        // Find product by ID and populate the 'category' field
        const productData = await Product.findById(productId).populate('category');

        // Check if the product exists
        if (!productData) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Return the product data
        return res.status(200).json({ productData });
    } catch (error) {
        console.error("Error retrieving product:", error); // Log the error for debugging
        res.status(500).json({ message: "Error retrieving product", error: error.message });
    }
};




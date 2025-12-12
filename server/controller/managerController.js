const bcrypt = require('bcrypt'); // Ensure bcrypt is required
const User = require('../db/model/userModel');
const Category = require('../db/model/categoryModel')
const Product = require('../db/model/productModel');
const QRCode = require('qrcode');
const path = require("path");
const fs = require("fs");
const { parseCSV } = require("../utils/CSVImport/CSVParser");
// exports.changePassword = async function (req, res) {
//     try {
//         let id = req.params.id;

//         if (!id) {
//             return res.status(400).json({ message: "Id is required" });
//         }
//         let findUser = await User.findOne({ _id: id });
//         if (!findUser) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         let checkPassword = await bcrypt.compare(req.body.currentPassword, findUser.password);
//         if (!checkPassword) {
//             return res.status(400).json({ message: "Current password is wrong" });
//         }

//         let newPassword = req.body.newPassword;
//         if (!newPassword) {
//             return res.status(400).json({ message: "New password is required" });
//         }

//         let hashNewPassword = await bcrypt.hash(newPassword, 10);
//         findUser.password = hashNewPassword;

//         // Check if the user is a manager and needs to change the password
//         if (findUser.role === 'manager' && findUser.isFirstLogin) {
//             // Update the isFirstLogin flag to false
//             findUser.isFirstLogin = false;
//         }

//         // Save the user with updated password and possibly updated flag
//         await findUser.save();

//         return res.status(200).json({ message: "Password changed successfully" });
//     } catch (error) {
//         console.log("Something went wrong", error);
//         return res.status(500).json({ message: "Internal Server Error" || error.message });
//     }
// };

exports.addCategory = async function (req, res) {
    try {
        const { name } = req.body;

        // Check if the category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        // Create a new category
        const newCategory = new Category({ name });
        await newCategory.save();
        res.status(201).json({ message: 'Category added successfully', category: newCategory });

    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}



// Add a new product
exports.addProduct = async (req, res) => {
    try {
        const { name, price, stock, category, description, weight } = req.body;

        if (!name || !price || !stock || !category || !description || !weight) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const categoryDoc = await Category.findOne({ name: category });
        if (!categoryDoc) {
            return res.status(400).json({ message: "Invalid category" });
        }

        const images = (req.files?.["images[]"] || []).map(file => ({
            url: file.path,
            alt: req.body.altText || "Product Images",
        }));

        // Save product first to get `_id`
        const product = new Product({
            name,
            price,
            stock,
            category: categoryDoc._id,
            description,
            images,
            weight,
            createdBy: req.user.id,
        });

        await product.save();

        // Generate a unique filename for the QR Code
        const qrFileName = `qr_${product._id}.png`;
        const qrFilePath = path.join(__dirname, "../uploads/qrcodes", qrFileName);

        if (!fs.existsSync(path.dirname(qrFilePath))) {
            fs.mkdirSync(path.dirname(qrFilePath), { recursive: true });
        }

        // **✅ Best Approach: Store JSON Data in QR Code**
        const qrData = JSON.stringify({
            productId: product._id,
            name: product.name,
            price: product.price,
            category: categoryDoc.name,
            image: images.length > 0 ? `http://localhost:5000/${images[0].url}` : "No Image Available"
        });

        await QRCode.toFile(qrFilePath, qrData);

        // Update product with QR Code path
        product.qrCode = `/uploads/qrcodes/${qrFileName}`;
        await product.save();

        res.status(201).json({ message: "Product added successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Error adding product", error: error.message });
    }
};




exports.importCSV = async (req, res) => {
    try {
        // Check for uploaded file
        if (!req.file) {
            return res.status(400).json({ message: "CSV file is required" });
        }

        const csvData = await parseCSV(req.file.path);

        let inserted = [];
        let failed = [];

        for (let row of csvData) {
            try {
                // --- CATEGORY LOOKUP ---
                let categoryDoc = null;
                if (row.category) {
                    categoryDoc = await Category.findOne({ name: row.category.trim() });
                    if (!categoryDoc) {
                        categoryDoc = new Category({ name: row.category.trim() });
                        await categoryDoc.save();
                    }
                }

                // --- CREATE PRODUCT ---
                // Generate unique SKU
                const generateSKU = (name) => {
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                    const randomHex = Math.random().toString(16).substr(2, 4);
                    return `${slug}-${randomHex}`;
                };
                const sku = generateSKU(row.name);

                // Check if SKU already exists
                const existingProduct = await Product.findOne({ sku });
                if (existingProduct) {
                    res.status(400).json({ message: `Product with SKU '${sku}' already exists` });
                    return;
                }

                const newProduct = await Product.create({
                    name: row.name,
                    price: Number(row.price) || 0,
                    stock: Number(row.stock) || 0,
                    category: categoryDoc ? categoryDoc._id : null,
                    description: row.description || "",
                    weight: Number(row.weight) || 0,
                    discount: Number(row.discount) || 0,
                    createdBy: req.user ? req.user._id : null,   // from auth middleware
                    sku,
                    imageUrl: row.imageUrl || ""
                });

                // Generate QR Code
                const qrFileName = `qr_${newProduct._id}.png`;
                const qrFilePath = path.join(__dirname, "../uploads/qrcodes", qrFileName);

                if (!fs.existsSync(path.dirname(qrFilePath))) {
                    fs.mkdirSync(path.dirname(qrFilePath), { recursive: true });
                }

                const qrData = JSON.stringify({
                    productId: newProduct._id,
                    name: newProduct.name,
                    price: newProduct.price,
                    category: categoryDoc ? categoryDoc.name : null,
                    sku: newProduct.sku,
                    imageUrl: newProduct.imageUrl || "No Image Available"
                });

                await QRCode.toFile(qrFilePath, qrData);

                // Update product with QR Code path
                newProduct.qrCode = `/uploads/qrcodes/${qrFileName}`;
                await newProduct.save();

                inserted.push(newProduct);

            } catch (err) {
                failed.push({
                    row,
                    error: err.message
                });
            }
        }

        res.status(200).json({
            message: "CSV import completed",
            insertedCount: inserted.length,
            failedCount: failed.length,
            inserted,
            failed
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}

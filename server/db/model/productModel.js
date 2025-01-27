const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String,  },
    price: { type: Number,  },
    stock: { type: Number,  }, // Available stock
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    description: { type: String }, // Additional product details
    qrCode: { type: String }, // QR code for queueless payment
    imageUrl: { type: String }, // Product image URL
    discount: { type: Number, default: 0 }, // Discount percentage
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  }, // Admin/Manager who added it
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);

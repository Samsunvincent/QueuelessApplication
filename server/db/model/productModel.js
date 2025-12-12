const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String,  },
    price: { type: Number,  },
    stock: { type: Number,  }, // Available stock
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    description: { type: String }, 
    qrCode: { type: String }, 
    imageUrl: { type: String }, 
    discount: { type: Number, default: 0 }, 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  },
    weight: { type: Number, default: 0 , required : true}, 
    createdAt: { type: Date, default: Date.now },
    sku : { type: String, unique: true  },
});

module.exports = mongoose.model('Product', productSchema);

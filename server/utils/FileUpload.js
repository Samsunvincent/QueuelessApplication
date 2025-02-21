


// middleware/upload.js
const multer = require('multer');

// Define storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Directory where files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Unique file name
    }
});

// Initialize multer with the defined storage and fields
const upload = multer({ storage: storage }).fields([{ name: 'images[]', maxCount: 10 }]); // Allow multiple images

module.exports = upload; // Export the upload middleware

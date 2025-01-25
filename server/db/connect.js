const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');

async function mongoConnect() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DATABASE CONNECTION ESTABLISHED");
    } catch (error) {
        console.log("DATABASE CONNECTION FAILED");
    }
}

module.exports = mongoConnect;

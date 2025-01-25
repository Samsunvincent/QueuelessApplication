const mongoose = require('mongoose');

let userTypeSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      required: true,  // This ensures that the userType is always set
      unique: true      // This makes sure that no duplicate userType is added
    }
  },
  { timestamps: true }  // Adds createdAt and updatedAt fields automatically
);

module.exports = mongoose.model('userType', userTypeSchema);

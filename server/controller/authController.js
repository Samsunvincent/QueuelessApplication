const User = require('../db/model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


exports.login = async function (req, res) {
  try {
    const { email, password } = req.body;

    // Check for missing email
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check for missing password
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Find the user in the users collection
    let check_user = await User.findOne({ email: email });
    console.log("Checking email in users data:", check_user);

    if (check_user) {
      // Compare password with the stored hash
      const isPasswordMatch = await bcrypt.compare(password, check_user.password);
      if (isPasswordMatch) {
        // Ensure the role is assigned correctly from the 'role' field in your model
        const role = check_user.role || 'user';  // Default to 'user' if no role is set



        if (check_user.role === "manager" && check_user.isFirstLogin === true) {
          return res.status(400).json({ message: "Please change your password before logging in" });
        }


        // Generate JWT token with user ID and role
        const token = jwt.sign({ id: check_user._id, role: role }, process.env.PRIVATE_KEY, { expiresIn: role === 'admin' ? '1h' : '10d' });
        console.log('token : ', token);

        return res.status(200).json({
          message: "Login successful",
          data: { user: check_user, token }
        });
      } else {
        return res.status(401).json({ message: "Incorrect password" });
      }
    }

    // If no user found
    return res.status(404).json({ message: "User not found" });

  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "An error occurred during login" });
  }
};



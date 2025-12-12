const User = require("../db/model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const { sendEmail } = require("./email/sendEmail");
const { passwordResetEmailTemplate } = require("./email-templates/passwordResetTemplate");

exports.login = async function (req, res) {
  try {
    let { email, password } = req.body;
      email = email.toLowerCase().trim();

    // Required checks
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    const check_user = await User.findOne({ email: email });
    console.log("Checking email:", check_user);

    if (!check_user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, check_user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // ---------- FIRST LOGIN HANDLING ----------
    if (check_user.role === "manager" && check_user.isFirstLogin === true) {
      
      // Create password reset token
      const passwordToken = jwt.sign(
        { user_id: check_user._id },
        process.env.PRIVATE_KEY,
        { expiresIn: "15m" }
      );

      // Save token to DB
      await User.updateOne(
        { _id: check_user._id },
        { $set: { password_token: passwordToken } }
      );

      // CREATE EMAIL TEMPLATE
      const emailHtml = passwordResetEmailTemplate(check_user.name,check_user.email,{ role: "manager" },passwordToken);

      // Send Email
      await sendEmail(check_user.email,"Reset Your Password",emailHtml);

      return res.status(200).json({
        firstLogin: true,
        message: "First login — reset password link sent to email.",
        passwordToken: passwordToken
      });
    }

    // ---------- NORMAL LOGIN ----------
    const role = check_user.role || "user";

    const token = jwt.sign(
      { id: check_user._id, role: role },
      process.env.PRIVATE_KEY,
      { expiresIn: role === "admin" ? "1h" : "10d" }
    );

    return res.status(200).json({
      message: "Login successful",
      data: { user: check_user, token },
    });

  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "An error occurred during login" });
  }
};


exports.passwordResetController = async function (req, res) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];

    let newPassword = req.body.newPassword;
    let confirmPassword = req.body.confirmPassword;

    if (newPassword !== confirmPassword) {
      return res.status(400).send({ message: "Passwords do not match" });
    }

    let decoded = jwt.decode(token);

    let userData = await User.findOne({
      _id: decoded.user_id,
      password_token: token,
    });

    if (userData) {
      let salt = bcrypt.genSaltSync(10);
      let hashed_password = bcrypt.hashSync(newPassword, salt);

      let data = await User.updateOne(
        { _id: decoded.user_id },
        {
          $set: {
            password: hashed_password,
            password_token: null,
            firstLogin: false,
          },
        }
      );

      if (data.modifiedCount == 1) {
        res.status(200).send({ message: "Password changed successfully" });
        return;
      }
    }

    res.status(400).send({ message: "Invalid token" });
  } catch (error) {
    res.status(400).send({ message: "Forbidden" });
  }
};

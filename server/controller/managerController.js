const bcrypt = require('bcrypt'); // Ensure bcrypt is required
const User = require('../db/model/userModel');

exports.changePassword = async function (req, res) {
    try {
        let id = req.params.id;

        if (!id) {
            return res.status(400).json({ message: "Id is required" });
        }
        let findUser = await User.findOne({ _id: id });
        if (!findUser) {
            return res.status(404).json({ message: "User not found" });
        }

        let checkPassword = await bcrypt.compare(req.body.currentPassword, findUser.password);
        if (!checkPassword) {
            return res.status(400).json({ message: "Current password is wrong" });
        }

        let newPassword = req.body.newPassword;
        if (!newPassword) {
            return res.status(400).json({ message: "New password is required" });
        }

        let hashNewPassword = await bcrypt.hash(newPassword, 10);
        findUser.password = hashNewPassword;

        // Check if the user is a manager and needs to change the password
        if (findUser.role === 'manager' && findUser.isFirstLogin) {
            // Update the isFirstLogin flag to false
            findUser.isFirstLogin = false;
        }

        // Save the user with updated password and possibly updated flag
        await findUser.save();

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.log("Something went wrong", error);
        return res.status(500).json({ message: "Internal Server Error" || error.message });
    }
};

const express = require('express');
const router = express.Router();

const authController = require('../controller/authController');

router.post('/login',authController.login)
router.patch('/changePassword',authController.passwordResetController)

module.exports = router;
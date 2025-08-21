const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');
const middlewareAuth = require('../middlewares/auth');

// Tambahkan middleware authenticateUser
router.post('/request', middlewareAuth, otpController.requestOTP);
router.post('/verify', middlewareAuth, otpController.verifyOTP);

module.exports = router;

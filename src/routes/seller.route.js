// routes/sellerRoutes.js
const express = require("express");
const { requestSellerOtp, verifySellerOtp } = require("../controllers/seller.Rquestotp.controller");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.post("/request-seller-otp", authMiddleware, requestSellerOtp);
router.post("/verify-seller-otp", authMiddleware, verifySellerOtp);

module.exports = router;

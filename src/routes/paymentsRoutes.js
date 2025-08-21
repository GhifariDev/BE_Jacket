const express = require("express");
const router = express.Router();
const { createTransaction, handleNotification } = require("../controllers/payment.controller");
const paymentController = require("../controllers/payment.controller"); // 🔥 tambahkan ini
const middlewareAuth = require('../middlewares/auth');
router.post("/create", middlewareAuth, paymentController.createTransaction);
router.post("/notification", handleNotification);

module.exports = router;

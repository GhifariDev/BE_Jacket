const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authenticateUser = require('../middlewares/auth'); // ⬅️ pastikan ini

router.post('/checkout', authenticateUser, orderController.checkout); // ⬅️ harus pakai ini
router.get('/', authenticateUser, orderController.getUserOrders);     // ⬅️ juga ini

module.exports = router;

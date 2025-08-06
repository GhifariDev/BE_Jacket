const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authenticateUser = require('../middlewares/auth'); // ⬅️ ini penting

// 🛡️ Tambahkan middleware autentikasi
router.post('/', authenticateUser, cartController.addToCart);
router.get('/', authenticateUser, cartController.getCart);

module.exports = router;

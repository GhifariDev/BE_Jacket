const express = require('express');
const router = express.Router();
const { submitProduct, getMyProducts } = require('../controllers/sellerProductController');
// routes/sellerProducts.js
const authMiddleware = require('../middlewares/auth');
const { uploadProductSeller, validateMin3Images } = require('../middlewares/uploadProductSeller');

// Debug cek apakah sudah function
console.log('uploadProductSeller:', typeof uploadProductSeller);
console.log('validateMin3Images:', typeof validateMin3Images);

router.post(
  '/products',
  authMiddleware,
  uploadProductSeller.array('images', 10),
  validateMin3Images,
  submitProduct
);

router.get('/products/mine', authMiddleware, getMyProducts);

module.exports = router;

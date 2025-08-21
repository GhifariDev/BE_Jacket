const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const middlewareAuth = require('../middlewares/auth');

router.get('/', middlewareAuth, productController.getAllProducts);
router.get('/:id', middlewareAuth, productController.getProductById);

// ✅ Tambahan: produk dengan diskon aktif
router.get('/discounts/active', productController.getDiscountedProducts);

module.exports = router;

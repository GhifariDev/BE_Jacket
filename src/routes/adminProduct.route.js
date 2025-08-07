const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const adminProductController = require('../controllers/adminProduct.controller');
const authenticateUser = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

// Semua route dilindungi oleh authenticateUser + isAdmin
router.post('/create', authenticateUser, isAdmin, upload.single('image'), adminProductController.createProduct);
router.get('/', authenticateUser, isAdmin, adminProductController.getAllProducts);
router.get('/:id', authenticateUser, isAdmin, adminProductController.getProductById);
router.put('/:id', authenticateUser, isAdmin, upload.single('image'), adminProductController.updateProduct);
router.delete('/:id', authenticateUser, isAdmin, adminProductController.deleteProduct);

module.exports = router;

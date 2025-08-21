const express = require('express');
const router = express.Router();
const { uploadProduct } = require('../middlewares/upload');
const adminProductController = require('../controllers/adminProduct.controller');
const authenticateUser = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

// Semua route dilindungi oleh authenticateUser + isAdmin
router.post(
  '/create',
  authenticateUser,
  isAdmin,
  uploadProduct.single('image'),
  adminProductController.createProduct
);

router.get('/', authenticateUser, isAdmin, adminProductController.getAllProducts);
router.put('/:id', authenticateUser, isAdmin, adminProductController.getProductById);
router.delete('/:id', authenticateUser, isAdmin, adminProductController.deleteProduct);

// ✅ Approve / Reject
router.patch('/:id/approve', authenticateUser, isAdmin, adminProductController.approveProduct);
router.patch('/:id/reject', authenticateUser, isAdmin, adminProductController.rejectProduct);

// ✅ Set Discount (dengan waktu aktif)
router.patch('/:id/discount', authenticateUser, isAdmin, adminProductController.setDiscount);


module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // pastikan ini benar
const middlewareAuth = require('../middlewares/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
// Contoh route yang benar harus function sebagai handler:
router.get('/admin', middlewareAuth, userController.getAllUsers);
router.get('/', middlewareAuth, userController.getCurrentUser);
router.patch('/block/:id', middlewareAuth, userController.toggleBlockUser);
router.patch("/unblock/:id", middlewareAuth, userController.unblockUser);
const {  uploadKtp } = require('../middlewares/upload');

router.put('/role/seller', middlewareAuth, uploadKtp.single('ktp'), userController.updateRoleToSeller);

module.exports = router;

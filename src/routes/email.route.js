const express = require('express');
const router = express.Router();
const multer = require('multer');
const { sendEmail } = require('../controllers/email.controller');
const middlewareAuth = require('../middlewares/auth');
const authRole = require('../middlewares/authRole'); // baru
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Hanya seller yang bisa akses
router.post(
  '/penjualan-baju',
  middlewareAuth,
  authRole(['seller']),
  upload.single('gambar'),
  sendEmail
);

module.exports = router;

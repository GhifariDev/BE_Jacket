const express = require('express');
const router = express.Router();
const multer = require('multer');
const { sendEmail } = require('../controllers/email.controller');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/penjualan-baju', upload.single('gambar'), sendEmail);

module.exports = router;

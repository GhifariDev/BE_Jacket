const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Buat folder kalau belum ada
const uploadDir = path.join(__dirname, '../uploads/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storageProductSeller = multer.diskStorage({
destination: (req, file, cb) => {
  console.log('req.user di multer:', req.user);
  const sellerName = req.user?.name?.replace(/\s+/g, '_') || 'unknown';
    const sellerDir = path.join(uploadDir, sellerName);

    // Buat folder kalau belum ada
    if (!fs.existsSync(sellerDir)) {
      fs.mkdirSync(sellerDir, { recursive: true });
    }

    cb(null, sellerDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
  },
});


const fileFilterProductSeller = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Produk hanya menerima file JPG, JPEG, PNG'));
  }
};

const uploadProductSeller = multer({
  storage: storageProductSeller,
  fileFilter: fileFilterProductSeller,
  limits: { fileSize: 2 * 1024 * 1024 }
});

const validateMin3Images = (req, res, next) => {
  if (!req.files || req.files.length < 3) {
    return res.status(400).json({ error: 'Minimal 3 gambar produk diperlukan' });
  }
  next();
};

module.exports = { uploadProductSeller, validateMin3Images };

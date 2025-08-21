const multer = require('multer');
const path = require('path');

// Storage untuk produk
const storageProduct = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products'); // folder khusus produk
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilterProduct = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Produk hanya menerima file JPG, JPEG, PNG'));
  }
};

const uploadProduct = multer({ storage: storageProduct, fileFilter: fileFilterProduct });

// Storage untuk KTP
const storageKtp = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/ktp'); // folder khusus KTP
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilterKtp = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('KTP hanya menerima file JPG, JPEG, PNG, atau PDF'));
  }
};

const uploadKtp = multer({ storage: storageKtp, fileFilter: fileFilterKtp });

module.exports = {
  uploadProduct,
  uploadKtp,
};

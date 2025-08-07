const multer = require('multer');
const path = require('path');

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // folder simpan
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // nama unik
  },
});

// Filter file
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
    cb(null, true);
  } else {
    cb(new Error('Hanya menerima file JPG, JPEG, PNG'));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;

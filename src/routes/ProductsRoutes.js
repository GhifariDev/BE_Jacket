const express = require("express");
const router = express.Router();
const middlewareAuth = require("../middlewares/auth"); // tanpa destructuring {}

const { uploadProductSeller, validateMin3Images } = require("../middlewares/uploadProductSeller");
const {
  createProduct,
  getApprovedProducts,
  getPendingProducts,
  approveProduct
} = require("../controllers/productsController");

// POST: Buat produk baru
router.post(
  "/",
  middlewareAuth,
  uploadProductSeller.array("images", 5), // di sini baru array()
  validateMin3Images,
  createProduct
);

// GET: Produk yang disetujui
router.get("/", getApprovedProducts);

// GET: Produk pending (hanya admin)
router.get("/pending", middlewareAuth, getPendingProducts);

// PUT: Approve atau reject produk
router.put("/:id/approve", middlewareAuth, approveProduct);

module.exports = router;

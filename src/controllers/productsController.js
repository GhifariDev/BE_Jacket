const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create Product
const createProduct = async (req, res) => {
  try {
    const { title, description, price, stock, category } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

if (!role.includes("SELLER") && !role.includes("ADMIN")) {
  return res.status(403).json({ message: "Unauthorized" });
}

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        category,
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl: JSON.stringify(images), // simpan sebagai JSON string
        userId,
        status: "PENDING",
      },
    });

    res.status(201).json({ message: "Produk berhasil dibuat", product });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", error: error.message });
  }
};

// Get Approved Products
const getApprovedProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: "APPROVED" },
      include: { seller: { select: { id: true, name: true } } },
    });

    const formatted = products.map(p => ({
      ...p,
      imageUrl: JSON.parse(p.imageUrl || "[]"), // parse JSON string ke array
      sellerName: p.seller?.name || null,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", error: error.message });
  }
};

// Get Pending Products (admin only)
const getPendingProducts = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Hanya admin yang bisa mengakses" });
    }
    const products = await prisma.product.findMany({
      where: { status: "PENDING" },
      include: { seller: { select: { id: true, name: true } } },
    });

    const formatted = products.map(p => ({
      ...p,
      imageUrl: JSON.parse(p.imageUrl || "[]"),
      sellerName: p.seller?.name || null,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", error: error.message });
  }
};

// Approve / Reject Product
const approveProduct = async (req, res) => {
  try {
    const { status } = req.body;
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Hanya admin yang bisa approve/reject" });
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });

    res.json({ message: "Status produk berhasil diubah", product });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", error: error.message });
  }
};

module.exports = {
  createProduct,
  getApprovedProducts,
  getPendingProducts,
  approveProduct,
};

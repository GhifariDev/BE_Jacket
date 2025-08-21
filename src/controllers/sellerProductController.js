// controllers/sellerProductController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.submitProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock } = req.body;
   const imageFiles = req.files && req.files.length > 0
  ? req.files.map(file => file.filename)
  : ['default.jpg'];
const newProduct = await prisma.product.create({
  data: {
    title,
    description,
    price: parseFloat(price),
    category,
    stock: parseInt(stock),
    imageUrl: JSON.stringify(imageFiles), // simpan array jadi string
    userId: req.user.id,
    status: "PENDING"
  },
});


    res.status(201).json({ message: "Produk dikirim untuk approval", product: newProduct });
  } catch (err) {
    console.error("❌ Gagal membuat produk:", err);
    res.status(500).json({ error: "Gagal membuat produk" });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const myProducts = await prisma.product.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    res.json(myProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

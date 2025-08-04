// src/controllers/product.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ambil semua produk
const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        category: true,
        imageUrl: true, // ✅ Ditambahkan
        createdAt: true,
        updatedAt: true,
      }
    });
    res.json(products);
  } catch (err) {
    console.error('🔥 ERROR getAllProducts:', err);
    res.status(500).json({ error: 'Gagal mengambil data produk' });
  }
};

// Ambil produk berdasarkan ID
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        category: true,
        imageUrl: true, // ✅ Ditambahkan
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data produk' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
};

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// CREATE
const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock } = req.body;
    const imageUrl = req.file?.filename || null;

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock),
        imageUrl,
        userId: null, // karena admin
      },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ ALL
const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ BY ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, stock } = req.body;
    const newImage = req.file?.filename;

    const existing = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    if (newImage && existing.imageUrl) {
      fs.unlink(path.join('uploads', existing.imageUrl), err => {
        if (err) console.warn('Gagal hapus gambar lama:', err.message);
      });
    }

    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock),
        imageUrl: newImage || existing.imageUrl,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Hapus product dan atur ulang posisi
const deleteProduct = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: "Produk tidak ditemukan" });

    const deletedPosition = product.position;

    await prisma.product.delete({ where: { id } });

    // Turunkan posisi semua yang lebih besar dari posisi yang dihapus
    await prisma.product.updateMany({
      where: {
        position: {
          gt: deletedPosition,
        },
      },
      data: {
        position: {
          decrement: 1,
        },
      },
    });

    res.json({ message: "Produk berhasil dihapus dan urutan diperbarui." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};

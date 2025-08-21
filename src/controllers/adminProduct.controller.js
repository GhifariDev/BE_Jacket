const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// Helper function untuk handle imageUrl yang bisa berupa string atau array
const getImageUrls = (imageUrl) => {
  if (!imageUrl) return [];
  
  // Jika string dimulai dengan [ dan diakhiri ], parse sebagai JSON array
  if (typeof imageUrl === 'string' && imageUrl.startsWith('[') && imageUrl.endsWith(']')) {
    try {
      return JSON.parse(imageUrl);
    } catch (err) {
      console.warn('Failed to parse imageUrl as JSON:', err);
      return [imageUrl];
    }
  }
  
  // Jika sudah berupa array
  if (Array.isArray(imageUrl)) {
    return imageUrl;
  }
  
  // Jika string biasa
  return [imageUrl];
};

// Helper function untuk menyimpan imageUrl dengan konsisten
const saveImageUrls = (files) => {
  if (!files) return null;
  
  // Jika single file
  if (files.filename) {
    return files.filename;
  }
  
  // Jika multiple files
  if (Array.isArray(files)) {
    const filenames = files.map(file => file.filename);
    return filenames.length === 1 ? filenames[0] : JSON.stringify(filenames);
  }
  
  return null;
};

// CREATE
const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock } = req.body;

    // Handle single atau multiple files
    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.filename;
    } else if (req.files && req.files.length > 0) {
      const filenames = req.files.map(file => file.filename);
      imageUrl = filenames.length === 1 ? filenames[0] : JSON.stringify(filenames);
    }

    const newProduct = await prisma.product.create({
      data: {
        title,
        description,
        price: parseInt(price),
        category,
        stock: parseInt(stock),
        imageUrl,
        status: "PENDING",
      },
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error("❌ Gagal membuat produk:", err);
    res.status(500).json({ error: "Gagal membuat produk" });
  }
};

// READ ALL
const getAllProducts = async (req, res) => {
  try {
    const now = new Date();
    const products = await prisma.product.findMany({
      include: {
        seller: { select: { name: true, email: true } },
      },
    });

    // cek diskon aktif dan format imageUrl
    const updated = products.map(p => {
      let finalPrice = p.price;
      if (p.discountPrice && p.discountStart && p.discountEnd) {
        if (now >= p.discountStart && now <= p.discountEnd) {
          finalPrice = p.discountPrice;
        }
      }

      // Format imageUrl untuk konsistensi
      const imageUrls = getImageUrls(p.imageUrl);
      
      return { 
        ...p, 
        finalPrice,
        imageUrl: p.imageUrl, // Keep original
        imageUrls, // Add parsed array for frontend
        primaryImage: imageUrls[0] || null // Primary image for display
      };
    });

    res.json(updated);
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ error: error.message });
  }
};

// READ BY ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        seller: { select: { name: true, email: true } },
      },
    });
    
    if (!product) return res.status(404).json({ error: 'Not found' });

    let finalPrice = product.price;
    if (product.discountPrice && product.discountStart && product.discountEnd) {
      if (now >= product.discountStart && now <= product.discountEnd) {
        finalPrice = product.discountPrice;
      }
    }

    // Format imageUrl
    const imageUrls = getImageUrls(product.imageUrl);

    res.json({ 
      ...product, 
      finalPrice,
      imageUrls,
      primaryImage: imageUrls[0] || null
    });
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, stock } = req.body;

    const existing = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    let updateData = {
      title,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
    };

    // Handle image update
    if (req.file || (req.files && req.files.length > 0)) {
      // Delete old images
      if (existing.imageUrl) {
        const oldImageUrls = getImageUrls(existing.imageUrl);
        oldImageUrls.forEach(filename => {
          if (filename) {
            fs.unlink(path.join('uploads', filename), err => {
              if (err) console.warn('Gagal hapus gambar lama:', filename, err.message);
            });
          }
        });
      }

      // Set new image(s)
      if (req.file) {
        updateData.imageUrl = req.file.filename;
      } else if (req.files && req.files.length > 0) {
        const filenames = req.files.map(file => file.filename);
        updateData.imageUrl = filenames.length === 1 ? filenames[0] : JSON.stringify(filenames);
      }
    }

    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // Format response
    const imageUrls = getImageUrls(updated.imageUrl);
    res.json({
      ...updated,
      imageUrls,
      primaryImage: imageUrls[0] || null
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE
const deleteProduct = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: "Produk tidak ditemukan" });

    // Delete associated images
    if (product.imageUrl) {
      const imageUrls = getImageUrls(product.imageUrl);
      imageUrls.forEach(filename => {
        if (filename) {
          fs.unlink(path.join('uploads', filename), err => {
            if (err) console.warn('Gagal hapus gambar:', filename, err.message);
          });
        }
      });
    }

    const deletedPosition = product.position;

    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.orderItem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    if (deletedPosition !== null && deletedPosition !== undefined) {
      await prisma.product.updateMany({
        where: { position: { gt: deletedPosition } },
        data: { position: { decrement: 1 } },
      });
    }

    res.json({ message: "Produk berhasil dihapus dan urutan diperbarui." });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ error: err.message, code: err.code, meta: err.meta });
  }
};

// APPROVE PRODUCT
const approveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!product) return res.status(404).json({ error: "Produk tidak ditemukan" });

    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { status: "APPROVED" }
    });

    const imageUrls = getImageUrls(updated.imageUrl);
    res.json({ 
      message: "Produk berhasil disetujui", 
      product: {
        ...updated,
        imageUrls,
        primaryImage: imageUrls[0] || null
      }
    });
  } catch (error) {
    console.error("Approve product error:", error);
    res.status(500).json({ error: error.message });
  }
};

// REJECT PRODUCT
const rejectProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!product) return res.status(404).json({ error: "Produk tidak ditemukan" });

    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { status: "REJECTED" }
    });

    const imageUrls = getImageUrls(updated.imageUrl);
    res.json({ 
      message: "Produk berhasil ditolak", 
      product: {
        ...updated,
        imageUrls,
        primaryImage: imageUrls[0] || null
      }
    });
  } catch (error) {
    console.error("Reject product error:", error);
    res.status(500).json({ error: error.message });
  }
};

// SET DISCOUNT
const setDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { discountPercent, startDate, endDate } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!product) return res.status(404).json({ error: "Produk tidak ditemukan" });

    // Validasi sederhana
    if (discountPercent < 0 || discountPercent > 100) {
      return res.status(400).json({ error: "Diskon harus antara 0 - 100%" });
    }
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ error: "Tanggal mulai harus sebelum tanggal berakhir" });
    }

    // Hitung diskon price
    const discountPrice = Math.round(product.price * (1 - discountPercent / 100));

    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        discountPercent: parseInt(discountPercent),
        discountPrice: discountPrice,
        discountStart: new Date(startDate),
        discountEnd: new Date(endDate),
      },
    });

    const imageUrls = getImageUrls(updated.imageUrl);
    res.json({ 
      message: "Diskon berhasil diterapkan", 
      product: {
        ...updated,
        imageUrls,
        primaryImage: imageUrls[0] || null
      }
    });
  } catch (error) {
    console.error("Set discount error:", error);
    res.status(500).json({ error: error.message });
  }
};

// REMOVE DISCOUNT
const removeDiscount = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        discountPercent: null,
        discountPrice: null,
        discountStart: null,
        discountEnd: null,
      },
    });

    const imageUrls = getImageUrls(updated.imageUrl);
    res.json({ 
      message: "Diskon berhasil dihapus", 
      product: {
        ...updated,
        imageUrls,
        primaryImage: imageUrls[0] || null
      }
    });
  } catch (error) {
    console.error("Remove discount error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  approveProduct,
  rejectProduct,
  setDiscount,
  removeDiscount,
};
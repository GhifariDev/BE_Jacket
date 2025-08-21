  // src/controllers/product.controller.js
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  // Ambil semua produk
  // Ambil semua produk
  const getAllProducts = async (req, res) => {
    try {
      const productsRaw = await prisma.product.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          category: true,
          stock: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true,
          seller: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });



      const products = productsRaw.map(p => ({
        ...p,
        seller: p.seller
          ? { ...p.seller, nama: p.seller.name }
          : { name: null, email: null, nama: null }
      }));


      res.json(products);
    } catch (err) {
      console.error('🔥 ERROR getAllProducts:', err);
      res.status(500).json({ error: 'Gagal mengambil data produk' });
    }
  };


  const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
      const p = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          category: true,
          stock: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true,
          seller: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      if (!p) {
        return res.status(404).json({ message: 'Produk tidak ditemukan' });
      }

      const product = { 
        ...p,
        sellerName: p.seller?.name || null,
        sellerEmail: p.seller?.email || null
      };

      res.json(product);
    } catch (err) {
      console.error('🔥 ERROR getProductById:', err);
      res.status(500).json({ error: 'Gagal mengambil data produk' });
    }
  };


  
// GET DISCOUNTED PRODUCTS
// GET DISCOUNTED PRODUCTS
// GET DISCOUNTED PRODUCTS
const getDiscountedProducts = async (req, res) => {
  try {
    const now = new Date();

    const products = await prisma.product.findMany({
      where: {
        discountStart: { lte: now },
        discountEnd: { gte: now },
        status: "APPROVED",
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        originalPrice: true,
        discountStart: true,
        discountEnd: true,
        imageUrl: true, // ✅ tambahkan ini
        seller: {
          select: { name: true, email: true },
        },
      },
    });

    // hitung diskon manual
    const updated = products.map((p) => {
      const discountPercent = p.originalPrice
        ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
        : 0;

      return {
        ...p,
        discountPercent,
        finalPrice: p.price,
      };
    });

    res.json(updated);
  } catch (error) {
    console.error("❌ Gagal ambil produk diskon:", error);
    res.status(500).json({ error: error.message });
  }
};


  module.exports = {
    getAllProducts,
    getProductById,
    getDiscountedProducts, // ✅ jangan lupa export
  };

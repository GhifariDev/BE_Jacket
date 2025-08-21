const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 🛒 Tambah produk ke cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    // Cek produk
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Cek apakah sudah ada di cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { userId, productId },
    });

    let cartItem;
    if (existingItem) {
      // Update jumlah
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (quantity || 1) },
        include: { product: true },
      });
    } else {
      // Tambah baru
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity: quantity || 1,
        },
        include: { product: true },
      });
    }

    return res.json({
      message: "Produk berhasil ditambahkan ke keranjang",
      cartItem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menambahkan produk" });
  }
};

// 🔍 Lihat cart user
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    res.json(cartItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil cart" });
  }
};
  
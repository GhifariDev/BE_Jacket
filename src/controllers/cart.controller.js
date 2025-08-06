const prisma = require('../prisma/client');

// ➕ Tambah item ke cart
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id; // pastikan sudah login

  try {
    // Cek apakah item sudah ada di cart
    const existing = await prisma.cartItem.findFirst({
      where: { userId, productId }
    });

    if (existing) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: { userId, productId, quantity }
      });
    }

    res.json({ message: 'Item added to cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Lihat cart user
exports.getCart = async (req, res) => {
  const userId = req.user.id;

  try {
    const cart = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

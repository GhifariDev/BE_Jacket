const prisma = require('../prisma/client');

exports.checkout = async (req, res) => {
const userId = req.user?.id || 1;


  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // 1. Buat order
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'PENDING'
      }
    });

    // 2. Buat orderItem berdasarkan isi cart
    const items = cartItems.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price
    }));

    await prisma.orderItem.createMany({ data: items });

    // 3. Hapus isi cart
    await prisma.cartItem.deleteMany({ where: { userId } });

    res.json({ message: 'Checkout berhasil', orderId: order.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Lihat semua order user
exports.getUserOrders = async (req, res) => {
  const userId = req.user.id;
//  console.log('User ID:', userId);
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
// console.log('Orders:', JSON.stringify(orders, null, 2));
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

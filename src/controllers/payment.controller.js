const midtransClient = require("midtrans-client");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Midtrans Snap & CoreAPI setup
let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

let core = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// 🔹 Create Transaction
exports.createTransaction = async (req, res) => {
  try {
    const userId = req.user.id; // 🔥 ambil dari JWT, bukan body

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart kosong" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

    const grossAmount = cartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId,
        status: "PENDING",
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { orderItems: true },
    });

    const parameter = {
      transaction_details: {
        order_id: `order-${order.id}-${userId}-${Date.now()}`, // lebih aman
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: user.name || `User-${userId}`,
        email: user.email || "user@example.com",
      },
    };

    const transaction = await snap.createTransaction(parameter);

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        snapToken: transaction.token,
        snapRedirect: transaction.redirect_url,
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Webhook
exports.handleNotification = async (req, res) => {
  try {
    const statusResponse = await core.transaction.notification(req.body);

    const parts = statusResponse.order_id.split("-");
    const orderId = parseInt(parts[1]);
    const userId = parseInt(parts[2]);
    const transactionStatus = statusResponse.transaction_status;

    let status = "PENDING";
    if (transactionStatus === "settlement" || transactionStatus === "capture") {
      status = "PAID";
      await prisma.cartItem.deleteMany({ where: { userId } });
    } else if (transactionStatus === "cancel" || transactionStatus === "expire") {
      status = "CANCELLED";
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    res.json({ message: "OK" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

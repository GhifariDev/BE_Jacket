const prisma = require('../prisma/client');
const jwt = require('jsonwebtoken');
// Ambil semua user
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isBlocked: true,
      },
    });

    const usersWithStatus = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.isBlocked ? "blocked" : "active",
    }));

    res.json(usersWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Ambil current user lengkap dengan role
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        isBlocked: true,
        phone: true,
        roles: {
          select: { role: { select: { name: true } } }
        },
        cartItems: true,
        orders: true,
        orderItems: true,
        reviews: true,
        otps: true,
        penjualanBaju: true
      }
    });

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const userWithRoles = {
      ...user,
      role: user.roles.map(r => r.role.name)
    };

    res.json(userWithRoles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data user" });
  }
};

// Toggle blokir user
exports.toggleBlockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { isBlocked: !user.isBlocked },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unblock user
exports.unblockUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { isBlocked: false },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengembalikan status user" });
  }
};

// Update role jadi seller (langsung tanpa request)
exports.updateRoleToSeller = async (req, res) => {
  try {
    const userId = req.user.id;

    const sellerRole = await prisma.role.findUnique({ where: { name: 'seller' } });
    if (!sellerRole) return res.status(400).json({ message: 'Role seller tidak ada' });

    const existing = await prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId: sellerRole.id } }
    });

    if (!existing) {
      await prisma.userRole.create({ data: { userId, roleId: sellerRole.id } });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { select: { role: { select: { name: true } } } }
      }
    });

    const newToken = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, role: updatedUser.roles.map(r => r.role.name) },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Role updated to seller',
      data: updatedUser,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update role', error });
  }
};

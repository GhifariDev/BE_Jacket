// src/controllers/auth.controller.js
// src/controllers/auth.controller.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// REGISTER
const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    // Validasi input
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Name, email, password, dan phone wajib diisi" });
    }

    // Cek apakah email atau phone sudah terdaftar
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Email atau nomor HP sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user ke DB
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone
      }
    });

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan saat registrasi' });
  }
};

module.exports = {
  register,
};


// LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } }
    });

    if (!user) return res.status(401).json({ message: 'Email tidak ditemukan' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Password salah' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Ambil role pertama sebagai default
    const role = user.roles.length > 0 ? user.roles[0].role.name : 'user';

    res.cookie('token', token, { httpOnly: false, secure: false, sameSite: 'none', path: '/' });
    res.cookie('user_name', encodeURIComponent(user.name), { httpOnly: false, sameSite: 'Lax', path: '/' });
    res.cookie('user_role', role, { httpOnly: false, sameSite: 'Lax', path: '/' });

    res.json({
      message: 'Login berhasil',
      token,
      user: { id: user.id, name: user.name, email: user.email, role }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
};



// LOGOUT
const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'Lax',
    secure: true,
    path: '/', // ← WAJIB ini!
  });

  res.clearCookie('user_email', { path: '/' });
  res.clearCookie('user_name', { path: '/' });

  res.json({ message: 'Logout berhasil' });
};




// ✅ GET semua user
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data user' });
  }
};

// ✅ GET user berdasarkan ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil user' });
  }
};
const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true, // ⬅️ kirim role ke frontend
      },
    });

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    res.json(user); // ⬅️ role dikirim di sini
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  register,
  login,
  logout, // ✅ tambahkan ini
  getAllUsers,
  getUserById,
  me,
};

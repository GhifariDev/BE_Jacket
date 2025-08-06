// src/controllers/auth.controller.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// REGISTER
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

    // Simpan user ke DB
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    res.status(201).json({ message: 'Registrasi berhasil', user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan saat registrasi' });
  }
};

// LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Email tidak ditemukan' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Password salah' });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    // Simpan token di cookie
    res.cookie('token', token, {
      httpOnly: false,
      secure: true,            // ⛔ HARUS false di lokal (karena pakai HTTP)
      sameSite: 'Lax', 
        path: '/',          // ✅ 'Lax' atau bahkan 'Strict' cukup di lokal
    });


    res.json({
      message: 'Login berhasil',
      token, // kirim juga ke FE
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
};

// LOGOUT
const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: false,
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



module.exports = {
  register,
  login,
  logout, // ✅ tambahkan ini
  getAllUsers,
  getUserById,
};

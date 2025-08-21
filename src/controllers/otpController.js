// src/controllers/otpController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcryptjs');

// Kirim OTP via Fonnte dengan logging
async function sendOTPFonnte(phone, code) {
  const FONNTE_TOKEN = process.env.FONNTE_TOKEN; // ambil dari env
  try {
    const res = await axios.post('https://api.fonnte.com/send', {
      target: phone,
      message: `Kode OTP Anda: ${code}`
    }, {
      headers: { Authorization: FONNTE_TOKEN }
    });
    console.log('Fonnte response:', res.data);
  } catch (err) {
    console.error('Gagal kirim OTP via Fonnte:', err.response?.data || err.message);
    throw new Error('Gagal kirim OTP via Fonnte');
  }
}

// REQUEST OTP
// REQUEST OTP
exports.requestOTP = async (req, res) => {
  try {
    // Ambil user dari DB berdasarkan ID di token
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id } 
    });

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    if (!user.phone) return res.status(400).json({ message: "Nomor HP belum tersedia" });

    const phone = user.phone;

    // Generate kode OTP 6 digit
    const code = Math.floor(100000 + Math.random() * 900000);
    console.log(`Generated OTP for ${phone}: ${code}`);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    // Simpan OTP di DB
    await prisma.oTP.create({
      data: { code, userId: user.id, expiresAt }
    });

    // Kirim OTP via Fonnte
    await sendOTPFonnte(phone, code);

    res.json({ message: "OTP berhasil dikirim via WhatsApp" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Terjadi kesalahan saat request OTP" });
  }
};

// VERIFY OTP
exports.verifyOTP = async (req, res) => {
  try {
    let { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ message: "Phone dan OTP wajib diisi" });

    phone = phone.replace(/\s+/g, '');

    const user = await prisma.user.findFirst({
      where: { phone },
      include: { otp: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    if (!user || user.otp.length === 0)
      return res.status(400).json({ message: "OTP tidak ditemukan" });

    const latestOTP = user.otp[0];
    if (latestOTP.code !== parseInt(code))
      return res.status(400).json({ message: "OTP salah" });

    if (new Date() > latestOTP.expiresAt)
      return res.status(400).json({ message: "OTP expired" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "OTP berhasil diverifikasi", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Terjadi kesalahan saat verifikasi OTP" });
  }
};

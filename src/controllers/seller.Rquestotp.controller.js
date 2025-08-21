// controllers/sellerOtp.controller.js
const prisma = require('../prisma/client');
const axios = require("axios");

// Kirim OTP untuk verifikasi jadi seller
const requestSellerOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone } = req.user;

    const otp = Math.floor(100000 + Math.random() * 900000);

    // Hapus OTP lama
    await prisma.OTP.deleteMany({ where: { userId } });

    // Simpan OTP baru
    await prisma.OTP.create({
      data: {
        code: otp,
        userId,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 menit
      },
    });

    // Kirim OTP via Fonnte
    await axios.post("https://api.fonnte.com/send", {
      target: phone,
      message: `Kode OTP verifikasi seller Anda adalah ${otp}`,
    }, {
      headers: { Authorization: process.env.FONNTE_TOKEN }
    });

    res.json({ message: "OTP berhasil dikirim" });
  } catch (error) {
    console.error("Error requestSellerOtp:", error);
    res.status(500).json({ error: "Gagal mengirim OTP" });
  }
};

// Verifikasi OTP & tambahkan role seller via pivot table
const verifySellerOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: "OTP wajib diisi" });

    // Pastikan OTP valid
    const otpEntry = await prisma.OTP.findFirst({
      where: { userId: req.user.id, code: parseInt(otp, 10) },
    });

    if (!otpEntry) return res.status(400).json({ message: "OTP salah" });
    if (otpEntry.expiresAt < new Date()) return res.status(400).json({ message: "OTP kadaluarsa" });

    // Cek apakah user sudah punya role seller
    const existingRole = await prisma.userRole.findFirst({
      where: {
        userId: req.user.id,
        role: { name: "seller" },
      },
      include: { role: true },
    });

    res.cookie('user_role', 'seller', {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
});

    if (!existingRole) {
      // Ambil role seller
      const sellerRole = await prisma.role.findUnique({ where: { name: "seller" } });
      if (!sellerRole) {
        return res.status(500).json({ message: "Role seller belum tersedia di database" });
      }

      // Tambahkan pivot userRole
      await prisma.userRole.create({
        data: {
          userId: req.user.id,
          roleId: sellerRole.id,
        },
      });
    }

    // Hapus OTP setelah sukses
    await prisma.OTP.deleteMany({ where: { userId: req.user.id } });

    return res.json({ message: "Sekarang kamu menjadi seller!" });
  } catch (err) {
    console.error("Error verifySellerOtp:", err);
    res.status(500).json({ message: "Gagal verifikasi OTP" });
  }
};

module.exports = {
  requestSellerOtp,
  verifySellerOtp,
};

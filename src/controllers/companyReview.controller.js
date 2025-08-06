const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createCompanyReview = async (req, res) => {
  const { content, rating } = req.body;
  const userId = req.user.id; // Didapat dari middleware auth

  try {
    const review = await prisma.review.create({
      data: {
        content,
        rating: parseInt(rating),
        userId,
      },
    });

    res.status(201).json({ message: 'Ulasan berhasil dikirim', review });
  } catch (error) {
    console.error('Error membuat ulasan perusahaan:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat membuat ulasan.' });
  }
};


// controllers/companyReview.controller.js
const getAllCompanyReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: true, // untuk ambil nama user jika perlu
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error mengambil ulasan:', error);
    res.status(500).json({ error: 'Gagal mengambil ulasan.' });
  }
};

module.exports = {
  createCompanyReview,
  getAllCompanyReviews, // ← tambahkan ini juga di router nanti
};


const nodemailer = require('nodemailer');

const sendEmail = async (req, res) => {
  try {
    // ✅ Cek apakah user sudah login dari cookie
    const userEmail = req.cookies.user_email;

    if (!userEmail) {
      return res.status(401).json({ message: 'Silakan login terlebih dahulu untuk mengisi form.' });
    }
    const { nama, alamat, alasan } = req.body;
    const file = req.file;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${nama}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Form Penjualan Baju',
      text: `Nama: ${nama}\nAlamat: ${alamat}\nAlasan: ${alasan}\nEmail User: ${userEmail}`,
      attachments: file
        ? [{
            filename: file.originalname,
            content: file.buffer,
          }]
        : [],
    };

    await transporter.sendMail(mailOptions);

    console.log('Email berhasil dikirim!');
    res.status(200).json({ message: 'Email berhasil dikirim!' });
  } catch (err) {
    console.error('Gagal mengirim email:', err);
    res.status(500).json({ message: 'Gagal mengirim email' });
  }
};

module.exports = { sendEmail };

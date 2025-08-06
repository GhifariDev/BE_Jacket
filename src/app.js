// app.js
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());
const allowedOrigins = ['https://jaxel-tes.vercel.app', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


app.use(express.json());

// ⬇️ Import semua routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const emailRoute = require('./routes/email.route'); // atau sesuaikan path
const middlewareAuth = require('./middlewares/auth.js');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
// ⬇️ Gunakan prefix route
app.use('/api/products', productRoutes); // ✅ tambahkan ini
app.use('/api/auth', middlewareAuth);
app.use('/api', authRoutes);
app.use('/api', emailRoute);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

const companyReviewRoutes = require('./routes/companyReview');
// Middleware dan konfigurasi lain...

app.use('/api/review', companyReviewRoutes); // ✅ sekarang ini akan bekerja



module.exports = app;

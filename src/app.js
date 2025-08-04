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

  // ⬇️ Gunakan prefix route
  app.use('/api/products', productRoutes); // ✅ tambahkan ini
  app.use('/api', authRoutes);
  

  module.exports = app;

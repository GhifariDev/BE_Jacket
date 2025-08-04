  // app.js
  const express = require('express');
  require('dotenv').config();
  const cors = require('cors');
  const cookieParser = require('cookie-parser');

  const app = express();

  app.use(cookieParser());
  app.use(cors({
    origin: 'https://jaxel-tes.vercel.app', // sesuaikan front-end kamu
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

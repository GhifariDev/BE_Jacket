// app.js
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require("path");
const app = express();

app.use(cookieParser());
const allowedOrigins = ['https://jaxel-tes.vercel.app', 'http://localhost:3000', 'http://10.255.10.177:3000', 'https://b3c67a3f5cf7.ngrok-free.app'];

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
app.use("/uploads/products", express.static(path.join(__dirname, "uploads/products")));

// ⬇️ Import semua routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const emailRoute = require('./routes/email.route'); // atau sesuaikan path
const middlewareAuth = require('./middlewares/auth.js');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes');
const companyReviewRoutes = require('./routes/companyReview');
const otpRoutes = require('./routes/otpRoutes');
const sellerRoutes = require('./routes/seller.route.js'); // kalau ini undefined
const userController = require('./controllers/userController'); // <--- import controller
const adminProductRoutes = require('./routes/adminProduct.route');
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes); // ✅ tambahkan ini
app.use('/api/auth', middlewareAuth);
app.use('/api', authRoutes);
app.use('/api', emailRoute);
app.use('/api/cart', cartRoutes);
app.get('/api/me', middlewareAuth, userController.getCurrentUser);
app.use('/api/admin-products', adminProductRoutes);
app.use('/api/users', userRoutes);
app.use('/api/review', companyReviewRoutes); // ✅ sekarang ini akan bekerja
app.use('/api/otp', otpRoutes); // sama ini 
app.use('/api', sellerRoutes); // ini dua masih aneh -> ga rapi 


const productRoutess = require('./routes/ProductsRoutes.js');
app.use('/api/products', productRoutess);
const sellerRoutesForm = require('./routes/sellerform.route.js');
app.use('/api/seller', sellerRoutesForm);
const paymentRoutes = require("./routes/paymentsRoutes");
app.use("/api/payments", paymentRoutes);

module.exports = app;

const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/auth');
const { register, login, logout, getAllUsers, getUserById } = require('../controllers/auth.controller');

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Logout
router.post('/logout', logout);

// Cek apakah user sudah login (⬅️ penting untuk frontend auth check)
router.get('/check', authenticateUser, (req, res) => {
  res.status(200).json({ loggedIn: true, user: req.user });
});

// Get semua user
router.get('/user', getAllUsers);

// Get user by ID
router.get('/user/:id', getUserById);

module.exports = router;

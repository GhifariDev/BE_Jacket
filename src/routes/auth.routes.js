const express = require('express');
const router = express.Router();
const { register, login , getAllUsers, getUserById , logout } = require('../controllers/auth.controller');


// Register Route
router.post('/register', register);

// Login Route  
router.post('/login', login);

// ✅ GET semua user
router.get('/user', getAllUsers);

// ✅ GET user by ID
router.post('/logout', logout);

router.get('/user/:id', getUserById);

module.exports = router;

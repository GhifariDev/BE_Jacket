// routes/auth.js
const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/auth');

router.get('/check', authenticateUser, (req, res) => {
  res.status(200).json({ loggedIn: true, user: req.user });
});

module.exports = router;

const express = require('express');
const router = express.Router();

const { createCompanyReview, getAllCompanyReviews } = require('../controllers/companyReview.controller');
const authenticateUser = require('../middlewares/auth'); // ✅ ini yang benar

// POST /api/review/company
router.post('/company', authenticateUser, createCompanyReview);
router.get('/companys', getAllCompanyReviews);

module.exports = router;

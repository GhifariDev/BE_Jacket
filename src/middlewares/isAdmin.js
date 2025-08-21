// middleware/isAdmin.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const isAdmin = (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const roles = user.role || []; // ← sesuaikan dengan key di authenticateUser
    if (!roles.includes('admin')) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = isAdmin;


module.exports = isAdmin;

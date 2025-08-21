module.exports = function (allowedRoles = []) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Periksa apakah ada role user yang termasuk dalam allowedRoles
    if (!user.role.some(r => allowedRoles.includes(r))) {
      return res.status(403).json({ message: 'Hanya seller yang dapat mengakses ini' });
    }

    next();
  };
};

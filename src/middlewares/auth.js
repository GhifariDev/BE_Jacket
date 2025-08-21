const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userFromDb = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        isBlocked: true,
        roles: { select: { role: { select: { name: true } } } }
      }
    });

    if (!userFromDb) return res.status(401).json({ message: "Unauthorized" });
    if (userFromDb.isBlocked) return res.status(401).json({ message: "blocked" });

    req.user = {
      id: userFromDb.id,
      name: userFromDb.name,
      email: userFromDb.email,
      role: userFromDb.roles.map(r => r.role.name)
    };

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = authenticateUser;

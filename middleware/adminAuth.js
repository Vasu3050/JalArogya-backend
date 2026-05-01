const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from cookie or header
  let token = req.cookies ? req.cookies.token : null;

  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7, authHeader.length);
    } else {
      token = req.header('x-auth-token'); // fallback
    }
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    req.user = decoded; // { id: admin._id, role: "admin" }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

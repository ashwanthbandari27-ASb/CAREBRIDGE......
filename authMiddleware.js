const jwt = require('jsonwebtoken');
const { getModel } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'carebridge_jwt_secret_key_2026_super_secure';

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const usersCol = getModel('users');
    const user = await usersCol.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token. User not found.' });
    }

    // Attach user (without password)
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Authentication failed: ' + error.message });
  }
};

const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    const userRole = (req.user.role || '').toLowerCase();
    const authorized = allowedRoles.map(r => r.toLowerCase()).includes(userRole);

    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource. Allowed: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  checkRole,
  JWT_SECRET
};


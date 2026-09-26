const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  const match = /^Bearer\s+(\S+)$/.exec(req.headers.authorization || '');
  if (!match) return res.status(401).json({ success: false, message: 'Authorization: Bearer <token> required' });
  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET);
    if (payload.type !== 'access' || !payload.id) throw new Error('Wrong token type');
    const user = await User.findById(payload.id).select('+token_version');
    if (!user || user.token_version !== payload.v) throw new Error('User or token invalidated');
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized. Invalid or expired token.' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { protect, authorize };

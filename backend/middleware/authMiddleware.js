import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bracu_bazaar_secret_key_2026';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      let user = await User.findById(decoded.id).select('-passwordHash');

      if (!user && decoded.studentId) {
        user = await User.findOne({ studentId: decoded.studentId }).select('-passwordHash');
      }

      if (!user && decoded.email) {
        user = await User.findOne({ email: decoded.email }).select('-passwordHash');
      }

      if (!user) {
        return res.status(401).json({ message: 'User account session expired or not found. Please log in again.' });
      }

      if (user.isBanned) {
        return res.status(403).json({ 
          message: 'Your account has been banned/kicked out by Admin (Md. Fazlul Karim). Access denied.',
          isBanned: true 
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};

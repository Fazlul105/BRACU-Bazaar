import jwt from 'jsonwebtoken';
import { dbStore } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bracu_bazaar_secret_key_2026';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      let user = await dbStore.findUserById(decoded.id);

      if (!user && decoded.studentId) {
        user = await dbStore.findUserByStudentId(decoded.studentId);
      }

      if (!user && decoded.email) {
        user = await dbStore.findUserByEmail(decoded.email);
      }

      // Rehydrate user from decoded token payload if memory was cleared
      if (!user && (decoded.name || decoded.studentId)) {
        user = await dbStore.createUser({
          _id: decoded.id || ('user_' + Date.now()),
          name: decoded.name || 'BRACU Student',
          studentId: decoded.studentId || '23101229',
          email: decoded.email || `${decoded.studentId || 'student'}@g.bracu.ac.bd`,
          role: decoded.role || 'both',
          department: decoded.department || 'CSE',
          phone: decoded.phone || ''
        });
      }

      if (!user) {
        return res.status(401).json({ message: 'User account session expired. Please log in again.' });
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
      return res.status(401).json({ message: 'Not authorized, token failed' });
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

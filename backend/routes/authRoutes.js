import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore } from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bracu_bazaar_secret_key_2026';

const generateToken = (user) => {
  return jwt.sign({ 
    id: user._id,
    studentId: user.studentId,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    phone: user.phone
  }, JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new BRACU Student (Buyer/Seller)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, studentId, email, password, role, phone, department } = req.body;

    // 1. Validation
    if (!name || !studentId || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (Name, Student ID, Email, Password)' });
    }

    // 2. Exact 8-digit Student ID check
    const studentIdRegex = /^\d{8}$/;
    if (!studentIdRegex.test(studentId.trim())) {
      return res.status(400).json({ 
        message: 'Invalid Student ID! BRACU Student ID must consist of exactly 8 numeric digits (e.g. 23101229).' 
      });
    }

    // 3. Check existing user
    const existingStudent = await dbStore.findUserByStudentId(studentId.trim());
    if (existingStudent) {
      return res.status(400).json({ message: `Student ID ${studentId} is already registered on BRACU Bazaar.` });
    }

    const existingEmail = await dbStore.findUserByEmail(email.trim());
    if (existingEmail) {
      return res.status(400).json({ message: `Email ${email} is already registered.` });
    }

    // Special Auto-Admin check if name matches Md. Fazlul Karim & student ID 23101229
    let assignedRole = role || 'buyer';
    if (name.trim().toLowerCase() === 'md. fazlul karim' && studentId.trim() === '23101229') {
      assignedRole = 'admin';
    }

    // 4. Create user
    const newUser = await dbStore.createUser({
      name: name.trim(),
      studentId: studentId.trim(),
      email: email.trim(),
      password,
      passwordHash: bcrypt.hashSync(password, 10),
      role: assignedRole,
      phone: phone ? phone.trim() : '',
      department: department || 'CSE'
    });

    const token = generateToken(newUser);

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      studentId: newUser.studentId,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      department: newUser.department,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
});

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { studentIdOrEmail, password } = req.body;

    if (!studentIdOrEmail || !password) {
      return res.status(400).json({ message: 'Please enter your Student ID or Email and Password' });
    }

    const query = studentIdOrEmail.trim();

    // Find by Student ID or Email
    let user = await dbStore.findUserByStudentId(query);
    if (!user) {
      user = await dbStore.findUserByEmail(query);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid Student ID/Email or password' });
    }

    // Check if user is kicked out / banned by Admin
    if (user.isBanned) {
      return res.status(403).json({ 
        message: 'Your account has been banned/kicked out by Admin (Md. Fazlul Karim). Access revoked.',
        isBanned: true 
      });
    }

    // Verify Password
    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Student ID/Email or password' });
    }

    const token = generateToken(user);

    res.json({
      _id: user._id,
      name: user.name,
      studentId: user.studentId,
      email: user.email,
      role: user.role,
      phone: user.phone,
      department: user.department,
      avatar: user.avatar,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

export default router;

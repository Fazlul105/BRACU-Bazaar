import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect & admin middleware to all admin endpoints
router.use(protect);
router.use(admin);

// @desc    Get all users (buyers & sellers)
// @route   GET /api/admin/users
// @access  Admin only (Md. Fazlul Karim)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error retrieving platform users' });
  }
});

// @desc    Kick out / Ban user from BRACU Bazaar
// @route   POST /api/admin/kickout/:id
// @access  Admin only (Md. Fazlul Karim)
router.post('/kickout/:id', async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.params.id;

    // Prevent admin from banning himself
    if (userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot kick out their own admin account' });
    }

    const bannedUser = await User.findByIdAndUpdate(
      userId,
      {
        isBanned: true,
        bannedReason: reason || 'Kicked out by Admin Md. Fazlul Karim due to policy violation'
      },
      { new: true }
    ).select('-passwordHash');

    if (!bannedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: `User ${bannedUser.name} (ID: ${bannedUser.studentId}) has been kicked out / banned from BRACU Bazaar.`,
      user: bannedUser 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error kicking out user' });
  }
});

// @desc    Unban user
// @route   POST /api/admin/unban/:id
// @access  Admin only
router.post('/unban/:id', async (req, res) => {
  try {
    const unbannedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        isBanned: false,
        bannedReason: ''
      },
      { new: true }
    ).select('-passwordHash');

    if (!unbannedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User ${unbannedUser.name} reinstated successfully.`, user: unbannedUser });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error unbanning user' });
  }
});

// @desc    Permanently delete user account
// @route   DELETE /api/admin/users/:id
// @access  Admin only
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    if (userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin account cannot be deleted' });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clean up listings by this user
    await Product.deleteMany({ sellerId: userId });

    res.json({ message: `User ${deletedUser.name} deleted permanently.` });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting user' });
  }
});

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Admin only
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalBuyers, totalSellers, bannedUsersCount, totalProducts] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: { $in: ['seller', 'both'] } }),
      User.countDocuments({ isBanned: true }),
      Product.countDocuments()
    ]);

    res.json({
      totalUsers,
      totalBuyers,
      totalSellers,
      bannedUsersCount,
      totalProducts,
      adminName: 'Md. Fazlul Karim',
      adminStudentId: '23101229'
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching admin stats' });
  }
});

export default router;

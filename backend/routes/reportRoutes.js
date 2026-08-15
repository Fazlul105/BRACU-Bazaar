import express from 'express';
import Report from '../models/Report.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Report an inappropriate product listing or user
// @route   POST /api/reports
// @access  Private (Logged-in Student)
router.post('/', protect, async (req, res) => {
  try {
    const { targetType, targetId, targetName, reason, description } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: 'Target type, target ID, and reason are required' });
    }

    const report = await Report.create({
      reporterId: req.user._id,
      reporterName: req.user.name,
      targetType,
      targetId,
      targetName: targetName || 'Item/User',
      reason,
      description: description || '',
      status: 'pending'
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error submitting report' });
  }
});

// @desc    Get all reported items and users
// @route   GET /api/reports
// @access  Admin only (Md. Fazlul Karim)
router.get('/', protect, admin, async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error retrieving reports' });
  }
});

// @desc    Resolve report
// @route   PUT /api/reports/:id/resolve
// @access  Admin only
router.put('/:id/resolve', protect, admin, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved' },
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json({ message: 'Report resolved successfully', report });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error resolving report' });
  }
});

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Admin only
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);
    if (!deletedReport) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json({ message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting report' });
  }
});

export default router;

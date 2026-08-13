import express from 'express';
import { dbStore } from '../config/db.js';
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

    const report = await dbStore.createReport({
      reporterId: req.user._id,
      reporterName: req.user.name,
      targetType,
      targetId,
      targetName: targetName || 'Item/User',
      reason,
      description: description || ''
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
    const reports = await dbStore.getAllReports();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving reports' });
  }
});

// @desc    Resolve report
// @route   PUT /api/reports/:id/resolve
// @access  Admin only
router.put('/:id/resolve', protect, admin, async (req, res) => {
  try {
    const report = await dbStore.resolveReport(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json({ message: 'Report resolved successfully', report });
  } catch (error) {
    res.status(500).json({ message: 'Error resolving report' });
  }
});

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Admin only
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const deletedReport = await dbStore.deleteReport(req.params.id);
    if (!deletedReport) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json({ message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting report' });
  }
});

export default router;

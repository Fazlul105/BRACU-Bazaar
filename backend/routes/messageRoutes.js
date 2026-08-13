import express from 'express';
import { dbStore } from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all messaging routes
router.use(protect);

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { recipientId, recipientName, productId, productTitle, text } = req.body;

    if (!recipientId || !text || !text.trim()) {
      return res.status(400).json({ message: 'Recipient ID and message content are required' });
    }

    if (recipientId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot send a message to yourself' });
    }

    const message = await dbStore.sendMessage({
      senderId: req.user._id,
      senderName: req.user.name,
      recipientId,
      recipientName: recipientName || 'BRACU Student',
      productId,
      productTitle,
      text: text.trim()
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error sending message' });
  }
});

// @desc    Get all active conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await dbStore.getConversationsForUser(req.user._id);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

// @desc    Get total unread messages count for navbar badge
// @route   GET /api/messages/unread-count
// @access  Private
router.get('/unread-count', async (req, res) => {
  try {
    const count = await dbStore.getUnreadCount(req.user._id);
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Error counting unread messages' });
  }
});

// @desc    Get message history in conversation with a specific partner
// @route   GET /api/messages/:partnerId
// @access  Private
router.get('/:partnerId', async (req, res) => {
  try {
    const messages = await dbStore.getMessagesInConversation(req.user._id, req.params.partnerId);
    // Mark incoming messages from partner as read
    await dbStore.markMessagesAsRead(req.user._id, req.params.partnerId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversation messages' });
  }
});

// @desc    Mark conversation messages as read
// @route   PUT /api/messages/:partnerId/read
// @access  Private
router.put('/:partnerId/read', async (req, res) => {
  try {
    await dbStore.markMessagesAsRead(req.user._id, req.params.partnerId);
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating read status' });
  }
});

export default router;

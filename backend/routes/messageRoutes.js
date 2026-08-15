import express from 'express';
import Message from '../models/Message.js';
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

    const message = await Message.create({
      senderId: req.user._id,
      senderName: req.user.name,
      recipientId,
      recipientName: recipientName || 'BRACU Student',
      productId: productId || undefined,
      productTitle: productTitle || '',
      text: text.trim(),
      read: false
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
    const currentUserId = req.user._id;

    // Find all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId },
        { recipientId: currentUserId }
      ]
    }).sort({ createdAt: -1 });

    const conversationMap = new Map();

    for (const msg of messages) {
      const isSender = msg.senderId.toString() === currentUserId.toString();
      const partnerId = isSender ? msg.recipientId.toString() : msg.senderId.toString();
      const partnerName = isSender ? msg.recipientName : msg.senderName;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partnerName,
          lastMessage: msg.text,
          lastTimestamp: msg.createdAt,
          unreadCount: 0,
          productId: msg.productId,
          productTitle: msg.productTitle
        });
      }

      if (!isSender && !msg.read) {
        const convo = conversationMap.get(partnerId);
        convo.unreadCount += 1;
      }
    }

    const conversations = Array.from(conversationMap.values());
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching conversations' });
  }
});

// @desc    Get total unread messages count for navbar badge
// @route   GET /api/messages/unread-count
// @access  Private
router.get('/unread-count', async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipientId: req.user._id,
      read: false
    });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error counting unread messages' });
  }
});

// @desc    Get message history in conversation with a specific partner
// @route   GET /api/messages/:partnerId
// @access  Private
router.get('/:partnerId', async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const partnerId = req.params.partnerId;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, recipientId: partnerId },
        { senderId: partnerId, recipientId: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    // Mark incoming messages from partner as read
    await Message.updateMany(
      { senderId: partnerId, recipientId: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching conversation messages' });
  }
});

// @desc    Mark conversation messages as read
// @route   PUT /api/messages/:partnerId/read
// @access  Private
router.put('/:partnerId/read', async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const partnerId = req.params.partnerId;

    await Message.updateMany(
      { senderId: partnerId, recipientId: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating read status' });
  }
});

export default router;

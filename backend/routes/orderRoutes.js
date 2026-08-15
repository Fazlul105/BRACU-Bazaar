import express from 'express';
import Order from '../models/Order.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (Registered BRACU Student)
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, deliveryFee, totalAmount, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.meetupLocation) {
      return res.status(400).json({ message: 'Please complete all required shipping & meetup details' });
    }

    const orderNumber = 'BB-' + Math.floor(100000 + Math.random() * 900000);

    const newOrder = await Order.create({
      orderNumber,
      buyerId: req.user._id,
      buyerName: req.user.name,
      buyerEmail: req.user.email,
      buyerStudentId: req.user.studentId,
      items,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Campus Handover',
      subtotal: Number(subtotal || 0),
      deliveryFee: Number(deliveryFee || 0),
      totalAmount: Number(totalAmount || 0),
      notes: notes || '',
      isPaid: paymentMethod !== 'Cash on Campus Handover'
    });

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error placing order' });
  }
});

// @desc    Get personal order history for logged-in user
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching order history' });
  }
});

// @desc    Get individual order by ID or orderNumber
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    let order;
    if (req.params.id.startsWith('BB-')) {
      order = await Order.findOne({ orderNumber: req.params.id });
    } else {
      order = await Order.findById(req.params.id);
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    const isBuyer = order.buyerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching order details' });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating order status' });
  }
});

export default router;

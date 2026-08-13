import express from 'express';
import { dbStore } from '../config/db.js';
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

    const newOrder = await dbStore.createOrder({
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
    const orders = await dbStore.getOrdersForUser(req.user._id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order history' });
  }
});

// @desc    Get individual order by ID or orderNumber
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await dbStore.getOrderById(req.params.id);
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
    res.status(500).json({ message: 'Error fetching order details' });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await dbStore.updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
});

export default router;

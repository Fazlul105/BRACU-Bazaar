import express from 'express';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Fetch all products with filtering & search
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, condition, search, minPrice, maxPrice, sellerId } = req.query;

    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (condition && condition !== 'All') {
      filter.condition = condition;
    }

    if (sellerId) {
      filter.sellerId = sellerId;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching products' });
  }
});

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product listing not found' });
    }

    const reviews = await Review.find({ productId: req.params.id }).sort({ createdAt: -1 });
    res.json({ ...product.toObject(), reviews });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching product details' });
  }
});

// @desc    Create a product listing
// @route   POST /api/products
// @access  Private (Registered BRACU Student)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, price, category, condition, images, meetupLocation, phone } = req.body;

    if (!title || !description || price === undefined || !category || !condition) {
      return res.status(400).json({ message: 'Please complete all required product fields' });
    }

    const defaultImage = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';
    const productImages = (images && images.length > 0) ? images : [defaultImage];

    const newProduct = await Product.create({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      condition,
      images: productImages,
      sellerId: req.user._id,
      sellerName: req.user.name,
      sellerStudentId: req.user.studentId,
      sellerPhone: phone || req.user.phone || 'N/A',
      meetupLocation: meetupLocation || 'Merul Badda Permanent Campus'
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating product listing' });
  }
});

// @desc    Update product listing
// @route   PUT /api/products/:id
// @access  Private (Seller owner or Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product listing not found' });
    }

    // Check ownership or admin status
    const isOwner = product.sellerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const { title, description, price, category, condition, images, meetupLocation, phone, status } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price !== undefined) updateData.price = Number(price);
    if (category !== undefined) updateData.category = category;
    if (condition !== undefined) updateData.condition = condition;
    if (images && images.length > 0) updateData.images = images;
    if (meetupLocation !== undefined) updateData.meetupLocation = meetupLocation;
    if (phone !== undefined) updateData.sellerPhone = phone;
    if (status !== undefined) updateData.status = status;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating product listing' });
  }
});

// @desc    Delete product listing
// @route   DELETE /api/products/:id
// @access  Private (Seller owner or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check ownership or admin status
    const isOwner = product.sellerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await Product.findByIdAndDelete(req.params.id);
    await Review.deleteMany({ productId: req.params.id });

    res.json({ message: 'Product listing removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting product' });
  }
});

export default router;

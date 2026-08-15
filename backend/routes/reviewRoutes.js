import express from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to recalculate average rating & review count for a product
async function updateProductRatingStats(productId) {
  try {
    const reviews = await Review.find({ productId });
    const numReviews = reviews.length;
    let averageRating = 0;
    if (numReviews > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      averageRating = parseFloat((sum / numReviews).toFixed(1));
    }
    await Product.findByIdAndUpdate(productId, { averageRating, numReviews });
  } catch (err) {
    console.error('Error updating product rating stats:', err.message);
  }
}

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error loading reviews' });
  }
});

// @desc    Add review for a product
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Please provide rating (1-5) and review comment' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const newReview = await Review.create({
      productId,
      reviewerId: req.user._id,
      reviewerName: req.user.name,
      reviewerStudentId: req.user.studentId,
      rating: Number(rating),
      comment: comment.trim(),
      verifiedBuyer: true
    });

    // Update product average rating & review count
    await updateProductRatingStats(productId);

    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error submitting review' });
  }
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Author or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const isAuthor = review.reviewerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate stats
    await updateProductRatingStats(productId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting review' });
  }
});

export default router;

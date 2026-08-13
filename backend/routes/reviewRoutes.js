import express from 'express';
import { dbStore } from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await dbStore.getReviewsForProduct(req.params.productId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error loading reviews' });
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

    const product = await dbStore.getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const newReview = await dbStore.addReview({
      productId,
      reviewerId: req.user._id,
      reviewerName: req.user.name,
      reviewerStudentId: req.user.studentId,
      rating: Number(rating),
      comment: comment.trim()
    });

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
    const review = await dbStore.deleteReview(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review' });
  }
});

export default router;

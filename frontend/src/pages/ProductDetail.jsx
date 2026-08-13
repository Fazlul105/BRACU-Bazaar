import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  Star, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Calendar, 
  Tag, 
  ArrowLeft, 
  MessageSquare, 
  CheckCircle2, 
  Trash2,
  AlertCircle,
  ExternalLink,
  Edit3,
  ShoppingCart,
  Flag
} from 'lucide-react';
import EditProductModal from '../components/EditProductModal';
import ReportModal from '../components/ReportModal';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { addToCart } = useCart();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Product not found');
      
      setProduct(data);
      setReviews(data.reviews || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in with your BRACU Student account to post a review.");
      navigate('/login');
      return;
    }

    if (!comment.trim()) return;

    setSubmittingReview(true);
    setReviewMsg(null);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          productId: id,
          rating,
          comment
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Review failed');

      setComment('');
      setReviewMsg({ type: 'success', text: 'Thank you! Your product review has been posted.' });
      fetchProductDetails();
    } catch (err) {
      setReviewMsg({ type: 'error', text: err.message });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to remove this review?")) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (!res.ok) throw new Error("Could not delete review");
      fetchProductDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 space-y-6">
        <div className="h-96 glass-card rounded-3xl animate-pulse bg-slate-900" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center glass-panel p-10 rounded-3xl space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <p className="text-xs text-slate-400">{error || "This listing may have been sold or removed by Admin."}</p>
        <Link to="/products" className="inline-block px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const imageSrc = (product.images && product.images.length > 0)
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </button>
      </div>

      {/* PRODUCT OVERVIEW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left: High-Res Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden glass-card relative border border-slate-800">
            <img
              src={imageSrc}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';
              }}
            />
            <span className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30 text-xs font-semibold text-emerald-400">
              {product.condition}
            </span>
          </div>
        </div>

        {/* Right: Product Details & Seller Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <Tag className="w-3.5 h-3.5" /> {product.category}
              </div>
              {(isAdmin || (user && (user._id === product.sellerId || user.studentId === product.sellerStudentId))) && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Listing
                </button>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-snug">
              {product.title}
            </h1>
            <div className="text-3xl font-black text-emerald-400 mt-3 flex items-center justify-between">
              <span>৳ {product.price.toLocaleString()}</span>
              {product.status === 'sold' && (
                <span className="text-xs font-bold uppercase px-3 py-1 bg-rose-950 text-rose-300 rounded-full border border-rose-500/30">
                  Sold Out
                </span>
              )}
            </div>
          </div>

          {/* Rating Summary & Add to Cart Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
                <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                <span>{product.averageRating || 0}</span>
              </div>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-300 font-medium">
                {reviews.length} Verified BRACU Student Review{reviews.length !== 1 ? 's' : ''}
              </span>
            </div>

            <button
              onClick={() => addToCart(product)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60">
              {product.description}
            </p>
          </div>

          {/* Campus Meetup Location */}
          <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Recommended Meetup Location</div>
              <div className="text-xs text-slate-300">{product.meetupLocation}</div>
            </div>
          </div>

          {/* VERIFIED SELLER CONTACT CARD */}
          <div className="glass-panel p-5 rounded-2xl space-y-4 border-emerald-500/30">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 p-[2px]">
                  <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center font-bold text-white text-xs">
                    {product.sellerName ? product.sellerName.substring(0, 2).toUpperCase() : 'SU'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    {product.sellerName}
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xs text-emerald-400 font-medium">
                    Verified BRACU Student
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2.5 py-1 bg-emerald-950 text-emerald-300 rounded-full border border-emerald-500/30">
                Verified Seller
              </span>
            </div>

            {/* Direct Contact & Messaging Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <Link
                to={`/messages?partnerId=${product.sellerId}&partnerName=${encodeURIComponent(product.sellerName)}&productId=${product._id}&productTitle=${encodeURIComponent(product.title)}`}
                className="flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl shadow shadow-emerald-500/20 transition-all"
              >
                <MessageSquare className="w-4 h-4 text-slate-950" />
                <span>Message Seller</span>
              </Link>

              <a
                href={`tel:${product.sellerPhone}`}
                className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call {product.sellerPhone || 'Seller'}</span>
              </a>

              <a
                href={`https://wa.me/88${product.sellerPhone?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-semibold text-xs rounded-xl transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Report Listing Button */}
            <div className="pt-2 border-t border-slate-800/80 flex justify-end">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors font-medium"
              >
                <Flag className="w-3.5 h-3.5" /> Report Inappropriate Listing or User
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* REVIEWS & RATINGS SECTION */}
      <section className="glass-panel p-8 rounded-3xl space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-emerald-400" /> Student Reviews & Ratings
            </h2>
            <p className="text-xs text-slate-400">Authentic feedback from BRACU buyers</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-emerald-400">{product.averageRating || 0} / 5</div>
            <div className="text-xs text-slate-400">{reviews.length} Total Review{reviews.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Submit Review Form */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Write a Product Review</h3>
          
          {reviewMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              reviewMsg.type === 'success' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
            }`}>
              {reviewMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{reviewMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleAddReview} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star className={`w-6 h-6 ${star <= rating ? 'fill-emerald-400 text-emerald-400' : 'text-slate-600'}`} />
                  </button>
                ))}
                <span className="text-xs font-bold text-emerald-400 ml-2">{rating} Star{rating > 1 ? 's' : ''}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Your Detailed Feedback</label>
              <textarea
                rows="3"
                required
                placeholder="How was the product condition? How was the meetup transaction with the seller at BRACU?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:border-emerald-400/80"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              {submittingReview ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </form>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <div key={rev._id} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 space-y-3 relative">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-emerald-400">
                      {rev.reviewerName ? rev.reviewerName.substring(0, 2).toUpperCase() : 'ST'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {rev.reviewerName}
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Verified Student Buyer
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                      <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300">{rev.rating}</span>
                    </div>

                    {(isAdmin || (user && user._id === rev.reviewerId)) && (
                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  "{rev.comment}"
                </p>

                <div className="text-[10px] text-slate-500">
                  Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                </div>

              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No reviews posted for this item yet. Be the first BRACU student to review!
            </div>
          )}
        </div>

      </section>

      {/* EDIT PRODUCT MODAL */}
      <EditProductModal
        product={product}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdated={(updated) => {
          setProduct(updated);
        }}
      />

      {/* REPORT PRODUCT / USER MODAL */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetType="product"
        targetId={product._id}
        targetName={product.title}
      />

    </div>
  );
}

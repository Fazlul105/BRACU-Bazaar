import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, ShieldCheck, Tag, Trash2, Edit3, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onDelete, onEdit }) {
  const { user, isAdmin } = useAuth();
  const { addToCart } = useCart();

  const isOwner = user && (user._id === product.sellerId || user.studentId === product.sellerStudentId);

  const getConditionColor = (cond) => {
    switch (cond) {
      case 'Brand New': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Like New': return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'Good': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default: return 'bg-slate-800/60 text-slate-300 border-slate-700/40';
    }
  };

  const imageSrc = (product.images && product.images.length > 0)
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group relative">
      {/* Condition Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md ${getConditionColor(product.condition)}`}>
          {product.condition}
        </span>
      </div>

      {(isAdmin || isOwner) && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(product);
              }}
              title="Edit listing details"
              className="p-2 rounded-full bg-slate-900/90 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition-all shadow-lg"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(product._id);
              }}
              title={isAdmin ? "Admin: Remove listing" : "Delete your listing"}
              className="p-2 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all shadow-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Product Image */}
      <Link to={`/products/${product._id}`} className="block relative aspect-[4/3] overflow-hidden bg-slate-900">
        <img
          src={imageSrc}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80" />
        
        {/* Category Tag */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-medium text-slate-200 bg-slate-900/85 backdrop-blur-sm px-2.5 py-0.5 rounded-md border border-white/10">
          <Tag className="w-3 h-3 text-amber-400" />
          {product.category}
        </div>
      </Link>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex justify-between items-start gap-2 mb-1">
            <Link to={`/products/${product._id}`} className="font-semibold text-white text-base hover:text-amber-400 line-clamp-1 transition-colors">
              {product.title}
            </Link>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-2">
            {product.description}
          </p>
        </div>

        <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between">
            <div className="text-xl font-extrabold text-amber-400">
              ৳ {product.price.toLocaleString()}
            </div>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product);
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow shadow-amber-500/20 transition-all flex items-center gap-1.5"
              title="Add item to cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Rating Summary */}
          {product.numReviews > 0 ? (
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.averageRating}</span>
              <span className="text-slate-400 text-[10px]">({product.numReviews} reviews)</span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-500">Unreviewed</div>
          )}

          {/* Seller & Meetup Info */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1 text-slate-300 truncate max-w-[170px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-medium truncate">{product.sellerName}</span>
            </span>

            <span className="flex items-center gap-1 text-slate-400 truncate max-w-[130px]" title={product.meetupLocation}>
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{product.meetupLocation}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


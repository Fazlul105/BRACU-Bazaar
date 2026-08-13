import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getItemCount,
    isCartOpen, 
    setIsCartOpen 
  } = useCart();

  if (!isCartOpen) return null;

  const subtotal = getCartTotal();

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md transition-opacity">
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={() => setIsCartOpen(false)} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-panel bg-slate-950/95 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-amber-400">
              <ShoppingBag className="w-6 h-6" />
              <h2 className="text-lg font-black text-white">Your Shopping Cart</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {getItemCount()} items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {cartItems.length > 0 ? (
              cartItems.map(({ product, quantity }) => (
                <div 
                  key={product._id} 
                  className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex gap-3 relative group"
                >
                  <img
                    src={(product.images && product.images.length > 0) ? product.images[0] : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'}
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded-xl border border-slate-700 shrink-0 bg-slate-950"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';
                    }}
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white truncate">{product.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Condition: {product.condition}</p>
                      <div className="text-sm font-black text-amber-400 mt-1">
                        ৳ {product.price.toLocaleString()}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-800/60">
                      <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                        <button
                          onClick={() => updateQuantity(product._id, quantity - 1)}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white px-2 font-mono">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product._id, quantity + 1)}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product._id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">Your cart is empty</h3>
                <p className="text-xs text-slate-400">Add course textbooks, Casio calculators, or gadgets to get started.</p>
              </div>
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-950 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({getItemCount()} items)</span>
                  <span className="font-semibold text-white">৳ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Campus Meetup / Delivery</span>
                  <span className="font-semibold text-emerald-400">Free (Campus Pickup)</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
                  <span>Total Order Price</span>
                  <span className="text-amber-400">৳ {subtotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={clearCart}
                  className="w-full py-2 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-colors"
                >
                  Clear Shopping Cart
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Verified BRACU Student Hand-to-Hand Exchange</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  CreditCard, 
  Truck
} from 'lucide-react';

export default function Checkout() {
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Saved Shipping Info
  const savedShipping = (() => {
    try {
      const s = localStorage.getItem('bracu_bazaar_shipping');
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  })();

  const [fullName, setFullName] = useState(savedShipping?.fullName || user?.name || '');
  const [phone, setPhone] = useState(savedShipping?.phone || user?.phone || '');
  const [meetupLocation, setMeetupLocation] = useState(
    savedShipping?.meetupLocation || 'Merul Badda Permanent Campus (Library Plaza)'
  );
  const [notes, setNotes] = useState(savedShipping?.notes || '');
  const [deliveryOption, setDeliveryOption] = useState('pickup'); // 'pickup' (0 BDT) or 'hostel' (30 BDT)
  const [paymentMethod, setPaymentMethod] = useState('Cash on Campus Handover');
  const [saveInfo, setSaveInfo] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const campusLocations = [
    'Merul Badda Permanent Campus (Library Plaza)',
    'Merul Badda Permanent Campus (Food Court)',
    'Mohakhali UB1 / UB2 Main Entrance',
    'Mohakhali UB5 / UB7 Plaza',
    'Residential Campus Tarakanda',
    'Badda Gate 1 / Badda Gate 2',
    'Hostel Room / Mess Address'
  ];

  useEffect(() => {
    if (!user) {
      alert("Please sign in with your BRACU student account to proceed to checkout.");
      navigate('/login');
    }
  }, [user, navigate]);

  const subtotal = getCartTotal();
  const deliveryFee = deliveryOption === 'hostel' ? 30 : 0;
  const grandTotal = subtotal + deliveryFee;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      setError("Your cart is empty!");
      return;
    }

    setLoading(true);
    setError(null);

    // Save Shipping Info to LocalStorage if checked
    if (saveInfo) {
      try {
        localStorage.setItem('bracu_bazaar_shipping', JSON.stringify({
          fullName,
          phone,
          meetupLocation,
          notes
        }));
      } catch (e) {
        console.error(e);
      }
    }

    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item.product._id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          image: (item.product.images && item.product.images.length > 0) ? item.product.images[0] : '',
          sellerName: item.product.sellerName
        })),
        shippingAddress: {
          fullName,
          phone,
          meetupLocation,
          email: user.email,
          studentId: user.studentId
        },
        paymentMethod,
        subtotal,
        deliveryFee,
        totalAmount: grandTotal,
        notes
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to place order');

      clearCart();
      setOrderSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="glass-panel p-8 rounded-3xl space-y-6 text-center border-emerald-500/30">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Order Confirmed!</h1>
            <p className="text-xs text-slate-300">
              Order Number: <span className="font-mono text-amber-400 font-bold">{orderSuccess.orderNumber}</span>
            </p>
          </div>

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-left text-xs space-y-2 text-slate-300">
            <div className="flex justify-between border-b border-slate-800 pb-2 font-semibold text-white">
              <span>Total Price Paid</span>
              <span className="text-amber-400 font-bold">৳ {orderSuccess.totalAmount.toLocaleString()}</span>
            </div>
            <div>Meetup Spot: <strong className="text-white">{orderSuccess.shippingAddress.meetupLocation}</strong></div>
            <div>Contact Phone: <strong className="text-white">{orderSuccess.shippingAddress.phone}</strong></div>
            <div>Payment: <strong className="text-emerald-400">{orderSuccess.paymentMethod}</strong></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/my-orders"
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              View Order History
            </Link>
            <Link
              to="/products"
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400">Please add items to your cart before proceeding to checkout.</p>
        <Link
          to="/products"
          className="inline-block px-6 py-3 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg"
        >
          Explore Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-amber-400" /> Complete Checkout & Order
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your items, enter campus handover details, and confirm order
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left (2 cols): Shipping & Meetup Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Shipping & Meetup Info */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <MapPin className="w-4 h-4 text-amber-400" />
              Campus Handover & Shipping Information
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Contact Phone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">BRACU Meetup Spot *</label>
                  <select
                    value={meetupLocation}
                    onChange={(e) => setMeetupLocation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-amber-400"
                  >
                    {campusLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
              </div>

              {/* Delivery Option */}
              <div>
                <label className="block font-semibold text-slate-300 mb-2">Delivery / Pickup Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryOption('pickup')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      deliveryOption === 'pickup'
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>Campus Pickup</span>
                      <span className="text-emerald-400 text-[10px]">Free</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Hand-to-hand exchange at campus spot</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryOption('hostel')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      deliveryOption === 'hostel'
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>Hostel Express</span>
                      <span className="text-amber-400 text-[10px]">৳ 30</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Direct hostel/mess doorstep delivery</p>
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Handover Notes (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Meet near library gate after CSE370 lab at 3:30 PM..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-amber-400"
                />
              </div>

              {/* Save Shipping Info */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-500"
                />
                <span className="text-xs text-slate-300">Save shipping details for future orders</span>
              </label>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <CreditCard className="w-4 h-4 text-amber-400" />
              Payment Method
            </h2>

            <div className="space-y-3 text-xs">
              {[
                { id: 'Cash on Campus Handover', label: 'Cash on Hand-to-Hand Campus Meetup', desc: 'Pay cash directly when receiving the item at campus' },
                { id: 'bKash Mobile Banking', label: 'bKash Mobile Banking (BRACU Merchant)', desc: 'Pay via bKash on delivery / pickup' },
                { id: 'Nagad Mobile Banking', label: 'Nagad Mobile Banking', desc: 'Pay via Nagad wallet' }
              ].map(pm => (
                <label 
                  key={pm.id} 
                  className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === pm.id 
                      ? 'bg-amber-500/10 border-amber-500/80 text-white' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.id}
                    checked={paymentMethod === pm.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-0.5 accent-amber-500"
                  />
                  <div>
                    <div className="font-bold text-white">{pm.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{pm.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Right (1 col): Order Summary & Complete Calculation */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-5 border-slate-800 sticky top-24">
            <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
              Order Summary ({cartItems.length} items)
            </h2>

            {/* Items Summary List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map(({ product, quantity }) => (
                <div key={product._id} className="flex items-center gap-3 text-xs">
                  <img
                    src={(product.images && product.images.length > 0) ? product.images[0] : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'}
                    alt={product.title}
                    className="w-12 h-12 object-cover rounded-lg border border-slate-800 shrink-0 bg-slate-950"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{product.title}</p>
                    <p className="text-[10px] text-slate-400">Qty: {quantity} × ৳ {product.price.toLocaleString()}</p>
                  </div>
                  <div className="font-black text-amber-400">
                    ৳ {(product.price * quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Complete Price Calculation */}
            <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-semibold text-white">৳ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery / Handover Fee</span>
                <span className="font-semibold text-emerald-400">
                  {deliveryFee === 0 ? 'Free' : `৳ ${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                <span>Total Amount Due</span>
                <span className="text-amber-400">৳ {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Processing Order...' : 'Confirm & Place Order'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Instant order confirmation with student notification</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}

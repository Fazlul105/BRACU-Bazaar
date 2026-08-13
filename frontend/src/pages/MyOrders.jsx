import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  CreditCard, 
  Package, 
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyOrders();
  }, [user, navigate]);

  const fetchMyOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch order history');

      setOrders(data);
      if (data.length > 0) {
        setExpandedOrderId(data[0]._id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
      case 'Completed':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
      case 'Confirmed':
      case 'Processing':
        return 'bg-sky-950/80 text-sky-300 border-sky-500/40';
      default:
        return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* HEADER BANNER */}
      <div className="glass-panel p-8 rounded-3xl border-sky-500/20 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-950 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Personal Order History</h1>
              <p className="text-xs text-slate-300 mt-1">
                Track status and inspect past orders placed on BRACU Bazaar
              </p>
            </div>
          </div>

          <Link
            to="/products"
            className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" /> Browse Marketplace
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading order history...</div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map(order => {
            const isExpanded = expandedOrderId === order._id;
            return (
              <div 
                key={order._id} 
                className="glass-card rounded-2xl border-slate-800 overflow-hidden transition-all"
              >
                
                {/* Order Summary Row */}
                <div 
                  onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                  className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 font-mono text-xs font-bold shrink-0">
                      #{order.orderNumber.substring(10)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{order.orderNumber}</span>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Total Price</div>
                      <div className="text-lg font-black text-amber-400">
                        ৳ {order.totalAmount.toLocaleString()}
                      </div>
                    </div>
                    <button className="p-1.5 text-slate-400 hover:text-white">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-800/80 bg-slate-950/40 space-y-4">
                    
                    {/* Items List */}
                    <div className="pt-4 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ordered Items</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center gap-3">
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'}
                              alt={item.title}
                              className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0 bg-slate-950"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';
                              }}
                            />
                            <div className="min-w-0 flex-1 text-xs">
                              <p className="font-bold text-white truncate">{item.title}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Seller: {item.sellerName}</p>
                              <p className="text-[11px] font-semibold text-amber-400 mt-0.5">
                                ৳ {item.price.toLocaleString()} × {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping & Payment Meta */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-800/60">
                      <div className="space-y-1 text-slate-300">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" /> Handover Spot & Recipient
                        </div>
                        <div>Name: <strong className="text-white">{order.shippingAddress.fullName}</strong></div>
                        <div>Contact Phone: <strong className="text-white">{order.shippingAddress.phone}</strong></div>
                        <div>Location: <strong className="text-sky-300">{order.shippingAddress.meetupLocation}</strong></div>
                        {order.notes && <div className="text-[11px] text-slate-400 italic">" {order.notes} "</div>}
                      </div>

                      <div className="space-y-1 text-slate-300">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Payment & Calculation
                        </div>
                        <div>Payment Method: <strong className="text-emerald-400">{order.paymentMethod}</strong></div>
                        <div>Subtotal: ৳ {order.subtotal.toLocaleString()}</div>
                        <div>Delivery Fee: {order.deliveryFee === 0 ? 'Free' : `৳ ${order.deliveryFee}`}</div>
                        <div className="font-bold text-amber-400 text-sm">Grand Total: ৳ {order.totalAmount.toLocaleString()}</div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Order History Found</h3>
          <p className="text-xs text-slate-400">
            You haven't placed any orders on BRACU Bazaar yet. Browse textbooks, calculators, and gadgets available for campus handover!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            Explore Marketplace
          </Link>
        </div>
      )}

    </div>
  );
}

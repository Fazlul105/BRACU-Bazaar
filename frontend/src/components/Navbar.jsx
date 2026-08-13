import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  PlusCircle, 
  ShieldCheck, 
  User, 
  LogOut, 
  Search, 
  Menu, 
  X,
  GraduationCap,
  ShoppingCart,
  Package,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { getItemCount, setIsCartOpen, toastMessage } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/messages/unread-count', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (e) {
        console.error("Error fetching unread count:", e);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 3000);

    return () => clearInterval(interval);
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-2xl flex items-center gap-2 animate-bounce border border-amber-300">
          <CheckCircle2 className="w-4 h-4 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full glass-panel border-b border-amber-500/15 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 text-slate-950" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg text-white tracking-tight leading-none group-hover:text-amber-400 transition-colors">
                  BRACU <span className="text-amber-400">Bazaar</span>
                </span>
                <span className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase flex items-center gap-1 mt-0.5">
                  <GraduationCap className="w-3 h-3 text-amber-400" /> Verified Student Hub
                </span>
              </div>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4 relative">
              <input
                type="text"
                placeholder="Search books, calculators, gadgets, hostel items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-full text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            </form>

            {/* Navigation Items */}
            <div className="hidden lg:flex items-center gap-4">
              <Link 
                to="/products" 
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Browse All
              </Link>

              {/* Cart Drawer Trigger Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 hover:border-amber-500/40 transition-all flex items-center gap-1.5"
                title="View Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow">
                    {getItemCount()}
                  </span>
                )}
              </button>

              {user && (
                <>
                  {/* Messages Inbox Link */}
                  <Link
                    to="/messages"
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 hover:border-amber-500/40 transition-all flex items-center gap-1.5 relative group"
                    title="Student Inbox & Direct Messages"
                  >
                    <MessageSquare className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 min-w-[20px] h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-lg border border-amber-300 animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <Link 
                    to="/my-orders" 
                    className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Package className="w-4 h-4 text-amber-400" />
                    My Orders
                  </Link>

                  <Link 
                    to="/my-listings" 
                    className="text-sm font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    My Listings
                  </Link>

                  <Link 
                    to="/add-product" 
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Post Item
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50 text-xs font-semibold tracking-wide uppercase transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Admin Panel (Md. Fazlul Karim)
                </Link>
              )}

              {user ? (
                <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white leading-none">{user.name}</div>
                    <div className="text-[11px] text-amber-400 font-medium mt-1">{user.department || 'BRACU Student'} • {user.role === 'both' ? 'Buyer & Seller' : user.role}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium border border-amber-500/30 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle & Icons */}
            <div className="flex items-center gap-2 lg:hidden">
              {user && (
                <Link
                  to="/messages"
                  className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300"
                  title="Direct Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 px-1 py-0.5 min-w-[18px] h-4.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300"
              >
                <ShoppingCart className="w-5 h-5" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden glass-panel border-b border-slate-800 px-4 py-6 space-y-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search marketplace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </form>

            <div className="flex flex-col space-y-3">
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="text-slate-200 py-1 font-medium">Browse All Products</Link>
              
              {user && (
                <>
                  <Link to="/messages" onClick={() => setMobileMenuOpen(false)} className="text-amber-400 py-1 font-medium flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Direct Messages
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs">
                        {unreadCount} unread
                      </span>
                    )}
                  </Link>
                  <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 py-1 font-medium flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-400" /> My Personal Orders
                  </Link>
                  <Link to="/my-listings" onClick={() => setMobileMenuOpen(false)} className="text-amber-400 py-1 font-medium flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" /> My Listings
                  </Link>
                  <Link to="/add-product" onClick={() => setMobileMenuOpen(false)} className="text-amber-300 py-1 font-medium flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Post New Item
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-amber-400 py-1 font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Admin Panel (Md. Fazlul Karim)
                </Link>
              )}

              {user ? (
                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white">{user.name}</div>
                    <div className="text-xs text-amber-400 font-medium">{user.department || 'BRACU Student'} • {user.role === 'both' ? 'Buyer & Seller' : user.role}</div>
                  </div>
                  <button onClick={handleLogout} className="text-rose-400 text-sm font-medium">
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-800 flex gap-3">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 bg-slate-800 rounded-lg text-white font-medium text-sm">Log In</Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 bg-amber-500 rounded-lg text-slate-950 font-bold text-sm">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}


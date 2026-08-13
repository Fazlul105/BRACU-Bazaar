import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Search, 
  AlertCircle,
  Tag,
  MapPin,
  Sparkles
} from 'lucide-react';
import EditProductModal from '../components/EditProductModal';

export default function MyListings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Edit Modal State
  const [selectedProductToEdit, setSelectedProductToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyProducts();
  }, [user]);

  const fetchMyProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products?sellerId=${user._id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load your listings');
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'available' ? 'sold' : 'available';
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Status toggle failed');

      setProducts(products.map(p => p._id === product._id ? { ...p, status: newStatus } : p));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to permanently delete this product listing?")) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');

      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts(products.map(p => p._id === updatedProduct._id ? updatedProduct : p));
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                          p.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const availableCount = products.filter(p => p.status === 'available').length;
  const soldCount = products.filter(p => p.status === 'sold').length;
  const totalValue = products.reduce((acc, p) => acc + p.price, 0);

  return (
    <div className="space-y-8 pb-16">
      
      {/* HEADER BANNER */}
      <div className="glass-panel p-8 rounded-3xl border-amber-500/20 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">My Seller Dashboard & Listings</h1>
              <p className="text-xs text-slate-300 mt-1">
                Manage, edit, update, or remove your items listed on BRACU Bazaar
              </p>
            </div>
          </div>

          <Link
            to="/add-product"
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Post New Item
          </Link>
        </div>
      </div>

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-1">Total Listings</div>
          <div className="text-3xl font-black text-white">{products.length}</div>
          <p className="text-[10px] text-slate-500 mt-1">Items posted by you</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border-emerald-950/60 bg-emerald-950/20">
          <div className="text-xs font-semibold text-emerald-300 mb-1">Active for Sale</div>
          <div className="text-3xl font-black text-emerald-400">{availableCount}</div>
          <p className="text-[10px] text-emerald-400/70 mt-1">Available on Marketplace</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-1">Sold Out</div>
          <div className="text-3xl font-black text-amber-400">{soldCount}</div>
          <p className="text-[10px] text-slate-500 mt-1">Marked as sold</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-1">Total Listed Value</div>
          <div className="text-3xl font-black text-sky-400">৳ {totalValue.toLocaleString()}</div>
          <p className="text-[10px] text-slate-500 mt-1">Combined items price</p>
        </div>
      </div>

      {/* SEARCH & STATUS FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search your items by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
          {['All', 'Available', 'Sold'].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === tab
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="p-4 bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* LISTINGS DISPLAY GRID */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading your listings...</div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product._id} className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between border-slate-800 relative group">
              
              {/* Product Header & Image */}
              <div>
                <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                  <img
                    src={(product.images && product.images.length > 0) ? product.images[0] : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  {/* Status Badge */}
                  <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border backdrop-blur-md ${
                    product.status === 'sold'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {product.status === 'sold' ? 'Sold Out' : 'Available'}
                  </span>

                  {/* Condition Tag */}
                  <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900/90 text-slate-300 border border-slate-700">
                    {product.condition}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                    <Tag className="w-3 h-3" /> {product.category}
                  </div>
                  <h3 className="font-extrabold text-white text-base line-clamp-1">{product.title}</h3>
                  <div className="text-xl font-black text-amber-400">৳ {product.price.toLocaleString()}</div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{product.description}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 space-y-2">
                <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between gap-2">
                  
                  {/* Toggle Sold/Available Status */}
                  <button
                    onClick={() => handleToggleStatus(product)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                      product.status === 'sold'
                        ? 'bg-emerald-950 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                    title={product.status === 'sold' ? 'Mark item as available' : 'Mark item as sold'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {product.status === 'sold' ? 'Mark Available' : 'Mark Sold'}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => {
                      setSelectedProductToEdit(product);
                      setIsEditModalOpen(true);
                    }}
                    className="p-2 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 rounded-lg text-xs font-bold transition-all"
                    title="Edit listing details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="p-2 bg-rose-950/80 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 rounded-lg transition-all"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* View Details Link */}
                  <Link
                    to={`/products/${product._id}`}
                    className="p-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    title="View item page"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No listings found</h3>
          <p className="text-xs text-slate-400">
            {products.length === 0 
              ? "You haven't listed any items for sale yet. Start selling textbook notes, calculators, or gadgets to fellow students!"
              : "No listings match your search or filter."}
          </p>
          <Link
            to="/add-product"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Post Item for Sale
          </Link>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      <EditProductModal
        product={selectedProductToEdit}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProductToEdit(null);
        }}
        onUpdated={handleProductUpdated}
      />

    </div>
  );
}

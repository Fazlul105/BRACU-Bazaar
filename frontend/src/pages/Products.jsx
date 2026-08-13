import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Filter, Search, SlidersHorizontal, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const categories = [
    'All',
    'Textbooks & Notes',
    'Electronics & Gadgets',
    'Hostel & Mess Essentials',
    'Calculators & Lab Gear',
    'Fashion & Merchandise',
    'Sports & Gaming',
    'Miscellaneous'
  ];

  const conditions = ['All', 'Brand New', 'Like New', 'Good', 'Fair'];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedCondition, searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/products?`;
      if (selectedCategory && selectedCategory !== 'All') url += `category=${encodeURIComponent(selectedCategory)}&`;
      if (selectedCondition && selectedCondition !== 'All') url += `condition=${encodeURIComponent(selectedCondition)}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      if (minPrice) url += `minPrice=${minPrice}&`;
      if (maxPrice) url += `maxPrice=${maxPrice}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch items');
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSelectedCondition('All');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this listing from BRACU Bazaar?")) return;
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');

      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Marketplace Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">Browse verified BRACU student listings across all departments</p>
        </div>
        <div className="text-xs text-amber-300 font-semibold bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/30 self-start sm:self-auto">
          Showing {products.length} Active Listings
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* FILTERS SIDEBAR */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-panel p-5 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-400" /> Filter Listings
              </h3>
              <button
                onClick={handleClearFilters}
                className="text-[11px] font-semibold text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Keyword Search */}
            <form onSubmit={handleSearchSubmit} className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Keyword Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. CSE370, Casio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              </div>
            </form>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Item Condition</label>
              <div className="flex flex-wrap gap-1.5">
                {conditions.map((cond) => (
                  <button
                    key={cond}
                    onClick={() => setSelectedCondition(cond)}
                    className={`px-3 py-1 rounded-full text-xs transition-all ${
                      selectedCondition === cond
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Price Range (BDT ৳)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:border-amber-400"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:border-amber-400"
                />
              </div>
              <button
                onClick={fetchProducts}
                className="w-full mt-2 py-2 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30 text-amber-400 font-bold rounded-lg text-xs transition-all shadow"
              >
                Apply Price Filter
              </button>
            </div>

          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="lg:col-span-3 space-y-6">
          {error && (
            <div className="glass-panel p-4 rounded-xl bg-rose-950/60 border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="glass-card rounded-2xl h-80 animate-pulse bg-slate-900" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(prod => (
                <ProductCard key={prod._id} product={prod} onDelete={handleDeleteProduct} />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-16 text-center rounded-2xl space-y-4">
              <SlidersHorizontal className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No matching listings found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try adjusting your search criteria or resetting filters to browse all BRACU student products.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}


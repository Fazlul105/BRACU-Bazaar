import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { 
  BookOpen, 
  Calculator, 
  Laptop, 
  Home as HomeIcon, 
  Shirt, 
  Gamepad2, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  GraduationCap
} from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Textbooks & Notes', icon: BookOpen, count: 'CSE, BBA, EEE', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { name: 'Calculators & Lab Gear', icon: Calculator, count: 'fx-991EX, Drafters', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { name: 'Electronics & Gadgets', icon: Laptop, count: 'Laptops, Mice, Earbuds', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { name: 'Hostel & Mess Essentials', icon: HomeIcon, count: 'Fans, Lamps, Kettles', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { name: 'Fashion & Merchandise', icon: Shirt, count: 'BRACU Hoodies, Bags', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    { name: 'Sports & Gaming', icon: Gamepad2, count: 'Rackets, Consoles', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' }
  ];

  return (
    <div className="space-y-16 pb-12">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 rounded-3xl border border-white/10 px-6 sm:px-12 shadow-2xl glass-panel group">
        {/* Background Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Exclusively for Verified BRACU Students</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Buy, Sell & Trade on Campus <br />
            <span className="gradient-text">BRACU Bazaar</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            The ultimate campus peer-to-peer marketplace. Trade course textbooks, Casio calculators, electronics, and hostel supplies safely at Merul Badda or Mohakhali campus meetup points.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/products"
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-base shadow-lg shadow-amber-500/20 transition-all hover:scale-105 flex items-center gap-2"
            >
              Explore Marketplace <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/add-product"
              className="px-8 py-3.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-base border border-slate-700 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-amber-400" /> Sell Item Now
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-10 border-t border-slate-800/80 max-w-2xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
              <div className="text-2xl font-black text-amber-400">100%</div>
              <div className="text-xs text-slate-400">BRACU Student Verified</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
              <div className="text-2xl font-black text-white">Zero</div>
              <div className="text-xs text-slate-400">Commission Fees</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 col-span-2 sm:col-span-1">
              <div className="text-2xl font-black text-emerald-400">Hand-to-Hand</div>
              <div className="text-xs text-slate-400">Campus Meetups</div>
            </div>
          </div>

        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Browse Categories</h2>
            <p className="text-xs text-slate-400">Find exactly what you need for your BRACU semester</p>
          </div>
          <Link to="/products" className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="glass-card p-5 rounded-2xl flex flex-col items-center text-center space-y-3 group hover:border-amber-500/40 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${cat.bg} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors leading-snug">
                    {cat.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">{cat.count}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* RECENT LISTINGS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Recent Campus Listings</h2>
            <p className="text-xs text-slate-400">Posted by fellow BRACU students</p>
          </div>
          <Link to="/products" className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1">
            See All Items ({products.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass-card rounded-2xl h-72 animate-pulse bg-slate-900" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map(prod => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No products listed yet</h3>
            <p className="text-xs text-slate-400">Be the first BRACU student to post an item for sale!</p>
            <Link to="/add-product" className="inline-block px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs">
              Post First Product
            </Link>
          </div>
        )}
      </section>

      {/* ADMIN TRUST BANNER */}
      <section className="glass-panel p-8 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-slate-900/40 to-sky-500/5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Safe & Moderated Campus Platform
              </h3>
              <p className="text-xs text-slate-400 max-w-xl">
                BRACU Bazaar is managed and supervised by Super Admin <span className="font-semibold text-amber-400">Md. Fazlul Karim</span>. Fraudulent sellers or inappropriate posts will be kicked out immediately.
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-full bg-slate-900 border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-slate-950 font-semibold text-xs whitespace-nowrap transition-colors"
          >
            Admin Sign In
          </Link>
        </div>
      </section>

    </div>
  );
}


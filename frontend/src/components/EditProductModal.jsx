import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Edit3, Upload, Link as LinkIcon, CheckCircle2, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function EditProductModal({ product, isOpen, onClose, onUpdated }) {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Textbooks & Notes');
  const [condition, setCondition] = useState('Like New');
  const [meetupLocation, setMeetupLocation] = useState('Merul Badda Permanent Campus (Library/Cafeteria)');
  const [status, setStatus] = useState('available');
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState('file');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    'Textbooks & Notes',
    'Electronics & Gadgets',
    'Hostel & Mess Essentials',
    'Calculators & Lab Gear',
    'Fashion & Merchandise',
    'Sports & Gaming',
    'Miscellaneous'
  ];

  const conditions = ['Brand New', 'Like New', 'Good', 'Fair'];

  const campusLocations = [
    'Merul Badda Permanent Campus (Library/Cafeteria)',
    'Merul Badda Permanent Campus (Food Court)',
    'Mohakhali UB1 / UB2 Main Entrance',
    'Mohakhali UB5 / UB7 Plaza',
    'Residential Campus Tarakanda',
    'Badda Gate 1 / Badda Gate 2',
    'Flexible Campus Hand-to-Hand'
  ];

  useEffect(() => {
    if (product) {
      setTitle(product.title || '');
      setDescription(product.description || '');
      setPrice(product.price !== undefined ? String(product.price) : '');
      setCategory(product.category || 'Textbooks & Notes');
      setCondition(product.condition || 'Like New');
      setMeetupLocation(product.meetupLocation || 'Merul Badda Permanent Campus (Library/Cafeteria)');
      setStatus(product.status || 'available');
      setImageUrl((product.images && product.images.length > 0) ? product.images[0] : '');
      setPhone(product.sellerPhone || user?.phone || '');
    }
  }, [product, user]);

  if (!isOpen || !product) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, JPEG, WebP).');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImageUrl(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          category,
          condition,
          meetupLocation,
          status,
          images: imageUrl ? [imageUrl] : product.images,
          phone
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update product');

      if (onUpdated) onUpdated(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-xl p-6 sm:p-8 rounded-3xl space-y-5 border border-slate-800 my-8 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Edit3 className="w-5 h-5" />
            <h2 className="text-xl font-extrabold text-white">Edit Product Listing</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Product Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-amber-400"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-amber-400"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Item Condition *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-amber-400"
              >
                {conditions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Price, Phone & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Price (BDT ৳) *</label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Listing Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-amber-400"
              >
                <option value="available">Available (For Sale)</option>
                <option value="sold">Sold Out</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Contact Phone *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-amber-400"
              />
            </div>
          </div>

          {/* Meetup Location */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">BRACU Meetup Location *</label>
            <select
              value={meetupLocation}
              onChange={(e) => setMeetupLocation(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-amber-400"
            >
              {campusLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          {/* Photo Options: Device Upload vs URL */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-300">Product Image (Device Upload or URL)</label>
            
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setImageMode('file')}
                className={`py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  imageMode === 'file' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  imageMode === 'url' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" /> Paste URL
              </button>
            </div>

            {imageMode === 'file' ? (
              <label className="border-2 border-dashed border-slate-700 hover:border-amber-400/70 bg-slate-900/40 rounded-xl p-4 text-center cursor-pointer block">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Upload className="w-5 h-5 text-amber-400" />
                  <span className="text-slate-300 font-semibold">Click to select photo from device</span>
                </div>
              </label>
            ) : (
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or paste image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-amber-400"
                />
                <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            )}

            {imageUrl && (
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
                <img src={imageUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Photo Attached
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Description *</label>
            <textarea
              rows="3"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
            >
              {loading ? 'Saving Changes...' : 'Update Listing'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

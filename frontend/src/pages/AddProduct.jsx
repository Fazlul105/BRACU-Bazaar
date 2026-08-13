import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Tag, MapPin, AlertCircle, CheckCircle2, Image as ImageIcon, Upload, Link, X } from 'lucide-react';

export default function AddProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Textbooks & Notes');
  const [condition, setCondition] = useState('Like New');
  const [meetupLocation, setMeetupLocation] = useState('Merul Badda Permanent Campus (Library/Cafeteria)');
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState('file'); // 'file' or 'url'
  const [phone, setPhone] = useState(user?.phone || '');

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
    if (!user) {
      alert("You must be logged in with a BRACU student account to post products.");
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
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
          images: imageUrl ? [imageUrl] : [],
          phone: phone || user.phone
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create product');

      navigate(`/products/${data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="glass-panel p-8 rounded-3xl space-y-6">
        
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-amber-400" /> Post New Item for Sale
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Listed by <span className="text-white font-semibold">{user?.name}</span> (<span className="text-emerald-400 font-medium">Verified BRACU Student</span>)
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Product Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Database System Concepts (Silberschatz) 7th Ed or Casio fx-991EX"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-400"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Item Condition *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-400"
              >
                {conditions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Price & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Price (BDT ৳) *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contact Phone / WhatsApp *</label>
              <input
                type="text"
                required
                placeholder="e.g. 01812345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-400"
              />
            </div>
          </div>

          {/* Meetup Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">BRACU Meetup Spot *</label>
            <select
              value={meetupLocation}
              onChange={(e) => setMeetupLocation(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-400"
            >
              {campusLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          {/* Item Image Section - Dual Option: Upload from Device OR Paste URL */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Product Image
              </label>
              <span className="text-[11px] text-slate-400">
                Choose Upload or Link
              </span>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setImageMode('file')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                  imageMode === 'file'
                    ? 'bg-amber-500 text-slate-950 shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload from Device
              </button>

              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                  imageMode === 'url'
                    ? 'bg-amber-500 text-slate-950 shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                Image Link (URL)
              </button>
            </div>

            {/* Mode 1: Device File Upload */}
            {imageMode === 'file' && (
              <div>
                <label className="relative border-2 border-dashed border-slate-700 hover:border-amber-400/70 bg-slate-900/40 hover:bg-slate-900/80 rounded-2xl p-6 text-center cursor-pointer block transition-all group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shadow-inner">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                        Click or drag to select photo from device
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Select any picture from your PC or phone (JPEG, PNG, WebP)
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            )}

            {/* Mode 2: Paste Image URL */}
            {imageMode === 'url' && (
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or paste direct image link"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400"
                />
                <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            )}

            {/* Live Image Preview Container */}
            {imageUrl && (
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={imageUrl}
                    alt="Uploaded item preview"
                    className="w-14 h-14 object-cover rounded-xl border border-slate-700 shrink-0 bg-slate-950"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600';
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Photo Attached
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5 max-w-[280px]">
                      {imageMode === 'file' ? 'Uploaded photo from device' : imageUrl}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 rounded-lg text-xs font-semibold transition-colors shrink-0 flex items-center gap-1"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description *</label>
            <textarea
              rows="4"
              required
              placeholder="Describe the item condition, course relevance, edition, reason for selling..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-xl transition-all"
          >
            {loading ? 'Publishing Listing...' : 'Publish Item Listing'}
          </button>

        </form>

      </div>
    </div>
  );
}

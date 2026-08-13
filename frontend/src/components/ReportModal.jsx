import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Flag, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, targetType = 'product', targetId, targetName }) {
  const { user } = useAuth();
  const [reason, setReason] = useState('Prohibited Item or Content');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to submit a report.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          targetType,
          targetId,
          targetName,
          reason,
          description
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit report');

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 cursor-pointer" 
        onClick={onClose} 
      />

      <div className="relative glass-panel bg-slate-950 border border-rose-500/30 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-lg font-black text-white">
              Report Inappropriate {targetType === 'user' ? 'Student Account' : 'Product Listing'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white">Report Submitted to Admin</h4>
            <p className="text-xs text-slate-300">
              Admin Md. Fazlul Karim will review this report and take appropriate moderation action.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            <div className="p-3 bg-rose-950/40 border border-rose-500/20 rounded-xl text-slate-300">
              Reporting: <strong className="text-white">{targetName || targetId}</strong>
            </div>

            {error && (
              <div className="p-3 bg-rose-950 border border-rose-500 text-rose-200 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Reason for Report *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-rose-400"
              >
                <option value="Prohibited Item or Content">Prohibited Item or Content (Exam paper leaks, Illegal items)</option>
                <option value="Misleading or Fake Price">Misleading or Fake Price (Scam offer)</option>
                <option value="Harassment or Offensive Behavior">Harassment or Offensive Behavior</option>
                <option value="Spam / Duplicate Listing">Spam / Duplicate Listing</option>
                <option value="Counterfeit or Broken Item">Counterfeit or Broken Item sold as brand new</option>
                <option value="Other Policy Violation">Other Policy Violation</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Detailed Description *</label>
              <textarea
                rows="3"
                required
                placeholder="Explain why this listing/user violates BRACU Bazaar community guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-rose-400"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Flag className="w-4 h-4" />
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}

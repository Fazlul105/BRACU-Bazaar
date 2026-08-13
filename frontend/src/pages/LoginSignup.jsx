import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ShieldCheck, Lock, Mail, User, Phone, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginSignup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isSignUp, setIsSignUp] = useState(location.pathname === '/signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('both');
  const [department, setDepartment] = useState('CSE');
  const [phone, setPhone] = useState('');

  const handleQuickAdmin = () => {
    setIsSignUp(false);
    setStudentId('23101229');
    setPassword('23101229');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Strict 8-digit check for Student ID
    if (!/^\d{8}$/.test(studentId.trim())) {
      setError("Student ID must consist of exactly 8 numeric digits (e.g. 23101229)!");
      setLoading(false);
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError("Name is required!");
        setLoading(false);
        return;
      }
      const res = await register({
        name: name.trim(),
        studentId: studentId.trim(),
        email: email.trim(),
        password,
        role,
        department,
        phone
      });
      setLoading(false);
      if (res.success) {
        if (res.data.role === 'admin') navigate('/admin');
        else navigate('/products');
      } else {
        setError(res.error);
      }
    } else {
      const res = await login(studentId.trim(), password);
      setLoading(false);
      if (res.success) {
        if (res.data.role === 'admin') navigate('/admin');
        else navigate('/products');
      } else {
        setError(res.error);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="glass-panel p-8 rounded-3xl space-y-6 border-slate-800">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isSignUp ? 'BRACU Student Signup' : 'BRACU Student Login'}
          </h1>
          <p className="text-xs text-slate-400">
            {isSignUp ? 'Join BRACU Bazaar with your student credentials' : 'Sign in to access your buyer/seller dashboard'}
          </p>
        </div>

        {/* Admin Preset Quick Button */}
        {!isSignUp && (
          <button
            type="button"
            onClick={handleQuickAdmin}
            className="w-full py-2 bg-sky-950/80 border border-sky-500/30 hover:bg-sky-900/60 text-sky-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Fill Admin Credentials (Md. Fazlul Karim)</span>
          </button>
        )}

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name (Signup only) */}
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Md. Fazlul Karim"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>
          )}

          {/* Student ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              BRACU Student ID *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={8}
                placeholder="e.g. 23101229"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:border-amber-400"
              />
              <GraduationCap className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Email */}
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">G.BRACU Email *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@g.bracu.ac.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password *</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-400"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          {/* Role & Department (Signup only) */}
          {isSignUp && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Platform Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="both">Buyer & Seller</option>
                  <option value="buyer">Buyer Only</option>
                  <option value="seller">Seller Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="CSE">CSE</option>
                  <option value="BBA">BBA</option>
                  <option value="EEE">EEE</option>
                  <option value="ESS">ESS</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Law">Law</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : (isSignUp ? 'Register Account' : 'Sign In')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            {isSignUp ? 'Already registered? Log In here' : "Don't have an account? Sign Up here"}
          </button>
        </div>

      </div>
    </div>
  );
}

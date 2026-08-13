import React, { useState, useEffect, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  UserX, 
  Users, 
  ShoppingBag, 
  MessageSquare, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Search,
  UserCheck,
  Crown,
  Flag,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

// React Error Boundary Component to prevent blank screen crashes
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AdminDashboard Render Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto py-16 text-center space-y-4">
          <div className="glass-panel p-8 rounded-3xl border-rose-500/40 space-y-4">
            <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Admin Dashboard Exception Caught</h2>
            <p className="text-xs text-slate-300">{this.state.error?.message || 'An unexpected rendering error occurred.'}</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg"
            >
              Reload Admin Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminDashboardContent() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminLoggingIn, setAdminLoggingIn] = useState(false);
  
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'products' | 'reports'
  const [userSearch, setUserSearch] = useState('');
  const [kickReason, setKickReason] = useState('');

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const statsData = await statsRes.json();
      if (!statsRes.ok) throw new Error(statsData.message || 'Access denied');
      setStats(statsData);

      // 2. Fetch Users
      const usersRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const usersData = await usersRes.json();
      if (!usersRes.ok) throw new Error(usersData.message || 'Failed to fetch users');
      setUsers(Array.isArray(usersData) ? usersData : []);

      // 3. Fetch Products
      const productsRes = await fetch('/api/products');
      const productsData = await productsRes.json();
      if (!productsRes.ok) throw new Error(productsData.message || 'Failed to fetch products');
      setProducts(Array.isArray(productsData) ? productsData : []);

      // 4. Fetch Reports
      const reportsRes = await fetch('/api/reports', {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(Array.isArray(reportsData) ? reportsData : []);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setAdminLoggingIn(true);
    try {
      const res = await login('23101229', '23101229');
      if (!res.success) {
        throw new Error(res.error || 'Admin auto-login failed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setAdminLoggingIn(false);
    }
  };

  const handleKickoutUser = async (userId, customReason) => {
    if (!window.confirm("CONFIRM: Kick out this user from BRACU Bazaar? Their access will be revoked.")) return;
    
    try {
      const res = await fetch(`/api/admin/kickout/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ reason: customReason || kickReason || 'Kicked out by Admin Md. Fazlul Karim' })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Kick out failed');

      alert(data.message);
      setKickReason('');
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      const res = await fetch(`/api/admin/unban/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Unban failed');

      alert(data.message);
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Admin: Permanently delete this product listing?")) return;
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (!res.ok) throw new Error("Delete failed");
      setProducts((prev) => Array.isArray(prev) ? prev.filter(p => p._id !== productId) : []);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resolve report');

      setReports((prev) => Array.isArray(prev) ? prev.map(r => r._id === reportId ? { ...r, status: 'resolved' } : r) : []);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Dismiss and delete this report record?")) return;
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (!res.ok) throw new Error("Failed to delete report");

      setReports((prev) => Array.isArray(prev) ? prev.filter(r => r._id !== reportId) : []);
    } catch (err) {
      alert(err.message);
    }
  };

  // Safe arrays
  const safeUsers = Array.isArray(users) ? users : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeReports = Array.isArray(reports) ? reports : [];

  // 1. NON-ADMIN ACCESS PROMPT
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto py-16">
        <div className="glass-panel p-8 rounded-3xl space-y-6 text-center border-amber-500/30">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Admin Privileges Required</h1>
            <p className="text-xs text-slate-300">
              You are currently signed in as <strong className="text-amber-400">{user ? user.name : 'Guest User'}</strong> ({user?.role || 'Guest'}). Access to moderation controls is reserved for Super Admin <strong className="text-white">Md. Fazlul Karim (23101229)</strong>.
            </p>
          </div>

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-left text-xs space-y-1.5 text-slate-300">
            <div className="font-bold text-white mb-1">Pre-seeded Admin Account Credentials:</div>
            <div>Admin Student ID: <strong className="text-amber-400 font-mono">23101229</strong></div>
            <div>Admin Name: <strong className="text-white">Md. Fazlul Karim</strong></div>
            <div>Password: <strong className="text-amber-400 font-mono">23101229</strong></div>
          </div>

          <button
            onClick={handleQuickAdminLogin}
            disabled={adminLoggingIn}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4" />
            {adminLoggingIn ? 'Switching Account...' : 'Switch to Admin Account (Md. Fazlul Karim)'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 2. LOADING STATE
  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading BRACU Bazaar Admin Control Panel...</p>
      </div>
    );
  }

  const filteredUsers = safeUsers.filter(u => 
    (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
    (u.studentId && u.studentId.includes(userSearch)) ||
    (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const pendingReportsCount = safeReports.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-8 pb-16">
      
      {/* HEADER BANNER */}
      <div className="glass-panel p-8 rounded-3xl border-sky-500/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-900 to-amber-400 p-[2px] shadow-xl">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Crown className="w-8 h-8 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">BRACU Bazaar Admin Panel</h1>
                <span className="text-xs px-3 py-0.5 rounded-full bg-sky-950 text-sky-300 font-bold border border-sky-500/40">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Admin: <span className="text-white font-bold">{user.name} ({user.studentId})</span> | Status: <span className="text-sky-400 font-bold">Super Admin Active</span>
              </p>
            </div>
          </div>

          <button
            onClick={fetchAdminData}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchAdminData} className="underline text-amber-300 font-bold">Retry</button>
        </div>
      )}

      {/* METRICS & METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Members</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.totalUsers || safeUsers.length}</div>
          <p className="text-[10px] text-slate-400 mt-1">Registered BRACU Students</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Active Sellers</span>
            <ShoppingBag className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{stats?.totalSellers || 0}</div>
          <p className="text-[10px] text-slate-400 mt-1">Sellers & Both Roles</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Active Listings</span>
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{safeProducts.length}</div>
          <p className="text-[10px] text-slate-400 mt-1">Products on Marketplace</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border-rose-900/40 bg-rose-950/20">
          <div className="flex items-center justify-between text-rose-300 mb-2">
            <span className="text-xs font-semibold">Pending Reports</span>
            <Flag className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400">{pendingReportsCount}</div>
          <p className="text-[10px] text-rose-300/70 mt-1">Reported Listings/Users</p>
        </div>
      </div>

      {/* TAB SYSTEM */}
      <div className="flex items-center gap-6 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'users' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Manage Users ({safeUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-2 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'products' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Manage Marketplace Listings ({safeProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'reports' ? 'border-rose-400 text-rose-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Reports & Moderation
          {pendingReportsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-slate-950 font-black text-[10px]">
              {pendingReportsCount}
            </span>
          )}
        </button>
      </div>

      {/* USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search user name or Student ID..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            </div>
            <span className="text-xs text-slate-400">
              Admin Capability: Click <strong className="text-rose-400">Kick Out</strong> to instantly ban any member.
            </span>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Student ID</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map(u => (
                    <tr key={u._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-semibold text-white flex items-center gap-2">
                        {u.name}
                        {u.role === 'admin' && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded border border-amber-500/30">
                            ADMIN
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-bold text-amber-400">{u.studentId}</td>
                      <td className="p-4 text-slate-400">{u.email}</td>
                      <td className="p-4 capitalize">
                        <span className="px-2 py-0.5 bg-slate-800 rounded text-[11px] font-medium text-slate-300">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.isBanned ? (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-bold bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-500/30">
                            <UserX className="w-3.5 h-3.5" /> Kicked Out
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <CheckCircle className="w-3.5 h-3.5" /> Active Member
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {u.role === 'admin' ? (
                          <span className="text-[11px] text-slate-500 font-semibold">Protected Super Admin</span>
                        ) : u.isBanned ? (
                          <button
                            onClick={() => handleUnbanUser(u._id)}
                            className="px-3 py-1 bg-emerald-950 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ml-auto"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Reinstate User
                          </button>
                        ) : (
                          <button
                            onClick={() => handleKickoutUser(u._id)}
                            className="px-3 py-1 bg-rose-950 border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 ml-auto shadow-md"
                          >
                            <UserX className="w-3.5 h-3.5" /> Kick Out Member
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS MODERATION TAB */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeProducts.map(prod => (
            <div key={prod._id} className="glass-card p-4 rounded-2xl space-y-3 relative border-slate-800">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-800 text-amber-400 rounded">
                  {prod.category}
                </span>
                <button
                  onClick={() => handleDeleteProduct(prod._id)}
                  className="p-1.5 bg-rose-950 text-rose-300 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                  title="Admin Delete Listing"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-bold text-white text-sm line-clamp-1">{prod.title}</h3>
              <div className="text-lg font-black text-amber-400">৳ {prod.price}</div>
              
              <div className="text-xs text-slate-400 border-t border-slate-800 pt-2 flex justify-between">
                <span>Seller: <strong>{prod.sellerName}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REPORTS & MODERATION TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {safeReports.length > 0 ? (
            safeReports.map(report => (
              <div 
                key={report._id} 
                className={`glass-panel p-5 rounded-2xl border space-y-3 ${
                  report.status === 'resolved' ? 'border-slate-800 opacity-60' : 'border-rose-500/40 bg-rose-950/20'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 text-[10px] font-bold uppercase border border-rose-500/30">
                      Reported {report.targetType}
                    </span>
                    <h4 className="text-sm font-bold text-white">{report.targetName}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {report.status === 'resolved' ? (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                      </span>
                    ) : (
                      <button
                        onClick={() => handleResolveReport(report._id)}
                        className="px-3 py-1 bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 rounded-lg text-xs font-bold transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteReport(report._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Dismiss & Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div>Reason: <strong className="text-rose-300">{report.reason}</strong></div>
                  <div>Details: <span className="text-slate-200">"{report.description}"</span></div>
                  <div className="text-[10px] text-slate-500 pt-1">
                    Reported by <strong>{report.reporterName}</strong> on {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Direct Action Buttons */}
                {report.status === 'pending' && (
                  <div className="flex gap-3 pt-1">
                    {report.targetType === 'product' && (
                      <button
                        onClick={() => {
                          handleDeleteProduct(report.targetId);
                          handleResolveReport(report._id);
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Reported Product Listing
                      </button>
                    )}

                    {report.targetType === 'user' && (
                      <button
                        onClick={() => {
                          handleKickoutUser(report.targetId, `Banned due to report: ${report.reason}`);
                          handleResolveReport(report._id);
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                      >
                        <UserX className="w-3.5 h-3.5" /> Kick Out Reported User
                      </button>
                    )}
                  </div>
                )}

              </div>
            ))
          ) : (
            <div className="glass-panel p-12 text-center text-xs text-slate-500 space-y-2">
              <Flag className="w-8 h-8 mx-auto text-slate-700" />
              <h3 className="font-bold text-white text-sm">No Policy Reports Found</h3>
              <p>No inappropriate listings or users have been reported by students.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ErrorBoundary>
      <AdminDashboardContent />
    </ErrorBoundary>
  );
}

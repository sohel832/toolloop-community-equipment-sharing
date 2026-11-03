'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Layers, 
  CalendarCheck, 
  ShieldCheck, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  PlusCircle, 
  TrendingUp, 
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  Star,
  Building,
  PieChart,
  Award,
  AlertCircle,
  Receipt,
  FileText,
  RotateCcw
} from 'lucide-react';

export default function AdminDashboard({ currentUser, onShowToast, onOpenReceipt }) {
  const [adminTab, setAdminTab] = useState('overview'); // 'overview' | 'users' | 'listings' | 'bookings' | 'transactions' | 'communities' | 'reviews' | 'analytics'
  
  // Data states
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search filters
  const [userSearch, setUserSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [reviewSearch, setReviewSearch] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');

  // Create Community Modal (Admin Exclusive Duty)
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [commName, setCommName] = useState('');
  const [commType, setCommType] = useState('Neighborhood');
  const [commLoading, setCommLoading] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, iRes, bRes, cRes, rRes, pRes, sRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/items?active=false'),
        fetch('/api/bookings'),
        fetch('/api/communities'),
        fetch('/api/ratings'),
        fetch('/api/payments'),
        fetch('/api/stats/dashboard')
      ]);

      const [uData, iData, bData, cData, rData, pData, sData] = await Promise.all([
        uRes.json(),
        iRes.json(),
        bRes.json(),
        cRes.json(),
        rRes.json(),
        pRes.json(),
        sRes.json()
      ]);

      if (uData.success) setUsers(uData.data || []);
      if (iData.success) setItems(iData.data || []);
      if (bData.success) setBookings(bData.data || []);
      if (cData.success) setCommunities(cData.data || []);
      if (rData.success) setRatings(rData.data || []);
      if (pData.success) setPayments(pData.data || []);
      if (sData.success) setStats(sData.data || null);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Update User Role (Admin <-> Member)
  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(`User role updated to ${newRole}`);
        loadAdminData();
      }
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  // Delete User
  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to permanently delete user "${userName}"?`)) return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onShowToast(`User ${userName} deleted`);
        loadAdminData();
      }
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  // Toggle Item Active State
  const handleToggleItemActive = async (itemId, currentActive) => {
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: currentActive ? 0 : 1 })
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(currentActive ? 'Listing deactivated' : 'Listing reactivated');
        loadAdminData();
      }
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  // Delete Listing
  const handleDeleteItem = async (itemId, itemTitle) => {
    if (!confirm(`Delete equipment listing "${itemTitle}"?`)) return;
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onShowToast('Listing deleted from catalog');
        loadAdminData();
      }
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  // Force Booking Status Override
  const handleOverrideBookingStatus = async (bookingId, status) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(`Booking #${bookingId} status overridden to ${status}`);
        loadAdminData();
      }
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  // Process Refund (Preserves Receipt & Updates Refund Status)
  const handleProcessRefund = async (bookingId, refundAmount) => {
    if (!confirm(`Confirm releasing refundable security deposit of ₹${Number(refundAmount).toLocaleString()} back to borrower?`)) return;
    try {
      const res = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          refund_amount: refundAmount,
          reason: 'Admin verified equipment return and release'
        })
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(data.message);
        loadAdminData();
      } else {
        onShowToast(data.message || 'Refund failed', 'error');
      }
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  // Delete Review
  const handleDeleteReview = async (ratingId) => {
    if (!confirm(`Delete review #${ratingId}?`)) return;
    try {
      const res = await fetch(`/api/ratings/${ratingId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onShowToast(`Review #${ratingId} removed`);
        loadAdminData();
      }
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  // Create Community Hub (Admin Duty)
  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!commName.trim()) return;
    setCommLoading(true);
    try {
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: commName.trim(),
          type: commType,
          user_id: currentUser.user_id
        })
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(`Community Hub "${commName}" created successfully!`);
        setCommName('');
        setShowCreateCommunityModal(false);
        loadAdminData();
      }
    } catch (err) {
      onShowToast(err.message, 'error');
    } finally {
      setCommLoading(false);
    }
  };

  // Delete Community Hub
  const handleDeleteCommunity = async (commId, name) => {
    if (!confirm(`Delete community "${name}"? Members and equipment will be unlinked.`)) return;
    try {
      const res = await fetch(`/api/communities/${commId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onShowToast(`Community ${name} deleted`);
        loadAdminData();
      }
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    const term = userSearch.toLowerCase();
    return u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term) || u.role?.toLowerCase().includes(term);
  });

  const filteredItems = items.filter((i) => {
    if (!itemSearch) return true;
    const term = itemSearch.toLowerCase();
    return i.title?.toLowerCase().includes(term) || i.category?.toLowerCase().includes(term) || i.owner_name?.toLowerCase().includes(term);
  });

  const filteredReviews = ratings.filter((r) => {
    if (!reviewSearch) return true;
    const term = reviewSearch.toLowerCase();
    return r.comment?.toLowerCase().includes(term) || r.rater_name?.toLowerCase().includes(term) || r.item_title?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Admin Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Admin Portal
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Platform Management</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Platform Administration</h1>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all shadow-sm w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800/80 text-xs font-semibold">
        <button
          onClick={() => setAdminTab('overview')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            adminTab === 'overview'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setAdminTab('users')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            adminTab === 'users'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <span>Users</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-mono">
            {users.length}
          </span>
        </button>
        <button
          onClick={() => setAdminTab('listings')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            adminTab === 'listings'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <span>Equipment Listings</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-mono">
            {items.length}
          </span>
        </button>
        <button
          onClick={() => setAdminTab('bookings')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            adminTab === 'bookings'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <span>Bookings & Escrow</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-mono">
            {bookings.length}
          </span>
        </button>

        {/* Transactions & Receipts Tab */}
        <button
          onClick={() => setAdminTab('transactions')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            adminTab === 'transactions'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Transactions & Receipts</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-mono">
            {payments.length}
          </span>
        </button>
        <button
          onClick={() => setAdminTab('communities')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            adminTab === 'communities'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <span>Community Hubs</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-mono">
            {communities.length}
          </span>
        </button>
        <button
          onClick={() => setAdminTab('reviews')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            adminTab === 'reviews'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <span>Reviews & Ratings</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-mono">
            {ratings.length}
          </span>
        </button>
        <button
          onClick={() => setAdminTab('analytics')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            adminTab === 'analytics'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Reports & Analytics</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Registered Users</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{users.length}</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">Community members & admins</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Equipment Listings</span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{items.length}</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">{items.filter(i => i.is_active).length} active tools</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Platform Loans</span>
              <span className="text-3xl font-black text-blue-600 dark:text-cyan-400">{bookings.length}</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
                {bookings.filter(b => b.status === 'approved' || b.status === 'requested').length} active/pending
              </span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Escrow Deposits Held</span>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                ₹{Number(stats?.summary?.totalDepositHeld || 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">Refundable security escrow</span>
            </div>
          </div>

          {/* Quick lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
                <span>Recent Member Registrations</span>
                <span className="text-xs text-purple-600 dark:text-purple-400 cursor-pointer font-semibold" onClick={() => setAdminTab('users')}>
                  View all &rarr;
                </span>
              </h3>
              <div className="space-y-2">
                {users.slice(0, 5).map((u) => (
                  <div key={u.user_id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{u.name}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === 'admin'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
                <span>Recent Booking Activity</span>
                <span className="text-xs text-purple-600 dark:text-purple-400 cursor-pointer font-semibold" onClick={() => setAdminTab('bookings')}>
                  View all &rarr;
                </span>
              </h3>
              <div className="space-y-2">
                {bookings.slice(0, 5).map((b) => (
                  <div key={b.booking_id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{b.item_title}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {b.borrower_name} &larr; {b.lender_name}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name, email, or role..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{filteredUsers.length} users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {filteredUsers.map((u) => (
                  <tr key={u.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">#{u.user_id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{u.phone || '—'}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">{u.address || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleUserRole(u.user_id, u.role)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] text-slate-700 dark:text-slate-200 font-medium transition-colors"
                        >
                          Make {u.role === 'admin' ? 'Member' : 'Admin'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.user_id, u.name)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LISTINGS OVERSIGHT */}
      {adminTab === 'listings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="Search equipment by title or category..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{filteredItems.length} listings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Item ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Deposit (₹)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {filteredItems.map((item) => (
                  <tr key={item.item_id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">#{item.item_id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">{item.title}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.category}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{item.owner_name}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{item.item_condition}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">₹{Number(item.deposit_amount).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.is_active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleItemActive(item.item_id, item.is_active)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] text-slate-700 dark:text-slate-200 font-medium transition-colors"
                        >
                          {item.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.item_id, item.title)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ALL BOOKINGS & ESCROW */}
      {adminTab === 'bookings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">All Platform Bookings & Escrow Payments</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{bookings.length} total records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Equipment</th>
                  <th className="py-3 px-4">Borrower</th>
                  <th className="py-3 px-4">Lender</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Deposit Held</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Override Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {bookings.map((b) => (
                  <tr key={b.booking_id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">#{b.booking_id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{b.item_title}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{b.borrower_name}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{b.lender_name}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {b.start_date} to {b.end_date}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ₹{Number(b.deposit_held).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === 'requested' && (
                          <button
                            onClick={() => handleOverrideBookingStatus(b.booking_id, 'approved')}
                            className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded text-[11px] font-semibold transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {b.status === 'approved' && (
                          <button
                            onClick={() => handleOverrideBookingStatus(b.booking_id, 'completed')}
                            className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded text-[11px] font-semibold transition-colors"
                          >
                            Return & Refund
                          </button>
                        )}
                        {b.status !== 'cancelled' && b.status !== 'completed' && (
                          <button
                            onClick={() => handleOverrideBookingStatus(b.booking_id, 'cancelled')}
                            className="px-2 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 rounded text-[11px] font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4.5: ALL TRANSACTIONS & RECEIPTS (Admin Duty - Complete Oversight) */}
      {adminTab === 'transactions' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm space-y-3">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">All Financial Transactions & Official Receipts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete platform payment audit log with clear separation between rental charges and refundable security deposits.
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                placeholder="Search receipt, txn ID, customer..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">Receipt No</th>
                  <th className="py-3 px-4">Txn ID</th>
                  <th className="py-3 px-4">Booking</th>
                  <th className="py-3 px-4">Customer (Borrower)</th>
                  <th className="py-3 px-4">Lender</th>
                  <th className="py-3 px-4">Rental Fee</th>
                  <th className="py-3 px-4">Security Deposit</th>
                  <th className="py-3 px-4">Total Paid</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {payments
                  .filter((p) => {
                    if (!paymentSearch) return true;
                    const term = paymentSearch.toLowerCase();
                    return (
                      p.receipt_number?.toLowerCase().includes(term) ||
                      p.transaction_id?.toLowerCase().includes(term) ||
                      p.borrower_name?.toLowerCase().includes(term) ||
                      p.item_title?.toLowerCase().includes(term)
                    );
                  })
                  .map((p) => {
                    const isRefunded = p.refund_status === 'refunded' || p.status === 'refunded';
                    return (
                      <tr key={p.payment_id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                          {p.receipt_number || `RCP-BK${p.booking_id}`}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {p.transaction_id || `TXN${p.payment_id}`}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 dark:text-white block">{p.item_title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">#BK{p.booking_id}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          <span className="font-medium block">{p.borrower_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{p.borrower_email}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          <span className="font-medium block">{p.lender_name}</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">{p.payee_upi_id || 'Direct UPI'}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-200">
                          ₹{Number(p.rental_charges || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{Number(p.security_deposit || p.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-slate-900 dark:text-white">
                          ₹{Number(p.amount).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          {isRefunded ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              Refunded
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Successful
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onOpenReceipt && (
                              <button
                                onClick={() => onOpenReceipt(p)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 text-[11px] font-bold border border-purple-200 dark:border-purple-800/80 transition-all active:scale-95"
                                title="View Official Receipt"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Receipt</span>
                              </button>
                            )}

                            {!isRefunded && (
                              <button
                                onClick={() => handleProcessRefund(p.booking_id, p.security_deposit || p.amount)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-blue-950/60 dark:text-slate-300 dark:hover:text-blue-400 text-[11px] font-medium transition-all"
                                title="Process Refund"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Refund</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: COMMUNITIES MANAGEMENT (Admin Duty to Create & Manage Hubs) */}
      {adminTab === 'communities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Manage Community Hubs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Create, configure, and monitor neighborhood and campus sharing hubs.</p>
            </div>

            <button
              onClick={() => setShowCreateCommunityModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Hub</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communities.map((c) => (
              <div key={c.community_id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      {c.type}
                    </span>
                    <span className="text-xs font-mono text-slate-400">ID #{c.community_id}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{c.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>{c.member_count} Members</span>
                    <span>•</span>
                    <span>{c.items_count} Tools in Hub</span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
                  <button
                    onClick={() => handleDeleteCommunity(c.community_id, c.name)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Hub</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Admin Create Community Modal */}
          {showCreateCommunityModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Create Community Hub</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Admins can create regional or institutional hubs for members to join.</p>

                <form onSubmit={handleCreateCommunity} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Community / Hub Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={commName}
                      onChange={(e) => setCommName(e.target.value)}
                      placeholder="e.g. Indiranagar Urban Gardeners"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Hub Type *
                    </label>
                    <select
                      value={commType}
                      onChange={(e) => setCommType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Neighborhood">Neighborhood</option>
                      <option value="College Campus">College Campus</option>
                      <option value="Apartment Complex">Apartment Complex</option>
                      <option value="Maker Space">Maker Space</option>
                      <option value="DIY Workshop">DIY Workshop</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowCreateCommunityModal(false)}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={commLoading}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                      {commLoading ? 'Creating...' : 'Create Hub'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: MANAGE REVIEWS */}
      {adminTab === 'reviews' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                placeholder="Search reviews by comment or reviewer..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{filteredReviews.length} reviews</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Equipment</th>
                  <th className="py-3 px-4">Reviewer</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Feedback Comment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-slate-500">No reviews found.</td>
                  </tr>
                ) : (
                  filteredReviews.map((r) => (
                    <tr key={r.rating_id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400">#{r.rating_id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{r.item_title}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{r.rater_name}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{r.ratee_name}</td>
                      <td className="py-3 px-4 font-bold text-amber-500 dark:text-amber-400">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{r.score}/5</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-sm italic">
                        "{r.comment || 'No comment'}"
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteReview(r.rating_id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: REPORTS & ANALYTICS */}
      {adminTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Aggregations */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Equipment by Category</span>
              </h3>
              <div className="space-y-2.5">
                {(stats?.categoryStats || []).map((cat) => (
                  <div key={cat.category} className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.category}</span>
                      <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{cat.count} listings</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 dark:bg-purple-500 h-full rounded-full"
                        style={{ width: `${Math.min(cat.count * 20, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Distribution */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Most Active Sharing Hubs</span>
              </h3>
              <div className="space-y-2.5">
                {(stats?.communityStats || []).map((comm, idx) => (
                  <div key={comm.name} className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-mono font-bold text-[10px] text-amber-600 dark:text-amber-400">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{comm.name}</span>
                    </div>
                    <div className="text-right font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                      <strong className="text-purple-600 dark:text-purple-400">{comm.members}</strong> members • <strong className="text-slate-900 dark:text-white">{comm.items_available}</strong> tools
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

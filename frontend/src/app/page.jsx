'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ItemFilter from '../components/ItemFilter';
import ItemCard from '../components/ItemCard';
import BorrowModal from '../components/BorrowModal';
import LendItemModal from '../components/LendItemModal';
import BookingsList from '../components/BookingsList';
import RatingModal from '../components/RatingModal';
import PaymentModal from '../components/PaymentModal';
import CommunitiesView from '../components/CommunitiesView';
import UserDashboard from '../components/UserDashboard';
import MyListedEquipment from '../components/MyListedEquipment';
import UserProfileView from '../components/UserProfileView';
import AdminDashboard from '../components/AdminDashboard';
import AuthPage from '../components/AuthPage';
import Footer from '../components/Footer';
import { 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  RefreshCw
} from 'lucide-react';

export default function Home() {
  // Theme State ('light' | 'dark')
  const [theme, setTheme] = useState('dark');

  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // View / Tab State:
  // For User: 'dashboard' | 'catalog' | 'my-listings' | 'bookings' | 'communities' | 'profile'
  // For Admin: 'admin' | 'catalog' | 'bookings' | 'communities' | 'profile'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Application Data State
  const [items, setItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters for Explore page
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedCommunity, setSelectedCommunity] = useState('All');

  // Modals
  const [borrowModalItem, setBorrowModalItem] = useState(null);
  const [showLendModal, setShowLendModal] = useState(false);
  const [ratingModalBooking, setRatingModalBooking] = useState(null);
  const [paymentModalBooking, setPaymentModalBooking] = useState(null);
  const [paymentModalItem, setPaymentModalItem] = useState(null);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Synchronize theme with localStorage & document root
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('toolloop_theme') || 'dark';
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Failed reading theme storage:', e);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('toolloop_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Failed saving theme:', e);
    }
  };

  // Restore authenticated user from localStorage on initial load
  useEffect(() => {
    try {
      const stored = localStorage.getItem('toolloop_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.user_id) {
          setCurrentUser(parsed);
          setActiveTab(parsed.role === 'admin' ? 'admin' : 'dashboard');
        }
      }
    } catch (e) {
      console.error('Failed reading auth storage:', e);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  // Fetch application data
  const loadData = async () => {
    try {
      setLoading(true);

      const [itemsRes, commsRes, bookingsRes, statsRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/communities'),
        fetch('/api/bookings'),
        fetch('/api/stats/dashboard')
      ]);

      const [itemsData, commsData, bookingsData, statsData] = await Promise.all([
        itemsRes.json(),
        commsRes.json(),
        bookingsRes.json(),
        statsRes.json()
      ]);

      if (itemsData.success) setItems(itemsData.data || []);
      if (commsData.success) setCommunities(commsData.data || []);
      if (bookingsData.success) setBookings(bookingsData.data || []);
      if (statsData.success) setStats(statsData.data || null);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // Login handler
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('toolloop_user', JSON.stringify(user));
    setActiveTab(user.role === 'admin' ? 'admin' : 'dashboard');
    showToast(`Welcome back, ${user.name}!`);
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('toolloop_user');
    setActiveTab('dashboard');
    showToast('You have been signed out.');
  };

  // Profile update handler
  const handleProfileUpdated = (updatedUser) => {
    const merged = { ...currentUser, ...updatedUser };
    setCurrentUser(merged);
    localStorage.setItem('toolloop_user', JSON.stringify(merged));
    showToast('Profile updated!');
  };

  // Filter items for Explore tab
  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (selectedCondition !== 'All' && item.item_condition !== selectedCondition) return false;
    if (selectedCommunity !== 'All' && item.community_id && String(item.community_id) !== String(selectedCommunity)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(term);
      const matchDesc = item.description?.toLowerCase().includes(term);
      const matchCat = item.category?.toLowerCase().includes(term);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  // Handle Booking Status Update (e.g. Accept request, Decline, Complete)
  const handleBookingStatusChange = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Booking #${bookingId} updated to ${newStatus}!`);
        await loadData();
      } else {
        showToast(data.message || 'Status update failed', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Item Active/Inactive Toggle
  const handleToggleItemActive = async (itemId, currentActive) => {
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: currentActive ? 0 : 1 })
      });
      const data = await res.json();
      if (data.success) {
        showToast(currentActive ? 'Listing deactivated' : 'Listing is now active');
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Item Deletion
  const handleDeleteItem = async (itemId, title) => {
    if (!confirm(`Are you sure you want to delete listing "${title}"?`)) return;
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Listing deleted`);
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Community Join
  const handleCommunityToggle = async (communityId) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          community_id: communityId,
          user_id: currentUser.user_id
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Joined community hub!`);
        await loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Guard: Initial auth storage check
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // 1. If not logged in -> SHOW AUTHENTICATION SCREEN
  if (!currentUser) {
    return (
      <AuthPage
        onLoginSuccess={handleLoginSuccess}
        communities={communities}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-semibold ${
              toast.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/90 dark:text-rose-200 dark:border-rose-800'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/90 dark:text-emerald-200 dark:border-emerald-800'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navbar with role-specific tabs & Light/Dark mode toggle */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
        onOpenLendModal={() => setShowLendModal(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ADMIN PORTAL TAB (Strictly for admins only) */}
        {isAdmin && activeTab === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            onShowToast={showToast}
          />
        )}

        {/* USER DASHBOARD (Page 1 of User Role) */}
        {!isAdmin && activeTab === 'dashboard' && (
          <UserDashboard
            currentUser={currentUser}
            items={items}
            bookings={bookings}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenLendModal={() => setShowLendModal(true)}
          />
        )}

        {/* EXPLORE EQUIPMENT (Page 2 of User Role & Browse for all) */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <Hero
              stats={stats}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onOpenLendModal={() => setShowLendModal(true)}
            />

            <div className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Explore Equipment</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Browse equipment listed by community members. Request tools with refundable security deposits.
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              <ItemFilter
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedCondition={selectedCondition}
                setSelectedCondition={setSelectedCondition}
                selectedCommunity={selectedCommunity}
                setSelectedCommunity={setSelectedCommunity}
                communities={communities}
              />

              {filteredItems.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <Wrench className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Equipment Found</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                    No tools match the selected filters. Try adjusting your search or list a tool yourself!
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedCondition('All');
                      setSelectedCommunity('All');
                      setSearchTerm('');
                    }}
                    className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold hover:bg-emerald-500/20"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <ItemCard
                      key={item.item_id}
                      item={item}
                      currentUser={currentUser}
                      onBorrowClick={(it) => setBorrowModalItem(it)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MY LISTED EQUIPMENT (Page 5 of User Role - Lender requests & own tools) */}
        {!isAdmin && activeTab === 'my-listings' && (
          <MyListedEquipment
            currentUser={currentUser}
            items={items}
            bookings={bookings}
            onOpenLendModal={() => setShowLendModal(true)}
            onToggleActive={handleToggleItemActive}
            onDeleteItem={handleDeleteItem}
            onBookingStatusChange={handleBookingStatusChange}
          />
        )}

        {/* MY BOOKINGS (Page 6 of User Role) */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {isAdmin ? 'All Platform Bookings' : 'My Bookings & Equipment Loans'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Track borrowed equipment and manage incoming requests for your equipment.
              </p>
            </div>

            <BookingsList
              bookings={bookings}
              currentUser={currentUser}
              onStatusChange={handleBookingStatusChange}
              onOpenRatingModal={(b) => setRatingModalBooking(b)}
              onOpenPaymentModal={(b) => {
                setPaymentModalBooking(b);
                setPaymentModalItem({ title: b.item_title, deposit_amount: b.deposit_held });
              }}
            />
          </div>
        )}

        {/* MY COMMUNITIES (Page 7 of User Role) */}
        {activeTab === 'communities' && (
          <CommunitiesView
            communities={communities}
            currentUser={currentUser}
            onJoinToggle={handleCommunityToggle}
          />
        )}

        {/* MY PROFILE & SETTINGS (Page 9 of User Role) */}
        {activeTab === 'profile' && (
          <UserProfileView
            currentUser={currentUser}
            onUpdateSuccess={handleProfileUpdated}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* MODALS */}
      {borrowModalItem && (
        <BorrowModal
          item={borrowModalItem}
          currentUser={currentUser}
          onClose={() => setBorrowModalItem(null)}
          onSuccess={(newBooking, item) => {
            showToast('Equipment borrow request submitted to owner!');
            loadData();
            setActiveTab('bookings');
            if (newBooking) {
              setPaymentModalBooking(newBooking);
              setPaymentModalItem(item);
            }
          }}
        />
      )}

      {showLendModal && (
        <LendItemModal
          currentUser={currentUser}
          onClose={() => setShowLendModal(false)}
          onSuccess={() => {
            showToast('Equipment listed successfully in your community!');
            loadData();
            setActiveTab(!isAdmin ? 'my-listings' : 'catalog');
          }}
        />
      )}

      {ratingModalBooking && (
        <RatingModal
          booking={ratingModalBooking}
          currentUser={currentUser}
          onClose={() => setRatingModalBooking(null)}
          onSuccess={() => {
            showToast('Review submitted successfully!');
            loadData();
          }}
        />
      )}

      {/* RAZORPAY UPI PAYMENT GATEWAY MODAL */}
      {paymentModalBooking && (
        <PaymentModal
          booking={paymentModalBooking}
          item={paymentModalItem}
          currentUser={currentUser}
          onClose={() => {
            setPaymentModalBooking(null);
            setPaymentModalItem(null);
          }}
          onPaymentSuccess={(verification) => {
            showToast('Razorpay Escrow deposit secured successfully!');
            loadData();
            setPaymentModalBooking(null);
            setPaymentModalItem(null);
          }}
        />
      )}

      {/* Clean Footer */}
      <Footer />
    </div>
  );
}

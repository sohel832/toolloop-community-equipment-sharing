'use client';

import React from 'react';
import { 
  Wrench, 
  Layers, 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  ArrowRight, 
  Package, 
  Calendar, 
  Sparkles
} from 'lucide-react';

export default function UserDashboard({
  currentUser,
  items = [],
  bookings = [],
  onNavigate,
  onOpenLendModal
}) {
  const myItems = items.filter(i => i.owner_id === currentUser?.user_id);

  const activeBookings = bookings.filter(
    b => (b.borrower_id === currentUser?.user_id || b.lender_id === currentUser?.user_id) &&
         (b.status === 'approved' || b.status === 'active')
  );

  const pendingRequests = bookings.filter(
    b => (b.borrower_id === currentUser?.user_id || b.lender_id === currentUser?.user_id) &&
         b.status === 'requested'
  );

  const completedBookings = bookings.filter(
    b => (b.borrower_id === currentUser?.user_id || b.lender_id === currentUser?.user_id) &&
         b.status === 'completed'
  );

  const recentItems = items.filter(i => i.owner_id !== currentUser?.user_id && i.is_active).slice(0, 4);
  const recentUserBookings = bookings
    .filter(b => b.borrower_id === currentUser?.user_id || b.lender_id === currentUser?.user_id)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-slate-100 to-white dark:from-emerald-950/60 dark:via-slate-900 dark:to-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Member Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hello, {currentUser?.name}!</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-lg">
            Share equipment with neighbors, track active loans, and manage incoming borrow requests with Razorpay escrow protection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLendModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List Equipment</span>
          </button>
          <button
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-800 transition-all shadow-sm"
          >
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>Browse Tools</span>
          </button>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('my-listings')}
          className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">My Equipment</span>
            <Package className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{myItems.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Listed for sharing</span>
        </div>

        <div 
          onClick={() => onNavigate('bookings')}
          className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Bookings</span>
            <CalendarCheck className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400">{activeBookings.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Approved & in-progress</span>
        </div>

        <div 
          onClick={() => onNavigate('bookings')}
          className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{pendingRequests.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting confirmation</span>
        </div>

        <div 
          onClick={() => onNavigate('bookings')}
          className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Completed Loans</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-3xl font-black text-teal-600 dark:text-teal-400">{completedBookings.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Returned & reviewed</span>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('catalog')}
          className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl text-left transition-all shadow-sm group"
        >
          <Layers className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Browse Equipment</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Explore available tools nearby</p>
        </button>

        <button
          onClick={onOpenLendModal}
          className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl text-left transition-all shadow-sm group"
        >
          <PlusCircle className="w-5 h-5 text-teal-500 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">List New Equipment</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Lend an idle tool you own</p>
        </button>

        <button
          onClick={() => onNavigate('bookings')}
          className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl text-left transition-all shadow-sm group"
        >
          <CalendarCheck className="w-5 h-5 text-cyan-500 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">View My Bookings</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Check borrowing and lending status</p>
        </button>

        <button
          onClick={() => onNavigate('my-listings')}
          className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl text-left transition-all shadow-sm group"
        >
          <Package className="w-5 h-5 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Manage My Equipment</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Incoming requests & availability</p>
        </button>
      </div>

      {/* Two Column Layout: Recent Community Tools & My Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Available in Your Communities</span>
            </h3>
            <button
              onClick={() => onNavigate('catalog')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              See all &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {recentItems.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No equipment listed yet.</p>
            ) : (
              recentItems.map((item) => (
                <div
                  key={item.item_id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white line-clamp-1">{item.title}</h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.category} • Owner: {item.owner_name}
                    </span>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{Number(item.deposit_amount).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 block">deposit</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-500" />
              <span>Your Recent Booking Activity</span>
            </h3>
            <button
              onClick={() => onNavigate('bookings')}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
            >
              See all &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {recentUserBookings.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No booking activities yet.</p>
            ) : (
              recentUserBookings.map((b) => {
                const isBorrower = b.borrower_id === currentUser?.user_id;
                return (
                  <div
                    key={b.booking_id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">{b.item_title}</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isBorrower ? `Borrowing from ${b.lender_name}` : `Lending to ${b.borrower_name}`}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400">
                      {b.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

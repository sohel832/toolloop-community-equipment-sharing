'use client';

import React from 'react';
import { Search, ShieldCheck, Zap, Repeat, Sparkles } from 'lucide-react';

export default function Hero({ stats, searchTerm, setSearchTerm, onOpenLendModal }) {
  const summary = stats?.summary || {
    totalUsers: 6,
    totalItems: 8,
    totalCommunities: 4,
    totalBookings: 5,
    activeLoans: 3,
    totalDepositHeld: 6700
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-10 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Equipment-Sharing Network</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            Borrow Tools Locally. <span className="text-emerald-600 dark:text-emerald-400">Save Money. Cut Waste.</span>
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed max-w-2xl mx-auto">
            Access high-quality drills, pressure washers, projectors, and camping gear from trusted neighbors with refundable Razorpay escrow deposits.
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 max-w-lg mx-auto mb-8">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search power tools, gardening, woodworking..."
                className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-xs sm:text-sm shadow-sm"
              />
            </div>
            <button
              onClick={onOpenLendModal}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs whitespace-nowrap shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              List a Tool
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <div className="text-xl font-black text-slate-900 dark:text-white">{summary.totalItems}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tools Available</p>
          </div>

          <div className="bg-white dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <div className="text-xl font-black text-slate-900 dark:text-white">{summary.totalBookings}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total Loans</p>
          </div>

          <div className="bg-white dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">₹{Number(summary.totalDepositHeld).toLocaleString()}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Refundable Escrow</p>
          </div>

          <div className="bg-white dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <div className="text-xl font-black text-slate-900 dark:text-white">{summary.totalCommunities}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Active Hubs</p>
          </div>
        </div>
      </div>
    </section>
  );
}

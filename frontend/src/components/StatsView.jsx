'use client';

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  ShieldCheck, 
  Users, 
  Repeat, 
  DollarSign,
  Activity,
  Award
} from 'lucide-react';

export default function StatsView({ stats }) {
  const summary = stats?.summary || {
    totalUsers: 6,
    totalItems: 8,
    totalCommunities: 4,
    totalBookings: 5,
    activeLoans: 3,
    totalDepositHeld: 6700
  };

  const categoryStats = stats?.categoryStats || [];
  const communityStats = stats?.communityStats || [];
  const recentActivity = stats?.recentActivity || [];

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-semibold block mb-1">Total Users</span>
          <span className="text-2xl font-black text-white">{summary.totalUsers}</span>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-semibold block mb-1">Equipment Listed</span>
          <span className="text-2xl font-black text-emerald-400">{summary.totalItems}</span>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-semibold block mb-1">Hubs / Communities</span>
          <span className="text-2xl font-black text-cyan-400">{summary.totalCommunities}</span>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-semibold block mb-1">All-Time Bookings</span>
          <span className="text-2xl font-black text-white">{summary.totalBookings}</span>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-semibold block mb-1">Active Loans</span>
          <span className="text-2xl font-black text-teal-300">{summary.activeLoans}</span>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-semibold block mb-1">Deposits in Escrow</span>
          <span className="text-xl font-black text-emerald-400">₹{Number(summary.totalDepositHeld).toLocaleString()}</span>
        </div>
      </div>

      {/* Two columns: Category Aggregations & Community Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category distribution */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>Category Breakdown & Average Deposit</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">SQL GROUP BY</span>
          </div>

          <div className="space-y-3">
            {categoryStats.map((cat) => (
              <div key={cat.category} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-200">{cat.category}</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {cat.count} items • Avg: ₹{Number(cat.avg_deposit).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(cat.count * 25, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Leaderboard */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Community Equipment Hub Leaderboard</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">SQL JOIN & COUNT</span>
          </div>

          <div className="space-y-3">
            {communityStats.map((comm, idx) => (
              <div
                key={comm.name}
                className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[11px] text-amber-400">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-white">{comm.name}</h4>
                    <span className="text-[11px] text-slate-400">{comm.members} registered members</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-emerald-400 font-bold">{comm.items_available}</span>
                  <span className="text-slate-500 text-[10px] block">Tools Available</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Audit */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Recent Equipment Loans (Audit Log)</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Live bookings table</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase font-mono">
                <th className="py-2.5 px-3">Loan ID</th>
                <th className="py-2.5 px-3">Equipment</th>
                <th className="py-2.5 px-3">Borrower</th>
                <th className="py-2.5 px-3">Lender</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {recentActivity.map((b) => (
                <tr key={b.booking_id} className="hover:bg-slate-900/40">
                  <td className="py-2 px-3 text-slate-500">#{b.booking_id}</td>
                  <td className="py-2 px-3 font-semibold text-white">{b.item_title}</td>
                  <td className="py-2 px-3 text-slate-300">{b.borrower_name}</td>
                  <td className="py-2 px-3 text-slate-300">{b.lender_name}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-emerald-300 border border-emerald-500/20">
                      {b.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-500">{String(b.created_at || '').substring(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

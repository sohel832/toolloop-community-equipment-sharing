'use client';

import React from 'react';
import { Users, Wrench, Building } from 'lucide-react';

export default function CommunitiesView({
  communities = [],
  currentUser,
  onJoinToggle
}) {
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Community Equipment Hubs</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Connect with local campuses, residential apartment complexes, and neighborhood maker circles to discover shared tools nearby.
        </p>
      </div>

      {/* Grid of communities */}
      {communities.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 shadow-sm">
          No communities available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {communities.map((comm) => (
            <div
              key={comm.community_id}
              className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {comm.type}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">Hub #{comm.community_id}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{comm.name}</h3>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span><strong className="text-slate-800 dark:text-slate-200">{comm.member_count}</strong> Members</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span><strong className="text-slate-800 dark:text-slate-200">{comm.items_count}</strong> Shared Tools</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Equipment Sharing Hub
                </span>

                <button
                  onClick={() => onJoinToggle(comm.community_id)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-emerald-500 hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-emerald-500 dark:hover:text-slate-950 text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 active:scale-95 shadow-sm"
                >
                  Join Hub
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

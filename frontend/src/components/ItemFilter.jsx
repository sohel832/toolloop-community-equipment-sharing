'use client';

import React from 'react';
import { Filter } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Power Tools',
  'Gardening',
  'Woodworking',
  'Electronics',
  'Automotive',
  'Outdoor & Camping'
];

const CONDITIONS = ['All', 'Like New', 'Good', 'Fair'];

export default function ItemFilter({
  selectedCategory,
  setSelectedCategory,
  selectedCondition,
  setSelectedCondition,
  selectedCommunity,
  setSelectedCommunity,
  communities = []
}) {
  return (
    <div className="mb-6 space-y-3.5">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white shadow-sm'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Secondary Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Filter className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Filter By:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Condition Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400">Condition:</span>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-lg focus:outline-none focus:border-emerald-500 text-xs"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Community Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400">Community:</span>
            <select
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-lg focus:outline-none focus:border-emerald-500 text-xs"
            >
              <option value="All">All Communities</option>
              {communities.map((comm) => (
                <option key={comm.community_id} value={comm.community_id}>
                  {comm.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

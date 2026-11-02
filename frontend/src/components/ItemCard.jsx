'use client';

import React from 'react';
import { 
  Star, 
  MapPin, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

export default function ItemCard({ item, currentUser, onBorrowClick }) {
  const isOwner = currentUser?.user_id === item.owner_id;
  const isAvailable = item.current_availability !== 'reserved';

  const conditionColor = {
    'Like New': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    'Good': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    'Fair': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
  }[item.item_condition] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800/90 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-lg dark:hover:shadow-none transition-all duration-200 shadow-sm">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {item.category}
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${conditionColor}`}>
            {item.item_condition}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 line-clamp-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
          {item.description || 'No detailed description provided.'}
        </p>

        {/* Ratings & Community */}
        <div className="space-y-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-amber-500 dark:text-amber-400">{item.avg_rating}</span>
              <span className="text-slate-400">({item.total_reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              {isAvailable ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready to Lend
                </span>
              ) : (
                <span className="text-amber-500 font-medium">Currently Reserved</span>
              )}
            </div>
          </div>

          {item.community_names && (
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] truncate">
              <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
              <span className="truncate">{item.community_names}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Deposit Amount & Borrow Action */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Security Deposit</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 dark:text-white">₹{Number(item.deposit_amount).toLocaleString()}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">(Refundable)</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Owner</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {item.owner_name} {isOwner && '(You)'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        {isOwner ? (
          <button
            disabled
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-semibold cursor-not-allowed border border-slate-200 dark:border-slate-700/50"
          >
            Your Listed Equipment
          </button>
        ) : (
          <button
            onClick={() => onBorrowClick(item)}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <span>Request to Borrow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Wrench, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Wrench className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">ToolLoop</span>
          <span className="text-slate-400 dark:text-slate-500">— Community Equipment Sharing Platform</span>
        </div>

        {/* Security & Integrity Note */}
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Secure escrow deposits & verified community members</span>
        </div>

        {/* Copyright */}
        <div className="text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} ToolLoop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

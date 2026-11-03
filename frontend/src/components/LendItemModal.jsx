'use client';

import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  AlertCircle, 
  Sparkles, 
  Smartphone, 
  ShieldCheck, 
  HelpCircle,
  Coins
} from 'lucide-react';

const CATEGORIES = [
  'Power Tools',
  'Gardening',
  'Woodworking',
  'Electronics',
  'Automotive',
  'Outdoor & Camping',
  'Cleaning Equipment',
  'Hand Tools'
];

const CONDITIONS = ['Like New', 'Good', 'Fair'];

const DEPOSIT_PRESETS = [0, 250, 500, 1000, 2000];
const RENTAL_PRESETS = [0, 100, 250, 500];

export default function LendItemModal({ currentUser, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState('Like New');
  
  // Customizable / Flexible Deposit & Rental Rates
  const [depositAmount, setDepositAmount] = useState('500');
  const [rentalRate, setRentalRate] = useState('100');
  
  // Mandatory Lender UPI ID
  const [lenderUpi, setLenderUpi] = useState(currentUser?.upi_id || '');
  
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const threeMonths = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [endDate, setEndDate] = useState(threeMonths);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Equipment title is required.');
      return;
    }

    // MANDATORY UPI ID VALIDATION
    if (!lenderUpi.trim()) {
      setError('Entering your UPI ID is mandatory so borrower payments go directly to your UPI account.');
      return;
    }

    // Basic UPI format validation (must contain @)
    if (!lenderUpi.includes('@') || lenderUpi.trim().length < 4) {
      setError('Please enter a valid UPI ID (e.g. yourname@okhdfcbank or 9611668103@ptyes).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_id: currentUser.user_id,
          category,
          title: title.trim(),
          description: description.trim(),
          item_condition: condition,
          rental_rate: parseFloat(rentalRate) || 0,
          deposit_amount: parseFloat(depositAmount) || 0,
          start_date: startDate,
          end_date: endDate,
          lender_upi_id: lenderUpi.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to list item');
      }

      // Update local storage user profile with updated UPI ID if not present
      if (!currentUser.upi_id) {
        try {
          const updatedUser = { ...currentUser, upi_id: lenderUpi.trim() };
          localStorage.setItem('toolloop_user', JSON.stringify(updatedUser));
        } catch (e) {}
      }

      onSuccess(data.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto transition-colors duration-200 text-slate-900 dark:text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Equipment Sharing</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">List Equipment to Lend</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lending as: <strong className="text-slate-800 dark:text-slate-200">{currentUser.name}</strong> ({currentUser.email})
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. MANDATORY LENDER UPI ID (High Priority) */}
          <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-purple-700 dark:text-purple-300">
                Your UPI ID (Mandatory for Receiving Payments) *
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                Required
              </span>
            </div>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-purple-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={lenderUpi}
                onChange={(e) => setLenderUpi(e.target.value)}
                placeholder="e.g. 9611668103@ptyes or name@okhdfcbank"
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 font-mono font-semibold"
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              Borrowers will scan a dynamic QR code or pay via PhonePe / GPay directly to this UPI address.
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Equipment Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bosch 18V Cordless Impact Drill Kit"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 placeholder-slate-400"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. CUSTOMIZABLE / FLEXIBLE SECURITY DEPOSIT */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Refundable Security Deposit (₹)
              </label>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                100% Refundable
              </span>
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5">
              {DEPOSIT_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setDepositAmount(String(preset))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    depositAmount === String(preset)
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {preset === 0 ? '₹0 (No Deposit)' : `₹${preset}`}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="relative pt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="50"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter custom deposit amount..."
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Set any custom amount. Held in escrow and returned to borrower upon safe return.
            </p>
          </div>

          {/* 3. CUSTOMIZABLE DAILY RENTAL RATE */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Daily Rental Fee (₹ / Day)
              </label>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase">
                Your Earnings
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {RENTAL_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setRentalRate(String(preset))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    rentalRate === String(preset)
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {preset === 0 ? '₹0 (Free Sharing)' : `₹${preset}/day`}
                </button>
              ))}
            </div>

            <div className="relative pt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
              <input
                type="number"
                min="0"
                step="25"
                value={rentalRate}
                onChange={(e) => setRentalRate(e.target.value)}
                placeholder="Enter custom daily rate..."
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Equipment Details & Accessories
            </label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Include accessories included, battery health, bit sets, or safety guidance..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 placeholder-slate-400"
            />
          </div>

          {/* Initial Availability Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Available From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Available Until
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'Publishing Tool...' : 'Publish Equipment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

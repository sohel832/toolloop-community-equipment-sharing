'use client';

import React, { useState } from 'react';
import { 
  Package, 
  PlusCircle, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RotateCcw, 
  Calendar, 
  ShieldCheck, 
  User,
  Power,
  Receipt,
  FileText,
  DollarSign,
  Smartphone
} from 'lucide-react';

export default function MyListedEquipment({
  currentUser,
  items = [],
  bookings = [],
  onOpenLendModal,
  onToggleActive,
  onDeleteItem,
  onBookingStatusChange,
  onOpenReceipt
}) {
  const [filter, setFilter] = useState('all');

  // Items owned by logged in user
  const myItems = items.filter((i) => i.owner_id === currentUser?.user_id);

  // Incoming booking requests for my equipment
  const incomingRequests = bookings.filter((b) => b.lender_id === currentUser?.user_id);
  const pendingRequests = incomingRequests.filter((b) => b.status === 'requested');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Listed Equipment</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your shared tools, review payments, and track equipment loans.
          </p>
        </div>

        <button
          onClick={onOpenLendModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List Another Tool</span>
        </button>
      </div>

      {/* SECTION 1: INCOMING BORROWING REQUESTS (Highest Priority for Lender) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Incoming Borrow Requests for Your Equipment</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {pendingRequests.length} Pending
            </span>
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80">
            No pending borrower requests right now.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((b) => (
              <div
                key={b.booking_id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{b.item_title}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400">
                      {b.item_category}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Borrower: <strong className="text-slate-900 dark:text-white">{b.borrower_name}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                      {b.start_date} to {b.end_date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Deposit: ₹{Number(b.deposit_held).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Accept / Reject Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onBookingStatusChange(b.booking_id, 'approved')}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    Accept Request
                  </button>
                  <button
                    onClick={() => onBookingStatusChange(b.booking_id, 'rejected')}
                    className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-rose-50 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-500/20 transition-all"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: MY LISTED EQUIPMENT TABLE/CARDS WITH PAYMENT DETAILS & RECEIPTS */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Your Equipment Listings ({myItems.length})</h3>

        {myItems.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <Package className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Equipment Listed Yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
              You haven't listed any equipment to share. Share drills, saws, lawn mowers or cameras with your community.
            </p>
            <button
              onClick={onOpenLendModal}
              className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md"
            >
              List Equipment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myItems.map((item) => {
              // Find bookings and payment history for this equipment
              const itemBookings = bookings.filter((b) => b.item_id === item.item_id);
              const paidBookings = itemBookings.filter((b) => b.payment_id || b.payment_status === 'held' || b.payment_status === 'refunded');

              return (
                <div
                  key={item.item_id}
                  className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.is_active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}>
                        {item.is_active ? 'Active Listing' : 'Inactive'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{item.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {item.description || 'No description provided.'}
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-700 dark:text-slate-300 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase block">Condition</span>
                        <strong className="text-slate-800 dark:text-slate-200">{item.item_condition}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase block">Rental Rate</span>
                        <strong className="text-purple-600 dark:text-purple-400">₹{Number(item.rental_rate || 0)}/day</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase block">Deposit</span>
                        <strong className="text-emerald-600 dark:text-emerald-400">₹{Number(item.deposit_amount).toLocaleString()}</strong>
                      </div>
                    </div>

                    {/* PAYMENT DETAILS FOR THIS LISTING (User Request Feature) */}
                    {paidBookings.length > 0 && (
                      <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Payment History & Receipts ({paidBookings.length})</span>
                          </span>
                          <span className="text-[10px] text-slate-400">Direct UPI Payout</span>
                        </div>

                        <div className="space-y-2">
                          {paidBookings.map((pb) => {
                            const isRefunded = pb.refund_status === 'refunded' || pb.status === 'completed';
                            return (
                              <div
                                key={pb.booking_id}
                                className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900 dark:text-white">Borrower: {pb.borrower_name}</span>
                                    {isRefunded ? (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        Deposit Refunded
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        Escrow Held
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Total Paid: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">₹{Number(pb.payment_amount || pb.total_paid || pb.deposit_held).toLocaleString()}</strong>
                                    {pb.receipt_number && <span className="ml-2 font-mono text-[10px]">({pb.receipt_number})</span>}
                                  </div>
                                </div>

                                {onOpenReceipt && (
                                  <button
                                    onClick={() => onOpenReceipt(pb)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition-all active:scale-95 shadow-sm"
                                    title="Download Receipt"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span>Download Receipt</span>
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions: Toggle Active & Delete */}
                  <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => onToggleActive(item.item_id, item.is_active)}
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                      <Power className={`w-3.5 h-3.5 ${item.is_active ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <span>{item.is_active ? 'Deactivate Listing' : 'Make Active'}</span>
                    </button>

                    <button
                      onClick={() => onDeleteItem(item.item_id, item.title)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

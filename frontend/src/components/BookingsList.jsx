'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  RotateCcw,
  CreditCard,
  QrCode,
  Receipt,
  FileText,
  DollarSign
} from 'lucide-react';

export default function BookingsList({
  bookings = [],
  currentUser,
  onStatusChange,
  onOpenRatingModal,
  onOpenPaymentModal,
  onOpenReceipt
}) {
  const [subTab, setSubTab] = useState('borrowing'); // 'borrowing' | 'lending' | 'payments' | 'all'

  const filteredBookings = bookings.filter((b) => {
    if (subTab === 'borrowing') return b.borrower_id === currentUser.user_id;
    if (subTab === 'lending') return b.lender_id === currentUser.user_id;
    if (subTab === 'payments') {
      return (b.borrower_id === currentUser.user_id || b.lender_id === currentUser.user_id) && 
        (b.payment_id || b.receipt_number || b.payment_status === 'held' || b.payment_status === 'refunded');
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Requested
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <CheckCircle className="w-3 h-3" /> Approved & Active
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" /> Returned & Completed
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> {status === 'rejected' ? 'Rejected' : 'Cancelled'}
          </span>
        );
      default:
        return <span className="text-xs text-slate-500 dark:text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSubTab('borrowing')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              subTab === 'borrowing'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Tools I'm Borrowing ({bookings.filter(b => b.borrower_id === currentUser.user_id).length})
          </button>

          <button
            onClick={() => setSubTab('lending')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              subTab === 'lending'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Requests for My Tools ({bookings.filter(b => b.lender_id === currentUser.user_id).length})
          </button>

          {/* Payment History & Receipts Tab */}
          <button
            onClick={() => setSubTab('payments')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              subTab === 'payments'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Payment History & Receipts</span>
          </button>

          <button
            onClick={() => setSubTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              subTab === 'all'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Bookings ({bookings.length})
          </button>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400">
          Viewing as: <strong className="text-slate-800 dark:text-slate-200">{currentUser.name}</strong>
        </span>
      </div>

      {/* Bookings cards */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Calendar className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            {subTab === 'payments' ? 'No Payment Receipts Found' : 'No Bookings Found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {subTab === 'borrowing'
              ? "You haven't requested any equipment yet. Explore the catalog and borrow what you need!"
              : subTab === 'payments'
              ? "No payment transactions yet. When you complete an escrow payment for borrowed equipment, receipts appear here."
              : "No one has requested your equipment yet. List more tools to help your community!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map((b) => {
            const isLender = b.lender_id === currentUser.user_id;
            const isBorrower = b.borrower_id === currentUser.user_id;
            const hasPayment = Boolean(b.payment_id || b.receipt_number || b.payment_status === 'held' || b.payment_status === 'refunded');
            const isPaymentPending = b.payment_status === 'pending' || !b.payment_status;
            const isRefunded = b.refund_status === 'refunded' || b.payment_status === 'refunded' || b.status === 'completed';

            // Breakdown
            const rentalAmount = Number(b.payment_rental_charges ?? b.rental_charges ?? 0);
            const platformFee = 20;
            const depositAmount = Number(b.payment_security_deposit ?? b.deposit_held ?? 0);
            const totalPaid = Number(b.payment_amount ?? b.total_paid ?? (rentalAmount + platformFee + depositAmount));

            return (
              <div
                key={b.booking_id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
              >
                {/* Left Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-slate-400">#{b.booking_id}</span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{b.item_title}</h4>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {b.item_category}
                    </span>
                    {getStatusBadge(b.status)}
                    {isRefunded && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        Deposit Refunded
                      </span>
                    )}
                  </div>

                  {/* Dates & Users */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>
                        Dates: <strong className="text-slate-800 dark:text-slate-200">{b.start_date}</strong> to <strong className="text-slate-800 dark:text-slate-200">{b.end_date}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">Borrower:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{b.borrower_name}</strong>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-slate-500 dark:text-slate-400">Lender:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{b.lender_name}</strong>
                    </div>
                  </div>

                  {/* Payment Breakdown Distinction */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Rental Charges</span>
                        <strong className="text-slate-900 dark:text-white font-mono">₹{rentalAmount.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Platform Fee</span>
                        <strong className="text-slate-900 dark:text-white font-mono">₹{platformFee}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase block">Security Deposit</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{depositAmount.toLocaleString()} (Refundable)
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Total Amount</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        ₹{totalPaid.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Review snippet */}
                  {b.rating_score && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <div className="flex items-center gap-1 text-amber-500 font-bold shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{b.rating_score}/5</span>
                      </div>
                      <p className="italic text-slate-500 dark:text-slate-400">"{b.rating_comment}"</p>
                    </div>
                  )}
                </div>

                {/* Right Actions */}
                <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0">
                  {/* VIEW RECEIPT BUTTON (Available once paid or completed) */}
                  {hasPayment && onOpenReceipt && (
                    <button
                      onClick={() => onOpenReceipt(b)}
                      className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 dark:text-purple-300 font-bold text-xs transition-all border border-purple-200 dark:border-purple-800/80 active:scale-95 flex items-center justify-center gap-1.5 w-full shadow-sm"
                    >
                      <Receipt className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>View Receipt</span>
                    </button>
                  )}

                  {/* Borrower: Open Razorpay Payment Gateway if pending */}
                  {isBorrower && isPaymentPending && b.status !== 'cancelled' && b.status !== 'rejected' && onOpenPaymentModal && (
                    <button
                      onClick={() => onOpenPaymentModal(b)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 w-full"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Pay Deposit (UPI)</span>
                    </button>
                  )}

                  {/* Lender Actions for requested */}
                  {isLender && b.status === 'requested' && (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => onStatusChange(b.booking_id, 'approved')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 flex-1"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onStatusChange(b.booking_id, 'rejected')}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-500/20 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-500/20 transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {/* Active Loan -> Mark Returned & Refund */}
                  {isLender && b.status === 'approved' && (
                    <button
                      onClick={() => onStatusChange(b.booking_id, 'completed')}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 w-full"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Confirm Return & Refund</span>
                    </button>
                  )}

                  {/* Borrower Cancel */}
                  {isBorrower && b.status === 'requested' && (
                    <button
                      onClick={() => onStatusChange(b.booking_id, 'cancelled')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs font-medium transition-all"
                    >
                      Cancel Request
                    </button>
                  )}

                  {/* Rate Experience */}
                  {b.status === 'completed' && !b.rating_id && (
                    <button
                      onClick={() => onOpenRatingModal(b)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 w-full"
                    >
                      <Star className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Leave Review (1-5★)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

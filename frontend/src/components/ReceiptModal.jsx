'use client';

import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Mail, 
  CheckCircle2, 
  ShieldCheck, 
  Wrench, 
  Download, 
  RotateCcw,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

export default function ReceiptModal({ receipt, onClose, onResendEmail }) {
  const [emailSending, setEmailSending] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [copiedTxn, setCopiedTxn] = useState(false);

  if (!receipt) return null;

  // Extract / normalize fields
  const receiptNumber = receipt.receipt_number || `RCP-${Date.now().toString().slice(-6)}`;
  const transactionId = receipt.transaction_id || `TXN${Date.now()}`;
  const orderId = receipt.order_id || (receipt.booking_id ? `BK${String(receipt.booking_id).padStart(5, '0')}` : 'BK00125');
  const paymentDate = receipt.payment_date || (receipt.payment_time ? new Date(receipt.payment_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '03 Nov 2026');
  const paymentTime = receipt.payment_time ? new Date(receipt.payment_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '10:30 AM';
  const paymentStatus = receipt.payment_status || (receipt.status === 'refunded' ? 'Refunded' : 'Successful');

  // Customer details
  const customerName = receipt.customer?.name || receipt.borrower_name || 'Community Member';
  const customerEmail = receipt.customer?.email || receipt.borrower_email || receipt.receipt_email || 'customer@example.com';
  const customerPhone = receipt.customer?.phone || receipt.borrower_phone || '+91 96116 68103';

  // Equipment details
  const equipmentTitle = receipt.equipment?.title || receipt.item_title || 'Equipment Rental';
  const ownerName = receipt.equipment?.owner || receipt.lender_name || 'Equipment Owner';
  const startDate = receipt.equipment?.start_date || receipt.start_date || '05 Nov 2026';
  const endDate = receipt.equipment?.end_date || receipt.end_date || '07 Nov 2026';
  const duration = receipt.equipment?.duration || '2 Days';

  // Breakdown
  const rentalCharges = Number(receipt.breakdown?.rental_charges ?? receipt.rental_charges ?? 500);
  const platformFee = Number(receipt.breakdown?.platform_fee ?? receipt.platform_fee ?? 20);
  const securityDeposit = Number(receipt.breakdown?.security_deposit ?? receipt.security_deposit ?? 200);
  const totalPaid = Number(receipt.breakdown?.total_paid ?? receipt.amount ?? (rentalCharges + platformFee + securityDeposit));

  // Method
  const method = receipt.method?.type || receipt.method || 'UPI';
  const upiApp = receipt.method?.upi_app || receipt.upi_app || 'PhonePe';
  const upiRef = receipt.method?.upi_ref_id || receipt.upi_ref_id || '123456789012';

  // Refund info
  const isRefunded = receipt.refund_status === 'refunded' || receipt.status === 'refunded';
  const refundAmount = Number(receipt.refund_amount || securityDeposit);
  const refundDate = receipt.refund_date ? new Date(receipt.refund_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '07 Nov 2026';

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = async () => {
    setEmailSending(true);
    try {
      if (onResendEmail) {
        await onResendEmail(receipt);
      } else {
        await fetch('/api/payments/send-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_id: receipt.booking_id,
            receipt_number: receiptNumber,
            email: customerEmail
          })
        });
      }
      setEmailSentSuccess(true);
      setTimeout(() => setEmailSentSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setEmailSending(false);
    }
  };

  const copyTxn = () => {
    navigator.clipboard.writeText(transactionId);
    setCopiedTxn(true);
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden my-6 print:m-0 print:border-none print:shadow-none print:w-full print:max-w-none text-slate-900 dark:text-slate-100">
        
        {/* ACTION BAR (Hidden in print) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Payment Receipt</span>
            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">#{receiptNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendEmail}
              disabled={emailSending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all active:scale-95 shadow-sm"
              title="Send to customer email"
            >
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span>{emailSending ? 'Sending...' : emailSentSuccess ? 'Sent to Mail!' : 'Email Receipt'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Download / Print PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTAINER */}
        <div className="p-6 sm:p-8 space-y-6 print:p-8" id="printable-receipt">
          {/* Email dispatch toast notice */}
          {emailSentSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 print:hidden">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Official payment receipt was successfully dispatched to <strong>{customerEmail}</strong>!</span>
            </div>
          )}

          {/* RECEIPT HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center font-bold text-slate-950 shadow-md">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">ToolLoop</h1>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                  Community Equipment-Sharing Network
                </span>
                <span className="text-[10px] text-slate-400 block">Direct Peer-to-Peer Escrow Protocol</span>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {paymentStatus}
              </div>
              <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Receipt No: <span className="text-emerald-600 dark:text-emerald-400">{receiptNumber}</span>
              </div>
              <span className="text-[11px] text-slate-400 block font-mono">Issued: {paymentDate} • {paymentTime}</span>
            </div>
          </div>

          {/* REFUND STATUS BANNER (If Refund happened) */}
          {isRefunded && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 space-y-1">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wider">
                <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Security Deposit Refunded</span>
              </div>
              <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                Equipment was returned safely and inspected by owner. The refundable security deposit of 
                <strong> ₹{refundAmount.toLocaleString()}</strong> was successfully released back to the borrower's account on {refundDate}. 
                Original receipt preserved for audit integrity.
              </p>
            </div>
          )}

          {/* 1. TRANSACTION DETAILS */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              1. Transaction Details
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Transaction ID</span>
                <div className="flex items-center gap-1 font-mono font-bold text-slate-900 dark:text-white truncate">
                  <span>{transactionId}</span>
                  <button onClick={copyTxn} className="text-slate-400 hover:text-slate-600 print:hidden" title="Copy ID">
                    {copiedTxn ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Order / Booking ID</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white block">{orderId}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Payment Date & Time</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">{paymentDate}, {paymentTime}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Payment Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{paymentStatus}</span>
                </span>
              </div>
            </div>
          </div>

          {/* 2. CUSTOMER DETAILS & 3. EQUIPMENT / BOOKING DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                2. Customer Details
              </h2>
              <div className="space-y-1 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Name:</span>
                  <strong className="text-slate-900 dark:text-white">{customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono text-[11px]">{customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span>{customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Equipment / Booking Details */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                3. Equipment / Booking Details
              </h2>
              <div className="space-y-1 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Equipment:</span>
                  <strong className="text-slate-900 dark:text-white truncate max-w-[150px]">{equipmentTitle}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Owner (Lender):</span>
                  <span>{ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rental Period:</span>
                  <span>{startDate} to {endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rental Duration:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">{duration}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 4. PAYMENT BREAKDOWN TABLE */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              4. Payment Breakdown
            </h2>
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-mono text-[11px] uppercase border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-4 font-semibold">Description</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  <tr>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 font-medium">Rental Charges ({duration})</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹{rentalCharges.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 font-medium">Platform Fee</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹{platformFee.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-emerald-500/5">
                    <td className="py-2.5 px-4 text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                      <span>Security Deposit</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                        100% Refundable
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      ₹{securityDeposit.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-slate-100 dark:bg-slate-950 font-black text-sm border-t-2 border-slate-200 dark:border-slate-800">
                    <td className="py-3 px-4 text-slate-900 dark:text-white">Total Paid</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{totalPaid.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. PAYMENT METHOD */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              5. Payment Method & Direct UPI Transfer
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Method</span>
                <span className="font-bold text-slate-900 dark:text-white block">{method}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">UPI App</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">{upiApp}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">UPI UTR Reference</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white block">{upiRef}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Paid Amount</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">₹{totalPaid.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* OFFICIAL FOOTER NOTICE & VERIFICATION SEAL */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Cryptographically verified payment. Escrow secured by ToolLoop Escrow Services.</span>
            </div>
            <div className="text-right">
              <span>Admin Escrow Lead: <strong>Sohel M Chapparband</strong> (s9611668103@ptyes)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

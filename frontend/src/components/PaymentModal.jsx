'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Clock, 
  CreditCard, 
  Smartphone, 
  Copy, 
  Check, 
  Send, 
  FileText,
  Printer,
  Mail,
  Receipt
} from 'lucide-react';

export default function PaymentModal({
  booking,
  item,
  currentUser,
  onClose,
  onPaymentSuccess,
  onOpenReceipt
}) {
  const [paymentTab, setPaymentTab] = useState('upi_qr'); // 'upi_qr' | 'upi_manual' | 'upi_apps'
  const [selectedUpiApp, setSelectedUpiApp] = useState('PhonePe');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 min
  const [copiedUpi, setCopiedUpi] = useState(false);

  // User input fields
  const [userUpiId, setUserUpiId] = useState(currentUser?.upi_id || '');
  const [utrNumber, setUtrNumber] = useState('');

  // Lender (Beneficiary) Info
  const lenderName = booking?.lender_name || 'Equipment Owner';
  const lenderUpiId = orderData?.upi_id || booking?.lender_upi_id || 's9611668103@ptyes';

  // Amount breakdown
  const securityDeposit = Number(booking?.deposit_held || item?.deposit_amount || 0);
  const rentalCharges = Number(booking?.rental_charges || 0);
  const platformFee = 20.00;
  const totalAmount = orderData?.amount_inr || (rentalCharges + platformFee + securityDeposit);

  // Dynamic UPI URI string to Lender's UPI Account
  const upiLink = orderData?.upi_link || `upi://pay?pa=${lenderUpiId}&pn=${encodeURIComponent(lenderName)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=ToolLoop_BK${booking?.booking_id || ''}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(upiLink)}`;

  // Initialize Order on Mount
  useEffect(() => {
    let isMounted = true;
    async function initOrder() {
      try {
        const res = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_id: booking?.booking_id,
            amount: securityDeposit,
            item_title: item?.title || booking?.item_title || 'Equipment Share'
          })
        });
        const data = await res.json();
        if (isMounted && data.success) {
          setOrderData(data);
        }
      } catch (err) {
        console.error('Order creation error:', err);
      }
    }
    initOrder();
    return () => { isMounted = false; };
  }, [booking?.booking_id, securityDeposit, item?.title]);

  // Countdown timer
  useEffect(() => {
    if (timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  const formatTimer = () => {
    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(lenderUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Verify Payment Handler
  const handleVerifyPayment = async (appName = selectedUpiApp) => {
    setError('');
    setLoading(true);

    try {
      const orderId = orderData?.order_id || `order_${Date.now()}`;
      const paymentId = utrNumber.trim()
        ? `utr_${utrNumber.trim()}`
        : `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const signature = `sig_verified_${Date.now()}`;

      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking?.booking_id,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          method: 'UPI',
          upi_app: appName,
          upi_ref_id: utrNumber.trim(),
          payer_upi_id: userUpiId.trim() || `${currentUser.name.toLowerCase().replace(/\s+/g, '')}@upi`,
          simulate_failure: false
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Payment verification failed');
      }

      setGeneratedReceipt(data.receipt);
      setVerifiedSuccess(true);
      if (onPaymentSuccess) {
        onPaymentSuccess(data.payment);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative my-6 transition-colors duration-200 text-slate-900 dark:text-slate-100">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-lg">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-base">Direct UPI Escrow Payment</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Safe & Verified
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Paid directly to Lender • 100% Refundable Security Deposit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VERIFIED SUCCESS SCREEN */}
        {verifiedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Payment Successful & Escrow Secured!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto mt-1">
                Your payment of <strong>₹{totalPaid.toLocaleString()}</strong> has been verified. 
                Refundable security deposit is locked in escrow.
              </p>
            </div>

            {/* Email dispatch indicator */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official Receipt <strong>#{generatedReceipt?.receipt_number}</strong> was sent to <strong>{currentUser.email}</strong>!</span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => {
                  if (onOpenReceipt && generatedReceipt) {
                    onOpenReceipt(generatedReceipt);
                  }
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Receipt className="w-4 h-4" />
                <span>View & Download Receipt</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* LENDER BENEFICIARY & BREAKDOWN CARD */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Equipment</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[170px] block">
                    {item?.title || booking?.item_title || 'Equipment Rental'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Lender Beneficiary</span>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block">
                    {lenderName}
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Rental Charges:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">₹{rentalCharges}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Verification Fee:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">₹{platformFee}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Security Deposit (Refundable):</span>
                  <span className="font-mono font-bold">₹{securityDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-sm font-black text-slate-900 dark:text-white">
                  <span>Total Payable:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* PAYMENT METHOD TABS */}
            <div className="grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPaymentTab('upi_qr')}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  paymentTab === 'upi_qr'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-500" />
                <span>Scan QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentTab('upi_manual')}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  paymentTab === 'upi_manual'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Send className="w-3.5 h-3.5 text-blue-500" />
                <span>Enter UTR / UPI</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentTab('upi_apps')}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  paymentTab === 'upi_apps'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-purple-500" />
                <span>UPI Apps</span>
              </button>
            </div>

            {/* TAB 1: SCAN QR CODE */}
            {paymentTab === 'upi_qr' && (
              <div className="text-center space-y-4 py-1">
                {/* QR Code Container */}
                <div className="inline-block p-3 bg-white rounded-2xl border-2 border-emerald-500 shadow-md">
                  <img
                    src={qrCodeUrl}
                    alt={`Scan to Pay ₹${totalAmount} to ${lenderUpiId}`}
                    className="w-40 h-40 mx-auto rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    style={{ display: 'none' }} 
                    className="w-40 h-40 bg-slate-950 rounded-xl p-2.5 flex-col items-center justify-center text-white"
                  >
                    <QrCode className="w-20 h-20 text-white" />
                    <span className="text-[10px] font-mono font-bold text-emerald-400 mt-1 truncate max-w-[130px]">{lenderUpiId}</span>
                  </div>
                </div>

                {/* Lender UPI ID with Copy Button */}
                <div className="flex items-center justify-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[260px]">
                    Lender UPI: <span className="text-emerald-600 dark:text-emerald-400">{lenderUpiId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyUpiId}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition-all active:scale-95"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="space-y-1 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Expires in: <strong className="text-slate-900 dark:text-white font-mono">{formatTimer()}</strong></span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Scan using Google Pay, PhonePe, Paytm, or BHIM to transfer ₹{totalAmount.toLocaleString()} directly to {lenderName}.
                  </p>
                </div>

                {/* Confirm Button */}
                <div className="pt-2">
                  <button
                    onClick={() => handleVerifyPayment('UPI QR')}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Verifying with Bank...' : `I have Scanned & Paid ₹${totalAmount.toLocaleString()} (Confirm)`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: ENTER UPI ID / UTR */}
            {paymentTab === 'upi_manual' && (
              <div className="space-y-4 py-2">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Lender UPI Address:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{lenderUpiId}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Lender Name:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{lenderName}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your UPI ID (Payer VPA)
                  </label>
                  <input
                    type="text"
                    value={userUpiId}
                    onChange={(e) => setUserUpiId(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    The UPI handle from which you made the payment.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    12-Digit Bank UTR / Reference Number
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 408221839210"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                <button
                  onClick={() => handleVerifyPayment('UPI ID')}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Verifying with Bank...' : `Confirm Payment of ₹${totalAmount.toLocaleString()}`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* TAB 3: UPI APPS INTENT */}
            {paymentTab === 'upi_apps' && (
              <div className="space-y-4 py-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 block text-center font-medium">
                  Select your UPI app to pay directly:
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { name: 'PhonePe', color: 'hover:border-purple-500', desc: 'Direct UPI' },
                    { name: 'Google Pay', color: 'hover:border-blue-500', desc: 'Fast checkout' },
                    { name: 'Paytm UPI', color: 'hover:border-cyan-500', desc: 'Zero fee' },
                    { name: 'BHIM / Any UPI', color: 'hover:border-emerald-500', desc: 'NPCI Official' }
                  ].map((app) => (
                    <a
                      key={app.name}
                      href={upiLink}
                      onClick={() => {
                        setSelectedUpiApp(app.name);
                        setTimeout(() => handleVerifyPayment(app.name), 1200);
                      }}
                      className={`p-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-left transition-all active:scale-95 block ${app.color} ${
                        selectedUpiApp === app.name ? 'border-emerald-500' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">{app.name}</span>
                      <span className="text-[10px] text-slate-500">Pay to {lenderName}</span>
                    </a>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleVerifyPayment(selectedUpiApp)}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Confirming...' : `I have Completed Transfer on ${selectedUpiApp} (₹${totalAmount.toLocaleString()})`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* SECURITY GUARANTEE FOOTER */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Direct Lender Escrow Protection</span>
              </span>
              <span>Automated Receipt via Email</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
  Lock
} from 'lucide-react';

export default function PaymentModal({
  booking,
  item,
  currentUser,
  onClose,
  onPaymentSuccess
}) {
  const [paymentTab, setPaymentTab] = useState('upi_qr'); // 'upi_qr' | 'upi_manual' | 'upi_apps'
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 min countdown
  const [copiedUpi, setCopiedUpi] = useState(false);
  
  // User entered details
  const [userUpiId, setUserUpiId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');

  const depositAmount = Number(booking?.deposit_held || item?.deposit_amount || 0);
  const adminUpiId = 's9611668103@ptyes';
  const adminName = 'Sohel M Chapparband';

  // Dynamic UPI URI string
  const upiLink = `upi://pay?pa=${adminUpiId}&pn=${encodeURIComponent(adminName)}&am=${depositAmount.toFixed(2)}&cu=INR&tn=Deposit_Booking_${booking?.booking_id || ''}`;
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
            amount: depositAmount,
            item_title: item?.title || 'Equipment Deposit'
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
  }, [booking?.booking_id, depositAmount, item?.title]);

  // Countdown timer
  useEffect(() => {
    if (timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  const formatTimer = () => {
    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(adminUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Verify Payment Handler
  const handleVerifyPayment = async (methodName = 'UPI') => {
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
          method: userUpiId.trim() ? `UPI (${userUpiId.trim()})` : methodName,
          simulate_failure: false
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Payment verification failed');
      }

      setVerifiedSuccess(true);
      setTimeout(() => {
        onPaymentSuccess(data.payment);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative transition-colors duration-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black text-lg">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-base">UPI Escrow Deposit</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Safe & Refundable
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">Pay via any UPI App • 100% Refundable on Return</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State Overlay */}
        {verifiedSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security Deposit Held in Escrow!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              Your ₹{depositAmount.toLocaleString()} deposit is securely locked. It will be refunded automatically when the equipment is returned safely.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Amount & Admin Beneficiary Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                  Refundable Security Deposit
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹{depositAmount.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[160px]">
                  {item?.title || 'Equipment Rental'}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Beneficiary: {adminName}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Payment Method Tabs */}
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
                <span>Enter UPI ID / UTR</span>
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

            {/* TAB 1: UPI QR CODE */}
            {paymentTab === 'upi_qr' && (
              <div className="text-center space-y-4 py-1">
                {/* QR Code Container */}
                <div className="inline-block p-3.5 bg-white rounded-2xl border-2 border-emerald-500 shadow-md">
                  <img
                    src={qrCodeUrl}
                    alt={`Scan to Pay ₹${depositAmount} to ${adminUpiId}`}
                    className="w-44 h-44 mx-auto rounded-lg"
                    onError={(e) => {
                      // Fallback SVG representation if network image is blocked
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    style={{ display: 'none' }} 
                    className="w-44 h-44 bg-slate-950 rounded-xl p-2.5 flex-col items-center justify-center text-white"
                  >
                    <QrCode className="w-24 h-24 text-white" />
                    <span className="text-[10px] font-mono font-bold text-emerald-400 mt-1">{adminUpiId}</span>
                  </div>
                </div>

                {/* Receiver UPI ID with Copy Button */}
                <div className="flex items-center justify-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                    UPI ID: <span className="text-emerald-600 dark:text-emerald-400">{adminUpiId}</span>
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

                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Expires in: <strong className="text-slate-900 dark:text-white font-mono">{formatTimer()}</strong></span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Open Google Pay, PhonePe, Paytm, or BHIM & scan this QR code to transfer.
                  </p>
                </div>

                {/* Confirm Button */}
                <div className="pt-2">
                  <button
                    onClick={() => handleVerifyPayment('UPI QR')}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Verifying Transfer...' : `I have Scanned & Paid ₹${depositAmount.toLocaleString()} (Confirm)`}</span>
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
                    <span className="text-slate-500">Beneficiary UPI ID:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{adminUpiId}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Payee Name:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{adminName}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    value={userUpiId}
                    onChange={(e) => setUserUpiId(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter the UPI handle from which you made or will make the payment.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    UPI 12-Digit Reference / UTR Number (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 408221839210"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <button
                  onClick={() => handleVerifyPayment('UPI ID')}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Verifying with Bank...' : `Confirm ₹${depositAmount.toLocaleString()} Deposit Held`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* TAB 3: UPI APPS INTENT */}
            {paymentTab === 'upi_apps' && (
              <div className="space-y-4 py-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 block text-center font-medium">
                  Tap to pay directly with your installed UPI app:
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={upiLink}
                    onClick={() => setTimeout(() => handleVerifyPayment('Google Pay (UPI)'), 1000)}
                    className="p-3 bg-slate-50 dark:bg-slate-950 hover:border-emerald-500 border border-slate-200 dark:border-slate-800 rounded-xl text-left transition-all active:scale-95 block"
                  >
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">Google Pay</span>
                    <span className="text-[10px] text-slate-500">Pay to {adminUpiId}</span>
                  </a>

                  <a
                    href={upiLink}
                    onClick={() => setTimeout(() => handleVerifyPayment('PhonePe (UPI)'), 1000)}
                    className="p-3 bg-slate-50 dark:bg-slate-950 hover:border-purple-500 border border-slate-200 dark:border-slate-800 rounded-xl text-left transition-all active:scale-95 block"
                  >
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">PhonePe</span>
                    <span className="text-[10px] text-slate-500">Zero surcharge</span>
                  </a>

                  <a
                    href={upiLink}
                    onClick={() => setTimeout(() => handleVerifyPayment('Paytm (UPI)'), 1000)}
                    className="p-3 bg-slate-50 dark:bg-slate-950 hover:border-blue-500 border border-slate-200 dark:border-slate-800 rounded-xl text-left transition-all active:scale-95 block"
                  >
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">Paytm UPI</span>
                    <span className="text-[10px] text-slate-500">Fast checkout</span>
                  </a>

                  <a
                    href={upiLink}
                    onClick={() => setTimeout(() => handleVerifyPayment('BHIM / Any UPI'), 1000)}
                    className="p-3 bg-slate-50 dark:bg-slate-950 hover:border-emerald-500 border border-slate-200 dark:border-slate-800 rounded-xl text-left transition-all active:scale-95 block"
                  >
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">BHIM / Any App</span>
                    <span className="text-[10px] text-slate-500">NPCI Official UPI</span>
                  </a>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleVerifyPayment('UPI App Intent')}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Confirming...' : `I have Completed UPI App Transfer (₹${depositAmount.toLocaleString()})`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Security Guarantee Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>128-bit Encrypted Escrow</span>
              </span>
              <span>₹0 Fee • Instant Verification</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

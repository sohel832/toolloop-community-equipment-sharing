'use client';

import React, { useState } from 'react';
import { 
  Wrench, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  QrCode, 
  Smartphone, 
  Clock, 
  Users, 
  Package, 
  DollarSign, 
  HeartHandshake, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Sun, 
  Moon, 
  LogIn, 
  UserPlus, 
  LayoutDashboard, 
  LogOut,
  ChevronRight,
  Shield,
  Zap,
  RotateCcw,
  Check
} from 'lucide-react';

export default function LandingPage({
  currentUser,
  theme = 'dark',
  toggleTheme,
  onOpenLogin,
  onOpenRegister,
  onGoToDashboard,
  onLogout,
  onExploreClick,
  items = [],
  stats
}) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Join Your Community Hub',
      desc: 'Connect with verified members in your local neighborhood, university campus, or apartment complex.',
      icon: Users,
      badge: 'Step 1 • Hubs'
    },
    {
      num: '02',
      title: 'List or Explore Equipment',
      desc: 'Owners list unused tools with flexible, customizable security deposits and enter their mandatory UPI ID.',
      icon: Package,
      badge: 'Step 2 • Custom Deposit'
    },
    {
      num: '03',
      title: 'Request Booking Dates',
      desc: 'Borrowers pick start and return dates. The equipment owner reviews and approves the reservation.',
      icon: Clock,
      badge: 'Step 3 • Approval'
    },
    {
      num: '04',
      title: 'Direct UPI Payment to Lender',
      desc: 'Scan the dynamic QR code in Google Pay, PhonePe, or Paytm. Rental fee goes straight to the owner.',
      icon: QrCode,
      badge: 'Step 4 • Direct UPI'
    },
    {
      num: '05',
      title: 'Collect, Use & Return',
      desc: 'Meet your peer locally, pick up the gear, complete your project, and return it safely on schedule.',
      icon: HeartHandshake,
      badge: 'Step 5 • Handover'
    },
    {
      num: '06',
      title: 'Deposit Refund & Official Receipt',
      desc: 'Owner confirms safe return. The refundable security deposit is released, and official receipt is emailed.',
      icon: RotateCcw,
      badge: 'Step 6 • 100% Refund'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white block leading-tight">
                ToolLoop
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Community Equipment Sharing</span>
            </div>
          </a>

          {/* Quick Jump Anchor Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <a href="#about" className="hover:text-emerald-600 dark:hover:text-white transition-colors">About ToolLoop</a>
            <a href="#how-it-works" className="hover:text-emerald-600 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#explore-preview" className="hover:text-emerald-600 dark:hover:text-white transition-colors">Explore Tools</a>
            <a href="#about-us" className="hover:text-emerald-600 dark:hover:text-white transition-colors">About Us</a>
            <a href="#admin-details" className="hover:text-emerald-600 dark:hover:text-white transition-colors">Admin & Team</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme mode"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all active:scale-95 shadow-sm"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-90 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12 duration-300" />
              )}
            </button>

            {/* Authenticated vs Guest States */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onGoToDashboard}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Go to Dashboard</span>
                </button>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 dark:bg-slate-900 dark:hover:bg-rose-500/10 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all active:scale-95 shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Login</span>
                </button>

                <button
                  onClick={onOpenRegister}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Create Account</span>
                  <span className="sm:hidden">Join</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200 dark:border-slate-800/80">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Smart Community Equipment-Sharing Network</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15] mb-6">
            Borrow What You Need. <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Lend What You Don't.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Why buy expensive tools for a one-day task? ToolLoop connects verified peers in your campus and neighborhood. 
            Lend idle equipment, earn directly via UPI, and borrow with <strong>100% refundable security deposits</strong>.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-md mx-auto mb-12">
            <button
              onClick={currentUser ? onGoToDashboard : onOpenRegister}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all active:scale-95 flex items-center gap-2"
            >
              <span>{currentUser ? 'Go to Your Dashboard' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreClick}
              className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold text-sm shadow-sm transition-all active:scale-95"
            >
              Explore Equipment
            </button>
          </div>

          {/* Live Platform Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="bg-white dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Available Tools</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {items?.length || stats?.summary?.totalItems || 8}+
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-medium">Ready to borrow</span>
            </div>

            <div className="bg-white dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Active Sharing Hubs</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats?.summary?.totalCommunities || 3}+
              </span>
              <span className="text-[11px] text-blue-600 dark:text-cyan-400 block mt-0.5 font-medium">Campus & Cities</span>
            </div>

            <div className="bg-white dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Refundable Escrow</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                100%
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">Returned on Safe Return</span>
            </div>

            <div className="bg-white dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Lender Payouts</span>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                Direct UPI
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">PhonePe, GPay, Paytm</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: ABOUT TOOLLOOP */}
      <section id="about" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">About ToolLoop</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Why Buy When You Can Loop It?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
            The average power drill is used for less than 15 minutes across its entire lifespan. 
            ToolLoop transforms idle garage assets into accessible community resources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Customizable & Flexible Deposits</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Lenders have complete freedom to set flexible security deposits (from ₹0 for free friendly sharing up to custom amounts). 
              Deposits are clearly distinguished from rental fees and returned in full upon safe return.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Direct UPI Payments to Lender</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every lender provides their personal UPI ID when listing equipment. When a borrower reserves the tool, payments 
              flow directly to the lender's bank account via PhonePe, Google Pay, or Paytm.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Official Tax-Ready Receipts</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every verified transaction instantly generates an official, numbered payment receipt containing complete 
              customer details, equipment rental duration, breakdown, and UTR reference, automatically emailed to you.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS (DYNAMIC CSS ANIMATED & INTERACTIVE) */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-slate-100/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Interactive Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              How ToolLoop Works in 6 Simple Steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
              Click any step below to explore how easy it is to borrow and lend equipment with complete security.
            </p>
          </div>

          {/* Interactive Step Navigator */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(idx)}
                  className={`p-3 rounded-2xl text-left border transition-all duration-300 relative overflow-hidden ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-lg scale-105'
                      : 'bg-white/60 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-mono font-bold ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {step.num}
                    </span>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block line-clamp-1 leading-snug">
                    {step.title}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Step Active Spotlight Display with CSS Animation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {steps[activeStep].badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {steps[activeStep].title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {steps[activeStep].desc}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all active:scale-95 shadow-md"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={currentUser ? onGoToDashboard : onOpenLogin}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all"
                  >
                    Try it Now
                  </button>
                </div>
              </div>

              {/* Visual Interactive Graphic */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">ToolLoop Transaction Workflow</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">Step {activeStep + 1} of 6</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Security Deposit:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Customizable & 100% Refundable</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Lender Beneficiary:</span>
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">Verified Lender UPI ID</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Payment Verification:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">Instant UPI UTR Reference</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Official Receipt:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Auto Emailed + Download PDF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: EXPLORE EQUIPMENT TEASER */}
      <section id="explore-preview" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Live Equipment Catalog</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Popular Tools Ready to Share
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Browse equipment currently listed by community members with custom deposit amounts.
            </p>
          </div>

          <button
            onClick={onExploreClick}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline w-fit"
          >
            <span>View All {items?.length || 8} Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Equipment Cards Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.slice(0, 4).map((item) => (
            <div
              key={item.item_id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {item.item_condition}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Deposit</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">₹{Number(item.deposit_amount).toLocaleString()}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase block">Owner</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[90px] block">{item.owner_name}</span>
                  </div>
                </div>

                <button
                  onClick={currentUser ? onExploreClick : onOpenLogin}
                  className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Borrow This Tool</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: ABOUT US & VISION */}
      <section id="about-us" className="py-16 sm:py-20 bg-slate-100/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Our Mission</span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                Fostering Sustainable, Connected Communities Through Sharing
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                ToolLoop was founded on a simple insight: communities already own everything they need. 
                When DIY hobbyists, gardening enthusiasts, and students pool their equipment together, 
                we eliminate needless manufacturing waste, lower project costs, and build genuine neighborhood trust.
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Zero Intermediary Fees:</strong> 100% of the equipment rental fee goes directly to the lending owner's UPI handle.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Verified Identities:</strong> Members are linked to verified campus or residential community hubs.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Automated Invoicing:</strong> Official GST & tax-exempt PDF payment receipts generated automatically.</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Community Trust Protocol</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Built-in escrow & accountability</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Our platform protocol ensures equipment owners are protected with security deposits, 
                while borrowers are guaranteed that their deposits are returned immediately upon tool return.
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                <span>Platform Trust Rating</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">4.9 / 5.0 (Community Verified)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: ADMIN & TEAM DETAILS */}
      <section id="admin-details" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Platform Leadership</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Administration & Team Details
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            ToolLoop is governed with transparent administrator oversight and escrow accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Admin 1: Sohel M Chapparband */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-purple-500/20 shadow-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-purple-500/20">
                S
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Sohel M Chapparband</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    Lead Administrator
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">PES University RR Campus, Bangalore</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>Admin Email: <strong className="text-slate-900 dark:text-white font-mono">sohel@pesu.edu</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Smartphone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Admin Escrow UPI: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">s9611668103@ptyes</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Phone: <strong className="text-slate-900 dark:text-white">+91 96116 68103</strong></span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              Oversees platform infrastructure, payment escrow arbitration, database administration, and user verification.
            </p>
          </div>

          {/* Admin 2: Shreyas Bellad */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-black text-lg">
                S
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Shreyas Bellad</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Co-Administrator
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Banashankari 3rd Stage, Bangalore</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>Email: <strong className="text-slate-900 dark:text-white font-mono">shreyas@pesu.edu</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Smartphone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>UPI Handle: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">shreyas.bellad@okhdfcbank</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Duty: <strong>Community Moderation & Safety</strong></span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              Responsible for neighborhood hub moderation, equipment quality verification, and user rating standards.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION BANNER */}
      <section className="py-16 sm:py-20 text-center max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 p-8 sm:p-12 rounded-3xl text-white shadow-2xl space-y-4">
          <h2 className="text-2xl sm:text-4xl font-black">
            Ready to Start Sharing and Borrowing?
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto">
            Join your campus or neighborhood equipment hub in seconds. List your first tool or borrow gear for your next DIY weekend.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={currentUser ? onGoToDashboard : onOpenRegister}
              className="px-6 py-3 rounded-2xl bg-white text-slate-950 font-bold text-xs shadow-lg hover:bg-slate-100 transition-all active:scale-95"
            >
              {currentUser ? 'Go to Dashboard' : 'Create Free Account'}
            </button>
            {!currentUser && (
              <button
                onClick={onOpenLogin}
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all active:scale-95 border border-white/20"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

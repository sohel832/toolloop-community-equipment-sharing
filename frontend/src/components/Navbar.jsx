'use client';

import React from 'react';
import { 
  Wrench, 
  PlusCircle, 
  Layers, 
  CalendarCheck, 
  Users, 
  ShieldCheck, 
  LogOut, 
  Package, 
  LayoutDashboard, 
  User,
  Sun,
  Moon,
  Home
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  theme = 'dark',
  toggleTheme,
  onLogout,
  onOpenLendModal 
}) {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')} 
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-slate-900 dark:text-white block leading-tight">
              ToolLoop
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Community Equipment Sharing</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          {/* Home Link */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'home'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {/* ADMIN TABS */}
          {isAdmin ? (
            <>
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </button>

              <button
                onClick={() => setActiveTab('catalog')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'catalog'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Explore Tools</span>
              </button>

              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'bookings'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>All Bookings</span>
              </button>

              <button
                onClick={() => setActiveTab('communities')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'communities'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Communities</span>
              </button>
            </>
          ) : (
            /* MEMBER TABS */
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('catalog')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'catalog'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Explore Tools</span>
              </button>

              <button
                onClick={() => setActiveTab('my-listings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'my-listings'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>My Equipment</span>
              </button>

              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'bookings'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>My Bookings</span>
              </button>

              <button
                onClick={() => setActiveTab('communities')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'communities'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Communities</span>
              </button>
            </>
          )}

          {/* Profile Tab */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </nav>

        {/* Right Actions: Theme Toggle + Lend Button + User Pill & Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Light / Dark Mode Toggle Logo/Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme mode"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all active:scale-95 shadow-sm"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-90 duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 transition-transform -rotate-12 hover:rotate-0 duration-300" />
            )}
          </button>

          {/* Lend Equipment Button */}
          <button
            onClick={onOpenLendModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List Equipment</span>
          </button>

          {/* User Profile Pill */}
          <div 
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-xl cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold uppercase ${
              isAdmin ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
            }`}>
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate block">
                {currentUser?.name || 'User'}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-wider ${
                isAdmin ? 'text-purple-600 dark:text-purple-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {isAdmin ? 'Admin' : 'Member'}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            title="Sign Out"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-900 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800/80 px-2 py-1.5 bg-white dark:bg-slate-950 text-xs overflow-x-auto">
        <button 
          onClick={() => setActiveTab('home')}
          className={`px-2 py-1 rounded font-semibold ${activeTab === 'home' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Home
        </button>
        {isAdmin ? (
          <button 
            onClick={() => setActiveTab('admin')}
            className={`px-2 py-1 rounded font-semibold ${activeTab === 'admin' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Admin
          </button>
        ) : (
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-2 py-1 rounded font-semibold ${activeTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Dashboard
          </button>
        )}
        <button 
          onClick={() => setActiveTab('catalog')}
          className={`px-2 py-1 rounded ${activeTab === 'catalog' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Explore
        </button>
        {!isAdmin && (
          <button 
            onClick={() => setActiveTab('my-listings')}
            className={`px-2 py-1 rounded ${activeTab === 'my-listings' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}
          >
            My Tools
          </button>
        )}
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`px-2 py-1 rounded ${activeTab === 'bookings' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Bookings
        </button>
        <button 
          onClick={() => setActiveTab('communities')}
          className={`px-2 py-1 rounded ${activeTab === 'communities' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Hubs
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-2 py-1 rounded ${activeTab === 'profile' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Profile
        </button>
      </div>
    </header>
  );
}

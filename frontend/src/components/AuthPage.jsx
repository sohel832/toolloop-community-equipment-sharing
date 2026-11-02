'use client';

import React, { useState } from 'react';
import { 
  Wrench, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle,
  Building,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';

export default function AuthPage({ 
  onLoginSuccess, 
  communities = [], 
  theme = 'dark', 
  toggleTheme 
}) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password visibility toggle states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [role, setRole] = useState('member');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [communityId, setCommunityId] = useState('');

  // Live Password Strength Criteria
  const hasMinLength = registerPassword.length >= 5;
  const hasUpperCase = /[A-Z]/.test(registerPassword);
  const hasLowerCase = /[a-z]/.test(registerPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(registerPassword);
  const isStrongPassword = hasMinLength && hasUpperCase && hasLowerCase && hasSpecialChar;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check credentials.');
      }

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Enforce Password Strength Requirements
    if (!hasMinLength) {
      setError('Password must have a minimum length of 5 characters.');
      return;
    }
    if (!hasUpperCase) {
      setError('Password must contain at least one capital letter (A-Z).');
      return;
    }
    if (!hasLowerCase) {
      setError('Password must contain at least one small letter (a-z).');
      return;
    }
    if (!hasSpecialChar) {
      setError('Password must contain at least one special character (!@#$%^&*...).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: registerEmail,
          password: registerPassword,
          role,
          phone,
          address,
          community_id: communityId || null
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
      }

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Logins
  const fillDemo = (email, pass) => {
    setIsRegister(false);
    setLoginEmail(email);
    setLoginPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden transition-colors duration-200">
      {/* Background Subtle Gradient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Theme Toggle Button at top right */}
      {toggleTheme && (
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme mode"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm hover:scale-105 active:scale-95 transition-all"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
        </button>
      )}

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/20 mb-3 font-bold">
            <Wrench className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">ToolLoop</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Community Equipment-Sharing Network</p>
        </div>

        {/* Auth Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-xl dark:shadow-2xl dark:shadow-black/60 transition-colors duration-200">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl mb-6 border border-slate-200 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                !isRegister
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                isRegister
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {!isRegister ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  {/* Eye Blink Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    title={showLoginPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4 text-emerald-500" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Demo Sign In Shortcuts */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-2 text-center font-medium">
                  Quick Demo Accounts:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemo('sohel@pesu.edu', 'admin123')}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 text-left transition-colors"
                  >
                    <span className="font-bold text-purple-600 dark:text-purple-400 block">🛡️ Admin</span>
                    <span className="text-slate-500 text-[10px]">sohel@pesu.edu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemo('priya.sharma@example.com', 'member123')}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 text-left transition-colors"
                  >
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block">👤 Member</span>
                    <span className="text-slate-500 text-[10px]">priya.sharma...</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Password Input with Eye Blink Toggle & Strength Checklist */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="e.g. Tool@2026"
                    className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  {/* Eye Blink Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                    title={showRegisterPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4 text-emerald-500" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Checklist Indicator */}
                <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5 transition-all">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Password Security Requirements:
                  </span>
                  
                  <div className={`flex items-center gap-1.5 font-medium transition-colors ${
                    hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                      hasMinLength ? 'bg-emerald-500 text-slate-950' : 'border border-slate-300 dark:border-slate-700'
                    }`}>
                      {hasMinLength && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span>Minimum length is 5 characters</span>
                  </div>

                  <div className={`flex items-center gap-1.5 font-medium transition-colors ${
                    hasUpperCase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                      hasUpperCase ? 'bg-emerald-500 text-slate-950' : 'border border-slate-300 dark:border-slate-700'
                    }`}>
                      {hasUpperCase && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span>At least one capital letter (A-Z)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 font-medium transition-colors ${
                    hasLowerCase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                      hasLowerCase ? 'bg-emerald-500 text-slate-950' : 'border border-slate-300 dark:border-slate-700'
                    }`}>
                      {hasLowerCase && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span>At least one small letter (a-z)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 font-medium transition-colors ${
                    hasSpecialChar ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                      hasSpecialChar ? 'bg-emerald-500 text-slate-950' : 'border border-slate-300 dark:border-slate-700'
                    }`}>
                      {hasSpecialChar && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span>At least one special character (!@#$%^&*...)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="member">Member (Borrow/Lend)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Address / Neighborhood
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Indiranagar, Bangalore"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {communities.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Join Community Hub
                  </label>
                  <select
                    value={communityId}
                    onChange={(e) => setCommunityId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select a community (optional)</option>
                    {communities.map((c) => (
                      <option key={c.community_id} value={c.community_id}>
                        {c.name} ({c.type})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <span>{loading ? 'Creating Account in Database...' : 'Complete Registration'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Security Assurance */}
        <div className="flex items-center justify-center gap-2 mt-6 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>Encrypted passwords stored securely in MySQL</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  Calendar, 
  Save, 
  LogOut,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';

export default function UserProfileView({
  currentUser,
  onUpdateSuccess,
  onLogout
}) {
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Password criteria checks
  const hasMinLength = newPassword.length >= 5;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });

    if (newPassword) {
      if (!hasMinLength) {
        setMsg({ text: 'New password must have a minimum length of 5 characters.', type: 'error' });
        return;
      }
      if (!hasUpperCase) {
        setMsg({ text: 'New password must contain at least one capital letter (A-Z).', type: 'error' });
        return;
      }
      if (!hasLowerCase) {
        setMsg({ text: 'New password must contain at least one small letter (a-z).', type: 'error' });
        return;
      }
      if (!hasSpecialChar) {
        setMsg({ text: 'New password must contain at least one special character (!@#$%^&*...).', type: 'error' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMsg({ text: 'Passwords do not match.', type: 'error' });
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        phone: phone.trim(),
        address: address.trim()
      };

      if (newPassword) {
        payload.password = newPassword;
      }

      const res = await fetch(`/api/users/${currentUser.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setMsg({ text: 'Profile updated successfully!', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
      if (data.user) {
        onUpdateSuccess(data.user);
      }
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Profile & Security Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your contact information, security preferences, and view account details.
        </p>
      </div>

      {msg.text && (
        <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
          msg.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300'
        }`}>
          {msg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm transition-colors duration-200">
        {/* Read-Only Account Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{currentUser?.name}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Email Address <span className="text-[10px] text-slate-400 dark:text-slate-500">(Protected)</span>
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="font-mono text-[11px] truncate">{currentUser?.email}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Account Role <span className="text-[10px] text-slate-400 dark:text-slate-500">(Admin Managed)</span>
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-bold uppercase text-[11px] text-emerald-600 dark:text-emerald-400">{currentUser?.role}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Member Since</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>{String(currentUser?.created_at || '').substring(0, 10) || 'Active'}</span>
            </div>
          </div>
        </div>

        {/* Editable Contact Info */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Contact & Delivery Address</h4>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Address / Location</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Indiranagar, Bangalore"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Update Password (Optional)</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 5 chars with A-Z, a-z, symbol"
                  className="w-full pl-3 pr-9 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5 text-emerald-500" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-9 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5 text-emerald-500" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password criteria display if user begins typing */}
          {newPassword && (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">Password Requirements:</span>
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                <Check className={`w-3 h-3 ${hasMinLength ? 'text-emerald-500 stroke-[3]' : 'text-slate-400'}`} />
                <span>Min length: 5 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                <Check className={`w-3 h-3 ${hasUpperCase ? 'text-emerald-500 stroke-[3]' : 'text-slate-400'}`} />
                <span>At least one capital letter (A-Z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasLowerCase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                <Check className={`w-3 h-3 ${hasLowerCase ? 'text-emerald-500 stroke-[3]' : 'text-slate-400'}`} />
                <span>At least one small letter (a-z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                <Check className={`w-3 h-3 ${hasSpecialChar ? 'text-emerald-500 stroke-[3]' : 'text-slate-400'}`} />
                <span>At least one special character (!@#$%^&*...)</span>
              </div>
            </div>
          )}
        </div>

        {/* Save button & Logout */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

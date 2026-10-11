'use client';

import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  User,
  Phone,
  Briefcase,
  CheckCircle,
  Copy,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/lib/authService';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated?: () => void;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onUserCreated,
}: CreateUserModalProps) {
  const { createSystemUser } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    name: string;
    email: string;
    pass: string;
    role: UserRole;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('EMPLOYEE');
    setPhone('');
    setDesignation('');
    setErrorMsg(null);
    setSuccessInfo(null);
    setCopied(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter the employee full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createSystemUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role,
        phone: phone.trim(),
        designation: designation.trim() || (role === 'ADMIN' ? 'Administrator' : 'Counter Sales & Billing Staff'),
      });

      if (res.success) {
        setSuccessInfo({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          pass: password.trim(),
          role,
        });
        if (onUserCreated) onUserCreated();
      } else {
        setErrorMsg(res.error || 'Failed to create user account.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCredentials = () => {
    if (!successInfo) return;
    const text = `Goodwin Batteries ERP Login Credentials\nURL: ${window.location.origin}/login\nEmail: ${successInfo.email}\nPassword: ${successInfo.pass}\nRole: ${successInfo.role}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4c3cce] flex items-center justify-center font-bold">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Create ERP User Account</h3>
              <p className="text-[11px] text-slate-500">
                Generate email &amp; password credentials for staff login
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {successInfo ? (
            /* Success confirmation screen with copyable credentials */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-emerald-950 text-sm">
                    User Account Created Successfully!
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    This user can now sign in to the ERP at{' '}
                    <strong className="underline">/login</strong> using these credentials.
                  </p>
                </div>
              </div>

              {/* Credentials Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Login Details
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      successInfo.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {successInfo.role}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Name:</span>
                    <span className="font-bold text-slate-800">{successInfo.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Role:</span>
                    <span className="font-bold text-slate-800">{successInfo.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email (Username):</span>
                    <span className="font-mono font-bold text-indigo-600 break-all">{successInfo.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Password:</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                      {successInfo.pass}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={copyCredentials}
                  className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  {copied ? <CheckCircle size={15} className="text-emerald-400" /> : <Copy size={15} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 h-10 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Create Another
                </button>
              </div>
            </div>
          ) : (
            /* Create Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-medium">
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  User Role &amp; Access Level *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('EMPLOYEE')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === 'EMPLOYEE'
                        ? 'border-[#4c3cce] bg-indigo-50/50 ring-2 ring-[#4c3cce]/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-slate-900">Employee Staff</span>
                      <Shield size={14} className={role === 'EMPLOYEE' ? 'text-[#4c3cce]' : 'text-slate-400'} />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Can create bills, check inventory &amp; parties. Restricted from banking &amp; settings.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === 'ADMIN'
                        ? 'border-[#4c3cce] bg-indigo-50/50 ring-2 ring-[#4c3cce]/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-slate-900">Administrator</span>
                      <KeyRound size={14} className={role === 'ADMIN' ? 'text-purple-600' : 'text-slate-400'} />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Full administrative control over banking, settings, reports &amp; staff accounts.
                    </p>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email Address (Login Username) *
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh@goodwinbatteries.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Login Password *
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter account password (min 4 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:bg-white transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  The employee will use this password together with their email to log in.
                </p>
              </div>

              {/* Phone & Designation (Optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+91 98000 00000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Designation (Optional)
                  </label>
                  <div className="relative">
                    <Briefcase size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Sales Executive"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  {isSubmitting ? (
                    <span>Creating Account...</span>
                  ) : (
                    <>
                      <UserPlus size={15} />
                      <span>Save &amp; Generate Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredentials, selectedCompany } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your work email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithCredentials(email, password);
      if (res.success) {
        router.push('/');
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected connection error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Brand Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <img
            src="/goodwin-icon.svg"
            alt="Goodwin Batteries"
            className="w-11 h-11 object-contain drop-shadow-md"
          />
          <div>
            <span className="font-black text-lg text-white tracking-tight block">
              Goodwin Batteries
            </span>
            <span className="text-[10px] text-indigo-300 font-mono tracking-wider uppercase">
              Cloud ERP &amp; Billing
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-indigo-200">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>GST Ready • RBAC Protected</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-7 sm:p-9 shadow-2xl border border-white/20 text-slate-800 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <img
              src="/goodwin-logo.svg"
              alt="Goodwin Batteries"
              className="h-14 mx-auto mb-2 object-contain"
            />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-[#4c3cce] text-[11px] font-extrabold uppercase tracking-wider mb-1">
              <Sparkles size={12} />
              <span>Sign In to ERP</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs text-slate-500">
              Enter the credentials provided by your Administrator to access your dashboard.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-fadeIn">
              <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@goodwinbatteries.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/25 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[10px] text-slate-400">
                  Case-sensitive
                </span>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/25 focus:bg-white transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#4c3cce] to-[#5b4be2] hover:from-[#3e2fb7] hover:to-[#4c3cce] active:scale-[0.99] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to ERP Portal</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Credentials Helper */}
          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            <p className="text-[11px] font-bold text-slate-500 text-center uppercase tracking-wider">
              Quick Test Credentials
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@goodwinbatteries.com', 'admin123')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 text-left transition-colors"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-extrabold text-[11px] text-purple-900">👑 Admin</span>
                  <span className="text-[9px] font-mono bg-purple-200 text-purple-900 px-1 rounded">Full</span>
                </div>
                <p className="text-[10px] text-purple-700 font-mono truncate">admin@goodwinbatteries.com</p>
                <p className="text-[9px] text-purple-600 mt-0.5">Pass: admin123</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('employee@goodwinbatteries.com', 'emp123')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-left transition-colors"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-extrabold text-[11px] text-blue-900">👤 Employee</span>
                  <span className="text-[9px] font-mono bg-blue-200 text-blue-900 px-1 rounded">Staff</span>
                </div>
                <p className="text-[10px] text-blue-700 font-mono truncate">employee@goodwinbatteries.com</p>
                <p className="text-[9px] text-blue-600 mt-0.5">Pass: emp123</p>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              💡 Any user created by the Admin in <strong className="text-slate-600">Settings &gt; Staff &amp; RBAC</strong> can sign in here with their email &amp; password.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center py-4 text-[11px] text-slate-400">
        &copy; {new Date().getFullYear()} Goodwin Batteries ERP • Multi-Company Battery Billing &amp; Invoicing
      </footer>
    </div>
  );
}

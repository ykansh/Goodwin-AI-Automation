import { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import type { UserRole } from '../../types';
import { Shield, Zap, Lock, Mail, UserCheck, ChevronRight } from 'lucide-react';

export function LoginPage({ onNavigateToRegister }: { onNavigateToRegister?: () => void }) {
  const { signIn, quickSignInAsRole } = useAuth();
  const [email, setEmail] = useState('admin@goodwin.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn(email, password);
    setLoading(false);
  };

  const roles: { role: UserRole; label: string; desc: string; color: string }[] = [
    { role: 'admin', label: 'Admin', desc: 'All System Modules', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700' },
    { role: 'manager', label: 'Manager', desc: 'All Management Modules', color: 'border-lime-500/50 bg-lime-500/10 text-lime-800' },
    { role: 'accounts', label: 'Accounts', desc: 'Dashboard, Reports & Ledger', color: 'border-blue-500/50 bg-blue-500/10 text-blue-700' },
    { role: 'sales', label: 'Sales', desc: 'Customers, Invoices & Returns', color: 'border-amber-500/50 bg-amber-500/10 text-amber-800' },
    { role: 'inventory', label: 'Inventory', desc: 'Stock, POs & Warranties', color: 'border-purple-500/50 bg-purple-500/10 text-purple-700' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5f4f0] relative overflow-hidden">
      {/* Dynamic Orbs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00a631]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#cde06c]/25 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid md:grid-cols-12 glass-strong rounded-3xl overflow-hidden shadow-2xl border border-white/60 relative z-10 animate-fade-in">
        {/* Left Side: Brand Banner */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#3a3b39] to-[#252624] text-white p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00a631]/20 rounded-full blur-2xl" />

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#00a631] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#00a631]/40">
                G
              </div>
              <div>
                <h1 className="font-extrabold tracking-wider text-xl">GOODWIN</h1>
                <p className="text-[#cde06c] text-xs font-semibold uppercase tracking-widest">Batteries ERP & Ledger</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-3 leading-tight">
              Enterprise Energy Management & Financial Control
            </h2>
            <p className="text-gray-300 text-xs leading-relaxed mb-6">
              Complete cross-connected suite for Battery Manufacturers, Distributors & Dealers. Real-time automatic sync between Stock, Sales, POs, Warranties & Ledger.
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-gray-200">
                <Zap className="w-4 h-4 text-[#cde06c]" />
                <span>Goodwin Battery Specs (12V 8Ah, 14Ah, 150Ah)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <UserCheck className="w-4 h-4 text-[#cde06c]" />
                <span>Smart Auto Role Detection (Admin, Sales, Inventory)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <Shield className="w-4 h-4 text-[#cde06c]" />
                <span>GST Tax Invoicing & Battery Serial Warranty</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-[11px] text-gray-400">
            Powered by Goodwin Battery Systems & Ledger-Pro v4.2
          </div>
        </div>

        {/* Right Side: Form & Quick Role Selection */}
        <div className="md:col-span-7 p-8 flex flex-col justify-between bg-white/70 backdrop-blur-md">
          <div>
            <div className="mb-6">
              <h3 className="text-2xl font-extrabold text-[#3a3b39]">Sign In</h3>
              <p className="text-gray-500 text-xs mt-1">
                Enter your credentials or choose a quick role to demo access permissions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#3a3b39] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@goodwin.com"
                    className="w-full pl-9 pr-4 py-2.5 text-sm glass-input font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3a3b39] mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 text-sm glass-input font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#00a631] hover:bg-[#008a29] text-white font-bold rounded-xl shadow-lg shadow-[#00a631]/30 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Role Switcher Chips */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <span className="block text-xs font-bold text-[#3a3b39] uppercase tracking-wider mb-2">
                ⚡ Quick Demo Login by Role
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => quickSignInAsRole(r.role)}
                    className={`p-2 rounded-xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${r.color}`}
                  >
                    <span className="block text-xs font-bold">{r.label}</span>
                    <span className="block text-[10px] opacity-80 truncate">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="text-[#00a631] font-bold hover:underline cursor-pointer"
            >
              Register New Organization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import type { UserRole } from '../../types';
import { User, Mail, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';

export function RegisterPage({ onNavigateToLogin }: { onNavigateToLogin?: () => void }) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signUp(email, password, fullName, role);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5f4f0] relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00a631]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#cde06c]/25 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg glass-strong p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2d302d] relative z-10 animate-fade-in">
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#00a631] mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#00a631] text-white flex items-center justify-center font-bold">
              G
            </div>
            <span className="font-extrabold text-[#3a3b39] text-lg">GOODWIN ERP</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#3a3b39]">Register Account</h2>
          <p className="text-xs text-gray-500 mt-1">Create user profile and set your role in the system</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3a3b39] mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                className="w-full pl-9 pr-4 py-2.5 text-sm glass-input font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3a3b39] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rajesh@goodwin.com"
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

          <div>
            <label className="block text-xs font-semibold text-[#3a3b39] mb-1">Assign User Role</label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full pl-9 pr-4 py-2.5 text-sm glass-input font-medium appearance-none bg-white/50 cursor-pointer"
              >
                <option value="admin">Admin - Full System Access</option>
                <option value="manager">Manager - All Management Modules</option>
                <option value="accounts">Accounts - Dashboard, Reports & Ledger</option>
                <option value="sales">Sales - Customers, Sales Invoices & Returns</option>
                <option value="inventory">Inventory - Stock, POs & Battery Warranties</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#00a631] hover:bg-[#008a29] text-white font-bold rounded-xl shadow-lg shadow-[#00a631]/30 transition-all text-sm mt-2 cursor-pointer"
          >
            {loading ? 'Creating Profile...' : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Already registered?{' '}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="text-[#00a631] font-bold hover:underline cursor-pointer"
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
}

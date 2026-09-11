import { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Check, User, ChevronDown } from 'lucide-react';

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    const success = await signIn(email.trim(), password.trim());
    setLoading(false);

    if (!success) {
      setErrorMessage('Invalid credentials. Please verify your email and password.');
    }
  };

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center py-8 px-4 sm:px-6 bg-[#07100c] relative overflow-x-hidden overflow-y-auto font-sans select-none">
      {/* Subtle Dot Matrix Background Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `radial-gradient(#1e2d22 1.2px, transparent 1.2px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle Green Radial Glow centered behind the login card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] bg-[#22c55e]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Wrapper with natural vertical flow */}
      <div className="w-full max-w-[480px] flex flex-col items-center relative z-10 my-auto">
        {/* 2. Login Card (Natural height, no fixed vertical constraint, 32-40px padding, 20px radius) */}
        <div className="w-full bg-[#0f1612]/95 border border-white/[0.12] rounded-[20px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(34,197,94,0.06)] flex flex-col">
          {/* 1. Logo (64x64px, 14-18px bottom margin) */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#22c55e] to-[#15803d] text-white shadow-[0_0_24px_rgba(34,197,94,0.35)] border border-[#4ade80]/30 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Battery bracket Left */}
                <path d="M5 6V4a2 2 0 0 1 2-2h1" />
                <path d="M5 18v2a2 2 0 0 0 2 2h1" />
                {/* Battery bracket Right */}
                <path d="M19 6V4a2 2 0 0 0-2-2h-1" />
                <path d="M19 18v2a2 2 0 0 1-2 2h-1" />
                {/* Terminal tip */}
                <path d="M22 10v4" />
                {/* Lightning Bolt */}
                <path d="M13 6l-3.5 6h4l-2 6" fill="currentColor" fillOpacity="0.2" />
              </svg>
            </div>
          </div>

          {/* 2. GOODWIN ERP Branding (28-32px, 8-12px bottom margin) */}
          <div className="flex items-center justify-center gap-2.5 mb-2.5">
            <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-wider text-white">
              GOODWIN
            </h1>
            <span className="px-2 py-0.5 rounded-md border border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e] text-xs font-bold tracking-widest uppercase">
              ERP
            </span>
          </div>

          {/* 3. Subtitle (13-14px, 28-32px bottom margin to form) */}
          <p className="text-xs sm:text-[13px] text-[#8fa093] font-medium text-center leading-relaxed mb-7 sm:mb-8">
            Enterprise Energy & Industrial Ledger Management
          </p>

          {/* Error Alert Box (if present) */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2.5 animate-shake">
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-ping" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col">
            {/* 4 & 5. Email Section (7-8px label margin, 52-56px input, 18-22px bottom margin) */}
            <div className="mb-5">
              <label className="block text-xs sm:text-[13px] font-bold tracking-wider text-[#9aa99e] uppercase mb-2">
                EMAIL ADDRESS
              </label>
              <div className="relative w-full h-[54px] rounded-xl bg-[#17201a] border border-[#27352b] hover:border-[#384b3d] focus-within:border-[#22c55e] focus-within:ring-1 focus-within:ring-[#22c55e]/30 px-4 flex items-center transition-all group">
                <Mail className="w-[18px] h-[18px] text-[#22c55e] shrink-0 mr-3" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="name@goodwinbatteries.com"
                  className="w-full bg-transparent text-sm sm:text-[15px] text-white placeholder-[#526356] font-medium outline-none"
                />
                <div className="bg-[#202b23] px-2 py-1 rounded-lg flex items-center gap-1 text-[#6a7d6f] shrink-0 ml-2">
                  <User className="w-3.5 h-3.5 text-[#738277]" />
                  <ChevronDown className="w-3 h-3 text-[#738277]" />
                </div>
              </div>
            </div>

            {/* 6 & 7. Password Section (7-8px label margin, 52-56px input) */}
            <div className="mb-3.5">
              <label className="block text-xs sm:text-[13px] font-bold tracking-wider text-[#9aa99e] uppercase mb-2">
                PASSWORD
              </label>
              <div className="relative w-full h-[54px] rounded-xl bg-[#17201a] border border-[#27352b] hover:border-[#384b3d] focus-within:border-[#22c55e] focus-within:ring-1 focus-within:ring-[#22c55e]/30 px-4 flex items-center transition-all">
                <Lock className="w-[18px] h-[18px] text-[#22c55e] shrink-0 mr-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-sm sm:text-[15px] text-white placeholder-[#526356] font-medium outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#526356] hover:text-[#9aa99e] transition-colors p-1.5 cursor-pointer ml-2"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            {/* 8. Remember / Admin Row (12-14px top margin, 20-24px bottom margin to button) */}
            <div className="flex items-center justify-between pt-1 mb-6">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2 text-xs sm:text-[13px] text-[#9aa99e] hover:text-white cursor-pointer transition-colors"
              >
                <div
                  className={`w-4.5 h-4.5 rounded-[4px] flex items-center justify-center transition-all ${
                    rememberMe
                      ? 'bg-[#22c55e] text-white shadow-xs'
                      : 'border border-[#343e36] bg-[#17201a]'
                  }`}
                >
                  {rememberMe && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="font-medium">Remember this session</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs sm:text-[13px] text-[#9aa99e] font-medium">
                <ShieldCheck className="w-4.5 h-4.5 text-[#22c55e]" />
                <span>Admin Direct Access</span>
              </div>
            </div>

            {/* 9. Sign In Button (52-56px height, font 16px weight 700, 14-18px bottom margin) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[54px] bg-[#22c55e] hover:bg-[#16a34a] active:scale-[0.99] text-white font-bold rounded-xl shadow-[0_8px_20px_-4px_rgba(34,197,94,0.35)] transition-all flex items-center justify-center gap-2.5 text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-5"
            >
              {loading ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating Credentials...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>

            {/* 10. Security Information (Below button with subtle divider) */}
            <div className="pt-4 border-t border-[#233127] flex items-center justify-center gap-2 text-center text-xs text-[#7a8c80] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#22c55e] shrink-0" />
              <span>Secured 256-bit SSL · Authorized Admin Portal</span>
            </div>
          </form>
        </div>

        {/* 11. Copyright Section (OUTSIDE card, naturally flowing below with 18-24px margin) */}
        <div className="mt-6 text-center text-xs text-[#5f7365]">
          © 2025 <span className="text-[#22c55e] font-medium">Goodwin Batteries ERP</span>. All rights reserved.
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      setIsLoading(false);
      navigate('/marketing/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 w-full max-w-md p-8">
        {/* Glassmorphic Card */}
        <div className="bg-canvas-surface/80 backdrop-blur-xl rounded-3xl shadow-level-3 border border-white/50 p-10 transform transition-all hover:scale-[1.01] duration-300">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3 hover:rotate-6 transition-transform duration-300">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-display text-secondary mb-2">Welcome Back</h1>
            <p className="text-secondary-light">Sign in to continue to Goodwin Grow</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-light group-focus-within:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-canvas/50 border border-secondary/10 rounded-xl text-secondary placeholder:text-secondary-light/70 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-light group-focus-within:text-primary transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-canvas/50 border border-secondary/10 rounded-xl text-secondary placeholder:text-secondary-light/70 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-secondary/20 text-primary focus:ring-primary/20" />
                <span className="text-secondary-light group-hover:text-secondary transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:text-primary-dark font-medium transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full group flex items-center justify-center py-3.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden relative"
            >
              <span className="relative z-10 flex items-center">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-secondary-light mt-8">
          By signing in, you agree to our{' '}
          <a href="#" className="text-secondary hover:text-primary transition-colors underline underline-offset-2">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-secondary hover:text-primary transition-colors underline underline-offset-2">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

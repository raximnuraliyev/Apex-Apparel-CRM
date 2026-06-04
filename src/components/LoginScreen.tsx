import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shirt, Lock, User, AlertCircle, Sparkles } from 'lucide-react';
import { User as UserType } from '../types';
import { apiLogin } from '../api';

interface LoginScreenProps {
  onLoginSuccess: (user: UserType) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('staff@apex.com');
  const [password, setPassword] = useState('apexpassword');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiLogin(email.trim(), password);
      const loggedInUser: UserType = {
        _id: data.user._id,
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
        token: data.token,
      };
      onLoginSuccess(loggedInUser);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('staff@apex.com');
    setPassword('apexpassword');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden font-sans text-slate-800">
      {/* Glow Backdrops */}
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-indigo-500/10 blur-[110px] rounded-full pointer-events-none" />
      <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-purple-500/8 blur-[130px] rounded-full pointer-events-none" />

      {/* Main Glass Panel slab */}
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white/40 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-2xl relative overflow-hidden z-10">
        
        {/* Brand Left Panel */}
        <div className="hidden lg:flex lg:col-span-7 bg-gradient-to-tr from-indigo-950/90 to-slate-900/95 text-white flex-col justify-between p-12 relative overflow-hidden backdrop-blur-md border-r border-slate-200/10">
          {/* Subtle noise grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-5" />
          
          {/* Internal soft ambient light */}
          <div className="absolute bottom-[-100px] left-[10%] w-[350px] h-[300px] bg-indigo-500/30 rounded-full blur-[100px]" />
          <div className="absolute top-[10%] right-[-100px] w-[250px] h-[250px] bg-lime-400/15 rounded-full blur-[80px]" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/35">
              <Shirt className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-sans text-xl font-bold tracking-tight text-white block">APEX</span>
              <span className="font-mono text-[10px] text-indigo-400 block tracking-widest leading-none font-semibold uppercase">APPAREL GROUP</span>
            </div>
          </div>

          <div className="relative z-10 max-w-md mb-12">
            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-mono tracking-wider text-indigo-300 uppercase inline-block mb-6 font-semibold">
              Seasonal Logistical Workspace
            </span>
            <h1 className="font-sans text-3xl xl:text-4xl font-light tracking-tight text-white mb-6 leading-[1.2]">
              Bridging Premium Design with <span className="font-medium text-indigo-300">Efficient wholesale.</span>
            </h1>
            <p className="text-slate-300 text-sm font-light leading-relaxed">
              Coordinate batch allocations, manage buyer lists, and track real-time seasonal collections with absolute precision.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-450 font-mono">
            <span>© 2026 APEX APPAREL GROUP CO.</span>
            <div className="flex gap-4">
              <span>SECURE LOGISTICS LAYER</span>
            </div>
          </div>
        </div>

        {/* Login Form Right Panel */}
        <div className="lg:col-span-5 flex flex-col justify-center p-8 sm:p-12 relative bg-white/50 backdrop-blur-md">
          <div className="absolute top-8 right-8 lg:hidden flex items-center gap-2 font-bold">
            <Shirt className="h-5 w-5 text-indigo-600" />
            <span className="font-sans text-lg tracking-wider text-slate-900">APEX</span>
          </div>

          <div className="max-w-md w-full mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold font-sans tracking-tight text-slate-900">
                Welcome back
              </h2>
              <p className="text-slate-500 mt-2 font-light text-sm">
                Enter your wholesale credentials to access your client logs and order panels.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50/80 border border-red-200/80 text-red-700 rounded-lg text-xs flex items-start gap-2.5 backdrop-blur-md"
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div>
                <label htmlFor="username" className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                  Business Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="username"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/70 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 rounded-xl text-slate-900 font-sans placeholder-slate-400 transition-all text-sm outline-none shadow-xs"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    Password
                  </label>
                  <span className="text-xs text-indigo-600 hover:underline cursor-pointer font-light">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/70 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 rounded-xl text-slate-900 font-sans placeholder-slate-400 transition-all text-sm outline-none shadow-xs"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-indigo-650 border-slate-300 rounded focus:ring-indigo-500/30 cursor-pointer"
                  />
                  <label htmlFor="remember" className="ml-2 text-xs text-slate-500 font-light cursor-pointer select-none">
                    Remember this device for 30 days
                  </label>
                </div>
              </div>

              <button
                id="login-submit-button"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-medium rounded-xl shadow-md shadow-indigo-100 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Quick Fill Box */}
            <div className="mt-8 pt-8 border-t border-slate-150">
              <div className="p-4 bg-indigo-50/40 backdrop-blur-md border border-indigo-100/60 rounded-2xl shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-mono uppercase tracking-wider text-indigo-900 font-bold">
                    Quick Access Portal
                  </span>
                </div>
                <p className="text-slate-500 text-xs font-light mb-3 leading-relaxed">
                  Use pre-configured credentials to skip manual entering and load wholesale records instantly.
                </p>
                <button
                  id="quick-fill-button"
                  type="button"
                  onClick={handleQuickFill}
                  className="px-3 py-1.5 bg-white/70 border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-lg text-xs font-mono text-indigo-700 transition-all cursor-pointer shadow-xs font-semibold"
                >
                  Autofill Credentials
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

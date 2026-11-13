import React, { useState } from 'react';
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, HeartPulse, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('admin@carebridge.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`);
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.info(`Filled credentials for ${demoEmail}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-slate-50 to-teal-50/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white shadow-lg shadow-brand-500/25 mb-4 animate-bounce">
          <Activity className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          CARE<span className="text-brand-600">BRIDGE</span>
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Smart AI-Powered Healthcare Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-3xl sm:px-10 border border-slate-100">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Sign In to Dashboard</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to access clinical records and operations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@carebridge.com"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                />
                <span className="text-slate-600 font-medium">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50 transition-all duration-200 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Logins Pill Box */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              One-Click Demo Roles
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@carebridge.com', 'admin123')}
                className="p-2 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 text-purple-700 text-left font-medium transition-colors"
              >
                <span className="block font-bold">Admin</span>
                <span className="text-[10px] text-purple-500">Full Access</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('dr.sarah@carebridge.com', 'doctor123')}
                className="p-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-700 text-left font-medium transition-colors"
              >
                <span className="block font-bold">Doctor</span>
                <span className="text-[10px] text-blue-500">Dr. Sarah Jenkins</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('reception@carebridge.com', 'recep123')}
                className="p-2 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/80 text-teal-700 text-left font-medium transition-colors"
              >
                <span className="block font-bold">Receptionist</span>
                <span className="text-[10px] text-teal-600">Front Desk & Triage</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('patient@carebridge.com', 'patient123')}
                className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-700 text-left font-medium transition-colors"
              >
                <span className="block font-bold">Patient</span>
                <span className="text-[10px] text-emerald-600">Johnathan Hayes</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-bold text-brand-600 hover:text-brand-700 hover:underline"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 mt-6 text-slate-400 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>256-bit HIPAA Compliant Encrypted Transmission</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Reset Your Password</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter your registered email and we'll dispatch password recovery instructions.
            </p>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="user@carebridge.com"
              className="mt-4 w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500"
            />
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setForgotModalOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success('Password recovery instructions sent to your email.');
                  setForgotModalOpen(false);
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
              >
                Send Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


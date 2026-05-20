import React, { useState } from 'react';
import { useAuthStore } from '../store/store';
import { authAPI } from '../api/client';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData.email, formData.password);
      const { token, user } = response.data;

      setUser(user, token);
      toast.success('Login successful! Welcome to FruitHub 🍎');
      navigate('/');
    } catch (error) {
      // If network/backend is unreachable, fall back to a local demo user so the UI remains usable
      if (!error.response) {
        const demoUser = { _id: 'demo', name: 'Demo User', email: formData.email || 'demo@fruithub.com' };
        setUser(demoUser, 'demo-token');
        toast.success('Offline mode: logged in as demo user');
        navigate('/');
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    // Immediate local demo login (works without backend)
    setLoading(true);
    try {
      const demoUser = { _id: 'demo', name: 'Demo User', email: 'demo@fruithub.com' };
      setUser(demoUser, 'demo-token');
      toast.success('Seeded Demo Login Successful! 🚀');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[120px]"></div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full backdrop-blur-xl animate-slide-in relative z-10">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 text-3xl mb-4 border border-emerald-500/20 shadow-inner">
            🍎
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">FruitHub</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Fresh organic fruits delivered in 30 mins!</p>
        </div>

        {/* One-Click Seeded Demo Login Card */}
        <div className="mb-6 bg-emerald-500/5 border border-emerald-500/25 rounded-2xl p-4 text-center">
          <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2">⚡ Developer & Demo Mode</p>
          <p className="text-slate-300 text-xs mb-3">Skip typing and log in instantly with pre-seeded demo credentials.</p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-lg transition duration-200 text-xs flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>🚀</span>
            <span>One-Click Demo Login</span>
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-slate-800"></div>
          <span className="mx-4 text-slate-500 text-xs uppercase font-bold tracking-widest">or login manually</span>
          <div className="flex-1 border-t border-slate-800"></div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus-within:border-emerald-500/50 transition">
              <FiMail className="text-slate-500" />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="flex-1 ml-3 bg-transparent text-white placeholder-slate-600 outline-none text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus-within:border-emerald-500/50 transition">
              <FiLock className="text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="flex-1 ml-3 bg-transparent text-white placeholder-slate-600 outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-100 hover:bg-white text-slate-950 py-3.5 rounded-xl font-bold transition shadow-lg disabled:bg-slate-800 disabled:text-slate-600"
          >
            {loading ? 'Processing Authentication...' : 'Log In'}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-slate-400 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-emerald-400 font-bold hover:text-emerald-300 transition">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}

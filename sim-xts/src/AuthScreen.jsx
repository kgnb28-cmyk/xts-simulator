import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Box, ShieldCheck, TrendingUp, ArrowLeft } from 'lucide-react';

const AuthScreen = ({ onLoginSuccess }) => {
  // Views: 'login', 'register', 'forgot'
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const API_URL = "https://xts-backend-api.onrender.com/api"; 

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle Login & Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = view === 'login' ? '/auth/login' : '/auth/register';
    
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Connection Failed');

        if (view === 'login') {
            onLoginSuccess(data.user, data.token);
        } else {
            alert("Account Created Successfully. Please Sign In.");
            setView('login');
            setFormData({ ...formData, password: '' });
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  // Handle Forgot Password (UI Simulation)
  const handleForgotSubmit = (e) => {
      e.preventDefault();
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
          setLoading(false);
          setResetSent(true);
      }, 1500);
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 font-sans">
      
      {/* MAIN CARD */}
      <div className="flex w-[800px] h-[500px] bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
        
        {/* LEFT SIDE: BRAND IDENTITY (Subtle Minimalist Vibe) */}
        <div className="w-1/2 bg-gray-50 relative flex flex-col justify-between p-10 text-gray-800 border-r border-gray-200">
            {/* Logo Area - Matching the minimalist hex style */}
            <div className="z-10">
                <div className="flex items-center gap-3 mb-4">
                    <Box size={28} strokeWidth={1.5} className="text-black rotate-12" />
                    <h1 className="text-2xl font-bold tracking-tight text-black uppercase">PaperProp</h1>
                </div>
                <p className="text-gray-500 text-xs tracking-wider uppercase font-medium pl-1">Institutional Simulator</p>
            </div>

            {/* Content corrected to Indian Options */}
            <div className="z-10 space-y-8 pr-4">
                <div className="flex items-start gap-4">
                    <div className="mt-1"><TrendingUp size={20} className="text-gray-700"/></div>
                    <div>
                        <h3 className="font-bold text-sm text-gray-900">Indian Options Trading</h3>
                        <p className="text-xs text-gray-500 leading-relaxed mt-1 font-medium">Real-time simulation for NIFTY, BANKNIFTY, and FINNIFTY options chain.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="mt-1"><ShieldCheck size={20} className="text-gray-700"/></div>
                    <div>
                        <h3 className="font-bold text-sm text-gray-900">Risk Free Environment</h3>
                        <p className="text-xs text-gray-500 leading-relaxed mt-1 font-medium">Test strategies with ₹50L virtual capital before deploying real funds.</p>
                    </div>
                </div>
            </div>
            <div className="z-10 text-[10px] text-gray-400">© 2026 PaperProp Technologies.</div>
        </div>

        {/* RIGHT SIDE: FORMS (Login / Register / Forgot) */}
        <div className="w-1/2 bg-white p-12 flex flex-col justify-center relative">
            
            {/* --- FORGOT PASSWORD VIEW --- */}
            {view === 'forgot' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <button onClick={() => {setView('login'); setResetSent(false); setError('')}} className="flex items-center gap-2 text-xs text-gray-500 hover:text-black mb-8 font-bold transition-colors">
                        <ArrowLeft size={14} /> Back to Login
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
                    <p className="text-xs text-gray-500 mb-8 leading-relaxed">Enter your email to receive password reset instructions.</p>

                    {resetSent ? (
                         <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-center">
                            <p className="text-sm text-green-800 font-bold mb-2">Check your inbox</p>
                            <p className="text-xs text-green-600">If an account exists for {formData.email}, we have sent a reset link.</p>
                         </div>
                    ) : (
                        <form onSubmit={handleForgotSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-900 mb-2">Email</label>
                                <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" required />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-black hover:bg-gray-800 text-white text-sm font-bold py-3 rounded-lg shadow-sm transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* --- LOGIN & REGISTER VIEWS --- */}
            {(view === 'login' || view === 'register') && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{view === 'login' ? 'Welcome back' : 'Create account'}</h2>
                    <p className="text-xs text-gray-500 font-medium">{view === 'login' ? 'Please enter your details to sign in.' : 'Start your proprietary trading journey.'}</p>
                </div>

                {error && <div className="mb-6 p-3 bg-red-50 border-l-2 border-red-500 text-red-600 text-xs font-bold">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {view === 'register' && (
                        <div>
                            <label className="block text-xs font-bold text-gray-900 mb-2">Trader ID</label>
                            <input name="username" type="text" placeholder="e.g. TRADER01" onChange={handleChange} className="w-full px-4 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all uppercase placeholder-gray-400" required />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-900 mb-2">Email</label>
                        <input name="email" type="email" placeholder="Enter your email" onChange={handleChange} className="w-full px-4 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400" required />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-gray-900">Password</label>
                            {view === 'login' && <button type="button" onClick={() => setView('forgot')} className="text-xs text-gray-500 font-bold hover:text-black transition-colors">Forgot password?</button>}
                        </div>
                        <div className="relative">
                            <input 
                                name="password" 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400 pr-10"
                                required 
                            />
                            {/* Password Toggle Icon */}
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full mt-6 bg-black hover:bg-gray-800 text-white text-sm font-bold py-3 rounded-lg shadow-sm transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                        {loading ? "Processing..." : (view === 'login' ? "Sign in" : "Create account")}
                        {!loading && <ArrowRight size={16} />}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">
                        {view === 'login' ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => { setError(''); setView(view === 'login' ? 'register' : 'login'); }} className="ml-2 text-black font-bold hover:underline focus:outline-none">
                            {view === 'login' ? "Sign up now" : "Sign in"}
                        </button>
                    </p>
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ArrowLeft, LineChart, Activity } from 'lucide-react';

const AuthScreen = ({ onLoginSuccess }) => {
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const API_URL = "https://xts-backend-api.onrender.com/api"; 

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
            alert("Account Created. Please Sign In.");
            setView('login');
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
      e.preventDefault();
      setLoading(true);
      setTimeout(() => { setLoading(false); setResetSent(true); }, 1500);
  }

  return (
    <div className="w-full h-full flex font-sans bg-zinc-50 overflow-hidden relative">
      {/* Background Pattern & Blurs */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* LEFT SIDE: DASHBOARD COMPOSITION (60%) */}
      <div className="hidden md:flex w-[60%] relative items-center justify-center p-16 z-10">
         <div className="relative w-full max-w-lg h-[300px] flex items-center justify-center"> {/* Container */}
            
            {/* TILE 1: MAIN P&L CARD (Top Center) */}
            <div className="absolute top-0 z-30 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-zinc-100 p-6 w-[380px] transform hover:scale-[1.02] transition-all duration-500 ease-out">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                            <LineChart size={20} className="text-white" />
                        </div>
                        <span className="font-bold text-zinc-800 text-lg">PaperProp Demo</span>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wide">Live Sim</div>
                </div>
                
                {/* P&L Display */}
                <div className="h-28 bg-purple-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                    {/* Decorative Curve */}
                    <svg viewBox="0 0 200 60" className="absolute w-full h-full text-purple-400 opacity-40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M0 50 C 50 60, 100 10, 200 20" />
                    </svg>
                    
                    <div className="text-center relative z-10">
                        <div className="text-xs text-purple-600 font-bold uppercase tracking-widest mb-1">Total P&L</div>
                        <div className="text-4xl font-black text-zinc-900 tracking-tight flex items-center gap-1">
                            <span className="text-2xl text-zinc-400 font-medium">+</span> 
                            ₹1,24,500
                        </div>
                    </div>
                </div>
            </div>

            {/* TILE 2: CANDLESTICK CHART (Bottom Left - Diagonal) */}
            <div className="absolute top-[200px] left-[-20px] z-20 bg-white rounded-3xl shadow-xl border border-zinc-100 p-4 w-60 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-3">
                   <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nifty 50</span>
                   <Activity size={14} className="text-zinc-300" />
                </div>
                <div className="flex items-end justify-between h-20 px-1 gap-1">
                    <div className="w-2 bg-emerald-400 h-[40%] rounded-sm opacity-90"></div>
                    <div className="w-2 bg-red-400 h-[60%] rounded-sm opacity-90"></div>
                    <div className="w-2 bg-emerald-400 h-[30%] rounded-sm opacity-90"></div>
                    <div className="w-2 bg-emerald-400 h-[75%] rounded-sm opacity-90"></div>
                    <div className="w-2 bg-red-400 h-[45%] rounded-sm opacity-90"></div>
                    <div className="w-2 bg-emerald-400 h-[60%] rounded-sm opacity-90"></div>
                    <div className="w-2 bg-emerald-400 h-[85%] rounded-sm opacity-90 shadow-lg shadow-emerald-100"></div>
                </div>
            </div>

            {/* TILE 3: LINE CHART (Bottom Right - Diagonal) */}
            <div className="absolute top-[200px] right-[-20px] z-20 bg-white rounded-3xl shadow-xl border border-zinc-100 p-4 w-60 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                 <div className="flex items-center justify-between mb-3">
                   <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Volatility</span>
                </div>
                <div className="h-20 w-full relative">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                        <div className="h-px bg-zinc-50 w-full"></div>
                        <div className="h-px bg-zinc-50 w-full"></div>
                        <div className="h-px bg-zinc-50 w-full"></div>
                    </div>
                    {/* Line Graph */}
                    <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <path d="M0 35 L10 30 L20 38 L30 20 L40 25 L50 15 L60 28 L70 10 L80 18 L90 5 L100 12" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M0 35 L10 30 L20 38 L30 20 L40 25 L50 15 L60 28 L70 10 L80 18 L90 5 L100 12 V 40 H 0 Z" fill="url(#gradient)" opacity="0.1" />
                        <defs>
                            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>

         </div>
      </div>

      {/* RIGHT SIDE: MODERN FORM (40%) */}
      <div className="w-full md:w-[40%] flex flex-col justify-center p-8 md:p-16 bg-white/80 backdrop-blur-md z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.03)]">
         <div className="max-w-sm w-full mx-auto">
            {/* VIEW: FORGOT PASSWORD */}
            {view === 'forgot' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <button onClick={() => {setView('login'); setResetSent(false);}} className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-indigo-600 mb-8 transition-colors">
                        <ArrowLeft size={16} /> Back to Login
                    </button>
                    <h2 className="text-3xl font-extrabold text-zinc-900 mb-3 tracking-tight">Reset Password</h2>
                    <p className="text-sm text-zinc-500 mb-8">Enter your email to receive recovery instructions.</p>

                    {resetSent ? (
                         <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-center">
                            <p className="text-sm text-indigo-800 font-bold mb-1">Check your inbox</p>
                            <p className="text-xs text-indigo-600">Recovery link sent to {formData.email}</p>
                         </div>
                    ) : (
                        <form onSubmit={handleForgotSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-zinc-700 mb-2 ml-1">Email Address</label>
                                <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3.5 text-sm font-medium text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder-zinc-400" placeholder="name@company.com" required />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200/50 transition-all disabled:opacity-70">
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* VIEW: LOGIN & REGISTER */}
            {(view === 'login' || view === 'register') && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-10">
                    <h2 className="text-3xl font-extrabold text-zinc-900 mb-3 tracking-tight">{view === 'login' ? 'Welcome Back' : 'Join the Academy'}</h2>
                    <p className="text-sm text-zinc-500">{view === 'login' ? 'Enter your credentials to access your account.' : 'Start your journey with real market simulation.'}</p>
                </div>

                {error && <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs font-bold border-l-2 border-red-500 rounded-lg">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {view === 'register' && (
                        <div>
                            <label className="block text-xs font-bold text-zinc-700 mb-2 ml-1">Trader ID</label>
                            <input name="username" type="text" onChange={handleChange} className="w-full px-4 py-3.5 text-sm font-medium text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all uppercase placeholder-zinc-400" placeholder="TRADER01" required />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-2 ml-1">Email</label>
                        <input name="email" type="email" onChange={handleChange} className="w-full px-4 py-3.5 text-sm font-medium text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder-zinc-400" placeholder="name@company.com" required />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="text-xs font-bold text-zinc-700">Password</label>
                            {view === 'login' && <button type="button" onClick={() => setView('forgot')} className="text-xs text-indigo-600 font-bold hover:text-indigo-800 transition-colors">Forgot?</button>}
                        </div>
                        <div className="relative">
                            <input 
                                name="password" 
                                type={showPassword ? "text" : "password"} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3.5 text-sm font-medium text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder-zinc-400 pr-10"
                                placeholder="••••••••"
                                required 
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-zinc-400 hover:text-indigo-600 transition-colors">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200/50 transition-all flex justify-center items-center gap-2 disabled:opacity-70 hover:scale-[1.02] active:scale-[0.98]">
                        {loading ? "Processing..." : (view === 'login' ? "Sign In" : "Create Account")}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-sm text-zinc-500 font-medium">
                        {view === 'login' ? "New here?" : "Already have an account?"}
                        <button onClick={() => { setError(''); setView(view === 'login' ? 'register' : 'login'); }} className="ml-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
                            {view === 'login' ? "Create an Account" : "Sign In"}
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
import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Zap, BarChart2, ShieldCheck } from 'lucide-react';

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
      {/* Custom Styles for Floating Animation */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float-slow { animation: float 6s ease-in-out infinite; }
        .animate-float-medium { animation: float 5s ease-in-out infinite; animation-delay: 0.5s; }
        .animate-float-fast { animation: float 5.5s ease-in-out infinite; animation-delay: 1s; }
      `}</style>

      {/* Background Pattern & Blurs */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[40%] w-[600px] h-[600px] bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* LEFT SIDE: USP TILES (60%) */}
      <div className="hidden md:flex w-[60%] relative flex-col justify-center items-center z-10 pl-10">
         
         <div className="flex flex-col gap-8 w-full max-w-2xl"> {/* Container wraps the diagonal flow */}
            
            {/* USP TILE 1: Real-Time (Left aligned relative to group) */}
            <div className="animate-float-slow self-start translate-x-12">
                <div className="flex items-center gap-5 p-5 bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 w-[360px] hover:scale-[1.02] transition-transform duration-300">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 text-white shrink-0">
                        <Zap size={28} fill="currentColor" className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 leading-tight">Live Market Data</h3>
                        <p className="text-sm text-zinc-500 font-medium mt-1">Experience real-time feed latency under 20ms.</p>
                    </div>
                </div>
            </div>

            {/* USP TILE 2: Analytics (Center aligned relative to group) */}
            <div className="animate-float-medium self-center pr-12">
                <div className="flex items-center gap-5 p-5 bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 w-[360px] hover:scale-[1.02] transition-transform duration-300">
                    <div className="h-14 w-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-200 text-white shrink-0">
                        <BarChart2 size={28} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 leading-tight">Deep Analytics</h3>
                        <p className="text-sm text-zinc-500 font-medium mt-1">Track P&L, drawdowns, and Greeks in real-time.</p>
                    </div>
                </div>
            </div>

            {/* USP TILE 3: Risk Free (Right aligned relative to group) */}
            <div className="animate-float-fast self-end mr-20">
                <div className="flex items-center gap-5 p-5 bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 w-[360px] hover:scale-[1.02] transition-transform duration-300">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200 text-white shrink-0">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 leading-tight">Risk-Free Capital</h3>
                        <p className="text-sm text-zinc-500 font-medium mt-1">Test strategies with ₹50 Lacs virtual buying power.</p>
                    </div>
                </div>
            </div>

         </div>
      </div>

      {/* RIGHT SIDE: MODERN FORM (40%) */}
      <div className="w-full md:w-[40%] flex flex-col justify-center p-8 md:p-16 bg-white/90 backdrop-blur-xl z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.04)] h-full">
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
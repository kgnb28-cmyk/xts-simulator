import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, TrendingUp, ShieldCheck, ArrowLeft } from 'lucide-react';

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
    <div className="w-full h-full flex font-sans">
      
      {/* LEFT SIDE: BRAND EXPERIENCE (60%) */}
      {/* Colors: Zinc-100 background, Zinc-800 text for "Quiet Luxury" */}
      <div className="hidden md:flex w-[60%] bg-zinc-100 flex-col justify-between p-16 relative overflow-hidden">
         {/* Subtle Abstract Decoration */}
         <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-zinc-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-zinc-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>

         <div className="z-10">
             <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
                    <TrendingUp size={20} className="text-white" />
                 </div>
                 <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">PaperProp</h1>
             </div>
             <p className="text-zinc-500 text-sm font-medium tracking-wide uppercase pl-1">Institutional Simulation</p>
         </div>

         <div className="z-10 space-y-10 max-w-lg">
             <div>
                 <h2 className="text-4xl font-light text-zinc-900 leading-tight mb-4">Master the <br/><span className="font-bold">Indian Markets.</span></h2>
                 <p className="text-zinc-600 text-sm leading-relaxed">
                     Deploy ₹50L virtual capital on NIFTY and BANKNIFTY options chains. 
                     Experience real-time execution in a risk-free institutional environment.
                 </p>
             </div>
             
             <div className="flex gap-8">
                 <div className="flex flex-col gap-1">
                     <span className="text-2xl font-bold text-zinc-900">0ms</span>
                     <span className="text-xs text-zinc-500 uppercase tracking-wider">Latency</span>
                 </div>
                 <div className="flex flex-col gap-1">
                     <span className="text-2xl font-bold text-zinc-900">₹50L</span>
                     <span className="text-xs text-zinc-500 uppercase tracking-wider">Buying Power</span>
                 </div>
                 <div className="flex flex-col gap-1">
                     <span className="text-2xl font-bold text-zinc-900">100%</span>
                     <span className="text-xs text-zinc-500 uppercase tracking-wider">Real Data</span>
                 </div>
             </div>
         </div>

         <div className="z-10 text-xs text-zinc-400 font-medium">
             © 2026 PaperProp Financial Technologies. All rights reserved.
         </div>
      </div>

      {/* RIGHT SIDE: LOGIN FORM (40%) */}
      <div className="w-full md:w-[40%] bg-white flex flex-col justify-center px-16 relative shadow-2xl z-20">
         <div className="max-w-sm w-full mx-auto">
            
            {/* VIEW: FORGOT PASSWORD */}
            {view === 'forgot' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <button onClick={() => {setView('login'); setResetSent(false);}} className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 mb-8 transition-colors">
                        <ArrowLeft size={14} /> Back to Login
                    </button>
                    <h2 className="text-3xl font-bold text-zinc-900 mb-3">Reset Password</h2>
                    <p className="text-sm text-zinc-500 mb-8">Enter your email to receive recovery instructions.</p>

                    {resetSent ? (
                         <div className="p-4 bg-emerald-50 border border-emerald-100 rounded text-center">
                            <p className="text-sm text-emerald-800 font-bold mb-1">Check your inbox</p>
                            <p className="text-xs text-emerald-600">Recovery link sent to {formData.email}</p>
                         </div>
                    ) : (
                        <form onSubmit={handleForgotSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-zinc-900 mb-2 uppercase tracking-wide">Email Address</label>
                                <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-0 py-3 text-sm text-zinc-900 bg-transparent border-b border-zinc-300 focus:border-teal-600 focus:outline-none transition-colors placeholder-zinc-300" placeholder="name@company.com" required />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-zinc-900 hover:bg-black text-white text-sm font-bold py-4 rounded shadow-lg transition-all disabled:opacity-50">
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* VIEW: LOGIN & REGISTER */}
            {(view === 'login' || view === 'register') && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-zinc-900 mb-3">{view === 'login' ? 'Welcome Back' : 'Join PaperProp'}</h2>
                    <p className="text-sm text-zinc-500">{view === 'login' ? 'Please enter your credentials to access the terminal.' : 'Create your institutional simulation account.'}</p>
                </div>

                {error && <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs font-bold border-l-2 border-red-500">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {view === 'register' && (
                        <div>
                            <label className="block text-xs font-bold text-zinc-900 mb-2 uppercase tracking-wide">Trader ID</label>
                            <input name="username" type="text" onChange={handleChange} className="w-full px-0 py-3 text-sm text-zinc-900 bg-transparent border-b border-zinc-300 focus:border-teal-600 focus:outline-none transition-colors uppercase placeholder-zinc-300" placeholder="TRADER01" required />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-zinc-900 mb-2 uppercase tracking-wide">Email</label>
                        <input name="email" type="email" onChange={handleChange} className="w-full px-0 py-3 text-sm text-zinc-900 bg-transparent border-b border-zinc-300 focus:border-teal-600 focus:outline-none transition-colors placeholder-zinc-300" placeholder="name@company.com" required />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Password</label>
                            {view === 'login' && <button type="button" onClick={() => setView('forgot')} className="text-xs text-teal-700 font-bold hover:underline">Forgot?</button>}
                        </div>
                        <div className="relative">
                            <input 
                                name="password" 
                                type={showPassword ? "text" : "password"} 
                                onChange={handleChange} 
                                className="w-full px-0 py-3 text-sm text-zinc-900 bg-transparent border-b border-zinc-300 focus:border-teal-600 focus:outline-none transition-colors placeholder-zinc-300 pr-10"
                                placeholder="••••••••"
                                required 
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-3 text-zinc-400 hover:text-zinc-600">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full mt-8 bg-zinc-900 hover:bg-black text-white text-sm font-bold py-4 rounded shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                        {loading ? "Processing..." : (view === 'login' ? "Sign In" : "Create Account")}
                        {!loading && <ArrowRight size={16} />}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-xs text-zinc-500">
                        {view === 'login' ? "New to PaperProp?" : "Already have an account?"}
                        <button onClick={() => { setError(''); setView(view === 'login' ? 'register' : 'login'); }} className="ml-2 text-teal-700 font-bold hover:underline">
                            {view === 'login' ? "Create Account" : "Sign In"}
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
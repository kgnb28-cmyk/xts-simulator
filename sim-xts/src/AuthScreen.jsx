import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ArrowLeft, LineChart } from 'lucide-react';

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

      {/* LEFT SIDE: FRIENDLY VISUALS (60%) */}
      <div className="hidden md:flex w-[60%] relative items-center justify-center p-16 z-10">
         <div className="relative w-full max-w-lg">
            {/* Mockup "3D Card" Illustration */}
            <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-zinc-100 p-6 transform rotate-[-3deg] hover:rotate-0 transition-all duration-700 ease-out">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                            <LineChart size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-zinc-800">PaperProp Demo</span>
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Live Sim</div>
                </div>
                <div className="space-y-4">
                    <div className="h-24 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 flex items-center justify-center relative overflow-hidden">
                        {/* Simulated Chart Line */}
                        <svg viewBox="0 0 100 40" className="w-full h-full absolute bottom-0 text-indigo-600 opacity-20" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M0 30 C 20 10, 40 35, 60 15 S 80 25, 100 5" />
                        </svg>
                        <div className="text-center relative z-10">
                            <div className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Total P&L</div>
                            <div className="text-3xl font-extrabold text-zinc-900">+ ₹1,24,500</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                            <div className="text-xs text-zinc-500 font-bold mb-1">NIFTY 21500 CE</div>
                            <div className="text-lg font-bold text-emerald-600">+₹15,200</div>
                        </div>
                        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                            <div className="text-xs text-zinc-500 font-bold mb-1">BANKNIFTY FUT</div>
                            <div className="text-lg font-bold text-red-500">-₹4,100</div>
                        </div>
                    </div>
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
import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, TrendingUp, ShieldCheck, Globe } from 'lucide-react';

const AuthScreen = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  // KEEP YOUR LIVE URL
  const API_URL = "https://xts-backend-api.onrender.com/api"; 

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form refresh
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Connection Refused');

        if (isLogin) {
            onLoginSuccess(data.user, data.token);
        } else {
            alert("Account Created Successfully. Please Sign In.");
            setIsLogin(true);
            setFormData({ ...formData, password: '' }); // Clear password for safety
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 font-sans">
      
      {/* MAIN CARD CONTAINER */}
      <div className="flex w-[800px] h-[500px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* LEFT SIDE: BRAND IDENTITY (Institutional Vibe) */}
        <div className="w-1/2 bg-slate-900 relative flex flex-col justify-between p-10 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

            {/* Logo Area */}
            <div className="z-10">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center shadow-lg shadow-emerald-900/50">
                        <TrendingUp size={20} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">PaperProp</h1>
                </div>
                <p className="text-slate-400 text-xs tracking-wider uppercase font-semibold pl-10">Institutional Simulator</p>
            </div>

            {/* Feature Highlights */}
            <div className="z-10 space-y-6">
                <div className="flex items-start gap-4 opacity-90">
                    <div className="p-2 bg-slate-800 rounded-lg"><Globe size={18} className="text-emerald-400"/></div>
                    <div>
                        <h3 className="font-bold text-sm text-slate-100">Global Markets</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">Real-time execution simulation across NSE, BSE, and Global Indices.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 opacity-90">
                    <div className="p-2 bg-slate-800 rounded-lg"><ShieldCheck size={18} className="text-blue-400"/></div>
                    <div>
                        <h3 className="font-bold text-sm text-slate-100">Risk Free Environment</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">Test strategies with ₹50L virtual capital before deploying real funds.</p>
                    </div>
                </div>
            </div>

            {/* Footer Copyright */}
            <div className="z-10 text-[10px] text-slate-600">
                © 2026 PaperProp Financial Technologies.
            </div>
        </div>

        {/* RIGHT SIDE: CLEAN LOGIN FORM (Minimalist) */}
        <div className="w-1/2 bg-white p-12 flex flex-col justify-center relative">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-1">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="text-xs text-slate-500">
                    {isLogin ? 'Enter your credentials to access the terminal.' : 'Start your journey as a proprietary trader.'}
                </p>
            </div>

            {error && (
                <div className="mb-4 px-3 py-2 bg-red-50 border-l-2 border-red-500 text-red-600 text-[11px] font-semibold flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wide">Trader ID</label>
                        <input 
                            name="username" 
                            type="text" 
                            placeholder="e.g. TRADER01" 
                            className="w-full px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded focus:border-slate-900 focus:bg-white focus:outline-none transition-all uppercase placeholder-slate-400"
                            onChange={handleChange}
                            required 
                        />
                    </div>
                )}

                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wide">Email Address</label>
                    <input 
                        name="email" 
                        type="email" 
                        placeholder="name@firm.com" 
                        className="w-full px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded focus:border-slate-900 focus:bg-white focus:outline-none transition-all placeholder-slate-400"
                        onChange={handleChange}
                        required 
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Password</label>
                        {isLogin && <a href="#" className="text-[10px] text-blue-600 font-semibold hover:underline">Forgot?</a>}
                    </div>
                    <input 
                        name="password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded focus:border-slate-900 focus:bg-white focus:outline-none transition-all placeholder-slate-400"
                        onChange={handleChange}
                        required 
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full mt-6 bg-slate-900 hover:bg-black text-white text-sm font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                >
                    {loading ? "Processing..." : (isLogin ? "Access Terminal" : "Register Account")}
                    {!loading && <ArrowRight size={16} />}
                </button>
            </form>

            {/* Toggle Login/Signup */}
            <div className="mt-8 text-center border-t border-slate-100 pt-6">
                <p className="text-xs text-slate-500 font-medium">
                    {isLogin ? "New to PaperProp?" : "Already have an account?"}
                    <button 
                        onClick={() => { setError(''); setIsLogin(!isLogin); }} 
                        className="ml-2 text-emerald-600 font-bold hover:underline focus:outline-none"
                    >
                        {isLogin ? "Open Simulated Account" : "Sign In"}
                    </button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
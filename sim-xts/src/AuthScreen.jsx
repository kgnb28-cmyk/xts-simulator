import React, { useState } from 'react';
import { X, User, Lock, Mail, ArrowRight, Loader } from 'lucide-react';

const AuthScreen = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const API_URL = "https://xts-backend-api.onrender.com/api"; // Keep your live URL

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
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

        if (!res.ok) throw new Error(data.error || 'Something went wrong');

        if (isLogin) {
            // Success: Pass the user data up to App.jsx
            onLoginSuccess(data.user, data.token);
        } else {
            // Register Success: Switch to login view
            alert("Registration Successful! Please Login.");
            setIsLogin(true);
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative font-sans">
      <div className="absolute top-2 right-2 text-gray-400 cursor-pointer"><X size={16} /></div>
      
      {/* BRANDING HEADER */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 tracking-tighter">XTS</h1>
        <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Professional Trading Simulator</p>
      </div>

      {/* CARD */}
      <div className="w-[320px] bg-white p-6 rounded-lg shadow-xl border border-gray-100">
        <div className="flex justify-between mb-6 border-b border-gray-100 pb-2">
            <button onClick={() => setIsLogin(true)} className={`text-xs font-bold pb-1 ${isLogin ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-400'}`}>LOGIN</button>
            <button onClick={() => setIsLogin(false)} className={`text-xs font-bold pb-1 ${!isLogin ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-400'}`}>REGISTER</button>
        </div>

        {error && <div className="mb-4 p-2 bg-red-50 text-red-600 text-[10px] font-bold rounded border border-red-100">{error}</div>}

        <div className="space-y-3">
            {!isLogin && (
                <div className="relative">
                    <User size={14} className="absolute top-2.5 left-3 text-gray-400" />
                    <input name="username" placeholder="Create User ID (e.g. TRADER01)" onChange={handleChange} className="w-full pl-9 pr-3 py-2 text-xs font-bold border border-gray-200 rounded focus:border-orange-500 outline-none uppercase" />
                </div>
            )}
            
            <div className="relative">
                <Mail size={14} className="absolute top-2.5 left-3 text-gray-400" />
                <input name="email" type="email" placeholder="Email Address" onChange={handleChange} className="w-full pl-9 pr-3 py-2 text-xs font-bold border border-gray-200 rounded focus:border-orange-500 outline-none" />
            </div>

            <div className="relative">
                <Lock size={14} className="absolute top-2.5 left-3 text-gray-400" />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full pl-9 pr-3 py-2 text-xs font-bold border border-gray-200 rounded focus:border-orange-500 outline-none" />
            </div>
        </div>

        <button onClick={handleSubmit} disabled={loading} className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold py-2.5 rounded shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2">
            {loading ? <Loader size={14} className="animate-spin"/> : (isLogin ? "ACCESS TERMINAL" : "CREATE ACCOUNT")}
            {!loading && <ArrowRight size={14} />}
        </button>

        {/* AFFILIATE PLACEHOLDER */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-[9px] text-gray-400 mb-2">Don't have a Broker Account?</p>
            <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition-colors">
                Open Free Demat Account (Upstox)
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
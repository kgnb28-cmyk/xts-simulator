import React from 'react';
import { LineChart, ArrowUp, ArrowDown, Activity } from 'lucide-react';

const DashboardTiles = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Dot Pattern (Optional aesthetic) */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#6b7280 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 p-4">
        
        {/* --- TILE 1: Main P&L Card (Centered, spanning mostly) --- */}
        {/* Placed at col-start-3 to center it, spanning 8 columns */}
        <div className="md:col-start-3 md:col-span-8 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 z-20 transform transition-transform hover:scale-[1.01]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-xl text-white shadow-lg shadow-purple-200">
                <LineChart size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">PaperProp Demo</h2>
            </div>
            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Live Sim
            </span>
          </div>

          {/* P&L Area */}
          <div className="bg-purple-50 rounded-2xl p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[140px]">
             {/* Decorative Curve Line SVG */}
            <svg className="absolute top-0 left-0 w-full h-full opacity-30" preserveAspectRatio="none">
              <path d="M0,80 C150,90 300,20 450,50 C600,80 750,10 900,40" stroke="#a855f7" strokeWidth="4" fill="none" />
            </svg>
            
            <span className="text-purple-600 font-bold tracking-widest text-sm uppercase mb-1 z-10">Total P&L</span>
            <div className="text-5xl font-black text-gray-900 z-10 tracking-tight flex items-center gap-2">
              <span className="text-3xl text-gray-400">+</span>
              ₹1,24,500
            </div>
          </div>
        </div>

        {/* --- TILE 2: Chart/Candlesticks (Bottom Left - Diagonal offset) --- */}
        {/* Placed at col-start-2 (shifted left) */}
        <div className="md:col-start-2 md:col-span-5 bg-white rounded-3xl shadow-xl border border-gray-100 p-4 z-10 flex flex-col justify-between min-h-[180px]">
          <div className="flex justify-between items-center mb-2">
             <span className="text-gray-400 text-xs font-semibold uppercase">BankNifty Chart</span>
             <Activity size={16} className="text-gray-300" />
          </div>
          
          {/* Mock CSS Candlestick Chart */}
          <div className="flex items-end justify-between h-32 gap-1 px-2">
            <div className="w-2 bg-green-400 h-[40%] rounded-sm opacity-80"></div>
            <div className="w-2 bg-red-400 h-[60%] rounded-sm opacity-80"></div>
            <div className="w-2 bg-green-400 h-[30%] rounded-sm opacity-80"></div>
            <div className="w-2 bg-green-400 h-[80%] rounded-sm opacity-80"></div>
            <div className="w-2 bg-red-400 h-[45%] rounded-sm opacity-80"></div>
            <div className="w-2 bg-green-400 h-[55%] rounded-sm opacity-80"></div>
            <div className="w-2 bg-red-400 h-[20%] rounded-sm opacity-80"></div>
            <div className="w-2 bg-green-400 h-[70%] rounded-sm opacity-80"></div>
            <div className="w-2 bg-green-400 h-[90%] rounded-sm opacity-80 shadow-lg shadow-green-100"></div>
          </div>
        </div>

        {/* --- TILE 3: Blinking Arrows (Bottom Right - Diagonal offset) --- */}
        {/* Placed at col-start-8 (shifted right) */}
        <div className="md:col-start-8 md:col-span-4 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 z-10 flex items-center justify-center gap-8 min-h-[180px]">
          
          {/* Green Arrow - Blinking */}
          <div className="animate-pulse duration-1000 flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-gradient-to-t from-green-50 to-white rounded-2xl shadow-sm border border-green-100 flex items-center justify-center">
                <ArrowUp size={40} className="text-green-500 drop-shadow-md" strokeWidth={3} />
            </div>
            <span className="text-xs font-bold text-green-500 tracking-wider">CALL</span>
          </div>

          {/* Red Arrow - Blinking (Opposite phase or same) */}
          <div className="animate-pulse duration-1000 flex flex-col items-center gap-2">
             <div className="w-16 h-16 bg-gradient-to-t from-red-50 to-white rounded-2xl shadow-sm border border-red-100 flex items-center justify-center">
                <ArrowDown size={40} className="text-red-500 drop-shadow-md" strokeWidth={3} />
             </div>
             <span className="text-xs font-bold text-red-500 tracking-wider">PUT</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardTiles;
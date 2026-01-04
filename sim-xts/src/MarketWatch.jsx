import React, { useState, useRef } from 'react';
import { ArrowUp, ArrowDown, Search, X, Activity, TrendingUp } from 'lucide-react';

// --- MOCK DATABASE REMOVED (Data now comes from Server) ---

const MarketWatch = ({ onSelectRow, data = [], isTerminalMode }) => { // <--- 1. ACCEPTS DATA PROP
  
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);

  // --- STYLES (Preserved from your code) ---
  const styles = isTerminalMode ? {
      // TERMINAL MODE
      container: "bg-black text-white font-mono text-[11px] h-full border-r border-gray-800",
      header: "bg-[#d1d5db] text-black font-bold uppercase border-b border-gray-500 tracking-tight",
      row: "bg-black border-b border-gray-800 hover:bg-[#222] text-white cursor-pointer",
      symbol: "text-yellow-400 font-bold",
      
      // Dynamic Backgrounds
      bgTickUp: "bg-[#3b82f6] text-white font-bold",
      bgTickDown: "bg-[#ef4444] text-white font-bold",
      bgStandard: "",

      // Dynamic Text
      textTickUp: "text-[#3b82f6] font-bold",
      textTickDown: "text-[#ef4444] font-bold",
      textGreen: "text-green-500 font-bold",
      textRed: "text-red-500 font-bold",

      searchContainer: "bg-[#1a1a1a] border-b border-gray-700 p-1",
      searchInput: "bg-black border border-gray-600 text-yellow-400 placeholder:text-gray-600 h-8 text-xs focus:outline-none focus:border-yellow-500",
      
      cell: "border-r border-gray-800 px-2 py-1 truncate h-8 flex items-center justify-end",
      cellLeft: "border-r border-gray-800 px-2 py-1 truncate h-8 flex items-center justify-start",
      
      dimText: "opacity-70",
      bottomBar: "bg-[#333] border-t border-gray-600 text-white p-1",
      btnBuy: "bg-blue-700 text-white border border-blue-500 hover:bg-blue-600",
      btnSell: "bg-red-700 text-white border border-red-500 hover:bg-red-600"
  } : {
      // MODERN MODE
      container: "bg-white text-gray-800 font-sans text-xs h-full",
      header: "bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider",
      row: "bg-white border-b border-gray-100 hover:bg-indigo-50/50 text-gray-800 cursor-pointer",
      
      symbol: "text-gray-800 font-bold",
      bid: "text-gray-700",
      ask: "text-gray-700",
      ltpUp: "text-green-600 font-bold",
      ltpDown: "text-red-600 font-bold",
      
      searchContainer: "bg-white border-b border-gray-200 p-2",
      searchInput: "bg-gray-50 border-gray-200 text-gray-800 focus:border-indigo-500 focus:bg-white placeholder:text-gray-400 h-9 rounded-lg",
      
      cell: "px-2 py-3 flex items-center justify-end",
      cellLeft: "px-2 py-3 flex items-center justify-start",
      
      dimText: "text-gray-400",
      bottomBar: "bg-white border-t border-gray-200 text-gray-400 p-2",
      btnBuy: "bg-blue-600 text-white hover:bg-blue-700",
      btnSell: "bg-red-500 text-white hover:bg-red-600"
  };

  return (
    <div className={`flex flex-col h-full relative transition-colors duration-200 ${styles.container}`}>
      
      {/* SEARCH BAR (Visual Only - Backend now controls list) */}
      <div className={`sticky top-0 z-30 ${styles.searchContainer}`}>
        <div className="relative">
            <Search className={`absolute left-2 top-2.5 ${styles.dimText}`} size={14} />
            <input 
                ref={searchInputRef}
                type="text" 
                placeholder={isTerminalMode ? "SEARCH SCRIPT..." : "Search (Managed by Server)"}
                className={`w-full pl-8 pr-8 rounded transition-all ${styles.searchInput}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <button onClick={() => setSearchTerm('')} className={`absolute right-2 top-2.5 hover:opacity-75 ${styles.dimText}`}>
                    <X size={14} />
                </button>
            )}
        </div>
      </div>

      {/* HEADER */}
      <div className={`grid grid-cols-12 z-20 sticky top-0 ${styles.header}`}>
        <div className={`col-span-3 ${styles.cellLeft}`}>Script</div>
        <div className={`col-span-1 ${styles.cell}`}>LTP</div>
        <div className={`col-span-1 ${styles.cell}`}>Bid Qty</div>
        <div className={`col-span-1 ${styles.cell}`}>Bid</div>
        <div className={`col-span-1 ${styles.cell}`}>Ask</div>
        <div className={`col-span-1 ${styles.cell}`}>Ask Qty</div>
        <div className={`col-span-1 hidden lg:flex ${styles.cell}`}>Vol</div>
        <div className={`col-span-1 hidden lg:flex ${styles.cell}`}>OI</div>
        <div className={`col-span-1 ${styles.cell}`}>% Chg</div>
        <div className={`col-span-1 ${styles.cell} justify-center`}>Action</div>
      </div>

      {/* ROWS (Rendered from Backend Data) */}
      <div className="flex-1 overflow-y-auto">
        {data.map((row) => {
          // Determine dynamic background class based on tick direction
          // (Data from server includes 'change' but we calculate tickDir visually if needed)
          const tickUp = row.change >= 0;
          const dynamicBgClass = isTerminalMode 
            ? (tickUp ? styles.bgTickUp : styles.bgTickDown) 
            : '';

          return (
          <div 
            key={row.id} 
            onClick={() => onSelectRow(row)}
            className={`group grid grid-cols-12 transition-colors items-center ${styles.row}`}
          >
            {/* Symbol */}
            <div className={`col-span-3 ${styles.cellLeft}`}>
                <div className="flex flex-col justify-center">
                    <span className={styles.symbol}>{row.symbol}</span>
                    <span className={`text-[9px] flex items-center gap-1 ${styles.dimText}`}>NSE FO</span>
                </div>
            </div>

            {/* LTP */}
            <div className={`col-span-1 ${styles.cell} ${isTerminalMode ? (tickUp ? styles.textTickUp : styles.textTickDown) : (tickUp ? styles.ltpUp : styles.ltpDown)}`}>
              {row.ltp.toFixed(2)}
            </div>

            {/* BID QTY */}
            <div className={`col-span-1 ${styles.cell} ${isTerminalMode ? dynamicBgClass : styles.bid}`}>
                <span className={isTerminalMode ? "text-white" : styles.dimText}>{row.bQty || '-'}</span>
            </div>
            
            {/* BID PRICE */}
            <div className={`col-span-1 ${styles.cell} ${isTerminalMode ? dynamicBgClass : styles.bid}`}>
                {row.bPrice || '-'}
            </div>

            {/* ASK PRICE */}
            <div className={`col-span-1 ${styles.cell} ${isTerminalMode ? dynamicBgClass : styles.ask}`}>
                {row.sPrice || '-'}
            </div>

            {/* ASK QTY */}
            <div className={`col-span-1 ${styles.cell} ${isTerminalMode ? dynamicBgClass : styles.ask}`}>
                <span className={isTerminalMode ? "text-white" : styles.dimText}>{row.sQty || '-'}</span>
            </div>

            {/* VOL & OI (Server Mock Data) */}
            <div className={`col-span-1 hidden lg:flex ${styles.cell} font-mono ${styles.dimText}`}>1.2M</div>
            <div className={`col-span-1 hidden lg:flex ${styles.cell} font-mono ${styles.dimText}`}>45L</div>

            {/* CHANGE % */}
            <div className={`col-span-1 ${styles.cell}`}>
                {row.change >= 0 ? 
                    <ArrowUp size={10} className={isTerminalMode ? styles.textGreen : "text-green-600"} /> : 
                    <ArrowDown size={10} className={isTerminalMode ? styles.textRed : "text-red-600"} />
                }
                <span className={`${row.change >= 0 ? (isTerminalMode ? styles.textGreen : 'text-green-600') : (isTerminalMode ? styles.textRed : 'text-red-600')} ml-1`}>
                    {row.change}%
                </span>
            </div>

            {/* ACTIONS */}
            <div className={`col-span-1 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${styles.cell} border-none`}>
                <button className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[9px] ${styles.btnBuy}`}>B</button>
                <button className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[9px] ${styles.btnSell}`}>S</button>
            </div>

          </div>
        );
        })}
        
        {data.length === 0 && (
            <div className="p-4 text-center text-xs opacity-40">
                Waiting for Data Feed...
            </div>
        )}
      </div>
      
      {/* BOTTOM BAR */}
      <div className={`flex justify-between items-center text-[10px] ${styles.bottomBar}`}>
         <div className="flex gap-4">
             <span className="flex items-center gap-1"><Activity size={10} /> Market Status: OPEN</span>
             <span className="flex items-center gap-1"><TrendingUp size={10} /> VIX: 13.45 (+1.2%)</span>
         </div>
         <div>Real-Time Simulation</div>
      </div>

    </div>
  );
};

export default MarketWatch;
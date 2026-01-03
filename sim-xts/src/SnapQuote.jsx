import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const SnapQuote = ({ symbolData, onClose, onInitiateTrade, isTerminalMode }) => {
  if (!symbolData) return null;

  const [depth, setDepth] = useState({ bids: [], asks: [] });

  useEffect(() => {
    const ltp = parseFloat(symbolData.ltp);
    const spread = 0.05;

    const newBids = Array.from({ length: 5 }).map((_, i) => ({
      price: (ltp - ((i + 1) * spread)).toFixed(2),
      qty: Math.floor(Math.random() * 500) + 50,
      orders: Math.floor(Math.random() * 5) + 1
    }));

    const newAsks = Array.from({ length: 5 }).map((_, i) => ({
      price: (ltp + ((i + 1) * spread)).toFixed(2),
      qty: Math.floor(Math.random() * 500) + 50,
      orders: Math.floor(Math.random() * 5) + 1
    }));

    setDepth({ bids: newBids, asks: newAsks });
  }, [symbolData.ltp]);

  // --- DYNAMIC STYLES ---
  const s = isTerminalMode ? {
      // TERMINAL MODE
      wrapper: "w-[700px] bg-black shadow-2xl z-50 border border-gray-600 font-mono select-none text-xs text-white",
      header: "drag-handle flex justify-between items-center px-2 py-1 bg-[#d1d5db] border-b border-gray-500 cursor-move text-black",
      closeBtn: "hover:bg-red-600 hover:text-white p-0.5 rounded transition-colors",
      
      topBar: "flex gap-2 p-2 bg-[#222] border-b border-gray-600",
      symbolBox: "bg-black border border-gray-500 h-6 px-2 flex items-center w-32 font-bold text-yellow-400",
      
      tableContainer: "p-1 bg-black",
      table: "w-full border-collapse border border-gray-600 text-[11px] font-mono",
      
      // Header Cells
      th: "border border-gray-600 bg-[#333] text-gray-300",
      thBuy: "border border-gray-600 bg-[#333] text-blue-400",
      thSell: "border border-gray-600 bg-[#333] text-red-500",
      
      // Data Cells
      td: "border border-gray-700 text-right px-1 text-white",
      tdBuy: "border border-gray-700 text-right px-1 text-blue-400 font-bold",
      tdSell: "border border-gray-700 text-right px-1 text-red-500 font-bold",
      
      // Info Grid
      infoGrid: "grid grid-cols-4 gap-1 mt-1 text-[10px] font-mono",
      infoBox: "border border-gray-700 p-1 bg-[#1a1a1a] flex justify-between text-gray-300",
      infoVal: "font-bold text-white",
      infoValUp: "font-bold text-blue-400", // Terminal uses Blue
      infoValDown: "font-bold text-red-500",

      footer: "bg-[#222] border-t border-gray-600 px-2 py-1 text-[9px] text-gray-400 flex justify-between items-center"
  } : {
      // MODERN MODE
      wrapper: "w-[700px] bg-white shadow-2xl z-50 border border-gray-400 font-sans select-none text-xs text-black",
      header: "drag-handle flex justify-between items-center px-2 py-1 bg-white border-b border-gray-300 cursor-move",
      closeBtn: "hover:bg-red-100 p-0.5 rounded",
      
      topBar: "flex gap-2 p-2 bg-[#f0f0f0] border-b border-gray-300",
      symbolBox: "bg-white border border-gray-400 h-6 px-2 flex items-center w-32 font-bold text-blue-800",
      
      tableContainer: "p-1 bg-white",
      table: "w-full border-collapse border border-gray-400 text-[11px] font-mono",
      
      th: "border border-gray-400 bg-gray-100",
      thBuy: "border border-gray-400 bg-gray-100 text-blue-800",
      thSell: "border border-gray-400 bg-gray-100 text-red-600",
      
      td: "border border-gray-400 text-right px-1 text-blue-800",
      tdBuy: "border border-gray-400 text-right px-1 text-blue-800 font-bold bg-blue-50",
      tdSell: "border border-gray-400 text-right px-1 text-red-600 font-bold bg-red-50",
      
      infoGrid: "grid grid-cols-4 gap-1 mt-1 text-[10px] font-mono",
      infoBox: "border border-gray-300 p-1 bg-gray-50 flex justify-between text-black",
      infoVal: "font-bold text-black",
      infoValUp: "font-bold text-blue-600",
      infoValDown: "font-bold text-red-600",

      footer: "bg-[#f0f0f0] border-t border-gray-400 px-2 py-1 text-[9px] text-gray-500 flex justify-between items-center"
  };

  return (
    <div className={s.wrapper}>
      
      {/* HEADER */}
      <div className={s.header}>
        <div className="flex items-center gap-2 pointer-events-none">
            <span className="text-orange-600 font-bold text-lg">∑</span>
            <span className="font-bold">Snap Quote - {symbolData.symbol} [X14AD43]</span>
        </div>
        <button onClick={onClose} className={s.closeBtn}><X size={16}/></button>
      </div>

      <div className={s.topBar}>
         <div className={s.symbolBox}>{symbolData.symbol}</div>
         <div className="flex-1"></div>
         <button className="bg-black text-white px-3 font-bold border border-gray-600">Display</button>
      </div>

      <div className={s.tableContainer}>
        <table className={s.table}>
           <thead>
             <tr>
                <th className={`${s.thBuy} w-12`}>Orders</th>
                <th className={`${s.thBuy} w-16`}>Buy Qty</th>
                <th className={`${s.thBuy} w-16`}>Buy Price</th>
                <th className={`${s.thSell} w-16`}>Sell Price</th>
                <th className={`${s.thSell} w-16`}>Sell Qty</th>
                <th className={`${s.thSell} w-12`}>Orders</th>
             </tr>
           </thead>
           <tbody>
             {Array.from({ length: 5 }).map((_, i) => (
               <tr key={i} className="h-5">
                 <td className={s.tdBuy}>{depth.bids[i]?.orders || '-'}</td>
                 <td className={s.tdBuy}>{depth.bids[i]?.qty || '-'}</td>
                 <td className={s.tdBuy}>{depth.bids[i]?.price || '-'}</td>
                 <td className={s.tdSell}>{depth.asks[i]?.price || '-'}</td>
                 <td className={s.tdSell}>{depth.asks[i]?.qty || '-'}</td>
                 <td className={s.tdSell}>{depth.asks[i]?.orders || '-'}</td>
               </tr>
             ))}
           </tbody>
        </table>

        <div className={s.infoGrid}>
            <div className={s.infoBox}><span>Open:</span> <span className={s.infoVal}>{symbolData.open}</span></div>
            <div className={s.infoBox}><span>High:</span> <span className={s.infoVal}>{symbolData.high}</span></div>
            <div className={s.infoBox}><span>Low:</span> <span className={s.infoVal}>{symbolData.low}</span></div>
            <div className={s.infoBox}><span>Close:</span> <span className={s.infoVal}>{symbolData.prev}</span></div>
            <div className={s.infoBox}><span>ATP:</span> <span className="font-bold text-orange-600">{symbolData.atp}</span></div>
            <div className={s.infoBox}><span>Vol:</span> <span className={s.infoVal}>{symbolData.vol}</span></div>
            <div className={s.infoBox}><span>OI:</span> <span className={s.infoVal}>24,500</span></div>
            <div className={s.infoBox}><span>LTP:</span> <span className={symbolData.change >= 0 ? s.infoValUp : s.infoValDown}>{symbolData.ltp}</span></div>
        </div>
      </div>
      
      <div className={s.footer}>
          <div className="flex gap-4">
            <span>LTT: {new Date().toLocaleTimeString()}</span>
            <span>Last Updated: Realtime</span>
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => onInitiateTrade('BUY')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-0.5 rounded-sm shadow-sm border border-blue-800">BUY</button>
            <button onClick={() => onInitiateTrade('SELL')} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-0.5 rounded-sm shadow-sm border border-red-800">SELL</button>
          </div>
      </div>
    </div>
  );
};

export default SnapQuote;
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const SnapQuote = ({ symbolData, onClose, onInitiateTrade }) => {
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

  return (
    // REMOVED fixed positioning
    <div className="w-[700px] bg-white shadow-2xl z-50 border border-gray-400 font-sans select-none text-xs">
      
      {/* HEADER - Added drag-handle */}
      <div className="drag-handle flex justify-between items-center px-2 py-1 bg-white border-b border-gray-300 cursor-move">
        <div className="flex items-center gap-2 pointer-events-none">
            <span className="text-orange-600 font-bold text-lg">∑</span>
            <span className="font-bold text-gray-700">Snap Quote - {symbolData.symbol} [X14AD43]</span>
        </div>
        <button onClick={onClose} className="hover:bg-red-100 p-0.5 rounded"><X size={16}/></button>
      </div>

      <div className="flex gap-2 p-2 bg-[#f0f0f0] border-b border-gray-300">
         <div className="bg-white border border-gray-400 h-6 px-2 flex items-center w-32 font-bold text-blue-800">{symbolData.symbol}</div>
         <div className="flex-1"></div>
         <button className="bg-black text-white px-3 font-bold">Display</button>
      </div>

      <div className="p-1">
        <table className="w-full border-collapse border border-gray-400 text-[11px] font-mono">
           <thead>
             <tr className="bg-gray-100">
                <th className="border border-gray-400 text-blue-800 w-12">Orders</th>
                <th className="border border-gray-400 text-blue-800 w-16">Buy Qty</th>
                <th className="border border-gray-400 text-blue-800 w-16">Buy Price</th>
                <th className="border border-gray-400 text-red-600 w-16">Sell Price</th>
                <th className="border border-gray-400 text-red-600 w-16">Sell Qty</th>
                <th className="border border-gray-400 text-red-600 w-12">Orders</th>
             </tr>
           </thead>
           <tbody>
             {Array.from({ length: 5 }).map((_, i) => (
               <tr key={i} className="h-5">
                 <td className="border border-gray-400 text-right px-1 text-blue-800">{depth.bids[i]?.orders || '-'}</td>
                 <td className="border border-gray-400 text-right px-1 text-blue-800 font-bold">{depth.bids[i]?.qty || '-'}</td>
                 <td className="border border-gray-400 text-right px-1 text-blue-800 font-bold bg-blue-50">{depth.bids[i]?.price || '-'}</td>
                 <td className="border border-gray-400 text-right px-1 text-red-600 font-bold bg-red-50">{depth.asks[i]?.price || '-'}</td>
                 <td className="border border-gray-400 text-right px-1 text-red-600 font-bold">{depth.asks[i]?.qty || '-'}</td>
                 <td className="border border-gray-400 text-right px-1 text-red-600">{depth.asks[i]?.orders || '-'}</td>
               </tr>
             ))}
           </tbody>
        </table>

        <div className="grid grid-cols-4 gap-1 mt-1 text-[10px] font-mono">
            <div className="border border-gray-300 p-1 bg-gray-50 flex justify-between"><span>Open:</span> <span className="font-bold">{symbolData.open}</span></div>
            <div className="border border-gray-300 p-1 bg-gray-50 flex justify-between"><span>High:</span> <span className="font-bold">{symbolData.high}</span></div>
            <div className="border border-gray-300 p-1 bg-gray-50 flex justify-between"><span>Low:</span> <span className="font-bold">{symbolData.low}</span></div>
            <div className="border border-gray-300 p-1 bg-gray-50 flex justify-between"><span>Close:</span> <span className="font-bold">{symbolData.prev}</span></div>
            <div className="border border-gray-300 p-1 bg-gray-50 flex justify-between"><span>ATP:</span> <span className="font-bold text-orange-600">{symbolData.atp}</span></div>
            <div className="border border-gray-300 p-1 bg-gray-50 flex justify-between"><span>Vol:</span> <span className="font-bold">{symbolData.vol}</span></div>
            <div className="border border-gray-300 p-1 bg-gray-50 flex justify-between"><span>OI:</span> <span className="font-bold">24,500</span></div>
            <div className="border border-gray-300 p-1 bg-gray-50 flex justify-between"><span>LTP:</span> <span className={`font-bold ${symbolData.change >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{symbolData.ltp}</span></div>
        </div>
      </div>
      
      <div className="bg-[#f0f0f0] border-t border-gray-400 px-2 py-1 text-[9px] text-gray-500 flex justify-between items-center">
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
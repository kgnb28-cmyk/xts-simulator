import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ModifyWindow = ({ order, availableFunds, onClose, onConfirm, isTerminalMode }) => {
  const isBuy = order.side === 'BUY';
  const modernBgColor = isBuy ? 'bg-[#7879bc]' : 'bg-[#ff5252]'; 

  const [qty, setQty] = useState(order.qty);
  const [price, setPrice] = useState(order.price);
  const [orderType, setOrderType] = useState(order.type || 'LMT');
  const [error, setError] = useState(null);

  // Calculate Margin Difference
  const oldMargin = (order.qty * order.price * 0.2);
  const newMargin = (qty * price * 0.2);
  const diff = newMargin - oldMargin; 

  const handleSubmit = () => {
    // If modification requires MORE margin, check funds
    if (diff > 0 && diff > availableFunds) {
      setError(`Insufficient Funds. Need: ${diff.toFixed(2)}`);
      return;
    }
    onConfirm(order.id, { qty, price, type: orderType, marginDiff: diff });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') handleSubmit();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [qty, price, orderType, diff, availableFunds]);

  // --- DYNAMIC STYLES ---
  const s = isTerminalMode ? {
      // TERMINAL MODE
      wrapper: "w-[500px] font-mono select-none text-xs bg-black text-white shadow-2xl border border-gray-600",
      header: "drag-handle bg-[#d1d5db] text-black border-b border-gray-500 flex justify-between items-center px-2 py-1 h-7 cursor-move font-bold uppercase",
      closeBtn: "hover:bg-red-600 hover:text-white p-0.5 rounded transition-colors",
      
      body: "p-4 bg-black text-white", // Black body for terminal
      label: "mb-1 font-bold text-yellow-400",
      input: "w-full h-8 px-2 border border-gray-600 bg-[#222] text-white font-bold text-right focus:outline-none focus:border-yellow-500",
      select: "h-8 border border-gray-600 bg-[#222] text-white px-1 text-xs focus:outline-none",
      
      btnConfirm: "bg-blue-700 text-white px-6 py-1 font-bold border border-blue-500 hover:bg-blue-600",
      btnCancel: "bg-red-700 text-white border border-red-500 px-4 py-1 font-bold hover:bg-red-600"
  } : {
      // MODERN MODE
      wrapper: "w-[500px] font-sans select-none text-xs bg-white shadow-2xl border border-gray-500",
      header: "drag-handle bg-white border-b border-gray-300 flex justify-between items-center px-2 py-1 h-7 cursor-move font-bold text-gray-700",
      closeBtn: "hover:bg-red-100 p-0.5 rounded",
      
      body: `${modernBgColor} p-4 text-black`, // Colored body for modern
      label: "mb-1 font-bold",
      input: "w-full h-8 px-2 border-2 border-black/20 font-bold text-right focus:outline-none bg-white",
      select: "h-8 border border-black/20 px-1 text-xs bg-white",
      
      btnConfirm: "bg-black text-white px-6 py-1 font-bold shadow-md hover:bg-gray-800 border border-black",
      btnCancel: "bg-white text-black border border-black px-4 py-1 font-bold shadow-md hover:bg-gray-100"
  };

  return (
    <div className={s.wrapper}>
      
      {/* HEADER */}
      <div className={s.header}>
        <div className="flex items-center gap-2 pointer-events-none">
            <span>MODIFY ORDER - {order.symbol}</span>
        </div>
        <button onClick={onClose} className={s.closeBtn}><X size={14}/></button>
      </div>

      <div className={s.body}>
        <div className="flex gap-4 mb-4">
             <div className="flex flex-col w-24">
                <label className={s.label}>Total Qty</label>
                <input autoFocus type="number" value={qty} onChange={(e) => setQty(e.target.value)}
                    className={s.input}
                />
             </div>
             <div className="flex flex-col w-28">
                <label className={s.label}>Price</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} 
                    className={s.input}
                />
             </div>
             <div className="flex flex-col flex-1">
                <label className={s.label}>Order Type</label>
                <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className={s.select}>
                    <option value="MKT">Market</option>
                    <option value="LMT">Limit</option>
                    <option value="SL">SL Limit</option>
                    <option value="SL-M">SL Market</option>
                </select>
             </div>
        </div>

        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 mb-2 text-[10px] font-bold">
                {error}
            </div>
        )}

        <div className={`flex justify-end gap-2 pt-3 ${isTerminalMode ? 'border-t border-gray-700' : 'border-t border-black/10'}`}>
             <button onClick={handleSubmit} className={s.btnConfirm}>MODIFY</button>
             <button onClick={onClose} className={s.btnCancel}>CANCEL</button>
        </div>
      </div>
    </div>
  );
};

export default ModifyWindow;
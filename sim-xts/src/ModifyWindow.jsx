import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ModifyWindow = ({ order, availableFunds, onClose, onConfirm }) => {
  const isBuy = order.side === 'BUY';
  const bgColor = isBuy ? 'bg-[#7879bc]' : 'bg-[#ff5252]'; 

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

  return (
    <div className="w-[500px] font-sans select-none text-xs bg-white shadow-2xl border border-gray-500">
      
      {/* HEADER */}
      <div className="drag-handle bg-white border-b border-gray-300 flex justify-between items-center px-2 py-1 h-7 cursor-move">
        <div className="flex items-center gap-2 pointer-events-none">
            <span className="font-bold text-gray-700">Modify Order - {order.symbol}</span>
        </div>
        <button onClick={onClose} className="hover:bg-red-100 p-0.5"><X size={14}/></button>
      </div>

      <div className={`${bgColor} p-4 text-black`}>
        <div className="flex gap-4 mb-4">
             <div className="flex flex-col">
                <label className="mb-1 font-bold">Total Qty</label>
                <input autoFocus type="number" value={qty} onChange={(e) => setQty(e.target.value)}
                    className="w-24 h-8 px-2 border-2 border-black/20 font-bold text-right focus:outline-none"
                />
             </div>
             <div className="flex flex-col">
                <label className="mb-1 font-bold">Price</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} 
                    className="w-28 h-8 px-2 border-2 border-black/20 font-bold text-right focus:outline-none"
                />
             </div>
             <div className="flex flex-col">
                <label className="mb-1 font-bold">Order Type</label>
                <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className="h-8 border border-black/20 px-1 text-xs">
                    <option value="MKT">Market</option>
                    <option value="LMT">Limit</option>
                </select>
             </div>
        </div>

        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 mb-2 text-[10px] font-bold">
                {error}
            </div>
        )}

        <div className="flex justify-end gap-2 border-t border-black/10 pt-3">
             <button onClick={handleSubmit} className="bg-black text-white px-6 py-1 font-bold shadow-md hover:bg-gray-800 border border-black">MODIFY</button>
             <button onClick={onClose} className="bg-white text-black border border-black px-4 py-1 font-bold shadow-md hover:bg-gray-100">CANCEL</button>
        </div>
      </div>
    </div>
  );
};

export default ModifyWindow;
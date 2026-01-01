import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const OrderWindow = ({ mode, symbolData, availableFunds, onClose, onSubmit }) => {
  const isBuy = mode === 'BUY';
  const bgColor = isBuy ? 'bg-[#7879bc]' : 'bg-[#ff5252]'; 
  
  const [qty, setQty] = useState(symbolData?.bQty || 75);
  const [price, setPrice] = useState(symbolData?.ltp || 0);
  const [triggerPrice, setTriggerPrice] = useState(0); // NEW STATE
  const [orderType, setOrderType] = useState('MKT'); 
  const [error, setError] = useState(null); 
  
  const marginReq = (qty * price * 0.2); 

  // Reset trigger price when switching away from SL
  useEffect(() => {
    if (orderType === 'MKT' || orderType === 'LMT') {
      setTriggerPrice(0);
    } else {
        // Auto-set reasonable trigger for convenience
        setTriggerPrice(symbolData?.ltp || 0);
    }
  }, [orderType, symbolData]);

  const handleSubmit = () => {
    // Validation: Trigger Price is required for SL
    if ((orderType === 'SL-M' || orderType === 'SL') && (!triggerPrice || triggerPrice <= 0)) {
        setError("Trigger Price is required for Stop Loss orders.");
        return;
    }

    if (marginReq > availableFunds) {
      setError(`Insufficient Funds! Short: ${(marginReq - availableFunds).toFixed(2)}`);
      return;
    }

    onSubmit({ 
        mode, 
        qty, 
        price, 
        symbol: symbolData.symbol, 
        marginUsed: marginReq, 
        type: orderType,
        trigPrice: triggerPrice // SEND TRIGGER
    });
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') handleSubmit();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [qty, price, triggerPrice, mode, marginReq, availableFunds, orderType]);

  if (!symbolData) return null;

  return (
    <div className="w-[900px] font-sans select-none text-xs bg-white">
      <div className="drag-handle bg-white border-b border-gray-300 flex justify-between items-center px-2 py-1 h-7 cursor-move">
        <div className="flex items-center gap-2 pointer-events-none">
            <span className={`font-bold ${isBuy ? 'text-blue-800' : 'text-red-800'}`}>{isBuy ? 'Buy' : 'Sell'} Order Entry</span>
            <span className="text-gray-600">- X14AD43 - FINDOC</span>
        </div>
        <button onClick={onClose} className="hover:bg-red-100 p-0.5"><X size={14}/></button>
      </div>

      <div className={`${bgColor} p-2 text-black`}>
        <div className="flex gap-2 mb-2 items-end">
            <Field label="Exchg-Seg" value="NSEFO" w="w-16" />
            
            {/* ORDER TYPE DROPDOWN */}
            <div className="flex flex-col w-24">
                <label className="mb-0.5 truncate">Order Type</label>
                <select 
                    value={orderType} 
                    onChange={(e) => setOrderType(e.target.value)}
                    className="h-6 border border-gray-400 text-xs px-1 focus:outline-none"
                >
                    <option value="MKT">Market</option>
                    <option value="LMT">Limit</option>
                    <option value="SL-M">SL-M (Mkt)</option>
                    <option value="SL">SL (Lmt)</option>
                </select>
            </div>

            <Field label="Pro/Cli" value="CLI" w="w-14" />
            <Field label="Inst Name" value={symbolData.instr} w="w-20" />
            <Field label="Symbol" value={symbolData.symbol} w="w-24" />
            <Field label="Opt Type" value={symbolData.type} w="w-14" />
            <Field label="Strike Price" value={symbolData.strike} w="w-20" />
            <Field label="Expiry Date" value={symbolData.expiry} w="w-24" />
            <Field label="Mrkt Prot" value="0" w="w-16" />
            <Field label="Auc No" value="" w="w-16" />
            
            <div className="flex-1 flex justify-end gap-1">
                <button onClick={handleSubmit} className="bg-black text-white border border-black px-4 py-1 font-bold shadow-md hover:bg-gray-800">
                    {isBuy ? 'Buy' : 'Sell'}
                </button>
                <button onClick={onClose} className="bg-black text-white border border-black px-4 py-1 font-bold shadow-md hover:bg-gray-800">Cancel</button>
            </div>
        </div>

        <div className="flex gap-2 mb-4 items-end">
             <div className="flex flex-col">
                <label className="mb-0.5 font-semibold">Total Qty</label>
                <input autoFocus type="number" value={qty} onChange={(e) => { setQty(e.target.value); setError(null); }}
                    className={`w-20 h-6 px-1 border-2 text-right font-bold focus:outline-none ${isBuy ? 'border-blue-700 text-blue-800' : 'border-red-800 text-red-800'}`}
                />
             </div>
             <div className="flex flex-col">
                <label className="mb-0.5 font-semibold">Price</label>
                <input type="number" value={price} onChange={(e) => { setPrice(e.target.value); setError(null); }} className="w-24 h-6 px-1 border border-gray-400 text-right"/>
             </div>
             
             {/* TRIGGER PRICE INPUT (Enabled only for SL) */}
             <div className="flex flex-col w-20">
                <label className="mb-0.5 truncate">Trig. Price</label>
                <input 
                    type="number" 
                    value={triggerPrice} 
                    onChange={(e) => setTriggerPrice(e.target.value)}
                    disabled={orderType === 'MKT' || orderType === 'LMT'}
                    className={`w-full h-6 px-1 border border-gray-400 text-right ${
                        (orderType === 'MKT' || orderType === 'LMT') ? 'bg-gray-200 text-gray-500' : 'bg-white font-bold'
                    }`}
                />
             </div>

             <Field label="Disc. Qty" value="0" w="w-16" />
             <Field label="Prod Type" value="NRML" w="w-20" />
             <Field label="Validity" value="DAY" w="w-16" />
             <Field label="Client Id" value="AD43" w="w-24" />
             <Field label="Client Name" value="X14AD43" w="w-32" />
             <Field label="Participant Code" value="" w="w-24" />
             <Field label="Validity Period" value="29 Dec 2025" w="w-24" />
             <Field label="No. Days" value="0" w="w-12" />
        </div>

        <div className="mt-4 border-t border-black/10 pt-2 flex justify-between items-end relative">
            <div className="text-black font-semibold">
                <span className="bg-black text-white px-1 font-bold mr-2">R</span>
                Margin required : {Number(marginReq).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                <span className="ml-4 opacity-70 font-normal">| Available: {Number(availableFunds).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
            
            {error && (
              <div className="absolute left-1/2 bottom-8 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded shadow-lg font-bold animate-pulse z-50">
                {error}
              </div>
            )}

            <button className="underline font-bold">Est. Charges</button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, w }) => (
    <div className={`flex flex-col ${w}`}>
        <label className="mb-0.5 truncate">{label}</label>
        <div className="bg-white h-6 px-1 border border-gray-400 flex items-center overflow-hidden whitespace-nowrap">{value}</div>
    </div>
);

export default OrderWindow;
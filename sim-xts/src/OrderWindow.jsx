import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';

const OrderWindow = ({ mode, symbolData, availableFunds, onClose, onSubmit }) => {
  const isBuy = mode === 'BUY';
  const bgColor = isBuy ? 'bg-[#7879bc]' : 'bg-[#ff5252]';
  const isOption = symbolData?.symbol?.includes('CE') || symbolData?.symbol?.includes('PE');

  // --- 1. LOT SIZE HELPER (Guess based on symbol if not provided) ---
  const getLotSize = (sym) => {
    if (sym.includes('BANKNIFTY')) return 15; // 2026 Std
    if (sym.includes('FINNIFTY')) return 65;
    if (sym.includes('NIFTY')) return 50;
    if (sym.includes('RELIANCE')) return 250;
    return 1; // Default for Equity
  };

  const LOT_SIZE = getLotSize(symbolData?.symbol || '');

  // --- STATES ---
  const [qty, setQty] = useState(symbolData?.bQty || LOT_SIZE);
  const [price, setPrice] = useState(symbolData?.ltp || 0);
  const [triggerPrice, setTriggerPrice] = useState(0);
  const [orderType, setOrderType] = useState('MKT');
  const [productType, setProductType] = useState('NRML'); // MIS vs NRML
  const [error, setError] = useState(null);
  
  // --- 2. SMART MARGIN CALCULATOR ---
  const calculateMargin = () => {
    const value = qty * price;
    let reqMargin = 0;

    if (isBuy && isOption) {
        // Option Buying = Full Premium Required (No Leverage)
        reqMargin = value;
    } else {
        // Futures or Option Selling = SPAN + Exposure (~17% for Index)
        const isIndex = symbolData?.symbol?.includes('NIFTY');
        const baseMarginPct = isIndex ? 0.17 : 0.23; // 17% Index, 23% Stocks
        reqMargin = value * baseMarginPct;

        // Intraday Leverage (5x) for Sellers/Futures
        if (productType === 'MIS') {
            reqMargin = reqMargin / 5; 
        }
    }
    return Math.floor(reqMargin);
  };

  const marginReq = calculateMargin();

  // --- 3. RISK CALCULATOR (If SL is set) ---
  const calculateRisk = () => {
    if ((orderType === 'SL' || orderType === 'SL-M') && triggerPrice > 0) {
        const riskPerShare = Math.abs(price - triggerPrice);
        return (riskPerShare * qty).toFixed(2);
    }
    return null;
  };
  const estimatedRisk = calculateRisk();

  // Reset trigger when switching types
  useEffect(() => {
    if (orderType === 'MKT' || orderType === 'LMT') {
      setTriggerPrice(0);
    } else {
       setTriggerPrice(symbolData?.ltp || 0);
    }
  }, [orderType, symbolData]);

  // --- HANDLERS ---
  const handleQtyChange = (e) => {
      const val = parseInt(e.target.value);
      setQty(val);
      // Warning for odd lots
      if (val % LOT_SIZE !== 0) setError(`Warning: Standard Lot Size is ${LOT_SIZE}`);
      else setError(null);
  };

  const handleSubmit = () => {
    if ((orderType === 'SL-M' || orderType === 'SL') && (!triggerPrice || triggerPrice <= 0)) {
        setError("Trigger Price is required for Stop Loss.");
        return;
    }
    if (marginReq > availableFunds) {
      setError(`Insufficient Funds! Short: ${(marginReq - availableFunds).toLocaleString('en-IN')}`);
      return;
    }

    onSubmit({ 
        mode, qty, price, 
        symbol: symbolData.symbol, 
        marginUsed: marginReq, 
        type: orderType,
        product: productType, // Send Product Type
        trigPrice: triggerPrice 
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
    <div className="w-[900px] font-sans select-none text-xs bg-white shadow-2xl border border-gray-400">
      {/* HEADER */}
      <div className="drag-handle bg-white border-b border-gray-300 flex justify-between items-center px-2 py-1 h-7 cursor-move">
        <div className="flex items-center gap-2 pointer-events-none">
            <span className={`font-bold ${isBuy ? 'text-blue-800' : 'text-red-800'}`}>{isBuy ? 'Buy' : 'Sell'} Order Entry</span>
            <span className="text-gray-500 font-mono text-[10px]">- PRO TERMINAL -</span>
        </div>
        <button onClick={onClose} className="hover:bg-red-100 p-0.5"><X size={14}/></button>
      </div>

      <div className={`${bgColor} p-2 text-black transition-colors duration-200`}>
        {/* TOP ROW: FIELDS */}
        <div className="flex gap-2 mb-2 items-end">
            <Field label="Exchg" value="NSEFO" w="w-14" />
            
            {/* ORDER TYPE */}
            <div className="flex flex-col w-24">
                <label className="mb-0.5 truncate font-semibold opacity-80">Order Type</label>
                <select 
                    value={orderType} 
                    onChange={(e) => setOrderType(e.target.value)}
                    className="h-6 border border-gray-400 text-xs px-1 focus:outline-none bg-white font-bold"
                >
                    <option value="MKT">Market</option>
                    <option value="LMT">Limit</option>
                    <option value="SL-M">SL-M (Mkt)</option>
                    <option value="SL">SL (Lmt)</option>
                </select>
            </div>

            <Field label="Symbol" value={symbolData.symbol} w="w-32" bold={true} />
            <Field label="Instrument" value={symbolData.instr || 'FUTIDX'} w="w-20" />
            <Field label="Expiry" value={symbolData.expiry || '26JAN'} w="w-20" />
            <Field label="Strike" value={symbolData.strike || '0'} w="w-16" />
            
            {/* ACTION BUTTONS */}
            <div className="flex-1 flex justify-end gap-2">
                <button onClick={handleSubmit} className="bg-[#1a1a1a] text-white border border-black px-6 py-1 font-bold shadow-md hover:bg-gray-800 transition-transform active:scale-95">
                    {isBuy ? 'BUY' : 'SELL'}
                </button>
                <button onClick={onClose} className="bg-white text-black border border-black px-4 py-1 font-bold shadow-md hover:bg-gray-100">Cancel</button>
            </div>
        </div>

        {/* BOTTOM ROW: INPUTS */}
        <div className="flex gap-3 mb-4 items-end">
             {/* QUANTITY (With Stepper Logic) */}
             <div className="flex flex-col relative">
                <label className="mb-0.5 font-bold">Qty (Lot: {LOT_SIZE})</label>
                <input 
                    autoFocus 
                    type="number" 
                    step={LOT_SIZE} // Step by Lot Size
                    min={LOT_SIZE}
                    value={qty} 
                    onChange={handleQtyChange}
                    className={`w-24 h-7 px-2 border-2 text-right font-black text-sm focus:outline-none ${isBuy ? 'border-blue-700 text-blue-900' : 'border-red-800 text-red-900'}`}
                />
             </div>

             {/* PRICE */}
             <div className="flex flex-col">
                <label className="mb-0.5 font-bold">Price</label>
                <input 
                    type="number" 
                    value={price} 
                    onChange={(e) => { setPrice(e.target.value); setError(null); }} 
                    className="w-24 h-7 px-2 border border-gray-400 text-right font-bold text-sm"
                />
             </div>
             
             {/* TRIGGER PRICE */}
             <div className="flex flex-col w-24">
                <label className="mb-0.5 truncate font-semibold opacity-80">Trig. Price</label>
                <input 
                    type="number" 
                    value={triggerPrice} 
                    onChange={(e) => setTriggerPrice(e.target.value)}
                    disabled={orderType === 'MKT' || orderType === 'LMT'}
                    className={`w-full h-7 px-2 border border-gray-400 text-right font-bold ${
                        (orderType === 'MKT' || orderType === 'LMT') ? 'bg-black/10 text-gray-500' : 'bg-white text-black'
                    }`}
                />
             </div>

             {/* PRODUCT TYPE (MIS/NRML) */}
             <div className="flex flex-col w-20">
                <label className="mb-0.5 font-bold text-black">Product</label>
                <select 
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="h-7 border border-gray-500 bg-yellow-100 font-bold text-black focus:outline-none"
                >
                    <option value="NRML">NRML</option>
                    <option value="MIS">MIS</option>
                </select>
             </div>

             <Field label="Validity" value="DAY" w="w-16" />
             <Field label="Client" value="X14AD43" w="w-24" />
        </div>

        {/* FOOTER: MARGIN & RISK DISPLAY */}
        <div className="mt-2 border-t border-black/10 pt-2 flex justify-between items-center relative">
            <div className="flex flex-col">
                <div className="text-black font-semibold flex items-center gap-2">
                    <span className="bg-black text-white px-1.5 py-0.5 text-[10px] font-bold">REQ MARGIN</span>
                    <span className="text-lg font-bold">₹ {marginReq.toLocaleString('en-IN')}</span>
                    {productType === 'MIS' && <span className="text-[10px] bg-yellow-300 px-1 rounded text-black font-bold">5x LEVERAGE ACTIVE</span>}
                </div>
                <div className="text-[10px] opacity-70">
                    Available: ₹ {Number(availableFunds).toLocaleString('en-IN')}
                </div>
            </div>
            
            {/* Risk Display */}
            {estimatedRisk && (
                <div className="flex items-center gap-2 text-red-900 bg-red-100/50 px-2 py-1 rounded border border-red-900/20">
                    <ShieldAlert size={14} />
                    <span className="font-bold">Max Risk: -₹{estimatedRisk}</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="absolute left-1/2 bottom-10 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded shadow-xl font-bold flex items-center gap-2 z-50 animate-bounce">
                <AlertTriangle size={16} /> {error}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

// Helper Component for Static Fields
const Field = ({ label, value, w, bold }) => (
    <div className={`flex flex-col ${w}`}>
        <label className="mb-0.5 truncate font-semibold opacity-80">{label}</label>
        <div className={`bg-white h-6 px-1 border border-gray-400 flex items-center overflow-hidden whitespace-nowrap ${bold ? 'font-bold' : ''}`}>
            {value}
        </div>
    </div>
);

export default OrderWindow;
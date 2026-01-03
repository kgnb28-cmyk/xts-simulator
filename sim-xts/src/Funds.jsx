import React from 'react';
import { X } from 'lucide-react';

const Funds = ({ fundsData, onClose, isTerminalMode }) => {

  // --- STYLES ---
  const s = isTerminalMode ? {
      // TERMINAL MODE
      wrapper: "w-[400px] bg-black border border-gray-600 font-mono select-none text-xs shadow-2xl text-white",
      windowHeader: "drag-handle bg-[#d1d5db] text-black font-bold uppercase border-b border-gray-500 flex justify-between items-center px-2 py-1 h-7 cursor-move",
      closeBtn: "hover:bg-red-600 hover:text-white p-0.5 rounded transition-colors",
      
      sectionTitle: "font-bold text-yellow-400 mb-2 border-b border-gray-600 inline-block uppercase tracking-wider",
      container: "border border-gray-700 bg-black",
      
      row: "flex justify-between border-b border-gray-800 px-2 py-1",
      rowBold: "flex justify-between border-b border-gray-800 px-2 py-1 font-bold bg-[#1a1a1a]",
      
      label: "text-gray-400",
      
      // Values
      textNormal: "text-white",
      textProfit: "text-blue-400 font-bold", // Terminal Profit = Blue
      textLoss: "text-red-500 font-bold",
      textAvailable: "text-yellow-400 font-bold text-sm", // Highlight Available Funds
      textUsed: "text-red-400",

      divider: "h-2 bg-[#111] border-b border-gray-800",
      footer: "mt-4 text-[10px] text-gray-500 text-center font-mono"
  } : {
      // MODERN MODE (Original)
      wrapper: "w-[400px] bg-white border border-gray-400 font-sans select-none text-xs shadow-2xl",
      windowHeader: "drag-handle bg-gradient-to-r from-blue-900 to-blue-700 text-white flex justify-between items-center px-2 py-1 h-6 cursor-move",
      closeBtn: "hover:bg-red-500 p-0.5 rounded",
      
      sectionTitle: "font-bold text-gray-700 mb-2 border-b-2 border-orange-500 inline-block",
      container: "border border-gray-300 bg-white",
      
      row: "flex justify-between border-b border-gray-300 px-2 py-1",
      rowBold: "flex justify-between border-b border-gray-300 px-2 py-1 font-bold bg-gray-50",
      
      label: "text-gray-600",
      
      // Values
      textNormal: "text-black",
      textProfit: "text-green-600",
      textLoss: "text-red-600",
      textAvailable: "text-blue-700 font-bold",
      textUsed: "text-red-600 font-bold",

      divider: "h-2 bg-[#f0f2f5] border-b border-gray-300",
      footer: "mt-4 text-[10px] text-gray-400 text-center"
  };

  const Row = ({ label, value, bold = false, type = 'normal' }) => {
      let colorClass = s.textNormal;
      if (type === 'profit') colorClass = value >= 0 ? s.textProfit : s.textLoss;
      if (type === 'available') colorClass = s.textAvailable;
      if (type === 'used') colorClass = s.textUsed;

      return (
        <div className={bold ? s.rowBold : s.row}>
          <span className={s.label}>{label}</span>
          <span className={colorClass}>
            {value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      );
  };

  return (
    <div className={s.wrapper}>
      
      {/* TITLE BAR */}
      <div className={s.windowHeader}>
        <span className="pointer-events-none">RMS View Limits - X14AD43</span>
        <button onClick={onClose} className={s.closeBtn}><X size={14}/></button>
      </div>

      {/* BODY */}
      <div className="p-2">
        <h3 className={s.sectionTitle}>Cash & Margin</h3>
        
        <div className={s.container}>
          <Row label="Opening Balance" value={fundsData.opening} />
          <Row label="Payin" value={fundsData.payin} />
          <Row label="Payout" value={fundsData.payout} />
          
          <div className={s.divider}></div>
          
          <Row label="Realized MTM" value={fundsData.realizedMtm} type="profit" />
          <Row label="Unrealized MTM" value={fundsData.unrealizedMtm} type="profit" />
          
          <div className={s.divider}></div>

          <Row label="Margin Used" value={fundsData.usedMargin} type="used" bold />
          <Row label="Available Limit" value={fundsData.available} type="available" bold />
        </div>

        <div className={s.footer}>
            Last Updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default Funds;
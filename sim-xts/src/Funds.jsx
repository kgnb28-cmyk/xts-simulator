import React from 'react';
import { X } from 'lucide-react';

const Funds = ({ fundsData, onClose }) => {
  const Row = ({ label, value, bold = false, color = 'text-black' }) => (
    <div className={`flex justify-between border-b border-gray-300 px-2 py-1 ${bold ? 'font-bold bg-gray-50' : ''}`}>
      <span className="text-gray-600">{label}</span>
      <span className={`${color}`}>{value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
  );

  return (
    // REMOVED fixed positioning, uses wrapper
    <div className="w-[400px] bg-white border border-gray-400 font-sans select-none text-xs shadow-2xl">
      
      {/* TITLE BAR */}
      <div className="drag-handle bg-gradient-to-r from-blue-900 to-blue-700 text-white flex justify-between items-center px-2 py-1 h-6 cursor-move">
        <span className="font-bold pointer-events-none">RMS View Limits - X14AD43</span>
        <button onClick={onClose} className="hover:bg-red-500 p-0.5 rounded"><X size={14}/></button>
      </div>

      {/* BODY */}
      <div className="p-2">
        <h3 className="font-bold text-gray-700 mb-2 border-b-2 border-orange-500 inline-block">Cash & Margin</h3>
        
        <div className="border border-gray-300 bg-white">
          <Row label="Opening Balance" value={fundsData.opening} />
          <Row label="Payin" value={fundsData.payin} />
          <Row label="Payout" value={fundsData.payout} />
          
          <div className="h-2 bg-[#f0f2f5] border-b border-gray-300"></div>
          
          <Row label="Realized MTM" value={fundsData.realizedMtm} color={fundsData.realizedMtm >= 0 ? 'text-green-600' : 'text-red-600'} />
          <Row label="Unrealized MTM" value={fundsData.unrealizedMtm} color={fundsData.unrealizedMtm >= 0 ? 'text-green-600' : 'text-red-600'} />
          
          <div className="h-2 bg-[#f0f2f5] border-b border-gray-300"></div>

          <Row label="Margin Used" value={fundsData.usedMargin} color="text-red-600" bold />
          <Row label="Available Limit" value={fundsData.available} color="text-blue-700" bold />
        </div>

        <div className="mt-4 text-[10px] text-gray-400 text-center">
            Last Updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default Funds;
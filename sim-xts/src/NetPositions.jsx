import React, { useState } from 'react';
import { X, Zap } from 'lucide-react';

const NetPositions = ({ orders, marketData, onClose, onBulkSquareOff }) => {
  const [selectedSymbols, setSelectedSymbols] = useState([]);

  // --- 1. CONSOLIDATE TRADES ---
  const positions = {};
  orders.forEach(order => {
    if (order.status !== 'COMPLETE') return;
    const key = order.symbol; 
    if (!positions[key]) {
      positions[key] = {
        account: 'X14AD43',
        symbol: order.symbol,
        strike: '0.00',
        optType: 'XX',
        buyQty: 0,
        buyValue: 0,
        sellQty: 0,
        sellValue: 0,
        netQty: 0,
        ltp: 0,
      };
    }
    const qty = parseInt(order.qty);
    const price = parseFloat(order.price);
    if (order.side === 'BUY') {
      positions[key].buyQty += qty;
      positions[key].buyValue += (qty * price);
    } else {
      positions[key].sellQty += qty;
      positions[key].sellValue += (qty * price);
    }
  });

  // --- 2. CALCULATE PnL ---
  const rows = Object.values(positions).map(pos => {
    const marketRow = marketData.find(m => m.symbol === pos.symbol);
    const currentLtp = marketRow ? parseFloat(marketRow.ltp) : 0;
    
    pos.ltp = currentLtp;
    pos.buyAvg = pos.buyQty > 0 ? (pos.buyValue / pos.buyQty) : 0;
    pos.sellAvg = pos.sellQty > 0 ? (pos.sellValue / pos.sellQty) : 0;
    pos.netQty = pos.buyQty - pos.sellQty;
    
    const cashFlow = (pos.sellValue - pos.buyValue); 
    const holdingValue = (pos.netQty * currentLtp);
    pos.mtm = cashFlow + holdingValue;
    pos.actualMtM = pos.mtm; 
    return pos;
  });

  const totalMtM = rows.reduce((acc, row) => acc + row.mtm, 0);

  // --- 3. ROW SELECTION LOGIC ---
  const handleRowClick = (e, symbol) => {
    if (e.ctrlKey || e.metaKey) {
        // Multi-select (Toggle)
        if (selectedSymbols.includes(symbol)) {
            setSelectedSymbols(prev => prev.filter(s => s !== symbol));
        } else {
            setSelectedSymbols(prev => [...prev, symbol]);
        }
    } else {
        // Single select (Exclusive)
        setSelectedSymbols([symbol]);
    }
  };

  // --- 4. PREPARE BULK DATA ---
  const handleExecuteSquareOff = () => {
    // Filter out rows that are actually selected AND have open positions
    const positionsToClose = rows.filter(r => selectedSymbols.includes(r.symbol) && r.netQty !== 0);
    onBulkSquareOff(positionsToClose);
    setSelectedSymbols([]); // Clear selection after action
  };

  return (
    <div className="w-[1100px] h-[400px] bg-[#f0f0f0] shadow-2xl z-40 border border-gray-400 font-sans select-none text-xs flex flex-col">
      
      {/* HEADER */}
      <div className="drag-handle bg-gradient-to-r from-blue-900 to-blue-700 text-white flex justify-between items-center px-2 py-1 h-6 cursor-move">
        <span className="font-bold pointer-events-none">Net Positions - X14AD43 [FINDOC]</span>
        <button onClick={onClose} className="hover:bg-red-500 p-0.5 rounded"><X size={14}/></button>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto bg-white font-mono text-[11px]">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gradient-to-b from-[#f0f0f0] to-[#d4d4d4] text-black font-semibold">
            <tr>
              {['Account', 'Symbol', 'Net Qty', 'LTP', 'MtM', 'Buy Qty', 'Buy Avg', 'Sell Qty', 'Sell Avg', 'Net Val'].map(h => (
                <th key={h} className="border-r border-b border-gray-400 px-2 py-1 text-right whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isSelected = selectedSymbols.includes(row.symbol);
              return (
                <tr 
                    key={idx} 
                    onClick={(e) => handleRowClick(e, row.symbol)}
                    className={`border-b border-gray-200 cursor-pointer h-6 text-right
                        ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-black'}
                    `}
                >
                    <td className={`px-2 border-r border-gray-300 text-left ${isSelected ? 'border-blue-500' : ''}`}>{row.account}</td>
                    <td className={`px-2 border-r border-gray-300 text-left font-bold ${!isSelected && 'text-blue-800'}`}>{row.symbol}</td>
                    
                    <td className={`px-2 border-r border-gray-300 font-bold ${!isSelected && (row.netQty > 0 ? 'text-blue-600' : (row.netQty < 0 ? 'text-red-600' : 'text-gray-400'))}`}>
                        {row.netQty}
                    </td>
                    
                    <td className="px-2 border-r border-gray-300">{row.ltp.toFixed(2)}</td>
                    
                    <td className={`px-2 border-r border-gray-300 font-bold ${!isSelected && (row.mtm >= 0 ? 'text-green-600' : 'text-red-600')}`}>
                        {row.mtm.toFixed(2)}
                    </td>

                    <td className={`px-2 border-r border-gray-300 ${!isSelected && 'text-blue-600'}`}>{row.buyQty}</td>
                    <td className="px-2 border-r border-gray-300">{row.buyAvg.toFixed(2)}</td>
                    <td className={`px-2 border-r border-gray-300 ${!isSelected && 'text-red-600'}`}>{row.sellQty}</td>
                    <td className="px-2 border-r border-gray-300">{row.sellAvg.toFixed(2)}</td>
                    <td className="px-2 border-r border-gray-300">{(row.netQty * row.ltp).toFixed(2)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
                <tr><td colSpan="10" className="text-center py-8 text-gray-400 italic">No open positions.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER TOTALS & ACTIONS */}
      <div className="bg-[#fcfdfe] border-t border-gray-300 px-2 py-0.5 flex justify-between items-center h-8 font-bold font-mono">
        <div className="flex gap-4 items-center">
            <span>Total MTM: <span className={totalMtM >= 0 ? 'text-green-600' : 'text-red-600'}>{totalMtM.toFixed(2)}</span></span>
        </div>

        {/* BULK ACTION BUTTON */}
        {selectedSymbols.length > 0 && (
            <button 
                onClick={handleExecuteSquareOff}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-[10px] rounded shadow flex items-center gap-1 animate-pulse"
            >
                <Zap size={10} fill="white" />
                SQUARE OFF ({selectedSymbols.length})
            </button>
        )}
      </div>
    </div>
  );
};

export default NetPositions;
import React, { useState } from 'react';
import { X, Zap } from 'lucide-react';

const NetPositions = ({ orders, marketData, onClose, onBulkSquareOff, isTerminalMode }) => {
  const [selectedSymbols, setSelectedSymbols] = useState([]);

  // --- 1. CONSOLIDATE TRADES (No Changes to Logic) ---
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
        if (selectedSymbols.includes(symbol)) {
            setSelectedSymbols(prev => prev.filter(s => s !== symbol));
        } else {
            setSelectedSymbols(prev => [...prev, symbol]);
        }
    } else {
        setSelectedSymbols([symbol]);
    }
  };

  const handleExecuteSquareOff = () => {
    const positionsToClose = rows.filter(r => selectedSymbols.includes(r.symbol) && r.netQty !== 0);
    onBulkSquareOff(positionsToClose);
    setSelectedSymbols([]); 
  };

  // --- 4. DYNAMIC STYLES (The Surgical Edit) ---
  const s = isTerminalMode ? {
      // TERMINAL MODE
      wrapper: "bg-black text-white font-mono text-[11px] h-full flex flex-col border border-gray-600 shadow-2xl",
      windowHeader: "drag-handle bg-[#d1d5db] text-black font-bold uppercase border-b border-gray-500 tracking-tight flex justify-between items-center px-2 py-1 h-7 cursor-move",
      closeBtn: "hover:bg-red-600 hover:text-white p-0.5 rounded transition-colors",
      
      tableContainer: "flex-1 overflow-auto bg-black custom-scrollbar",
      tableHead: "sticky top-0 bg-[#333] text-yellow-400 font-bold border-b border-gray-600",
      th: "border-r border-gray-700 px-2 py-1 text-right whitespace-nowrap",
      
      row: "border-b border-gray-800 hover:bg-[#222] cursor-pointer h-6 text-right",
      rowSelected: "bg-blue-900/60 text-white",
      
      cell: "px-2 border-r border-gray-800 text-right",
      cellSymbol: "px-2 border-r border-gray-800 text-left font-bold text-yellow-400",
      
      textProfit: "text-blue-400 font-bold", // Terminal uses Blue for Profit
      textLoss: "text-red-500 font-bold",
      
      footer: "bg-[#222] border-t border-gray-600 text-white px-2 py-1 flex justify-between items-center h-8 font-bold font-mono"
  } : {
      // MODERN MODE (Original Styles Preserved)
      wrapper: "bg-[#f0f0f0] shadow-2xl z-40 border border-gray-400 font-sans select-none text-xs flex flex-col h-full",
      windowHeader: "drag-handle bg-gradient-to-r from-blue-900 to-blue-700 text-white flex justify-between items-center px-2 py-1 h-7 cursor-move",
      closeBtn: "hover:bg-red-500 p-0.5 rounded",
      
      tableContainer: "flex-1 overflow-auto bg-white font-mono text-[11px]",
      tableHead: "sticky top-0 bg-gradient-to-b from-[#f0f0f0] to-[#d4d4d4] text-black font-semibold",
      th: "border-r border-b border-gray-400 px-2 py-1 text-right whitespace-nowrap",
      
      row: "border-b border-gray-200 cursor-pointer h-6 text-right hover:bg-blue-50 text-black",
      rowSelected: "bg-blue-600 text-white",
      
      cell: "px-2 border-r border-gray-300",
      cellSymbol: "px-2 border-r border-gray-300 text-left font-bold text-blue-800",
      
      textProfit: "text-green-600 font-bold",
      textLoss: "text-red-600 font-bold",
      
      footer: "bg-[#fcfdfe] border-t border-gray-300 px-2 py-0.5 flex justify-between items-center h-8 font-bold font-mono"
  };

  return (
    <div className={s.wrapper}>
      
      {/* HEADER */}
      <div className={s.windowHeader}>
        <span className="pointer-events-none">Net Positions - X14AD43 [FINDOC]</span>
        <button onClick={onClose} className={s.closeBtn}><X size={14}/></button>
      </div>

      {/* TABLE */}
      <div className={s.tableContainer}>
        <table className="w-full border-collapse">
          <thead className={s.tableHead}>
            <tr>
              {['Account', 'Symbol', 'Net Qty', 'LTP', 'MtM', 'Buy Qty', 'Buy Avg', 'Sell Qty', 'Sell Avg', 'Net Val'].map(h => (
                <th key={h} className={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isSelected = selectedSymbols.includes(row.symbol);
              
              // Helper for conditional styling
              const mtmColor = row.mtm >= 0 ? s.textProfit : s.textLoss;
              const netQtyColor = row.netQty > 0 ? s.textProfit : (row.netQty < 0 ? s.textLoss : 'opacity-50');

              return (
                <tr 
                    key={idx} 
                    onClick={(e) => handleRowClick(e, row.symbol)}
                    className={`${s.row} ${isSelected ? s.rowSelected : ''}`}
                >
                    <td className={`${s.cell} text-left`}>{row.account}</td>
                    
                    {/* Symbol needs specific handling for text color in Modern mode vs Terminal */}
                    <td className={isTerminalMode ? s.cellSymbol : (isSelected ? 'px-2 border-r border-gray-300 text-left font-bold' : s.cellSymbol)}>
                        {row.symbol}
                    </td>
                    
                    <td className={`${s.cell} font-bold ${!isSelected ? netQtyColor : ''}`}>
                        {row.netQty}
                    </td>
                    
                    <td className={s.cell}>{row.ltp.toFixed(2)}</td>
                    
                    <td className={`${s.cell} ${!isSelected ? mtmColor : ''}`}>
                        {row.mtm.toFixed(2)}
                    </td>

                    <td className={`${s.cell} ${!isSelected && !isTerminalMode ? 'text-blue-600' : ''}`}>{row.buyQty}</td>
                    <td className={s.cell}>{row.buyAvg.toFixed(2)}</td>
                    <td className={`${s.cell} ${!isSelected && !isTerminalMode ? 'text-red-600' : ''}`}>{row.sellQty}</td>
                    <td className={s.cell}>{row.sellAvg.toFixed(2)}</td>
                    <td className={s.cell}>{(row.netQty * row.ltp).toFixed(2)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
                <tr><td colSpan="10" className="text-center py-8 opacity-50 italic">No open positions.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER TOTALS & ACTIONS */}
      <div className={s.footer}>
        <div className="flex gap-4 items-center">
            <span>Total MTM: <span className={totalMtM >= 0 ? s.textProfit : s.textLoss}>{totalMtM.toFixed(2)}</span></span>
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
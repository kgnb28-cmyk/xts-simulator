import React from 'react';
import { X } from 'lucide-react';

const OrderBook = ({ orders, selectedOrderId, onSelectRow, onClose, isTerminalMode }) => {
  const openOrders = orders.filter(o => o.status === 'OPEN' || o.status === 'PENDING' || o.status === 'TRIGGER_PENDING');
  const completedOrders = orders.filter(o => o.status === 'COMPLETE' || o.status === 'REJECTED' || o.status === 'CANCELLED');

  // --- DYNAMIC STYLES ---
  const s = isTerminalMode ? {
      // TERMINAL MODE
      wrapper: "w-[950px] h-[500px] bg-black shadow-2xl z-40 border border-gray-600 font-mono select-none text-xs flex flex-col text-white",
      windowHeader: "drag-handle bg-[#d1d5db] text-black font-bold uppercase border-b border-gray-500 flex justify-between items-center px-2 py-1 h-7 cursor-move",
      closeBtn: "hover:bg-red-600 hover:text-white p-0.5 rounded transition-colors",
      
      sectionHeader: "bg-[#333] px-2 py-1 font-bold text-yellow-400 text-[11px] border-b border-gray-600 uppercase tracking-wider",
      
      tableContainer: "flex-1 overflow-auto bg-black custom-scrollbar",
      tableHead: "sticky top-0 bg-[#222] text-gray-300 font-bold border-b border-gray-600",
      th: "border-r border-gray-700 px-2 py-1 text-left whitespace-nowrap",
      
      row: "border-b border-gray-800 hover:bg-[#222] cursor-pointer text-gray-300",
      rowSelected: "bg-blue-900/60 text-white",
      
      cell: "px-2 py-0.5 border-r border-gray-800",
      cellSymbol: "px-2 py-0.5 border-r border-gray-800 font-bold text-yellow-400",
      cellSideBuy: "px-2 py-0.5 border-r border-gray-800 font-bold text-blue-400",
      cellSideSell: "px-2 py-0.5 border-r border-gray-800 font-bold text-red-500",
      
      statusComplete: "text-blue-400 font-bold", // Terminal uses Blue/Green for success
      statusPending: "text-white font-bold",
      statusRejected: "text-red-500 font-bold",
      
      footer: "bg-[#222] border-t border-gray-600 px-2 py-0.5 flex gap-4 text-[10px] text-gray-400 h-6 items-center font-mono"
  } : {
      // MODERN MODE (Original)
      wrapper: "w-[950px] h-[500px] bg-[#f0f0f0] shadow-2xl z-40 border border-gray-400 font-sans select-none text-xs flex flex-col",
      windowHeader: "drag-handle bg-gradient-to-r from-blue-900 to-blue-700 text-white flex justify-between items-center px-2 py-1 h-6 cursor-move",
      closeBtn: "hover:bg-red-500 p-0.5 rounded",
      
      sectionHeader: "bg-[#e0e0e0] px-2 py-1 font-bold text-gray-700 text-[11px] border-b border-gray-400",
      
      tableContainer: "flex-1 overflow-auto bg-white font-mono text-[11px]",
      tableHead: "sticky top-0 bg-gradient-to-b from-[#f0f0f0] to-[#d4d4d4] text-black font-semibold",
      th: "border-r border-b border-gray-400 px-2 py-1 text-left whitespace-nowrap",
      
      row: "border-b border-gray-200 cursor-pointer hover:bg-blue-50",
      rowSelected: "bg-blue-600 text-white",
      
      cell: "px-2 py-0.5 border-r border-gray-300",
      cellSymbol: "px-2 py-0.5 border-r border-gray-300 font-bold",
      cellSideBuy: "px-2 py-0.5 border-r border-gray-300 font-bold bg-blue-100 text-blue-800",
      cellSideSell: "px-2 py-0.5 border-r border-gray-300 font-bold bg-red-100 text-red-800",
      
      statusComplete: "text-green-600 font-bold",
      statusPending: "text-orange-500 font-bold",
      statusRejected: "text-red-600 font-bold",

      footer: "bg-[#fcfdfe] border-t border-gray-300 px-2 py-0.5 flex gap-4 text-[10px] text-gray-600 h-6 items-center font-mono"
  };

  return (
    <div className={s.wrapper}>
      
      {/* TITLE BAR */}
      <div className={s.windowHeader}>
        <span className="pointer-events-none">Order Book - X14AD43 [FINDOC]</span>
        <button onClick={onClose} className={s.closeBtn}><X size={14}/></button>
      </div>

      {/* OPEN ORDERS */}
      <div className={`flex-1 flex flex-col min-h-0 ${isTerminalMode ? 'border-b border-gray-600' : 'border-b-4 border-gray-300'}`}>
        <div className={s.sectionHeader}>Open Orders</div>
        <TableGrid data={openOrders} selectedId={selectedOrderId} onSelect={onSelectRow} s={s} isTerminalMode={isTerminalMode} />
      </div>

      {/* COMPLETED ORDERS */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className={s.sectionHeader}>Completed Orders</div>
        <TableGrid data={completedOrders} selectedId={selectedOrderId} onSelect={onSelectRow} isCompleted={true} s={s} isTerminalMode={isTerminalMode} />
      </div>

      {/* FOOTER */}
      <div className={s.footer}>
        <span className={isTerminalMode ? "text-yellow-400 font-bold" : "text-blue-600 font-bold"}>Hints:</span>
        <span>Select Row + Shift+F2 to Modify</span>
        <span>Select Row + Delete to Cancel</span>
        <span className="ml-auto">Count : {orders.length}</span>
      </div>
    </div>
  );
};

// Sub-component now accepts Styles (s) prop
const TableGrid = ({ data, isCompleted, selectedId, onSelect, s, isTerminalMode }) => (
  <div className={s.tableContainer}>
    <table className="w-full border-collapse">
      <thead className={s.tableHead}>
        <tr>
          {['Time', 'Exch Seg', 'Symbol', 'Side', 'Qty', 'Price', 'Status', 'Order Type', 'Trig Price'].map(h => (
            <th key={h} className={s.th}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => {
            const isSelected = selectedId === row.id;
            
            // Helper to determine Status Style
            let statusStyle = s.statusPending;
            if (row.status === 'COMPLETE') statusStyle = s.statusComplete;
            if (row.status === 'REJECTED' || row.status === 'CANCELLED') statusStyle = s.statusRejected;

            return (
              <tr 
                key={row.id} 
                onClick={() => onSelect(row.id)}
                className={`${s.row} ${isSelected ? s.rowSelected : ''}`}
              >
                <td className={s.cell}>{row.time}</td>
                <td className={s.cell}>NSEFO</td>
                
                {/* Symbol */}
                <td className={isTerminalMode ? s.cellSymbol : (isSelected ? 'px-2 py-0.5 border-r border-gray-300 font-bold' : 'px-2 py-0.5 border-r border-gray-300 font-bold')}>
                    {row.symbol}
                </td>
                
                {/* Side (Buy/Sell) */}
                <td className={isSelected ? s.cell : (row.side === 'BUY' ? s.cellSideBuy : s.cellSideSell)}>
                    {row.side}
                </td>
                
                <td className={`${s.cell} font-bold`}>{row.qty}</td>
                <td className={s.cell}>{row.price}</td>
                
                {/* Status */}
                <td className={`${s.cell} ${!isSelected ? statusStyle : ''}`}>
                    {row.status}
                </td>
                
                <td className={s.cell}>{row.type}</td>
                <td className={s.cell}>{row.trigPrice > 0 ? row.trigPrice : '-'}</td>
              </tr>
            );
        })}
      </tbody>
    </table>
    {data.length === 0 && <div className="p-4 text-center opacity-50 italic">No orders available</div>}
  </div>
);

export default OrderBook;
import React from 'react';
import { X } from 'lucide-react';

const OrderBook = ({ orders, selectedOrderId, onSelectRow, onClose }) => {
  const openOrders = orders.filter(o => o.status === 'OPEN' || o.status === 'PENDING' || o.status === 'TRIGGER_PENDING');
  const completedOrders = orders.filter(o => o.status === 'COMPLETE' || o.status === 'REJECTED' || o.status === 'CANCELLED');

  return (
    <div className="w-[950px] h-[500px] bg-[#f0f0f0] shadow-2xl z-40 border border-gray-400 font-sans select-none text-xs flex flex-col">
      
      {/* TITLE BAR */}
      <div className="drag-handle bg-gradient-to-r from-blue-900 to-blue-700 text-white flex justify-between items-center px-2 py-1 h-6 cursor-move">
        <span className="font-bold pointer-events-none">Order Book - X14AD43 [FINDOC]</span>
        <button onClick={onClose} className="hover:bg-red-500 p-0.5 rounded"><X size={14}/></button>
      </div>

      {/* OPEN ORDERS */}
      <div className="flex-1 flex flex-col border-b-4 border-gray-300 min-h-0">
        <div className="bg-[#e0e0e0] px-2 py-1 font-bold text-gray-700 text-[11px] border-b border-gray-400">Open Orders</div>
        <TableGrid data={openOrders} selectedId={selectedOrderId} onSelect={onSelectRow} />
      </div>

      {/* COMPLETED ORDERS */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-[#e0e0e0] px-2 py-1 font-bold text-gray-700 text-[11px] border-b border-gray-400">Completed Orders</div>
        <TableGrid data={completedOrders} selectedId={selectedOrderId} onSelect={onSelectRow} isCompleted={true} />
      </div>

      {/* FOOTER */}
      <div className="bg-[#fcfdfe] border-t border-gray-300 px-2 py-0.5 flex gap-4 text-[10px] text-gray-600 h-6 items-center font-mono">
        <span className="text-blue-600 font-bold">Hints:</span>
        <span>Select Row + Shift+F2 to Modify</span>
        <span>Select Row + Delete to Cancel</span>
        <span className="ml-auto">Count : {orders.length}</span>
      </div>
    </div>
  );
};

const TableGrid = ({ data, isCompleted, selectedId, onSelect }) => (
  <div className="flex-1 overflow-auto bg-white font-mono text-[11px]">
    <table className="w-full border-collapse">
      <thead className="sticky top-0 bg-gradient-to-b from-[#f0f0f0] to-[#d4d4d4] text-black font-semibold">
        <tr>
          {['Time', 'Exch Seg', 'Symbol', 'Side', 'Qty', 'Price', 'Status', 'Order Type', 'Trig Price'].map(h => (
            <th key={h} className="border-r border-b border-gray-400 px-2 py-1 text-left whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr 
            key={row.id} 
            onClick={() => onSelect(row.id)}
            className={`border-b border-gray-200 cursor-pointer 
                ${selectedId === row.id ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'} 
                ${selectedId !== row.id && (row.side === 'BUY' ? 'text-blue-800' : 'text-red-800')}
            `}
          >
            <td className="px-2 py-0.5 border-r border-gray-300">{row.time}</td>
            <td className="px-2 py-0.5 border-r border-gray-300">NSEFO</td>
            <td className="px-2 py-0.5 border-r border-gray-300 font-bold">{row.symbol}</td>
            <td className={`px-2 py-0.5 border-r border-gray-300 font-bold ${selectedId === row.id ? 'text-white' : (row.side === 'BUY' ? 'bg-blue-100' : 'bg-red-100')}`}>{row.side}</td>
            <td className="px-2 py-0.5 border-r border-gray-300 font-bold">{row.qty}</td>
            <td className="px-2 py-0.5 border-r border-gray-300">{row.price}</td>
            <td className={`px-2 py-0.5 border-r border-gray-300 font-bold ${selectedId === row.id ? 'text-white' : (isCompleted ? 'text-green-600' : 'text-orange-500')}`}>{row.status}</td>
            <td className="px-2 py-0.5 border-r border-gray-300">{row.type}</td>
            <td className="px-2 py-0.5 border-r border-gray-300">{row.trigPrice > 0 ? row.trigPrice : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
    {data.length === 0 && <div className="p-4 text-center text-gray-400 italic">No orders available</div>}
  </div>
);

export default OrderBook;
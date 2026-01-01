import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Connect to Backend
const socket = io('http://localhost:5000');

export default function MarketWatch({ onSelectRow, onDataUpdate }) {
  const [selectedId, setSelectedId] = useState(null);
  const [marketData, setMarketData] = useState([]); 

  useEffect(() => {
    socket.on('market-tick', (newData) => {
        setMarketData(newData);
        if (onDataUpdate) onDataUpdate(newData);
    });
    return () => { socket.off('market-tick'); };
  }, [onDataUpdate]);

  return (
    <div className="flex-1 flex flex-col bg-black text-white font-mono text-[11px] h-full overflow-hidden select-none cursor-default">
      
      {/* GRID HEADER */}
      <div className="flex bg-gradient-to-b from-[#f0f0f0] to-[#d4d4d4] text-black border-b border-gray-500 font-semibold h-6 items-center">
        {[
          { w: 'w-12', label: 'Exchange' },
          { w: 'w-16', label: 'Token No' },
          { w: 'w-20', label: 'U/L Asset' },
          { w: 'w-24', label: 'Symbol' },
          { w: 'w-16', label: 'Instr' },
          { w: 'w-12', label: 'Series' },
          { w: 'w-20', label: 'Expiry Date' },
          { w: 'w-16', label: 'Strike' },
          { w: 'w-12', label: 'Opt Type' },
          { w: 'w-12', label: 'Best Buy', align: 'text-right' },
          { w: 'w-16', label: 'Best Buy', align: 'text-right' },
          { w: 'w-16', label: 'Best Sell', align: 'text-right' },
          { w: 'w-12', label: 'Best Sell', align: 'text-right' },
          { w: 'w-16', label: 'LTP', align: 'text-right' },
          { w: 'w-8', label: 'Ind', align: 'text-center' },
          { w: 'w-14', label: '% Change', align: 'text-right' },
          { w: 'w-14', label: 'ATP', align: 'text-right' },
          { w: 'w-14', label: 'Open', align: 'text-right' },
          { w: 'w-14', label: 'High', align: 'text-right' },
          { w: 'w-14', label: 'Low', align: 'text-right' },
          { w: 'w-14', label: 'Prev Cl...', align: 'text-right' },
          { w: 'w-20', label: 'Vol', align: 'text-right' },
        ].map((col, idx) => (
          <div key={idx} className={`${col.w} px-1 border-r border-gray-400 py-0.5 whitespace-nowrap overflow-hidden text-ellipsis ${col.align || 'text-left'}`}>
            {col.label}
          </div>
        ))}
      </div>

      {/* DATA ROWS */}
      <div className="overflow-y-auto bg-black">
        {marketData.map((row) => {
          const isSelected = selectedId === row.id;
          return (
            <div 
              key={row.id}
              onClick={() => {
                setSelectedId(row.id);
                if (onSelectRow) onSelectRow(row);
              }}
              className={`flex items-center border-b border-[#222] h-5 hover:bg-[#333] ${isSelected ? 'bg-[#000080] text-white' : ''}`}
            >
              <div className="w-12 px-1 border-r border-[#333]">{row.exchange}</div>
              <div className="w-16 px-1 border-r border-[#333]">{row.token}</div>
              <div className="w-20 px-1 border-r border-[#333] truncate">{row.ul}</div>
              <div className={`w-24 px-1 border-r border-[#333] font-bold ${isSelected ? 'text-white' : 'text-[#ffff00]'}`}>{row.symbol}</div>
              <div className="w-16 px-1 border-r border-[#333]">{row.instr}</div>
              <div className="w-12 px-1 border-r border-[#333]">{row.series}</div>
              <div className="w-20 px-1 border-r border-[#333]">{row.expiry}</div>
              <div className="w-16 px-1 border-r border-[#333] text-right">{row.strike}</div>
              <div className="w-12 px-1 border-r border-[#333] text-center">{row.type}</div>

              {/* [SAFETY FIX] Wrapped all .toFixed calls in Number() */}
              <div className="w-12 px-1 border-r border-[#333] text-right font-bold bg-[#0000ff] text-white">{row.bQty}</div>
              <div className="w-16 px-1 border-r border-[#333] text-right font-bold bg-[#0000ff] text-white">{Number(row.bPrice).toFixed(2)}</div>
              
              <div className="w-16 px-1 border-r border-[#333] text-right font-bold bg-[#ff0000] text-white">{Number(row.sPrice).toFixed(2)}</div>
              <div className="w-12 px-1 border-r border-[#333] text-right font-bold bg-[#ff0000] text-white">{row.sQty}</div>

              <div className={`w-16 px-1 border-r border-[#333] text-right font-bold ${row.change < 0 ? 'bg-[#ff0000]' : 'bg-[#0000ff]'} text-white`}>
                {Number(row.ltp).toFixed(2)}
              </div>

              <div className="w-8 px-1 border-r border-[#333] text-center text-[9px]">{row.change < 0 ? '▼' : '▲'}</div>

              <div className={`w-14 px-1 border-r border-[#333] text-right ${isSelected ? 'text-white' : (row.change < 0 ? 'bg-[#ff0000] text-white' : 'text-green-500')}`}>
                 {row.change}%
              </div>
              
              <div className="w-14 px-1 border-r border-[#333] text-right">{row.atp}</div>
              <div className="w-14 px-1 border-r border-[#333] text-right">{row.open}</div>
              <div className="w-14 px-1 border-r border-[#333] text-right">{row.high}</div>
              <div className="w-14 px-1 border-r border-[#333] text-right">{row.low}</div>
              <div className="w-14 px-1 border-r border-[#333] text-right">{row.prev}</div>
              <div className="w-20 px-1 border-r border-[#333] text-right">{row.vol}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
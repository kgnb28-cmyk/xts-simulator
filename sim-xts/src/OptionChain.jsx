import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, TrendingUp, Activity, X, Search } from 'lucide-react';

const OptionChain = ({ isTerminalMode, onTrade, onClose }) => {
  
  // --- STATE ---
  const [activeSymbol, setActiveSymbol] = useState('NIFTY');
  const [spotPrice, setSpotPrice] = useState(24550);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);

  // --- MOCK LOGIC TO HANDLE SCRIP CHANGE ---
  // In a real app, this would fetch the spot price from your API
  const handleSearch = (e) => {
      if (e.key === 'Enter') {
          const query = searchTerm.toUpperCase();
          let newSpot = 24550; // Default Nifty
          let newSym = query;

          if (query.includes('BANK')) { newSpot = 48200; newSym = 'BANKNIFTY'; }
          else if (query.includes('FIN')) { newSpot = 21450; newSym = 'FINNIFTY'; }
          else if (query.includes('REL')) { newSpot = 2850; newSym = 'RELIANCE'; }
          else if (query.includes('HDFC')) { newSpot = 1650; newSym = 'HDFCBANK'; }
          else if (query.includes('TATA')) { newSpot = 3400; newSym = 'TCS'; }
          
          setActiveSymbol(newSym);
          setSpotPrice(newSpot);
          setData(generateStrikes(newSpot)); // Regenerate Chain
      }
  };

  // --- MOCK DATA GENERATOR (Dynamic based on Spot) ---
  const generateStrikes = (center) => {
    let strikes = [];
    const step = center > 20000 ? 50 : (center > 2000 ? 20 : 10); // Adjust Strike Gap based on price
    const roundedCenter = Math.round(center / step) * step;

    for (let i = -6; i <= 6; i++) {
        const strike = roundedCenter + (i * step);
        const dist = (i * step); // Distance from ATM
        
        // Realistic Pricing Simulation
        // Calls are expensive below spot (ITM), cheap above (OTM)
        const callIntrinsic = Math.max(0, center - strike);
        const putIntrinsic = Math.max(0, strike - center);
        const timeValue = (400 - Math.abs(dist) * 0.5) * (center / 24000); // Rough decay logic

        strikes.push({
            strike: strike,
            ce: { 
                ltp: (callIntrinsic + Math.max(10, timeValue) + Math.random()*2).toFixed(2), 
                change: (Math.random() * 20 - 10).toFixed(1),
                oi: Math.floor(Math.random() * 500000), 
                vol: Math.floor(Math.random() * 100000) 
            },
            pe: { 
                ltp: (putIntrinsic + Math.max(10, timeValue) + Math.random()*2).toFixed(2), 
                change: (Math.random() * 20 - 10).toFixed(1),
                oi: Math.floor(Math.random() * 600000), 
                vol: Math.floor(Math.random() * 100000) 
            }
        });
    }
    return strikes;
  };

  const [data, setData] = useState(generateStrikes(spotPrice));
  const maxOI = Math.max(...data.map(d => Math.max(d.ce.oi, d.pe.oi))); 

  // Live Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setData(prev => prev.map(row => ({
            ...row,
            ce: { ...row.ce, ltp: (parseFloat(row.ce.ltp) + (Math.random()-0.5)).toFixed(2) },
            pe: { ...row.pe, ltp: (parseFloat(row.pe.ltp) + (Math.random()-0.5)).toFixed(2) }
        })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- STYLES ---
  const s = isTerminalMode ? {
      wrapper: "bg-black text-white font-mono text-[10px] h-full flex flex-col border border-gray-800",
      windowHeader: "drag-handle bg-[#d1d5db] text-black font-bold uppercase border-b border-gray-500 tracking-tight flex justify-between items-center px-2 py-1 h-8 cursor-move",
      searchInput: "bg-white text-black border border-gray-400 h-6 px-2 text-xs font-bold w-32 focus:outline-none uppercase placeholder:text-gray-400",
      closeBtn: "hover:bg-black/10 p-0.5 rounded transition-colors",
      container: "flex-1 overflow-hidden flex flex-col",
      header: "bg-[#333] text-yellow-400 font-bold border-b border-gray-600 grid grid-cols-11 text-center py-1 uppercase tracking-wider",
      row: "grid grid-cols-11 border-b border-gray-800 hover:bg-[#222] items-center text-center h-8",
      strike: "bg-[#1a1a1a] text-yellow-400 font-bold border-x border-gray-700 h-full flex items-center justify-center",
      cell: "h-full flex items-center justify-center relative",
      ltpUp: "text-blue-400 font-bold",
      ltpDown: "text-red-500 font-bold",
      spotLine: "bg-yellow-600/30 border-y border-yellow-500/50 text-yellow-200 font-bold",
      barCall: "bg-red-900/40 absolute top-1 bottom-1 right-0 transition-all duration-500",
      barPut: "bg-green-900/40 absolute top-1 bottom-1 left-0 transition-all duration-500",
      footer: "bg-black border-t border-gray-800 text-gray-500"
  } : {
      wrapper: "bg-white text-gray-800 font-sans text-xs h-full flex flex-col border border-gray-200 shadow-sm",
      windowHeader: "drag-handle bg-gray-50 text-gray-700 font-bold uppercase border-b border-gray-200 flex justify-between items-center px-2 py-1 h-9 cursor-move",
      searchInput: "bg-white text-gray-800 border border-gray-200 h-7 px-2 text-xs w-32 focus:outline-none focus:border-indigo-500 rounded uppercase",
      closeBtn: "hover:bg-gray-200 p-0.5 rounded transition-colors",
      container: "flex-1 overflow-hidden flex flex-col",
      header: "bg-gray-50 text-gray-500 font-bold border-b border-gray-200 grid grid-cols-11 text-center py-2 uppercase",
      row: "grid grid-cols-11 border-b border-gray-100 hover:bg-blue-50/50 items-center text-center h-10",
      strike: "bg-gray-50 text-gray-800 font-bold border-x border-gray-200 h-full flex items-center justify-center",
      cell: "h-full flex items-center justify-center relative",
      ltpUp: "text-green-600 font-bold",
      ltpDown: "text-red-600 font-bold",
      spotLine: "bg-yellow-50 border-y border-yellow-200 text-yellow-700 font-bold",
      barCall: "bg-red-100 absolute top-1 bottom-1 right-0 z-0",
      barPut: "bg-green-100 absolute top-1 bottom-1 left-0 z-0",
      footer: "bg-gray-50 border-t border-gray-200 text-gray-400"
  };

  return (
    <div className={s.wrapper}>
        {/* HEADER WITH SEARCH */}
        <div className={s.windowHeader}>
            <div className="flex items-center gap-2">
                <span>CHAIN: {activeSymbol}</span>
                <div className="relative">
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        placeholder="SEARCH..." 
                        className={s.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                    <Search size={10} className="absolute right-1 top-2 text-gray-400 pointer-events-none"/>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <span className="text-[10px] opacity-60">SPOT: {spotPrice}</span>
                <button onClick={onClose} className={s.closeBtn}>
                    <X size={14} />
                </button>
            </div>
        </div>

        <div className={s.container}>
            {/* COLUMN HEADERS */}
            <div className={s.header}>
                <div className="col-span-1">OI</div>
                <div className="col-span-1 hidden lg:block">Vol</div>
                <div className="col-span-1">Chg%</div>
                <div className="col-span-1">LTP</div>
                <div className="col-span-1">B/A</div>
                
                <div className="col-span-1 bg-gray-700/50 text-white">STRIKE</div>
                
                <div className="col-span-1">B/A</div>
                <div className="col-span-1">LTP</div>
                <div className="col-span-1">Chg%</div>
                <div className="col-span-1 hidden lg:block">Vol</div>
                <div className="col-span-1">OI</div>
            </div>

            {/* DATA GRID */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {data.map((row, i) => {
                    const isSpot = Math.abs(row.strike - spotPrice) < (spotPrice > 20000 ? 25 : 10);

                    return (
                        <React.Fragment key={i}>
                            {/* SPOT INDICATOR */}
                            {isSpot && (
                                <div className={`text-center py-0.5 text-[9px] tracking-widest ${s.spotLine}`}>
                                    SPOT: {spotPrice}
                                </div>
                            )}

                            <div className={`group ${s.row}`}>
                                {/* CALL SIDE */}
                                <div className={s.cell}>
                                    <div className={s.barCall} style={{ width: `${(row.ce.oi / maxOI) * 100}%` }}></div>
                                    <span className="z-10 relative">{(row.ce.oi / 1000).toFixed(1)}k</span>
                                </div>
                                <div className={`${s.cell} hidden lg:flex opacity-60`}>{(row.ce.vol / 1000).toFixed(0)}k</div>
                                <div className={`${s.cell} ${parseFloat(row.ce.change) >= 0 ? s.ltpUp : s.ltpDown}`}>{row.ce.change}%</div>

                                {/* LTP with Action Buttons */}
                                <div className={`${s.cell} cursor-pointer hover:bg-blue-900/20 group/cell`}>
                                    <span className="group-hover/cell:hidden">{row.ce.ltp}</span>
                                    <div className="hidden group-hover/cell:flex gap-1 z-20">
                                        <button className="bg-blue-600 text-white px-1.5 rounded text-[9px] font-bold">B</button>
                                        <button className="bg-red-500 text-white px-1.5 rounded text-[9px] font-bold">S</button>
                                    </div>
                                </div>

                                <div className={`${s.cell} opacity-50 text-[9px]`}>145.10</div>

                                {/* STRIKE */}
                                <div className={s.strike}>{row.strike}</div>

                                {/* PUT SIDE */}
                                <div className={`${s.cell} opacity-50 text-[9px]`}>145.10</div>
                                
                                <div className={`${s.cell} cursor-pointer hover:bg-blue-900/20 group/cell`}>
                                    <span className="group-hover/cell:hidden">{row.pe.ltp}</span>
                                    <div className="hidden group-hover/cell:flex gap-1 z-20">
                                        <button className="bg-blue-600 text-white px-1.5 rounded text-[9px] font-bold">B</button>
                                        <button className="bg-red-500 text-white px-1.5 rounded text-[9px] font-bold">S</button>
                                    </div>
                                </div>

                                <div className={`${s.cell} ${parseFloat(row.pe.change) >= 0 ? s.ltpUp : s.ltpDown}`}>{row.pe.change}%</div>
                                <div className={`${s.cell} hidden lg:flex opacity-60`}>{(row.pe.vol / 1000).toFixed(0)}k</div>

                                <div className={s.cell}>
                                    <div className={s.barPut} style={{ width: `${(row.pe.oi / maxOI) * 100}%` }}></div>
                                    <span className="z-10 relative">{(row.pe.oi / 1000).toFixed(1)}k</span>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
            
            {/* FOOTER */}
            <div className={`px-2 py-1 flex justify-between ${s.footer}`}>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><Activity size={12}/> PCR: 0.95 (Bearish)</span>
                    <span className="flex items-center gap-1"><TrendingUp size={12}/> Max Pain: {spotPrice}</span>
                </div>
                <div>EXP: 26 JAN</div>
            </div>
        </div>
    </div>
  );
};

export default OptionChain;
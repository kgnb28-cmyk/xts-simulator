import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, Search, Plus, X, Activity, TrendingUp } from 'lucide-react';

// --- MOCK MASTER DATABASE ---
const MASTER_SCRIPS = [
  { symbol: 'NIFTY 26JAN FUT', exchange: 'NSEFO', lotSize: 50, ltp: 24550.00, type: 'FUT' },
  { symbol: 'BANKNIFTY 26JAN FUT', exchange: 'NSEFO', lotSize: 15, ltp: 48200.00, type: 'FUT' },
  { symbol: 'RELIANCE EQ', exchange: 'NSE', lotSize: 1, ltp: 2850.50, type: 'EQ' },
  { symbol: 'HDFCBANK EQ', exchange: 'NSE', lotSize: 1, ltp: 1650.00, type: 'EQ' },
  { symbol: 'NIFTY 24500 CE', exchange: 'NSEFO', lotSize: 50, ltp: 145.20, type: 'OPT' },
  { symbol: 'NIFTY 24500 PE', exchange: 'NSEFO', lotSize: 50, ltp: 110.50, type: 'OPT' },
  { symbol: 'BANKNIFTY 48000 CE', exchange: 'NSEFO', lotSize: 15, ltp: 320.00, type: 'OPT' },
  { symbol: 'RELIANCE 2800 CE', exchange: 'NSEFO', lotSize: 250, ltp: 55.00, type: 'OPT' },
  { symbol: 'FINNIFTY 21000 PE', exchange: 'NSEFO', lotSize: 65, ltp: 45.00, type: 'OPT' },
];

// 1. ACCEPT THE PROP HERE
const MarketWatch = ({ onSelectRow, onDataUpdate, isTerminalMode }) => {
  
  const [watchlist, setWatchlist] = useState([
    { id: 1, symbol: 'NIFTY 24500 CE', ltp: 145.20, change: 12.5, bidQty: 500, bid: 145.10, ask: 145.25, askQty: 1200, vol: '1.2M', oi: '45L' },
    { id: 2, symbol: 'BANKNIFTY FUT', ltp: 48200.00, change: -150.00, bidQty: 25, bid: 48198.00, ask: 48202.00, askQty: 50, vol: '500K', oi: '12L' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  // SMART SEARCH LOGIC
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    const filtered = MASTER_SCRIPS.filter(scrip => 
      scrip.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5); 
    setSearchResults(filtered);
    setSelectedIndex(0);
  }, [searchTerm]);

  // KEYBOARD NAVIGATION
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter' && searchResults.length > 0) {
      addToWatchlist(searchResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      setSearchTerm('');
      setIsSearchOpen(false);
    }
  };

  const addToWatchlist = (scrip) => {
    if (watchlist.some(item => item.symbol === scrip.symbol)) {
        setSearchTerm('');
        setIsSearchOpen(false);
        return;
    }
    const newRow = {
        id: Date.now(),
        symbol: scrip.symbol,
        ltp: scrip.ltp,
        change: 0.00,
        bidQty: scrip.lotSize * 5,
        bid: scrip.ltp - 0.05,
        ask: scrip.ltp + 0.05,
        askQty: scrip.lotSize * 2,
        vol: '0',
        oi: '-'
    };
    setWatchlist(prev => [newRow, ...prev]);
    setSearchTerm('');
    setIsSearchOpen(false);
  };

  // SIMULATION ENGINE
  useEffect(() => {
    const interval = setInterval(() => {
      setWatchlist(prev => prev.map(item => {
        const move = (Math.random() - 0.5) * 1.5;
        const newLtp = parseFloat((item.ltp + move).toFixed(2));
        return { 
            ...item, 
            ltp: newLtp,
            bid: parseFloat((newLtp - 0.05).toFixed(2)),
            ask: parseFloat((newLtp + 0.05).toFixed(2)),
            change: parseFloat((move * 10).toFixed(2)) 
        };
      }));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if(onDataUpdate) onDataUpdate(watchlist);
  }, [watchlist, onDataUpdate]);

  // --- 2. DYNAMIC STYLING SYSTEM (The Surgical Part) ---
  const styles = isTerminalMode ? {
      // TERMINAL MODE (Retro/Matrix)
      container: "bg-black text-green-400 font-mono text-xs border-r border-gray-800",
      searchContainer: "border-b border-gray-800 bg-black",
      searchInput: "bg-[#111] border-gray-800 text-green-400 placeholder:text-gray-600 focus:border-green-600 focus:bg-black",
      dropdown: "bg-[#111] border-gray-700 text-green-400",
      dropdownHover: "bg-green-900/30 text-green-300",
      header: "bg-[#0a0a0a] border-b border-gray-800 text-green-600 font-bold uppercase tracking-wider",
      row: "border-b border-gray-900 hover:bg-[#151515] text-gray-300",
      symbol: "text-yellow-500 font-bold",
      bid: "text-blue-400",
      ask: "text-red-500",
      dimText: "opacity-60",
      bottomBar: "bg-black border-t border-gray-800 text-green-700",
      btnBuy: "bg-blue-900/50 border border-blue-600 text-blue-200 hover:bg-blue-800",
      btnSell: "bg-red-900/50 border border-red-600 text-red-200 hover:bg-red-800"
  } : {
      // MODERN MODE (Clean/White)
      container: "bg-white text-gray-800 font-sans text-xs",
      searchContainer: "border-b border-gray-200 bg-white",
      searchInput: "bg-gray-50 border-gray-200 text-gray-800 focus:border-indigo-500 focus:bg-white placeholder:text-gray-400",
      dropdown: "bg-white border-gray-200 text-gray-800",
      dropdownHover: "bg-indigo-50 text-indigo-700",
      header: "bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider",
      row: "border-b border-gray-100 hover:bg-indigo-50/50 text-gray-800",
      symbol: "text-gray-800 font-bold",
      bid: "text-gray-700",
      ask: "text-gray-700",
      dimText: "text-gray-400",
      bottomBar: "bg-white border-t border-gray-200 text-gray-400",
      btnBuy: "bg-blue-600 text-white hover:bg-blue-700",
      btnSell: "bg-red-500 text-white hover:bg-red-600"
  };

  return (
    <div className={`flex flex-col h-full relative transition-colors duration-300 ${styles.container}`}>
      
      {/* --- SEARCH BAR SECTION --- */}
      <div className={`p-2 sticky top-0 z-20 ${styles.searchContainer}`}>
        <div className="relative">
            <Search className={`absolute left-3 top-2.5 ${styles.dimText}`} size={14} />
            <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search & Add (e.g. Nifty, Rel 2500)" 
                className={`w-full pl-9 pr-8 py-2 rounded-lg focus:outline-none border transition-all text-xs font-medium uppercase placeholder:normal-case ${styles.searchInput}`}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setIsSearchOpen(true); }}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsSearchOpen(true)}
            />
            {searchTerm && (
                <button onClick={() => setSearchTerm('')} className={`absolute right-2 top-2.5 hover:opacity-75 ${styles.dimText}`}>
                    <X size={14} />
                </button>
            )}

            {/* DROPDOWN RESULTS */}
            {isSearchOpen && searchResults.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-xl overflow-hidden z-30 ${styles.dropdown}`}>
                    {searchResults.map((result, idx) => (
                        <div 
                            key={idx}
                            onClick={() => addToWatchlist(result)}
                            className={`flex justify-between items-center px-4 py-2 cursor-pointer transition-colors ${idx === selectedIndex ? styles.dropdownHover : ''}`}
                        >
                            <div className="flex flex-col">
                                <span className="font-bold text-xs">{result.symbol}</span>
                                <span className={`text-[9px] ${styles.dimText}`}>{result.exchange} • Lot: {result.lotSize}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs">{result.ltp.toFixed(2)}</span>
                                <Plus size={14} className={styles.dimText} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* --- WATCHLIST HEADER --- */}
      <div className={`grid grid-cols-10 py-2 px-4 z-10 ${styles.header}`}>
        <div className="col-span-3 text-left">Script</div>
        <div className="col-span-1 text-right">LTP</div>
        <div className={`col-span-1 text-right ${isTerminalMode ? 'text-blue-400' : 'text-green-600'}`}>Bid</div>
        <div className={`col-span-1 text-right ${isTerminalMode ? 'text-red-500' : 'text-red-500'}`}>Ask</div>
        <div className={`col-span-1 text-right hidden lg:block ${styles.dimText}`}>Vol</div>
        <div className={`col-span-1 text-right hidden lg:block ${styles.dimText}`}>OI</div>
        <div className="col-span-1 text-right">% Chg</div>
        <div className="col-span-1 text-center">Action</div>
      </div>

      {/* --- WATCHLIST ROWS --- */}
      <div className="flex-1 overflow-y-auto">
        {watchlist.map((row) => (
          <div 
            key={row.id} 
            onClick={() => onSelectRow(row)}
            className={`group grid grid-cols-10 border-b cursor-pointer transition-colors items-center py-3 px-4 ${styles.row}`}
          >
            {/* Symbol Name */}
            <div className="col-span-3 flex flex-col justify-center">
                <span className={`text-sm ${styles.symbol}`}>{row.symbol}</span>
                <span className={`text-[10px] flex items-center gap-1 ${styles.dimText}`}>
                   NSE <span className={`w-1 h-1 rounded-full ${isTerminalMode ? 'bg-gray-600' : 'bg-gray-300'}`}></span> FO
                </span>
            </div>

            {/* LTP */}
            <div className={`col-span-1 text-right font-bold text-sm ${row.change >= 0 ? (isTerminalMode ? 'text-green-400' : 'text-green-600') : 'text-red-600'}`}>
              {row.ltp.toFixed(2)}
            </div>

            {/* BID */}
            <div className={`col-span-1 text-right ${styles.bid}`}>
                <div className="font-medium">{row.bid.toFixed(2)}</div>
                <div className={`text-[10px] ${styles.dimText}`}>{row.bidQty}</div>
            </div>

            {/* ASK */}
            <div className={`col-span-1 text-right ${styles.ask}`}>
                <div className="font-medium">{row.ask.toFixed(2)}</div>
                <div className={`text-[10px] ${styles.dimText}`}>{row.askQty}</div>
            </div>

            {/* VOLUME */}
            <div className={`col-span-1 text-right hidden lg:block font-mono ${styles.dimText}`}>
                {row.vol}
            </div>

            {/* OI */}
            <div className={`col-span-1 text-right hidden lg:block font-mono ${styles.dimText}`}>
                {row.oi}
            </div>

            {/* CHANGE % */}
            <div className="col-span-1 text-right flex items-center justify-end gap-1">
                {row.change >= 0 ? 
                    <ArrowUp size={12} className={isTerminalMode ? "text-green-400" : "text-green-600"} /> : 
                    <ArrowDown size={12} className="text-red-600" />
                }
                <span className={`${row.change >= 0 ? (isTerminalMode ? 'text-green-400' : 'text-green-600') : 'text-red-600'} font-bold`}>{row.change}%</span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="col-span-1 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className={`w-6 h-6 rounded flex items-center justify-center font-bold shadow-sm text-[10px] ${styles.btnBuy}`}>B</button>
                <button className={`w-6 h-6 rounded flex items-center justify-center font-bold shadow-sm text-[10px] ${styles.btnSell}`}>S</button>
            </div>

          </div>
        ))}
      </div>
      
      {/* BOTTOM BAR */}
      <div className={`p-2 flex justify-between items-center text-[10px] ${styles.bottomBar}`}>
         <div className="flex gap-4">
             <span className="flex items-center gap-1"><Activity size={10} /> Market Status: OPEN</span>
             <span className="flex items-center gap-1"><TrendingUp size={10} /> VIX: 13.45 (+1.2%)</span>
         </div>
         <div>Real-Time Simulation</div>
      </div>

    </div>
  );
};

export default MarketWatch;
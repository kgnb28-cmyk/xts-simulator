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

  // --- 2. DYNAMIC STYLING SYSTEM (The True "Terminal Mode") ---
  const styles = isTerminalMode ? {
      // TERMINAL MODE (High Contrast / Matrix / ODIN Style)
      container: "bg-black text-white font-mono text-[11px] h-full border-r border-gray-800",
      
      // Header: Silver Background, Black Text, Sharp Borders
      header: "bg-[#d1d5db] text-black font-bold uppercase border-b border-gray-500 tracking-tight",
      
      // Rows: Black BG, White Text, Grid Lines
      row: "bg-black border-b border-gray-800 hover:bg-[#222] text-white cursor-pointer",
      
      // Specific Columns
      symbol: "text-yellow-400 font-bold", // Yellow Symbol
      bid: "bg-[#9333ea] text-white font-bold", // Purple Bid BG
      ask: "bg-[#dc2626] text-white font-bold", // Red Ask BG
      ltpUp: "text-green-400 font-bold",
      ltpDown: "text-red-500 font-bold",
      
      // Search Bar
      searchContainer: "bg-[#1a1a1a] border-b border-gray-700 p-1",
      searchInput: "bg-black border border-gray-600 text-yellow-400 placeholder:text-gray-600 h-8 text-xs focus:outline-none focus:border-yellow-500",
      dropdown: "bg-[#222] border-gray-600 text-white",
      dropdownHover: "bg-blue-900",

      // Grid Cells (Added border-r for grid effect)
      cell: "border-r border-gray-800 px-2 py-1 truncate h-8 flex items-center justify-end",
      cellLeft: "border-r border-gray-800 px-2 py-1 truncate h-8 flex items-center justify-start",
      
      dimText: "opacity-70",
      bottomBar: "bg-[#333] border-t border-gray-600 text-white p-1",
      btnBuy: "bg-blue-700 text-white border border-blue-500 hover:bg-blue-600",
      btnSell: "bg-red-700 text-white border border-red-500 hover:bg-red-600"
  } : {
      // MODERN MODE (Clean/White/Airy)
      container: "bg-white text-gray-800 font-sans text-xs h-full",
      header: "bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider",
      row: "bg-white border-b border-gray-100 hover:bg-indigo-50/50 text-gray-800 cursor-pointer",
      
      symbol: "text-gray-800 font-bold",
      bid: "text-gray-700",
      ask: "text-gray-700",
      ltpUp: "text-green-600 font-bold",
      ltpDown: "text-red-600 font-bold",
      
      searchContainer: "bg-white border-b border-gray-200 p-2",
      searchInput: "bg-gray-50 border-gray-200 text-gray-800 focus:border-indigo-500 focus:bg-white placeholder:text-gray-400 h-9 rounded-lg",
      dropdown: "bg-white border-gray-200 text-gray-800",
      dropdownHover: "bg-indigo-50 text-indigo-700",

      cell: "px-2 py-3 flex items-center justify-end",
      cellLeft: "px-2 py-3 flex items-center justify-start",
      
      dimText: "text-gray-400",
      bottomBar: "bg-white border-t border-gray-200 text-gray-400 p-2",
      btnBuy: "bg-blue-600 text-white hover:bg-blue-700",
      btnSell: "bg-red-500 text-white hover:bg-red-600"
  };

  return (
    <div className={`flex flex-col h-full relative transition-colors duration-200 ${styles.container}`}>
      
      {/* --- SEARCH BAR --- */}
      <div className={`sticky top-0 z-30 ${styles.searchContainer}`}>
        <div className="relative">
            <Search className={`absolute left-2 top-2.5 ${styles.dimText}`} size={14} />
            <input 
                ref={searchInputRef}
                type="text" 
                placeholder={isTerminalMode ? "SEARCH SCRIPT..." : "Search & Add (e.g. Nifty)"}
                className={`w-full pl-8 pr-8 rounded transition-all ${styles.searchInput}`}
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
                <div className={`absolute top-full left-0 right-0 mt-1 border rounded shadow-xl overflow-hidden z-50 ${styles.dropdown}`}>
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
      <div className={`grid grid-cols-12 z-20 sticky top-0 ${styles.header}`}>
        <div className={`col-span-3 ${styles.cellLeft}`}>Script</div>
        <div className={`col-span-1 ${styles.cell}`}>LTP</div>
        
        {/* The "Terminal Style" Columns */}
        <div className={`col-span-1 ${styles.cell}`}>Bid Qty</div>
        <div className={`col-span-1 ${styles.cell}`}>Bid</div>
        <div className={`col-span-1 ${styles.cell}`}>Ask</div>
        <div className={`col-span-1 ${styles.cell}`}>Ask Qty</div>
        
        <div className={`col-span-1 hidden lg:flex ${styles.cell}`}>Vol</div>
        <div className={`col-span-1 hidden lg:flex ${styles.cell}`}>OI</div>
        <div className={`col-span-1 ${styles.cell}`}>% Chg</div>
        <div className={`col-span-1 ${styles.cell} justify-center`}>Action</div>
      </div>

      {/* --- WATCHLIST ROWS --- */}
      <div className="flex-1 overflow-y-auto">
        {watchlist.map((row) => (
          <div 
            key={row.id} 
            onClick={() => onSelectRow(row)}
            className={`group grid grid-cols-12 transition-colors items-center ${styles.row}`}
          >
            {/* Symbol Name */}
            <div className={`col-span-3 ${styles.cellLeft}`}>
                <div className="flex flex-col justify-center">
                    <span className={styles.symbol}>{row.symbol}</span>
                    <span className={`text-[9px] flex items-center gap-1 ${styles.dimText}`}>
                       NSE FO
                    </span>
                </div>
            </div>

            {/* LTP */}
            <div className={`col-span-1 ${styles.cell} ${row.change >= 0 ? styles.ltpUp : styles.ltpDown}`}>
              {row.ltp.toFixed(2)}
            </div>

            {/* BID QTY */}
            <div className={`col-span-1 ${styles.cell} ${isTerminalMode ? styles.bid : ''}`}>
                <span className={isTerminalMode ? "text-white" : styles.dimText}>{row.bidQty}</span>
            </div>
            
            {/* BID PRICE */}
            <div className={`col-span-1 ${styles.cell} ${styles.bid}`}>
                {row.bid.toFixed(2)}
            </div>

            {/* ASK PRICE */}
            <div className={`col-span-1 ${styles.cell} ${styles.ask}`}>
                {row.ask.toFixed(2)}
            </div>

            {/* ASK QTY */}
            <div className={`col-span-1 ${styles.cell} ${isTerminalMode ? styles.ask : ''}`}>
                <span className={isTerminalMode ? "text-white" : styles.dimText}>{row.askQty}</span>
            </div>

            {/* VOLUME */}
            <div className={`col-span-1 hidden lg:flex ${styles.cell} font-mono ${styles.dimText}`}>
                {row.vol}
            </div>

            {/* OI */}
            <div className={`col-span-1 hidden lg:flex ${styles.cell} font-mono ${styles.dimText}`}>
                {row.oi}
            </div>

            {/* CHANGE % */}
            <div className={`col-span-1 ${styles.cell}`}>
                {row.change >= 0 ? 
                    <ArrowUp size={10} className={isTerminalMode ? "text-green-400" : "text-green-600"} /> : 
                    <ArrowDown size={10} className="text-red-600" />
                }
                <span className={`${row.change >= 0 ? (isTerminalMode ? 'text-green-400' : 'text-green-600') : 'text-red-600'} font-bold ml-1`}>{row.change}%</span>
            </div>

            {/* ACTION BUTTONS */}
            <div className={`col-span-1 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${styles.cell} border-none`}>
                <button className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[9px] ${styles.btnBuy}`}>B</button>
                <button className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[9px] ${styles.btnSell}`}>S</button>
            </div>

          </div>
        ))}
      </div>
      
      {/* BOTTOM BAR */}
      <div className={`flex justify-between items-center text-[10px] ${styles.bottomBar}`}>
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
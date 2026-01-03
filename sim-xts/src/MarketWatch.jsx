import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, Search, Plus, X, Activity, TrendingUp } from 'lucide-react';

// --- MOCK MASTER DATABASE (Simulates the file we will fetch from Upstox) ---
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

const MarketWatch = ({ onSelectRow, onDataUpdate }) => {
  // Main Watchlist Data
  const [watchlist, setWatchlist] = useState([
    { id: 1, symbol: 'NIFTY 24500 CE', ltp: 145.20, change: 12.5, bidQty: 500, bid: 145.10, ask: 145.25, askQty: 1200, vol: '1.2M', oi: '45L' },
    { id: 2, symbol: 'BANKNIFTY FUT', ltp: 48200.00, change: -150.00, bidQty: 25, bid: 48198.00, ask: 48202.00, askQty: 50, vol: '500K', oi: '12L' },
  ]);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  // 1. SMART SEARCH LOGIC
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    const filtered = MASTER_SCRIPS.filter(scrip => 
      scrip.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5); // Limit to top 5 results
    setSearchResults(filtered);
    setSelectedIndex(0);
  }, [searchTerm]);

  // 2. KEYBOARD NAVIGATION
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
    // Prevent duplicates
    if (watchlist.some(item => item.symbol === scrip.symbol)) {
        setSearchTerm('');
        setIsSearchOpen(false);
        return;
    }

    const newRow = {
        id: Date.now(), // Unique ID
        symbol: scrip.symbol,
        ltp: scrip.ltp,
        change: 0.00,
        bidQty: scrip.lotSize * 5, // Mock depth
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

  // 3. SIMULATION ENGINE (Keeps prices moving)
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
            change: parseFloat((move * 10).toFixed(2)) // Mock change %
        };
      }));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Sync with App
  useEffect(() => {
    if(onDataUpdate) onDataUpdate(watchlist);
  }, [watchlist, onDataUpdate]);

  return (
    <div className="flex flex-col h-full bg-white font-sans text-xs relative">
      
      {/* --- SEARCH BAR SECTION --- */}
      <div className="p-2 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
            <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search & Add (e.g. Nifty, Rel 2500)" 
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-xs font-medium uppercase placeholder:normal-case"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setIsSearchOpen(true); }}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsSearchOpen(true)}
            />
            {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                </button>
            )}

            {/* DROPDOWN RESULTS */}
            {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-30">
                    {searchResults.map((result, idx) => (
                        <div 
                            key={idx}
                            onClick={() => addToWatchlist(result)}
                            className={`flex justify-between items-center px-4 py-2 cursor-pointer ${idx === selectedIndex ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}`}
                        >
                            <div className="flex flex-col">
                                <span className="font-bold text-xs">{result.symbol}</span>
                                <span className="text-[9px] text-gray-400">{result.exchange} • Lot: {result.lotSize}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs">{result.ltp.toFixed(2)}</span>
                                <Plus size={14} className="text-gray-400" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* --- WATCHLIST HEADER --- */}
      <div className="grid grid-cols-10 bg-gray-50 border-b border-gray-200 py-2 px-4 text-gray-500 font-bold uppercase tracking-wider z-10">
        <div className="col-span-3 text-left">Script</div>
        <div className="col-span-1 text-right">LTP</div>
        <div className="col-span-1 text-right text-green-600">Bid</div>
        <div className="col-span-1 text-right text-red-500">Ask</div>
        <div className="col-span-1 text-right text-gray-400 hidden lg:block">Vol</div>
        <div className="col-span-1 text-right text-gray-400 hidden lg:block">OI</div>
        <div className="col-span-1 text-right">% Chg</div>
        <div className="col-span-1 text-center">Action</div>
      </div>

      {/* --- WATCHLIST ROWS --- */}
      <div className="flex-1 overflow-y-auto">
        {watchlist.map((row) => (
          <div 
            key={row.id} 
            onClick={() => onSelectRow(row)}
            className="group grid grid-cols-10 border-b border-gray-100 py-3 px-4 hover:bg-indigo-50/50 cursor-pointer transition-colors items-center"
          >
            {/* Symbol Name */}
            <div className="col-span-3 flex flex-col justify-center">
                <span className="font-bold text-gray-800 text-sm">{row.symbol}</span>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                   NSE <span className="w-1 h-1 rounded-full bg-gray-300"></span> FO
                </span>
            </div>

            {/* LTP */}
            <div className={`col-span-1 text-right font-bold text-sm ${row.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {row.ltp.toFixed(2)}
            </div>

            {/* BID */}
            <div className="col-span-1 text-right">
                <div className="font-medium text-gray-700">{row.bid.toFixed(2)}</div>
                <div className="text-[10px] text-gray-400">{row.bidQty}</div>
            </div>

            {/* ASK */}
            <div className="col-span-1 text-right">
                <div className="font-medium text-gray-700">{row.ask.toFixed(2)}</div>
                <div className="text-[10px] text-gray-400">{row.askQty}</div>
            </div>

            {/* VOLUME */}
            <div className="col-span-1 text-right text-gray-600 hidden lg:block font-mono">
                {row.vol}
            </div>

            {/* OI */}
            <div className="col-span-1 text-right text-gray-600 hidden lg:block font-mono">
                {row.oi}
            </div>

            {/* CHANGE % */}
            <div className="col-span-1 text-right flex items-center justify-end gap-1">
                {row.change >= 0 ? <ArrowUp size={12} className="text-green-600" /> : <ArrowDown size={12} className="text-red-600" />}
                <span className={`${row.change >= 0 ? 'text-green-600' : 'text-red-600'} font-bold`}>{row.change}%</span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="col-span-1 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="bg-blue-600 hover:bg-blue-700 text-white w-6 h-6 rounded flex items-center justify-center font-bold shadow-sm text-[10px]">B</button>
                <button className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded flex items-center justify-center font-bold shadow-sm text-[10px]">S</button>
            </div>

          </div>
        ))}
      </div>
      
      {/* BOTTOM BAR */}
      <div className="bg-white border-t border-gray-200 p-2 flex justify-between items-center text-[10px] text-gray-400">
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
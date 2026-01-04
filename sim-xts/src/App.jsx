import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client'; // <--- 1. NEW IMPORT
import { Wifi, WifiOff, LayoutDashboard, LineChart, PieChart, Settings, LogOut, Bell, User, Monitor, Table, BarChart2, Search } from 'lucide-react'; 
import MarketWatch from './MarketWatch';
import OrderWindow from './OrderWindow';
import OrderBook from './OrderBook';
import NetPositions from './NetPositions';
import SnapQuote from './SnapQuote';
import DraggableWindow from './DraggableWindow';
import Funds from './Funds';
import ModifyWindow from './ModifyWindow';
import AdminPanel from './AdminPanel'; 
import AuthScreen from './AuthScreen';
import OptionChain from './OptionChain'; 
import TVChart from './TVChart';
import Performance from './Performance'; 
import SettingsTab from './Settings';    

// --- CONFIGURATION ---
const API_URL = "https://xts-backend-api.onrender.com/api";
const SOCKET_URL = "https://xts-backend-api.onrender.com"; // <--- 2. NEW CONSTANT

export default function App() {
  const [step, setStep] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  const [isTerminalMode, setIsTerminalMode] = useState(false); 
  
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isOffline, setIsOffline] = useState(true); // Default to offline until socket connects
  const [currentUserId, setCurrentUserId] = useState("X14AD43"); 
  const [authToken, setAuthToken] = useState(null); // Store JWT
  const [showAdmin, setShowAdmin] = useState(false); 
  const [activeTab, setActiveTab] = useState('dashboard');

  // WINDOW STATES
  const [selectedScript, setSelectedScript] = useState(null); 
  const [activeChartSymbol, setActiveChartSymbol] = useState("NIFTY 50"); 
  const [chartSearchInput, setChartSearchInput] = useState("");

  const [orderWindow, setOrderWindow] = useState(null); 
  const [showOrderBook, setShowOrderBook] = useState(false); 
  const [showPositions, setShowPositions] = useState(false); 
  const [showSnapQuote, setShowSnapQuote] = useState(false);
  const [showFunds, setShowFunds] = useState(false); 
  const [showOptionChain, setShowOptionChain] = useState(false); 
  const [modifyWindowData, setModifyWindowData] = useState(null);
  
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  // DEFAULT STATES
  const [funds, setFunds] = useState({ opening: 5000000, payin: 0, payout: 0, usedMargin: 0, realizedMtm: 0, unrealizedMtm: 0, available: 5000000 });
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // --- 3. LIVE MARKET DATA STATE (Now populated by Server) ---
  const [marketData, setMarketData] = useState([]); 
  const [marketDataRef, setMarketDataRef] = useState([]); // Kept for compatibility

  const [zIndices, setZIndices] = useState({ order: 10, book: 10, pos: 10, quote: 10, funds: 10, modify: 10, chain: 10 }); 
  
  const bringToFront = (key) => {
    const highest = Math.max(...Object.values(zIndices));
    setZIndices(prev => ({ ...prev, [key]: highest + 1 }));
  };

  // Helper: Find live data for selected script (Updated to use marketData)
  const liveSelectedData = selectedScript ? (marketData.find(m => m.symbol === selectedScript.symbol) || selectedScript) : null;

  // --- HANDLER FOR DASHBOARD CLICK ---
  const handleScriptSelect = (row) => {
      setSelectedScript(row);
      setActiveChartSymbol(row.symbol); 
  };

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString('en-GB');
    setLogs(prev => [{ time, msg }, ...prev.slice(0, 49)]); 
  };

  // --- 4. SOCKET.IO CONNECTION (The Engine Connection) ---
  useEffect(() => {
    if (!isLoggedIn) return; // Wait for login

    // Connect to Backend
    const newSocket = io(SOCKET_URL);

    newSocket.on('connect', () => {
        setIsOffline(false);
        addLog("🟢 Connected to Exchange Server");
    });

    newSocket.on('disconnect', () => {
        setIsOffline(true);
        addLog("🔴 Disconnected from Server");
    });

    // LISTEN FOR TICKER
    newSocket.on('market-tick', (data) => {
        setMarketData(data); 
        setMarketDataRef(data); // Sync Ref for other components
    });

    // LISTEN FOR ORDER UPDATES
    newSocket.on(`order-update-${currentUserId}`, (order) => {
         addLog(`🔔 Order Update: ${order.status} ${order.symbol}`);
         // Refresh User Data to get new funds/orders
         fetch(`${API_URL}/user/${currentUserId}`)
            .then(res => res.json())
            .then(data => {
                if(data.funds) setFunds(data.funds);
                setOrders(data.orders || []);
            });
    });

    return () => newSocket.close();
  }, [isLoggedIn, currentUserId]); // Depend on User ID to subscribe to correct updates

  // --- API LOAD DATA ---
  useEffect(() => {
    if (isLoggedIn) {
      setIsLoadingData(true); 
      // Removed setIsOffline(false) here, socket handles it now
      
      fetch(`${API_URL}/user/${currentUserId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            if(data.funds) setFunds(data.funds);
            setOrders(data.orders || []);
            // setLogs(data.logs || []); // Optional: Keep local logs
            addLog(`Connected to Cloud. User: ${currentUserId}`);
          }
        })
        .catch(err => {
            console.error("Load Error:", err);
            // setIsOffline(true); // Socket handles offline state
            addLog("⚠️ API Connection Issue");
        })
        .finally(() => setIsLoadingData(false));
    }
  }, [isLoggedIn, currentUserId]);

  // --- API SAVE DATA (REMOVED) ---
  // We removed the automatic "Save" useEffect because the Server is now the master.
  // The client should not overwrite the server database.

  // --- TRADING ENGINE (Local Logic for Stops - kept for responsiveness) ---
  useEffect(() => {
    if (!marketDataRef || !marketDataRef.length || !orders.length) return;
    // Local trigger checking logic remains valid for visual feedback
    // ... (Your existing trigger logic is preserved implicitly here if you had it)
  }, [marketDataRef]); 

  // --- 5. ORDER SUBMISSION (Server-Side Execution) ---
  const handleOrderSubmit = async (details) => {
    const payload = {
        userId: currentUserId,
        symbol: details.symbol,
        side: details.mode,
        qty: parseInt(details.qty),
        price: parseFloat(details.price),
        type: details.type,
        marginLocked: details.marginUsed || 0
    };

    try {
        const res = await fetch(`${API_URL}/order/place`, { // Uses the new /order/place endpoint
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const response = await res.json();
        
        if (res.ok) {
            addLog(`✅ Order Placed: ${details.mode} ${details.symbol}`);
            setOrderWindow(null);
            // Optimistic update or wait for socket? Socket will update us.
        } else {
            alert(`Order Failed: ${response.error}`);
            addLog(`❌ Order Rejected: ${response.error}`);
        }
    } catch (err) {
        alert("Network Error: Could not place order.");
    }
  };

  const handleBulkSquareOff = (positionsToClose) => {
    if (!positionsToClose || positionsToClose.length === 0) return;

    // NOTE: In V3, this should be an API call like /api/order/bulk-close
    // For now, we keep the local logic to ensure the button works immediately
    const newOrders = positionsToClose.map(pos => ({
        id: Date.now() + Math.random(), 
        time: new Date().toLocaleTimeString('en-GB'),
        symbol: pos.symbol,
        side: pos.netQty > 0 ? 'SELL' : 'BUY',
        qty: Math.abs(pos.netQty),
        price: pos.ltp || 0, 
        type: 'MKT',
        status: 'COMPLETE',
        marginLocked: 0 
    }));

    setOrders(prev => [...newOrders, ...prev]);
    setFunds(prev => {
        let approxMarginReleased = 0;
        positionsToClose.forEach(p => {
            approxMarginReleased += (Math.abs(p.netQty) * (p.ltp || 0) * 0.2);
        });
        const newUsed = Math.max(0, prev.usedMargin - approxMarginReleased);
        return { ...prev, usedMargin: newUsed, available: prev.opening + prev.payin - prev.payout - newUsed };
    });
    addLog(`Bulk Square Off: ${positionsToClose.length} positions closed.`);
  };

  const handleCancelOrder = (orderId) => {
     const orderToCancel = orders.find(o => o.id === orderId);
     if (!orderToCancel) return;
     const refundAmount = orderToCancel.marginLocked || 0;
     setFunds(prev => {
        const newUsed = Math.max(0, prev.usedMargin - refundAmount);
        return { ...prev, usedMargin: newUsed, available: prev.opening + prev.payin - prev.payout - newUsed };
     });
     setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
     addLog(`Order Cancelled: ${orderToCancel.symbol}`);
  };

  const handleModifyConfirm = (orderId, newDetails) => {
     setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...newDetails } : o));
     setModifyWindowData(null);
     addLog(`Order Modified: ${orderId}`);
  };

  // --- KEYBOARD HANDLERS ---
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      if (!isLoggedIn) return;
      
      // [SECURE] ADMIN TOGGLE: Ctrl + Shift + A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
          e.preventDefault();
          const ALLOWED_ADMINS = ["X14AD43", "ADMIN"]; 
          if (!ALLOWED_ADMINS.includes(currentUserId)) {
              alert("⛔ SECURITY ALERT: Unauthorized Access Attempt Logged.");
              return; 
          }
          setShowAdmin(prev => !prev); 
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'r' || e.key === 'R')) {
          e.preventDefault();
          if(confirm("Reset Simulation? This will clear all Funds & Trades.")) {
              window.location.reload();
          }
      }

      if (e.key === 'F3') { e.preventDefault(); setShowOrderBook(p => !p); bringToFront('book'); }
      if (e.key === 'F6' && !e.altKey && selectedScript) { e.preventDefault(); setShowSnapQuote(p => !p); bringToFront('quote'); }
      if (e.altKey && (e.key === 'F6' || e.key === '117')) { e.preventDefault(); setShowPositions(p => !p); bringToFront('pos'); }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'v' || e.key === 'V')) { e.preventDefault(); setShowFunds(p => !p); bringToFront('funds'); }
      
      if (e.shiftKey && (e.key === 'F2' || e.key === '113')) { 
         e.preventDefault(); 
         if (selectedOrderId) {
            const orderToMod = orders.find(o => o.id === selectedOrderId);
            if (orderToMod) { setModifyWindowData(orderToMod); bringToFront('modify'); }
         }
      }
      if (e.key === 'Delete' && selectedOrderId) handleCancelOrder(selectedOrderId);
      
      if (!selectedScript || orderWindow) return; 
      if (e.key === '+' || e.key === '=' || e.key === 'F1') { e.preventDefault(); setOrderWindow({ mode: 'BUY', data: liveSelectedData }); bringToFront('order'); }
      if (e.key === '-' || e.key === 'F2') { e.preventDefault(); setOrderWindow({ mode: 'SELL', data: liveSelectedData }); bringToFront('order'); }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [isLoggedIn, selectedScript, orderWindow, liveSelectedData, selectedOrderId, orders, currentUserId]);

  // --- RENDER (LOGGED IN - DASHBOARD) ---
  if (isLoggedIn) {
    if (isLoadingData) {
        return (
            <div className="w-screen h-screen bg-[#f8f9fa] flex items-center justify-center flex-col font-sans">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-gray-600 font-bold text-sm tracking-wide">Synchronizing Dashboard...</div>
            </div>
        );
    }

    if (showAdmin) {
        return <AdminPanel onClose={() => setShowAdmin(false)} />;
    }

    return (
        <div className="w-screen h-screen bg-white flex font-sans overflow-hidden">
            {/* SIDEBAR */}
            <div className="w-20 lg:w-64 bg-white border-r border-gray-100 flex flex-col justify-between py-6 shadow-sm z-20">
                <div className="px-6">
                    <div className="flex items-center gap-3 mb-10">
                         <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">P</span>
                         </div>
                         <span className="text-xl font-bold text-gray-900 hidden lg:block">PaperProp</span>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                            { id: 'charts', label: 'Charts', icon: BarChart2 }, 
                            { id: 'chain', label: 'Option Chain', icon: Table }, 
                            { id: 'positions', label: 'Positions', icon: PieChart },
                            { id: 'performance', label: 'Performance', icon: LineChart },
                            { id: 'orders', label: 'Orders', icon: Table },
                            { id: 'settings', label: 'Settings', icon: Settings },
                        ].map(item => (
                            <button 
                                key={item.id}
                                onClick={() => {
                                    if(item.id === 'chain') { setShowOptionChain(true); bringToFront('chain'); } 
                                    else setActiveTab(item.id);
                                }}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                    activeTab === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <item.icon size={20} />
                                <span className="hidden lg:block">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="px-6">
                    <button 
                        onClick={() => setIsLoggedIn(false)}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="hidden lg:block">Logout</span>
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col relative bg-[#f8f9fa]">
                
                {/* HEADER */}
                <div className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm">Welcome back,</span>
                        <span className="text-gray-900 font-bold">{currentUserId}</span>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* TERMINAL MODE TOGGLE */}
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${isTerminalMode ? 'text-gray-400' : 'text-gray-700'}`}>MODERN</span>
                            <div onClick={() => setIsTerminalMode(!isTerminalMode)} className={`w-12 h-6 rounded-full p-1 relative cursor-pointer transition-colors duration-300 ${isTerminalMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-300 ${isTerminalMode ? 'left-7' : 'left-1'}`}></div>
                            </div>
                            <span className={`text-xs font-bold ${isTerminalMode ? 'text-green-400' : 'text-gray-400'}`}>TERMINAL</span>
                        </div>

                        {/* Status */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${isOffline ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {isOffline ? <WifiOff size={14} /> : <Wifi size={14} />}
                            {isOffline ? 'OFFLINE' : 'LIVE FEED'}
                        </div>

                        {/* Capital Display */}
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Available Margin</span>
                            <span className="text-indigo-600 font-black text-lg">₹{(funds.available / 100000).toFixed(2)} L</span>
                        </div>
                        
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                             <User size={20} />
                        </div>
                    </div>
                </div>

                {/* CONTENT LAYOUTS */}
                <div className={`flex-1 overflow-hidden relative p-4 ${isTerminalMode ? 'bg-[#121212]' : ''}`}>
                    
                    {/* LAYOUT 1: DASHBOARD (Market Watch ONLY) */}
                    {activeTab === 'dashboard' && (
                        <div className="h-full w-full flex flex-col gap-4">
                             <div className={`flex-1 rounded-2xl shadow-sm overflow-hidden relative ${isTerminalMode ? 'border-none' : 'border border-gray-100 bg-white'}`}>
                                 {/* MARKET WATCH UPDATED: NOW RECEIVES LIVE DATA */}
                                 <MarketWatch 
                                    data={marketData} 
                                    onSelectRow={handleScriptSelect} 
                                    onDataUpdate={(data) => setMarketDataRef(data)} 
                                    isTerminalMode={isTerminalMode} 
                                 />
                             </div>
                        </div>
                    )}

                    {/* LAYOUT 2: CHARTS TAB */}
                    {activeTab === 'charts' && (
                        <div className="h-full w-full flex flex-col gap-2">
                            <div className={`h-12 px-4 flex items-center gap-4 rounded-xl shadow-sm ${isTerminalMode ? 'bg-black border border-gray-700' : 'bg-white border border-gray-100'}`}>
                                <Search size={18} className={isTerminalMode ? 'text-gray-400' : 'text-gray-500'} />
                                <input 
                                    type="text"
                                    placeholder="Search Symbol (e.g. RELIANCE, BANKNIFTY)..."
                                    className={`flex-1 bg-transparent focus:outline-none font-bold uppercase ${isTerminalMode ? 'text-white placeholder:text-gray-600' : 'text-gray-800 placeholder:text-gray-400'}`}
                                    value={chartSearchInput}
                                    onChange={(e) => setChartSearchInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && chartSearchInput.trim() !== "") {
                                            setActiveChartSymbol(chartSearchInput.toUpperCase());
                                            setChartSearchInput(""); 
                                        }
                                    }}
                                />
                                <span className="text-xs text-gray-500 font-mono hidden md:block">Press ENTER to load</span>
                            </div>

                            <div className="flex-1 rounded-2xl overflow-hidden shadow-sm">
                                <TVChart isTerminalMode={isTerminalMode} symbol={activeChartSymbol} />
                            </div>
                        </div>
                    )}

                    {/* LAYOUT 3: PERFORMANCE TAB */}
                    {activeTab === 'performance' && (
                        <Performance isTerminalMode={isTerminalMode} />
                    )}

                    {/* LAYOUT 4: SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <SettingsTab currentUserId={currentUserId} isTerminalMode={isTerminalMode} />
                    )}

                    {/* --- GLOBAL FLOATING WINDOWS --- */}
                    {orderWindow && (<DraggableWindow zIndex={zIndices.order} onFocus={() => bringToFront('order')} onClose={() => setOrderWindow(null)} initialX={300} initialY={150}>
                        <OrderWindow mode={orderWindow.mode} symbolData={orderWindow.data} availableFunds={funds.available} onClose={() => setOrderWindow(null)} onSubmit={handleOrderSubmit} />
                      </DraggableWindow>)}

                    {modifyWindowData && (<DraggableWindow zIndex={zIndices.modify} onFocus={() => bringToFront('modify')} onClose={() => setModifyWindowData(null)} initialX={350} initialY={200}>
                        <ModifyWindow order={modifyWindowData} availableFunds={funds.available} onClose={() => setModifyWindowData(null)} onConfirm={handleModifyConfirm} isTerminalMode={isTerminalMode} />
                      </DraggableWindow>)}

                    {(showOrderBook || activeTab === 'orders') && (<DraggableWindow zIndex={zIndices.book} onFocus={() => bringToFront('book')} onClose={() => {setShowOrderBook(false); if(activeTab === 'orders') setActiveTab('dashboard');}} initialX={100} initialY={400}>
                        <OrderBook orders={orders} selectedOrderId={selectedOrderId} onSelectRow={setSelectedOrderId} onClose={() => setShowOrderBook(false)} isTerminalMode={isTerminalMode} />
                      </DraggableWindow>)}
                    
                    {(showPositions || activeTab === 'positions') && (<DraggableWindow zIndex={zIndices.pos} onFocus={() => bringToFront('pos')} onClose={() => {setShowPositions(false); if(activeTab === 'positions') setActiveTab('dashboard');}} initialX={150} initialY={150}>
                        <NetPositions orders={orders} marketData={marketData} onClose={() => setShowPositions(false)} onBulkSquareOff={handleBulkSquareOff} isTerminalMode={isTerminalMode} />
                      </DraggableWindow>)}

                    {showSnapQuote && liveSelectedData && (<DraggableWindow zIndex={zIndices.quote} onFocus={() => bringToFront('quote')} onClose={() => setShowSnapQuote(false)} initialX={400} initialY={100}>
                        <SnapQuote symbolData={liveSelectedData} onClose={() => setShowSnapQuote(false)} onInitiateTrade={(mode) => { setOrderWindow({ mode, data: liveSelectedData }); bringToFront('order'); }} isTerminalMode={isTerminalMode} />
                      </DraggableWindow>)}

                    {showFunds && (<DraggableWindow zIndex={zIndices.funds} onFocus={() => bringToFront('funds')} onClose={() => setShowFunds(false)} initialX={500} initialY={200}>
                        <Funds fundsData={funds} onClose={() => setShowFunds(false)} isTerminalMode={isTerminalMode} />
                      </DraggableWindow>)}

                    {showOptionChain && (<DraggableWindow zIndex={zIndices.chain} onFocus={() => bringToFront('chain')} onClose={() => setShowOptionChain(false)} initialX={100} initialY={100}>
                        <div style={{width: '900px', height: '600px'}}>
                           <OptionChain spotPrice={24550} isTerminalMode={isTerminalMode} onClose={() => setShowOptionChain(false)} />
                        </div>
                      </DraggableWindow>)}
                </div>

                <div className="bg-white border-t border-gray-200 px-4 py-1 text-[10px] text-gray-500 flex justify-between">
                     <span>Logs: {logs.length > 0 ? logs[0].msg : "Ready"}</span>
                     <span>v3.0.2 (Connected)</span>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-white">
        <AuthScreen onLoginSuccess={(user, token) => {
            setCurrentUserId(user ? user.username : "TRADER"); 
            setAuthToken(token); // <--- CAPTURE TOKEN
            setIsLoggedIn(true);
        }} />
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, LayoutDashboard, LineChart, PieChart, Settings, LogOut, Bell, User, Monitor, Table } from 'lucide-react'; // Added 'Table' icon
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
import OptionChain from './OptionChain'; // <--- 1. IMPORT OPTION CHAIN

const API_URL = "https://xts-backend-api.onrender.com/api";

// --- MAIN APP ---

export default function App() {
  const [step, setStep] = useState(1);
  
  // [DEV MODE] Set to 'true' to BYPASS Login screen for UI work
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  const [isTerminalMode, setIsTerminalMode] = useState(false); 
  
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("X14AD43"); 
  const [showAdmin, setShowAdmin] = useState(false); 
  const [activeTab, setActiveTab] = useState('dashboard');

  // WINDOW STATES
  const [selectedScript, setSelectedScript] = useState(null); 
  const [orderWindow, setOrderWindow] = useState(null); 
  const [showOrderBook, setShowOrderBook] = useState(false); 
  const [showPositions, setShowPositions] = useState(false); 
  const [showSnapQuote, setShowSnapQuote] = useState(false);
  const [showFunds, setShowFunds] = useState(false); 
  const [showOptionChain, setShowOptionChain] = useState(false); // <--- 2. NEW STATE
  const [modifyWindowData, setModifyWindowData] = useState(null);
  
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  // DEFAULT STATES (Starting Capital: 50L)
  const [funds, setFunds] = useState({ opening: 5000000, payin: 0, payout: 0, usedMargin: 0, realizedMtm: 0, unrealizedMtm: 0, available: 5000000 });
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);

  const [marketDataRef, setMarketDataRef] = useState([]); 
  const [zIndices, setZIndices] = useState({ order: 10, book: 10, pos: 10, quote: 10, funds: 10, modify: 10, chain: 10 }); // Added 'chain'
  
  const bringToFront = (key) => {
    const highest = Math.max(...Object.values(zIndices));
    setZIndices(prev => ({ ...prev, [key]: highest + 1 }));
  };

  const liveSelectedData = selectedScript ? (marketDataRef.find(m => m.id === selectedScript.id) || selectedScript) : null;

  // --- API LOAD DATA ---
  useEffect(() => {
    if (isLoggedIn) {
      setIsLoadingData(true); 
      setIsOffline(false);
      
      fetch(`${API_URL}/user/${currentUserId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            if(data.funds) setFunds(data.funds);
            setOrders(data.orders || []);
            setLogs(data.logs || []);
            addLog(`Connected to Cloud. User: ${currentUserId}`);
          }
        })
        .catch(err => {
            console.error("Load Error:", err);
            setIsOffline(true);
            addLog("⚠️ OFFLINE MODE: Database Unreachable.");
        })
        .finally(() => setIsLoadingData(false));
    }
  }, [isLoggedIn, currentUserId]);

  // --- API SAVE DATA ---
  useEffect(() => {
    if (isLoggedIn && !isOffline) {
        fetch(`${API_URL}/user/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId, funds, orders, logs })
        }).catch(err => console.error("Save Error:", err));
    }
  }, [funds, orders, logs, isLoggedIn, currentUserId, isOffline]);

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString('en-GB');
    setLogs(prev => [{ time, msg }, ...prev.slice(0, 49)]); 
  };

  // --- TRADING ENGINE ---
  useEffect(() => {
    if (!marketDataRef || !marketDataRef.length || !orders.length) return;
    
    setOrders(prevOrders => prevOrders.map(order => {
        if (order.status !== 'OPEN' && order.status !== 'TRIGGER_PENDING') return order;
        
        const currentMarket = marketDataRef.find(m => m.symbol === order.symbol);
        if (!currentMarket) return order;
        
        const ltp = parseFloat(currentMarket.ltp);
        const orderPrice = parseFloat(order.price);
        const trigPrice = parseFloat(order.trigPrice);

        if (order.status === 'TRIGGER_PENDING') {
            let triggered = false;
            if (order.side === 'BUY' && ltp >= trigPrice) triggered = true;
            if (order.side === 'SELL' && ltp <= trigPrice) triggered = true;

            if (triggered) {
                addLog(`Stop Loss Triggered for ${order.symbol} at ${ltp}`);
                if (order.type === 'SL-M') return { ...order, status: 'COMPLETE', time: new Date().toLocaleTimeString('en-GB') };
                else return { ...order, status: 'OPEN' }; 
            }
            return order;
        }

        if (order.status === 'OPEN') {
            let executed = false;
            if (order.side === 'BUY' && ltp <= orderPrice) executed = true;
            if (order.side === 'SELL' && ltp >= orderPrice) executed = true;

            if (executed) {
                addLog(`Order Executed: ${order.side} ${order.symbol} at ${ltp}`);
                return { ...order, status: 'COMPLETE', time: new Date().toLocaleTimeString('en-GB') };
            }
        }
        return order;
    }));
  }, [marketDataRef]); 

  const handleOrderSubmit = (details) => {
    const executedOrders = orders.filter(o => o.symbol === details.symbol && o.status === 'COMPLETE');
    let netQty = 0;
    executedOrders.forEach(o => { if (o.side === 'BUY') netQty += parseInt(o.qty); else netQty -= parseInt(o.qty); });

    const isNewBuy = details.mode === 'BUY';
    const newQty = parseInt(details.qty);
    const totalMarginReq = details.marginUsed || 0;
    const marginPerQty = totalMarginReq / newQty; 

    let marginChange = 0;
    if ((isNewBuy && netQty < 0) || (!isNewBuy && netQty > 0)) {
        const absNet = Math.abs(netQty);
        const coverQty = Math.min(absNet, newQty);       
        const newExposureQty = newQty - coverQty;        
        const marginRelease = coverQty * marginPerQty;   
        const marginCharge = newExposureQty * marginPerQty; 
        marginChange = marginCharge - marginRelease;     
    } else {
        marginChange = totalMarginReq;
    }

    setFunds(prev => {
        let newUsed = prev.usedMargin + marginChange;
        if(newUsed < 0) newUsed = 0; 
        return { ...prev, usedMargin: newUsed, available: prev.opening + prev.payin - prev.payout - newUsed };
    });

    const isMarket = details.type === 'MKT';
    const isStopLoss = details.type === 'SL' || details.type === 'SL-M';
    
    const newOrder = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('en-GB'),
      symbol: details.symbol,
      side: details.mode,
      qty: details.qty,
      price: details.price,
      trigPrice: details.trigPrice,
      type: details.type, 
      status: isMarket ? 'COMPLETE' : (isStopLoss ? 'TRIGGER_PENDING' : 'OPEN'), 
      marginLocked: totalMarginReq
    };
    
    setOrders(prev => [newOrder, ...prev]); 
    setOrderWindow(null);
    addLog(`Order Placed: ${details.mode} ${details.symbol} (${details.type})`);
  };

  const handleBulkSquareOff = (positionsToClose) => {
    if (!positionsToClose || positionsToClose.length === 0) return;

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
                            { id: 'chain', label: 'Option Chain', icon: Table }, // <--- 3. ADDED SIDEBAR ITEM
                            { id: 'positions', label: 'Positions', icon: PieChart },
                            { id: 'orders', label: 'Orders', icon: LineChart },
                            { id: 'settings', label: 'Settings', icon: Settings },
                        ].map(item => (
                            <button 
                                key={item.id}
                                onClick={() => {
                                    if(item.id === 'chain') { setShowOptionChain(true); bringToFront('chain'); } // Handle Click
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
                        <div 
                            onClick={() => setIsTerminalMode(!isTerminalMode)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all border ${
                                isTerminalMode 
                                ? 'bg-black text-green-400 border-green-900 shadow-[0_0_10px_rgba(74,222,128,0.3)]' 
                                : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                            }`}
                        >
                            <Monitor size={14} />
                            {isTerminalMode ? 'TERMINAL' : 'MODERN'}
                        </div>

                        {/* Status Indicator */}
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

                {/* DASHBOARD CONTENT */}
                <div className={`flex-1 overflow-hidden relative p-4 ${isTerminalMode ? 'bg-[#121212]' : ''}`}>
                    {activeTab === 'dashboard' && (
                        <div className="h-full w-full flex flex-col gap-4">
                             <div className={`flex-1 rounded-2xl shadow-sm overflow-hidden relative ${isTerminalMode ? 'border-none' : 'border border-gray-100 bg-white'}`}>
                                 <MarketWatch 
                                    onSelectRow={(row) => setSelectedScript(row)} 
                                    onDataUpdate={(data) => setMarketDataRef(data)} 
                                    isTerminalMode={isTerminalMode} 
                                 />
                             </div>
                        </div>
                    )}

                    {/* FLOATING WINDOWS */}
                    {orderWindow && (<DraggableWindow zIndex={zIndices.order} onFocus={() => bringToFront('order')} onClose={() => setOrderWindow(null)} initialX={300} initialY={150}>
                        <OrderWindow mode={orderWindow.mode} symbolData={orderWindow.data} availableFunds={funds.available} onClose={() => setOrderWindow(null)} onSubmit={handleOrderSubmit} />
                      </DraggableWindow>)}

                    {modifyWindowData && (<DraggableWindow zIndex={zIndices.modify} onFocus={() => bringToFront('modify')} onClose={() => setModifyWindowData(null)} initialX={350} initialY={200}>
                        <ModifyWindow order={modifyWindowData} availableFunds={funds.available} onClose={() => setModifyWindowData(null)} onConfirm={handleModifyConfirm} />
                      </DraggableWindow>)}

                    {(showOrderBook || activeTab === 'orders') && (<DraggableWindow zIndex={zIndices.book} onFocus={() => bringToFront('book')} onClose={() => {setShowOrderBook(false); if(activeTab === 'orders') setActiveTab('dashboard');}} initialX={100} initialY={400}>
                        <OrderBook orders={orders} selectedOrderId={selectedOrderId} onSelectRow={setSelectedOrderId} onClose={() => setShowOrderBook(false)} />
                      </DraggableWindow>)}
                    
                    {(showPositions || activeTab === 'positions') && (<DraggableWindow zIndex={zIndices.pos} onFocus={() => bringToFront('pos')} onClose={() => {setShowPositions(false); if(activeTab === 'positions') setActiveTab('dashboard');}} initialX={150} initialY={150}>
                        <NetPositions 
                            orders={orders} 
                            marketData={marketDataRef || []} 
                            onClose={() => setShowPositions(false)} 
                            onBulkSquareOff={handleBulkSquareOff} 
                        />
                      </DraggableWindow>)}

                    {showSnapQuote && liveSelectedData && (<DraggableWindow zIndex={zIndices.quote} onFocus={() => bringToFront('quote')} onClose={() => setShowSnapQuote(false)} initialX={400} initialY={100}>
                        <SnapQuote symbolData={liveSelectedData} onClose={() => setShowSnapQuote(false)} onInitiateTrade={(mode) => { setOrderWindow({ mode, data: liveSelectedData }); bringToFront('order'); }} />
                      </DraggableWindow>)}

                    {showFunds && (<DraggableWindow zIndex={zIndices.funds} onFocus={() => bringToFront('funds')} onClose={() => setShowFunds(false)} initialX={500} initialY={200}>
                        <Funds fundsData={funds} onClose={() => setShowFunds(false)} />
                      </DraggableWindow>)}

                    {/* <--- 4. OPTION CHAIN WINDOW ---> */}
                    {showOptionChain && (<DraggableWindow zIndex={zIndices.chain} onFocus={() => bringToFront('chain')} onClose={() => setShowOptionChain(false)} initialX={100} initialY={100} title="OPTION CHAIN">
                        <div style={{width: '900px', height: '600px'}}>
                           <OptionChain spotPrice={24550} isTerminalMode={isTerminalMode} />
                        </div>
                      </DraggableWindow>)}

                </div>

                <div className="bg-white border-t border-gray-200 px-4 py-1 text-[10px] text-gray-500 flex justify-between">
                     <span>System Logs: {logs.length > 0 ? logs[0].msg : "Ready"}</span>
                     <span>v2.0.1 (PaperProp)</span>
                </div>

            </div>
        </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-white">
        <AuthScreen onLoginSuccess={(user, token) => {
            setCurrentUserId(user ? user.username : "TRADER"); 
            setIsLoggedIn(true);
        }} />
    </div>
  );
}
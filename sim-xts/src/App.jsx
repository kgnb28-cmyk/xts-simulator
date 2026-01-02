import React, { useState, useEffect } from 'react';
import { X, Wifi, WifiOff } from 'lucide-react'; 
import MarketWatch from './MarketWatch';
import OrderWindow from './OrderWindow';
import OrderBook from './OrderBook';
import NetPositions from './NetPositions';
import SnapQuote from './SnapQuote';
import DraggableWindow from './DraggableWindow';
import Funds from './Funds';
import ModifyWindow from './ModifyWindow';
import AdminPanel from './AdminPanel'; 
import AuthScreen from './AuthScreen'; // Will be updated in Step 2

const API_URL = "https://xts-backend-api.onrender.com/api";

// --- COMPONENTS (Standard) ---
const XtsButton = ({ text, onClick, className = '' }) => (<button onClick={onClick} className={`bg-gradient-to-b from-[#ff8c00] to-[#ff6a00] hover:from-[#e65c00] hover:to-[#e65c00] text-white font-bold py-1 px-4 text-xs border border-[#cd5c00] shadow-sm ${className}`}>{text}</button>);

const ScreenDownload = ({ onNext }) => { 
  const [isComplete, setIsComplete] = useState(false); 
  useEffect(() => { 
    const timer = setTimeout(() => setIsComplete(true), 1500); 
    return () => clearTimeout(timer); 
  }, []); 
  return (
    <div className="w-full h-full p-6 flex flex-col relative">
      <div className="absolute top-2 right-2 text-gray-400 cursor-pointer"><X size={16} /></div>
      <h2 className="text-xl text-gray-500 font-normal mb-4">Download Instruments</h2>
      <p className="text-[10px] text-gray-500 mb-2 font-bold">Choose Exchange Segments:</p>
      <div className="border border-gray-300 text-[11px] mb-4 bg-white">
        <div className="bg-[#f0f0f0] flex border-b border-gray-300 py-1 px-2 font-bold text-gray-700">
          <span className="w-12">Select</span><span className="w-24">Segment</span><span>Status</span>
        </div>
        {['NSEFO', 'BSEFO'].map(seg => (
          <div key={seg} className="flex border-b border-gray-200 py-1 px-2 items-center">
            <input type="checkbox" checked readOnly className="w-12" />
            <span className="w-24 font-semibold text-gray-700">{seg}</span>
            <span className={`${isComplete ? 'text-green-600' : 'text-blue-600'}`}>{isComplete ? 'Download Complete.' : 'Downloading...'}</span>
          </div>
        ))}
      </div>
      {isComplete && (<div className="mt-auto"><XtsButton text="NEXT" onClick={onNext} /></div>)}
    </div>
  );
};

const RiskModal = ({ onAgree }) => (<div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] z-50 flex items-center justify-center font-sans"><div className="bg-white w-[600px] flex shadow-2xl animate-in fade-in zoom-in duration-200"><div className="w-1/3 bg-gradient-to-br from-[#ff9a44] to-[#fc6076] relative flex flex-col items-center justify-center text-white overflow-hidden"><div className="text-6xl font-extrabold select-none opacity-90">X</div><div className="text-lg font-bold tracking-widest mt-[-5px]">XCHANGE</div><div className="text-[10px] opacity-80 uppercase tracking-wide">Trading System</div><div className="absolute bottom-[-20px] left-0 w-full h-20 bg-white transform -skew-y-6 origin-bottom-left"></div></div><div className="w-2/3 p-6 pt-8"><h3 className="font-bold text-gray-800 text-sm mb-4">RISK DISCLOSURES ON DERIVATIVES</h3><ul className="list-disc pl-5 space-y-2 text-[11px] text-gray-600 leading-tight mb-8"><li>9 out of 10 individual traders in equity Futures and Options Segment, incurred net losses.</li><li>On an average, loss makers registered net trading loss close to ₹ 50,000.</li></ul><div className="flex gap-2"><XtsButton text="Agree" onClick={onAgree} className="flex-1 py-1.5" /><XtsButton text="Logout" className="flex-1 py-1.5" /></div></div></div></div>);

// --- MAIN APP ---

export default function App() {
  const [step, setStep] = useState(1);
  const [showRisk, setShowRisk] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("X14AD43"); 
  const [showAdmin, setShowAdmin] = useState(false); 

  // WINDOW STATES
  const [selectedScript, setSelectedScript] = useState(null); 
  const [orderWindow, setOrderWindow] = useState(null); 
  const [showOrderBook, setShowOrderBook] = useState(false); 
  const [showPositions, setShowPositions] = useState(false); 
  const [showSnapQuote, setShowSnapQuote] = useState(false);
  const [showFunds, setShowFunds] = useState(false); 
  const [modifyWindowData, setModifyWindowData] = useState(null);
  
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  // DEFAULT STATES
  const [funds, setFunds] = useState({ opening: 5000000, payin: 0, payout: 0, usedMargin: 0, realizedMtm: 0, unrealizedMtm: 0, available: 5000000 });
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);

  const [marketDataRef, setMarketDataRef] = useState([]); 
  const [zIndices, setZIndices] = useState({ order: 10, book: 10, pos: 10, quote: 10, funds: 10, modify: 10 });
  
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

  // --- RENDER (LOGGED IN - TERMINAL) ---
  if (isLoggedIn) {
    if (isLoadingData) {
        return (
            <div className="w-screen h-screen bg-[#f0f2f5] flex items-center justify-center flex-col">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-gray-600 font-bold text-sm">Synchronizing with Exchange...</div>
            </div>
        );
    }

    if (showAdmin) {
        return <AdminPanel onClose={() => setShowAdmin(false)} />;
    }

    return (
        <div className="w-screen h-screen bg-[#f0f2f5] flex flex-col overflow-hidden font-sans select-none">
             {/* TOP MENU - ONLY VISIBLE WHEN LOGGED IN */}
             <div className="bg-[#fcfdfe] border-b border-gray-300 px-2 py-0.5 flex gap-3 text-[11px] text-gray-600 shadow-sm z-10">{['File','Market','Orders And Trades','Preferences','Surveillance','Masters','Tools','Scanner','Funds','Add-In','Help'].map(m => (<span key={m} className="hover:bg-gray-200 px-1 cursor-pointer">{m}</span>))}</div>

            <div className="flex-1 relative flex flex-col">
                <MarketWatch onSelectRow={(row) => setSelectedScript(row)} onDataUpdate={(data) => setMarketDataRef(data)} />

                {orderWindow && (<DraggableWindow zIndex={zIndices.order} onFocus={() => bringToFront('order')} onClose={() => setOrderWindow(null)} initialX={300} initialY={150}>
                    <OrderWindow mode={orderWindow.mode} symbolData={orderWindow.data} availableFunds={funds.available} onClose={() => setOrderWindow(null)} onSubmit={handleOrderSubmit} />
                  </DraggableWindow>)}

                {modifyWindowData && (<DraggableWindow zIndex={zIndices.modify} onFocus={() => bringToFront('modify')} onClose={() => setModifyWindowData(null)} initialX={350} initialY={200}>
                    <ModifyWindow order={modifyWindowData} availableFunds={funds.available} onClose={() => setModifyWindowData(null)} onConfirm={handleModifyConfirm} />
                  </DraggableWindow>)}

                {showOrderBook && (<DraggableWindow zIndex={zIndices.book} onFocus={() => bringToFront('book')} onClose={() => setShowOrderBook(false)} initialX={100} initialY={400}>
                    <OrderBook orders={orders} selectedOrderId={selectedOrderId} onSelectRow={setSelectedOrderId} onClose={() => setShowOrderBook(false)} />
                  </DraggableWindow>)}
                
                {showPositions && (<DraggableWindow zIndex={zIndices.pos} onFocus={() => bringToFront('pos')} onClose={() => setShowPositions(false)} initialX={150} initialY={150}>
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

                <div className="h-32 bg-white border-t border-gray-400 flex flex-col text-xs">
                    <div className="bg-[#e0e0e0] border-b border-gray-300 px-2 py-0.5 font-bold text-gray-700 text-[10px] flex justify-between items-center">
                        <span>XTS Notifications</span>
                        <div className="flex items-center gap-1 px-2">
                            {isOffline ? <WifiOff size={10} color="red" /> : <Wifi size={10} color="green" />}
                            <span className={`text-[9px] font-bold ${isOffline ? 'text-red-600' : 'text-green-600'}`}>{isOffline ? 'OFFLINE' : 'CONNECTED'}</span>
                        </div>
                    </div>
                    <div className="flex-1 p-1 overflow-y-auto font-mono text-[11px] bg-white">
                        {logs.map((log, idx) => (
                            <div key={idx} className="flex gap-4 border-b border-gray-100 last:border-0">
                                <span className="text-gray-500 w-16">{log.time}</span>
                                <span className="font-bold text-blue-900 w-16">NSECM</span>
                                <span className="text-gray-800 flex-1">{log.msg}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex bg-[#fcfdfe] border-t border-gray-300"><div className="px-3 py-0.5 border-r border-gray-300 bg-[#dbeaf9] font-bold text-blue-800 border-t-2 border-t-orange-400">XTS Notifications</div><div className="px-3 py-0.5 border-r border-gray-300 text-gray-600 hover:bg-gray-100">Business Logs</div><div className="px-3 py-0.5 border-r border-gray-300 text-gray-600 hover:bg-gray-100">Algo Logs</div></div>
                </div>
            </div>

            <div className="bg-[#fcfdfe] border-t border-gray-300 px-2 py-0.5 flex justify-end gap-4 text-[10px] text-gray-600 shadow-sm h-6 items-center"><div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 shadow-sm"></div><span className="font-bold">NSECM</span></div><div className="flex items-center gap-1"><div className="flex gap-0.5"><div className="w-2 h-2 rounded-full bg-red-500 shadow-sm"></div><div className="w-2 h-2 rounded-full bg-orange-400 shadow-sm"></div><div className="w-2 h-2 rounded-full bg-green-500 shadow-sm"></div></div><span className="font-bold">Feed</span></div></div>
        </div>
    );
  }

  // --- RENDER (LOGGED OUT - LANDING PAGE) ---
  return (
    <div className="w-screen h-screen bg-white flex flex-col overflow-hidden font-sans select-none">
        {/* [REMOVED TOP MENU] - Full Screen Experience */}
        
        <div className="flex-1 relative flex items-center justify-center">
            {step === 1 && (
                <AuthScreen onLoginSuccess={(user, token) => {
                    setCurrentUserId(user.username);
                    setStep(2); 
                }} />
            )}

            {step === 2 && (
                <div className="z-50">
                   <div className="bg-white w-[400px] h-[250px] shadow-2xl rounded-sm border border-gray-300 relative">
                      <ScreenDownload onNext={() => setIsLoggedIn(true)} />
                   </div>
                </div>
            )}
            
            {showRisk && <RiskModal onAgree={() => setIsLoggedIn(true)} />}
        </div>
    </div>
  );
}
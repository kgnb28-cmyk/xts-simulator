import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import { Maximize, Minimize } from 'lucide-react';

const TVChart = ({ isTerminalMode, symbol = "NIFTY 50" }) => { // <--- Added symbol prop
  const chartContainerRef = useRef();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 1. SETUP CHART
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isTerminalMode ? '#000000' : '#ffffff' },
        textColor: isTerminalMode ? '#d1d5db' : '#333',
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight, // Use full height of container
      grid: {
        vertLines: { color: isTerminalMode ? '#333' : '#f0f0f0' },
        horzLines: { color: isTerminalMode ? '#333' : '#f0f0f0' },
      },
      crosshair: { mode: 1 },
      timeScale: { timeVisible: true, secondsVisible: true },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, { 
      upColor: '#26a69a', downColor: '#ef5350',
      borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });

    // 3. GENERATE DUMMY DATA (Resets on symbol change)
    let data = [];
    let time = Math.floor(Date.now() / 1000) - 6000; 
    let lastClose = symbol.includes("BANK") ? 48000 : (symbol.includes("RELIANCE") ? 2500 : 24500); // Simple mock logic

    for (let i = 0; i < 100; i++) {
      let open = lastClose;
      let close = open + (Math.random() - 0.5) * (lastClose * 0.002);
      let high = Math.max(open, close) + Math.random() * (lastClose * 0.001);
      let low = Math.min(open, close) - Math.random() * (lastClose * 0.001);
      data.push({ time: time + (i * 60), open, high, low, close });
      lastClose = close;
    }
    candleSeries.setData(data);

    // 4. LIVE TICK
    const interval = setInterval(() => {
        const lastCandle = data[data.length - 1];
        const now = Math.floor(Date.now() / 1000);
        if (now > lastCandle.time + 60) {
             const newCandle = { time: now, open: lastCandle.close, high: lastCandle.close, low: lastCandle.close, close: lastCandle.close };
             data.push(newCandle);
             candleSeries.update(newCandle);
        } else {
             const volatility = (Math.random() - 0.5) * (lastClose * 0.0005); 
             let newClose = lastCandle.close + volatility;
             let newHigh = Math.max(lastCandle.high, newClose);
             let newLow = Math.min(lastCandle.low, newClose);
             const updatedCandle = { ...lastCandle, high: newHigh, low: newLow, close: newClose };
             data[data.length - 1] = updatedCandle;
             candleSeries.update(updatedCandle);
        }
    }, 500); 

    const handleResize = () => {
        if(chartContainerRef.current) {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        clearInterval(interval);
        chart.remove();
    };
  }, [isTerminalMode, symbol]); // Re-run when Symbol changes

  return (
    <div className={`relative ${isTerminalMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm h-full flex flex-col`}>
        {/* CHART HEADER */}
        <div className={`flex justify-between items-center px-4 py-2 border-b ${isTerminalMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className="flex gap-4 items-center">
                <span className={`text-lg font-bold ${isTerminalMode ? 'text-yellow-400' : 'text-gray-800'}`}>{symbol}</span>
                <span className="text-xs text-gray-500">1 Min • NSE • TradingView</span>
            </div>
            <div className="flex gap-2 text-gray-400">
                 <button onClick={() => setIsFullscreen(!isFullscreen)} className="hover:text-gray-600">
                     {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                 </button>
            </div>
        </div>
        <div ref={chartContainerRef} className="flex-1 w-full overflow-hidden" />
        <div className="absolute bottom-4 left-4 pointer-events-none opacity-5">
            <h1 className="text-6xl font-black">PAPERPROP</h1>
        </div>
    </div>
  );
};

export default TVChart;
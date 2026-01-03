import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { Maximize, Minimize } from 'lucide-react';

const TVChart = ({ isTerminalMode }) => {
  const chartContainerRef = useRef();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // 1. SETUP CHART
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isTerminalMode ? '#000000' : '#ffffff' },
        textColor: isTerminalMode ? '#d1d5db' : '#333',
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: {
        vertLines: { color: isTerminalMode ? '#333' : '#f0f0f0' },
        horzLines: { color: isTerminalMode ? '#333' : '#f0f0f0' },
      },
      crosshair: {
        mode: 1, // Crosshair Mode
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    });

    // 2. ADD CANDLESTICK SERIES
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // 3. GENERATE HISTORICAL DATA (Last 100 Candles)
    let data = [];
    let time = Math.floor(Date.now() / 1000) - 6000; // Start 100 mins ago
    let lastClose = 24500;

    for (let i = 0; i < 100; i++) {
      let open = lastClose;
      let close = open + (Math.random() - 0.5) * 20;
      let high = Math.max(open, close) + Math.random() * 5;
      let low = Math.min(open, close) - Math.random() * 5;
      
      data.push({ time: time + (i * 60), open, high, low, close });
      lastClose = close;
    }
    candleSeries.setData(data);

    // 4. LIVE TICK SIMULATION
    // This creates a "Fake Live Feed" so the user sees movement immediately
    const interval = setInterval(() => {
        const lastCandle = data[data.length - 1];
        const now = Math.floor(Date.now() / 1000);
        
        // If we are in a new minute, start a new candle
        if (now > lastCandle.time + 60) {
             const newCandle = {
                 time: now,
                 open: lastCandle.close,
                 high: lastCandle.close,
                 low: lastCandle.close,
                 close: lastCandle.close
             };
             data.push(newCandle);
             candleSeries.update(newCandle);
        } else {
             // Update current candle (Live Ticking)
             const volatility = (Math.random() - 0.5) * 2; // Random movement
             let newClose = lastCandle.close + volatility;
             let newHigh = Math.max(lastCandle.high, newClose);
             let newLow = Math.min(lastCandle.low, newClose);
             
             const updatedCandle = {
                 ...lastCandle,
                 high: newHigh,
                 low: newLow,
                 close: newClose
             };
             
             data[data.length - 1] = updatedCandle;
             candleSeries.update(updatedCandle);
        }
    }, 500); // Tick every 500ms

    // Resize Handler
    const handleResize = () => {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        clearInterval(interval);
        chart.remove();
    };
  }, [isTerminalMode]);

  return (
    <div className={`relative ${isTerminalMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-sm p-2 h-full flex flex-col`}>
        
        {/* CHART HEADER */}
        <div className="flex justify-between items-center mb-2 px-2">
            <div className="flex gap-4">
                <span className={`font-bold ${isTerminalMode ? 'text-yellow-400' : 'text-gray-800'}`}>NIFTY 50</span>
                <span className="text-xs text-gray-500 mt-1">1 Min • NSE</span>
            </div>
            <div className="flex gap-2">
                 <button onClick={() => setIsFullscreen(!isFullscreen)} className="hover:bg-gray-200 p-1 rounded">
                     {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                 </button>
            </div>
        </div>

        {/* CHART CONTAINER */}
        <div ref={chartContainerRef} className="flex-1 w-full" style={{ minHeight: '350px' }} />
        
        {/* WATERMARK */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5">
            <h1 className="text-6xl font-black">PAPERPROP</h1>
        </div>
    </div>
  );
};

export default TVChart;
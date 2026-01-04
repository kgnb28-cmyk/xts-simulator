import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts'; // <--- 1. ADDED AreaSeries IMPORT
import { Calendar, TrendingUp } from 'lucide-react';

const Performance = ({ isTerminalMode }) => {
  const chartContainerRef = useRef();

  // --- MOCK DATA GENERATORS ---
  
  // 1. Generate P&L Calendar Data (Current Month)
  const generateCalendarData = () => {
      const days = [];
      const daysInMonth = 31; // Simple 31-day assumption
      for (let i = 1; i <= daysInMonth; i++) {
          const isWeekend = (i % 7 === 0 || i % 7 === 6);
          if (isWeekend) {
              days.push({ day: i, pnl: 0, status: 'weekend' });
          } else {
              const pnl = (Math.random() * 20000) - 8000; // Random PnL between -8k and +12k
              days.push({ day: i, pnl: pnl, status: pnl >= 0 ? 'profit' : 'loss' });
          }
      }
      return days;
  };
  const [calendarData] = useState(generateCalendarData());

  // 2. Generate Equity Curve Data
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isTerminalMode ? '#000000' : '#ffffff' },
        textColor: isTerminalMode ? '#d1d5db' : '#333',
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      grid: {
        vertLines: { visible: false },
        horzLines: { color: isTerminalMode ? '#333' : '#f0f0f0' },
      },
      timeScale: { borderVisible: false },
      rightPriceScale: { borderVisible: false },
    });

    // <--- 2. FIXED API CALL FOR V5 --->
    const areaSeries = chart.addSeries(AreaSeries, { 
      topColor: isTerminalMode ? 'rgba(38, 166, 154, 0.56)' : 'rgba(76, 175, 80, 0.5)',
      bottomColor: isTerminalMode ? 'rgba(38, 166, 154, 0.04)' : 'rgba(76, 175, 80, 0.04)',
      lineColor: isTerminalMode ? 'rgba(38, 166, 154, 1)' : 'rgba(76, 175, 80, 1)',
      lineWidth: 2,
    });

    // Simulate 30 Days of Equity Growth
    let capital = 5000000;
    const curveData = [];
    const now = new Date();
    for(let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dailyPnL = (Math.random() * 50000) - 20000;
        capital += dailyPnL;
        curveData.push({ time: dateStr, value: capital });
    }
    areaSeries.setData(curveData);
    chart.timeScale().fitContent();

    const handleResize = () => {
        if(chartContainerRef.current) {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
    };
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
    };
  }, [isTerminalMode]);

  // --- STYLES ---
  const s = isTerminalMode ? {
      wrapper: "h-full bg-black text-white font-mono p-4 overflow-y-auto",
      section: "mb-6",
      card: "bg-[#111] border border-gray-700 rounded-lg p-4",
      header: "text-lg font-bold text-yellow-400 mb-4 uppercase tracking-widest flex items-center gap-2",
      
      // Calendar
      calGrid: "grid grid-cols-7 gap-1",
      calDay: "h-20 border border-gray-800 p-1 relative flex flex-col justify-between hover:bg-[#222] transition-colors",
      calDate: "text-xs text-gray-500",
      calPnl: "text-xs font-bold self-end",
      bgGreen: "bg-green-900/20 text-green-400 border-green-900/50",
      bgRed: "bg-red-900/20 text-red-400 border-red-900/50",
      bgWeekend: "bg-[#0a0a0a] opacity-50",
      
      // Stat Box
      statBox: "bg-[#1a1a1a] p-3 rounded border border-gray-700",
      statLabel: "text-xs text-gray-500 uppercase",
      statValue: "text-xl font-bold text-white",
  } : {
      wrapper: "h-full bg-[#f8f9fa] text-gray-800 font-sans p-6 overflow-y-auto",
      section: "mb-6",
      card: "bg-white border border-gray-200 rounded-xl shadow-sm p-6",
      header: "text-lg font-bold text-gray-900 mb-4 flex items-center gap-2",
      
      calGrid: "grid grid-cols-7 gap-2",
      calDay: "h-24 border border-gray-100 rounded-lg p-2 relative flex flex-col justify-between hover:shadow-md transition-shadow bg-white",
      calDate: "text-sm text-gray-400 font-bold",
      calPnl: "text-sm font-bold self-end",
      bgGreen: "bg-green-50 text-green-700 border-green-200",
      bgRed: "bg-red-50 text-red-700 border-red-200",
      bgWeekend: "bg-gray-50/50",
      
      statBox: "bg-gray-50 p-4 rounded-xl border border-gray-100",
      statLabel: "text-xs text-gray-400 font-bold uppercase tracking-wider",
      statValue: "text-2xl font-black text-gray-800",
  };

  // Helper for PnL Color
  const getDayClass = (day) => {
      if (day.status === 'weekend') return s.bgWeekend;
      if (day.status === 'profit') return s.bgGreen;
      return s.bgRed;
  };

  const netPnl = calendarData.reduce((acc, curr) => acc + curr.pnl, 0);

  return (
    <div className={s.wrapper}>
        
        {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={s.statBox}>
                <div className={s.statLabel}>Net P&L (30 Days)</div>
                <div className={`${s.statValue} ${netPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {netPnl >= 0 ? '+' : ''}{netPnl.toLocaleString('en-IN', {style: 'currency', currency: 'INR'})}
                </div>
            </div>
            <div className={s.statBox}>
                <div className={s.statLabel}>Win Rate</div>
                <div className={s.statValue}>68%</div>
            </div>
            <div className={s.statBox}>
                <div className={s.statLabel}>Avg Profit Day</div>
                <div className="text-green-500 font-bold text-xl">+₹12,400</div>
            </div>
        </div>

        {/* EQUITY CURVE CHART */}
        <div className={s.section}>
            <div className={s.card}>
                <div className={s.header}>
                    <TrendingUp size={20} />
                    <span>Equity Curve</span>
                </div>
                <div ref={chartContainerRef} className="w-full" />
            </div>
        </div>

        {/* P&L CALENDAR */}
        <div className={s.section}>
            <div className={s.card}>
                <div className={s.header}>
                    <Calendar size={20} />
                    <span>Trading Journal (January)</span>
                </div>
                
                {/* Calendar Header (Days) */}
                <div className={`${s.calGrid} mb-2`}>
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                        <div key={d} className="text-center text-xs opacity-50 font-bold">{d}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className={s.calGrid}>
                    {calendarData.map((d, i) => (
                        <div key={i} className={`${s.calDay} ${getDayClass(d)}`}>
                            <span className={s.calDate}>{d.day}</span>
                            {d.status !== 'weekend' && (
                                <span className={s.calPnl}>
                                    {d.pnl > 0 ? '+' : ''}{(d.pnl/1000).toFixed(1)}k
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Performance;
import React, { useState } from 'react';
import { User, Bell } from 'lucide-react';

const Settings = ({ currentUserId, isTerminalMode }) => {
  const [audioEnabled, setAudioEnabled] = useState(true);

  // --- STYLES ---
  const s = isTerminalMode ? {
      wrapper: "h-full bg-black text-white font-mono p-6 overflow-y-auto",
      card: "bg-[#111] border border-gray-700 rounded-lg p-6 mb-6",
      header: "text-xl font-bold text-yellow-400 mb-4 border-b border-gray-700 pb-2 uppercase tracking-widest",
      subtext: "text-gray-400 text-xs mb-4",
      toggleBase: "w-10 h-5 rounded-full relative cursor-pointer transition-colors",
      toggleOn: "bg-green-600",
      toggleOff: "bg-gray-600",
      toggleKnob: "w-3 h-3 bg-white rounded-full absolute top-1 shadow-sm transition-all"
  } : {
      wrapper: "h-full bg-[#f8f9fa] text-gray-800 font-sans p-8 overflow-y-auto",
      card: "bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6",
      header: "text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2",
      subtext: "text-gray-500 text-sm mb-4",
      toggleBase: "w-10 h-5 rounded-full relative cursor-pointer transition-colors",
      toggleOn: "bg-indigo-600",
      toggleOff: "bg-gray-300",
      toggleKnob: "w-3 h-3 bg-white rounded-full absolute top-1 shadow-sm transition-all"
  };

  const Toggle = ({ checked, onChange }) => (
      <div onClick={() => onChange(!checked)} className={`${s.toggleBase} ${checked ? s.toggleOn : s.toggleOff}`}>
        <div className={`${s.toggleKnob} ${checked ? 'left-6' : 'left-1'}`}></div>
      </div>
  );

  return (
    <div className={s.wrapper}>
        <h1 className="text-3xl font-bold mb-8 opacity-80">Settings</h1>

        {/* 1. PROFILE CARD */}
        <div className={s.card}>
            <div className={s.header}>
                <User size={20} />
                <span>Trader Profile</span>
            </div>
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {currentUserId[0]}
                </div>
                <div>
                    <h3 className="font-bold text-lg">{currentUserId}</h3>
                    <span className="inline-block bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold border border-green-200 uppercase">
                        Active Student
                    </span>
                    <p className={s.subtext + " mt-1"}>ID: 59392019 • Server: NSE-SIM-1</p>
                </div>
            </div>
        </div>

        {/* 2. PREFERENCES */}
        <div className={s.card}>
            <div className={s.header}>
                <Bell size={20} />
                <span>Preferences</span>
            </div>
            <div className="flex justify-between items-center max-w-md">
                <span className="text-sm font-bold">Execution Audio Alerts</span>
                <Toggle checked={audioEnabled} onChange={setAudioEnabled} />
            </div>
        </div>

        <div className="text-center text-xs opacity-30 mt-10">
            PaperProp Simulator v2.0.2 • Contact Admin for Capital Reset
        </div>
    </div>
  );
};

export default Settings;
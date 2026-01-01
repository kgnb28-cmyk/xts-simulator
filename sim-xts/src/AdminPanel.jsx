import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';

const API_URL = "https://xts-backend-api.onrender.com/api";

const AdminPanel = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${API_URL}/admin/users`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Admin Fetch Error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
    // Auto-refresh every 5 seconds to simulate live monitoring
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-100 z-[100] flex flex-col font-sans text-xs animate-in fade-in zoom-in duration-200">
      
      {/* HEADER */}
      <div className="bg-[#1a1a1a] text-white px-4 py-2 flex justify-between items-center shadow-md border-b border-gray-600">
        <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-wider text-orange-500">XTS ADMIN <span className="text-gray-400 text-[10px] font-normal tracking-normal ml-2">RISK MANAGEMENT SYSTEM</span></h1>
            <div className="bg-gray-800 px-3 py-0.5 rounded text-[10px] border border-gray-600">
                Active Traders: <b className="text-green-400 ml-1">{users.length}</b>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchUsers} className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors">
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button onClick={onClose} className="bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors flex items-center gap-1">
                <X size={14} /> Close
            </button>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="flex-1 p-4 overflow-auto bg-[#e5e7eb]">
        <div className="bg-white shadow-lg border border-gray-300 rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gradient-to-b from-gray-100 to-gray-200 text-gray-700 font-bold uppercase text-[10px] border-b border-gray-300">
                    <tr>
                        <th className="py-2 px-3 border-r border-gray-300">User ID</th>
                        <th className="py-2 px-3 text-right border-r border-gray-300">Funds Available</th>
                        <th className="py-2 px-3 text-right border-r border-gray-300">Used Margin</th>
                        <th className="py-2 px-3 text-right border-r border-gray-300">Open Orders</th>
                        <th className="py-2 px-3 text-right border-r border-gray-300">PnL (Realized)</th>
                        <th className="py-2 px-3 border-r border-gray-300">Last Activity</th>
                        <th className="py-2 px-3 text-center">Risk Status</th>
                    </tr>
                </thead>
                <tbody className="text-gray-700 text-[11px] font-mono">
                    {users.map(user => {
                        const isHighRisk = user.funds?.usedMargin > 2000000; // Example Risk Rule
                        const lastLog = user.logs && user.logs.length > 0 ? user.logs[0] : null;

                        return (
                            <tr key={user._id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                                <td className="py-2 px-3 font-bold text-blue-900 border-r border-gray-200">{user.userId}</td>
                                <td className="py-2 px-3 text-right border-r border-gray-200 text-green-700 font-bold">
                                    {user.funds?.available?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </td>
                                <td className="py-2 px-3 text-right border-r border-gray-200 text-orange-700">
                                    {user.funds?.usedMargin?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </td>
                                <td className="py-2 px-3 text-right border-r border-gray-200 font-bold">
                                    {user.orders?.filter(o => o.status === 'OPEN').length || 0}
                                </td>
                                <td className={`py-2 px-3 text-right border-r border-gray-200 font-bold ${user.funds?.realizedMtm >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {user.funds?.realizedMtm?.toFixed(2)}
                                </td>
                                <td className="py-2 px-3 border-r border-gray-200 text-gray-500 text-[10px] truncate max-w-[150px]" title={lastLog?.msg}>
                                    {lastLog ? <>{lastLog.time} <span className="text-gray-400">|</span> {lastLog.msg}</> : 'N/A'}
                                </td>
                                <td className="py-2 px-3 text-center">
                                    {isHighRisk ? 
                                        <span className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[9px] font-bold">HIGH RISK</span> : 
                                        <span className="bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[9px] font-bold">NORMAL</span>
                                    }
                                </td>
                            </tr>
                        );
                    })}
                    {users.length === 0 && (
                        <tr><td colSpan="7" className="text-center py-8 text-gray-400 italic">No active traders found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
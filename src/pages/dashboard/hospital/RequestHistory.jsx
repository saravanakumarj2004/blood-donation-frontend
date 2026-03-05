/**
 * RequestHistory - Hospital's Blood Request History
 * 
 * Role: hospital
 * Features: List of all blood requests, status, dates
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { hospitalAPI } from '../../../services/api';
import { Calendar, Search, ArrowUpRight, ArrowDownLeft, Filter, Download } from 'lucide-react';

const RequestHistory = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState('all'); // all, sent, received
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user?.id) return;
            setIsLoading(true);
            try {
                const data = await hospitalAPI.getRequests(user.id, filter, searchTerm);
                setRequests(data);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchHistory();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [user, filter, searchTerm]);

    // Client-side filtering removed - now handled by backend
    const filteredRequests = requests;

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'rejected': return 'bg-red-50 text-error border-red-100';
            case 'accepted': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'dispatched': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            default: return 'bg-neutral-100 text-neutral-600 border-neutral-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-20 bg-slate-50 min-h-screen p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Calendar className="text-blue-600" size={32} /> Request History
                    </h2>
                    <p className="text-slate-500 font-medium ml-11">Archive of all blood transfers and emergency requests.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search history..."
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-semibold text-slate-700 bg-slate-50 focus:bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
                {['all', 'sent', 'received'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${filter === tab ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}
                    >
                        {tab === 'all' ? 'All History' : tab === 'sent' ? 'Sent (Outgoing)' : 'Received (Incoming)'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-500 font-medium">Loading history...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 font-medium">No records found matching your filters.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Other Party</th>
                                    <th className="px-6 py-4">Details</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{new Date(req.date || req.timestamp).toLocaleDateString()}</div>
                                            <div className="text-xs text-slate-500 font-medium uppercase mt-0.5">{new Date(req.date || req.timestamp).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border ${req.isOutgoing ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-purple-700 bg-purple-50 border-purple-200'
                                                }`}>
                                                {req.isOutgoing ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                                                {req.isOutgoing ? 'Sent' : 'Received'}
                                            </div>
                                            <div className="text-xs text-slate-500 font-semibold mt-1">{req.type === 'P2P' ? 'Direct P2P' : 'Emergency'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{req.hospitalName || req.requesterName || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500 font-medium mt-0.5">{req.location || 'Network Hospital'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-base text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">{req.bloodGroup}</span>
                                                <span className="text-sm font-semibold text-slate-600">{req.units} Units</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(req.status)}`}>
                                                {req.status}
                                            </span>
                                            {req.responseMessage && (
                                                <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-2 rounded-lg border border-yellow-200 max-w-[200px] shadow-sm">
                                                    <span className="font-bold block text-[10px] uppercase text-yellow-600 mb-0.5">Note from {req.hospitalName}:</span>
                                                    "{req.responseMessage}"
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestHistory;

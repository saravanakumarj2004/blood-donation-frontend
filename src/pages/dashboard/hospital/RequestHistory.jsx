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
            try {
                const data = await hospitalAPI.getRequests(user.id);
                setRequests(data);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    const filteredRequests = requests.filter(req => {
        // 1. Tab Filter
        if (filter === 'sent' && !req.isOutgoing) return false;
        if (filter === 'received' && req.isOutgoing) return false;

        // 2. Search Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const partyName = (req.hospitalName || req.requesterName || '').toLowerCase();
            const type = (req.bloodGroup || '').toLowerCase();
            return partyName.includes(term) || type.includes(term) || req.status.toLowerCase().includes(term);
        }
        return true;
    });

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'rejected': return 'bg-red-50 text-error border-red-100';
            case 'accepted': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-neutral-100 text-neutral-600 border-neutral-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                        <Calendar className="text-primary" size={28} /> Request History
                    </h2>
                    <p className="text-neutral-500 mt-1">Archive of all blood transfers and emergency requests.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search history..."
                            className="pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl w-fit">
                {['all', 'sent', 'received'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === tab ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                    >
                        {tab === 'all' ? 'All History' : tab === 'sent' ? 'Sent (Outgoing)' : 'Received (Incoming)'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-neutral-500">Loading history...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="p-12 text-center text-neutral-500">No records found matching your filters.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-50 text-neutral-500 text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold">Type</th>
                                    <th className="px-6 py-4 font-semibold">Other Party</th>
                                    <th className="px-6 py-4 font-semibold">Details</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-neutral-600">
                                            {new Date(req.date || req.timestamp).toLocaleDateString()}
                                            <div className="text-xs text-neutral-400">{new Date(req.date || req.timestamp).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${req.isOutgoing ? 'text-blue-600 bg-blue-50' : 'text-purple-600 bg-purple-50'
                                                }`}>
                                                {req.isOutgoing ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                                                {req.isOutgoing ? 'Sent' : 'Received'}
                                            </div>
                                            <div className="text-xs text-neutral-400 mt-1">{req.type === 'P2P' ? 'Direct P2P' : 'Emergency'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-neutral-900">{req.hospitalName || req.requesterName || 'Unknown'}</div>
                                            <div className="text-xs text-neutral-500">{req.location || 'Network Hospital'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-lg text-primary">{req.bloodGroup}</span>
                                                <span className="text-sm text-neutral-600">{req.units} Units</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(req.status)}`}>
                                                {req.status}
                                            </span>
                                            {req.responseMessage && (
                                                <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-2 rounded-lg border border-yellow-100 max-w-[200px]">
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

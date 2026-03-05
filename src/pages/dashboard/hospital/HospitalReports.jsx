import React, { useState, useEffect } from 'react';
import { hospitalAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { BarChart, Activity, AlertTriangle, Calendar, FileText, ArrowRight } from 'lucide-react';

const HospitalReports = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [filter, setFilter] = useState('month'); // week, month, year

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.id) return;
            try {
                // Fetch high-level numbers and history (outgoing batches)
                const [data, historyData] = await Promise.all([
                    hospitalAPI.getReports(user.id),
                    hospitalAPI.getOutgoingBatches(user.id)
                ]);

                // Adapter: Transform Backend Data to UI Structure
                const adaptedStats = {
                    usage: {
                        total: data.total_units_dispatched || 0,
                        whole: data.total_units_dispatched || 0,
                        platelets: 0,
                        plasma: 0
                    },
                    expiry: {
                        total: data.batches_expiring_soon || 0,
                        rate: data.batches_expiring_soon > 0 ? 'Urgent' : 'Low'
                    },
                    transfers: {
                        incoming: data.total_units_collected || 0,
                        outgoing: data.total_units_dispatched || 0
                    },
                    history: (historyData || []).map((log, idx) => ({
                        id: log._id || idx,
                        type: log.type === 'discard' ? 'Discard' : (log.action === 'use_unit' || log.type === 'patient_usage' ? 'Usage' : 'Transfer'),
                        desc: log.reason ? `Discarded: ${log.reason}` : log.ward ? `Used in ${log.ward}` : `Processed ${log.quantity || 0} units of ${log.bloodGroup}`,
                        date: log.issuedAt || log.discardedAt || log.createdAt ? new Date(log.issuedAt || log.discardedAt || log.createdAt).toLocaleDateString() : 'N/A'
                    }))
                };

                setStats(adaptedStats);
            } catch (error) {
                console.error("Failed to fetch reports", error);
            }
        };
        fetchStats();
    }, [filter, user]);

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-20 bg-slate-50 min-h-screen p-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <BarChart className="text-rose-600" size={32} /> Blood Reports
                    </h1>
                    <p className="text-slate-500 font-medium ml-11">Analytics on usage, wastage, and transfers.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-100">
                    {['Week', 'Month', 'Year'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilter(t.toLowerCase())}
                            className={`px-5 py-1.5 rounded-md text-sm font-semibold transition-all ${filter === t.toLowerCase() ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-rose-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {!stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-2xl" />)}
                </div>
            ) : (
                <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Activity size={80} /></div>
                            <h3 className="text-slate-500 font-semibold mb-2">Total Blood Usage</h3>
                            <div className="text-4xl font-bold text-slate-900">{stats.usage.total} <span className="text-lg font-medium text-slate-400">units</span></div>
                            <div className="mt-4 flex gap-2">
                                <span className="text-xs font-semibold bg-rose-50 text-rose-700 px-2 py-1 rounded-md">Whole: {stats.usage.whole}</span>
                                <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-2 py-1 rounded-md">Platelets: {stats.usage.platelets}</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><AlertTriangle size={80} /></div>
                            <h3 className="text-slate-500 font-semibold mb-2">Expiry & Discard</h3>
                            <div className="text-4xl font-bold text-rose-600">{stats.expiry.total} <span className="text-lg font-medium text-rose-300">units</span></div>
                            <div className="mt-4 text-sm font-semibold text-rose-500">Wastage Rate: {stats.expiry.rate}</div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group bg-gradient-to-br from-white to-emerald-50/30">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><ArrowRight size={80} /></div>
                            <h3 className="text-slate-500 font-semibold mb-2">Net Transfers</h3>
                            <div className="flex gap-8">
                                <div>
                                    <div className="text-2xl font-bold text-emerald-600">+{stats.transfers.incoming}</div>
                                    <div className="text-xs font-semibold text-slate-400">Incoming</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-rose-600">-{stats.transfers.outgoing}</div>
                                    <div className="text-xs font-semibold text-slate-400">Outgoing</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Report Table */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <FileText size={20} className="text-slate-400" /> Detailed Report Log
                        </h3>
                        <div className="space-y-3">
                            {stats.history.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'Usage' ? 'bg-rose-100 text-rose-600' :
                                            item.type === 'Discard' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                            {item.type === 'Usage' ? <Activity size={18} /> : item.type === 'Discard' ? <AlertTriangle size={18} /> : <ArrowRight size={18} />}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900">{item.desc}</div>
                                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-0.5">{item.type} Report</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-100">
                                        {item.date}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default HospitalReports;

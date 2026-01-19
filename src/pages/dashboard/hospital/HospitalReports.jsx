import React, { useState, useEffect } from 'react';
import { hospitalAPI } from '../../../services/api';
import { BarChart, Activity, AlertTriangle, Calendar, FileText, ArrowRight } from 'lucide-react';

const HospitalReports = () => {
    const [stats, setStats] = useState(null);
    const [filter, setFilter] = useState('month'); // week, month, year

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await hospitalAPI.getReports();

                // Adapter: Transform Backend Data to UI Structure
                const adaptedStats = {
                    usage: {
                        total: data.dispatched || 0,
                        whole: data.dispatched || 0, // Fallback as we don't have breakdown
                        platelets: 0,
                        plasma: 0
                    },
                    expiry: { total: 0, rate: '0%' }, // Not tracked yet
                    transfers: {
                        incoming: data.collected || 0,
                        outgoing: data.dispatched || 0
                    },
                    history: (data.logs || []).map((log, idx) => ({
                        id: log._id || idx,
                        type: log.type || 'Activity',
                        desc: log.source || `Processed ${log.units || 0} units of ${log.bloodGroup || 'Blood'}`,
                        date: log.date ? new Date(log.date).toLocaleDateString() : 'N/A'
                    }))
                };

                setStats(adaptedStats);
            } catch (error) {
                console.error("Failed to fetch reports", error);
            }
        };
        fetchStats();
    }, [filter]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 backdrop-blur-md bg-white/40 p-8 rounded-[2rem] border border-white/60 shadow-lg">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-600 flex items-center gap-3">
                        <span className="text-4xl">📊</span> Blood Reports
                    </h1>
                    <p className="text-neutral-500 font-medium ml-12">Analytics on usage, wastage, and transfers.</p>
                </div>
                <div className="flex bg-white/50 p-1 rounded-xl border border-neutral-200">
                    {['Week', 'Month', 'Year'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilter(t.toLowerCase())}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === t.toLowerCase() ? 'bg-white shadow-sm text-primary' : 'text-neutral-500 hover:text-neutral-800'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {!stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-neutral-100/50 rounded-[2rem]" />)}
                </div>
            ) : (
                <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-lg border border-white/60 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Activity size={100} /></div>
                            <h3 className="text-neutral-500 font-bold mb-2">Total Blood Usage</h3>
                            <div className="text-4xl font-black text-neutral-800">{stats.usage.total} <span className="text-lg font-medium text-neutral-400">units</span></div>
                            <div className="mt-4 flex gap-2">
                                <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md">Whole: {stats.usage.whole}</span>
                                <span className="text-xs font-bold bg-purple-50 text-purple-600 px-2 py-1 rounded-md">Platelets: {stats.usage.platelets}</span>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-lg border border-white/60 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><AlertTriangle size={100} className="text-red-500" /></div>
                            <h3 className="text-neutral-500 font-bold mb-2">Expiry & Discard</h3>
                            <div className="text-4xl font-black text-red-500">{stats.expiry.total} <span className="text-lg font-medium text-red-300">units</span></div>
                            <div className="mt-4 text-sm font-bold text-red-400">Wastage Rate: {stats.expiry.rate}</div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-lg border border-white/60 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><ArrowRight size={100} className="text-emerald-500" /></div>
                            <h3 className="text-neutral-500 font-bold mb-2">Net Transfers</h3>
                            <div className="flex gap-8">
                                <div>
                                    <div className="text-2xl font-black text-emerald-600">+{stats.transfers.incoming}</div>
                                    <div className="text-xs font-bold text-neutral-400">Incoming</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-blue-600">-{stats.transfers.outgoing}</div>
                                    <div className="text-xs font-bold text-neutral-400">Outgoing</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Report Table */}
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white/60">
                        <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                            <FileText size={20} className="text-neutral-400" /> Detailed Report Log
                        </h3>
                        <div className="space-y-4">
                            {stats.history.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-neutral-50/50 rounded-2xl hover:bg-white border border-transparent hover:border-neutral-100 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.type === 'Usage' ? 'bg-blue-100 text-blue-600' :
                                            item.type === 'Discard' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                            {item.type === 'Usage' ? <Activity size={20} /> : item.type === 'Discard' ? <AlertTriangle size={20} /> : <ArrowRight size={20} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-neutral-800">{item.desc}</div>
                                            <div className="text-xs font-bold text-neutral-400 uppercase">{item.type} Report</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-neutral-500 bg-white px-3 py-1 rounded-lg border border-neutral-100 shadow-sm">
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

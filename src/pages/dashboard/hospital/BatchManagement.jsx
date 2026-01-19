import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { hospitalAPI } from '../../../services/api';
import { Droplet, Calendar, Archive, Clock, Droplets, ArrowDown, MapPin, Building2, AlertCircle } from 'lucide-react';

const BatchManagement = () => {
    const { user } = useAuth();
    const [batches, setBatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBatches = async () => {
        if (!user?.id) return;
        try {
            setIsLoading(true);
            const data = await hospitalAPI.getBatches(user.id);
            setBatches(data);
        } catch (error) {
            console.error("Failed to fetch batches", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, [user]);

    const handleUseUnit = async (batchId) => {
        try {
            const res = await hospitalAPI.useBatchUnit(batchId, 1);
            // Optimistic update
            setBatches(prev => prev.map(b =>
                b._id === batchId || b.id === batchId
                    ? { ...b, units: res.remaining }
                    : b
            ).filter(b => b.units > 0)); // Remove empty batches from view? Or keep them showing 0? User asked to remove/update count.

            // If we want to remove empty batches immediately:
            // .filter(b => b.units > 0) above does this on next render step from map result if we chained it optimally.
            // But let's refine:

        } catch (error) {
            alert("Failed to use unit");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col gap-4 backdrop-blur-md bg-white/40 p-8 rounded-[2rem] border border-white/60 shadow-lg">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-600 flex items-center gap-3">
                    <span className="text-4xl">📦</span> Batch Management
                </h1>
                <p className="text-neutral-500 font-medium ml-12">Track individual blood donation batches and usage.</p>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-neutral-400 font-bold">Loading active batches...</div>
            ) : (
                <div className="space-y-12">
                    {batches.length === 0 ? (
                        <div className="col-span-full p-12 text-center bg-white/50 rounded-3xl border border-dashed border-neutral-200">
                            <p className="text-neutral-500 font-bold">
                                {new URLSearchParams(window.location.search).get('bloodGroup')
                                    ? `No active batches found for ${new URLSearchParams(window.location.search).get('bloodGroup')}.`
                                    : "No active batches found."}
                            </p>
                        </div>
                    ) : (
                        // Group by Blood Group
                        Object.entries(
                            batches
                                // 1. Filter by Blood Group Query Param
                                .filter(batch => {
                                    const params = new URLSearchParams(window.location.search);
                                    const filterGroup = params.get('bloodGroup');
                                    return filterGroup ? batch.bloodGroup === filterGroup : true;
                                })
                                // 2. Sort Logic (Old to New Date) - Assuming Collected Date (FIFO)
                                .sort((a, b) => new Date(a.collectedDate) - new Date(b.collectedDate))
                                .reduce((groups, batch) => {
                                    const group = batch.bloodGroup;
                                    if (!groups[group]) groups[group] = [];
                                    groups[group].push(batch);
                                    return groups;
                                }, {})
                        ).map(([group, groupBatches]) => (
                            <div key={group} className="space-y-6">
                                <h2 className="text-2xl font-black text-neutral-800 flex items-center gap-3 border-b border-neutral-200 pb-2">
                                    <span className={`px-4 py-1 rounded-xl text-lg ${group.includes('+') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {group}
                                    </span>
                                    <span className="text-lg text-neutral-400 font-medium">
                                        {groupBatches.length} Batch{groupBatches.length !== 1 ? 'es' : ''}
                                    </span>
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {groupBatches.map(batch => (
                                        <div key={batch._id || batch.id} className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-lg border border-white/60 flex flex-col gap-4 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                                            {/* Header */}
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shadow-inner ${batch.bloodGroup.includes('+') ? 'bg-red-50 text-red-600' : 'bg-rose-50 text-rose-600'
                                                        }`}>
                                                        {batch.bloodGroup}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-neutral-900">{batch.componentType}</h3>
                                                        <p className="text-xs font-medium text-neutral-400">Batch #{String(batch._id || batch.id).slice(-6)}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold uppercase">
                                                    Active
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="space-y-3 bg-neutral-50/50 p-4 rounded-xl border border-neutral-100">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-neutral-400 font-medium flex items-center gap-1"><Calendar size={14} /> Collected</span>
                                                    <span className="font-bold text-neutral-700">{new Date(batch.collectedDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-neutral-400 font-medium flex items-center gap-1"><AlertCircle size={14} /> Expires</span>
                                                    <span className="font-bold text-red-600">{new Date(batch.expiryDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-neutral-400 font-medium flex items-center gap-1"><Building2 size={14} /> Source</span>
                                                    <span className="font-bold text-neutral-700 truncate max-w-[120px]" title={batch.sourceName}>{batch.sourceName}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-neutral-400 font-medium flex items-center gap-1"><MapPin size={14} /> Location</span>
                                                    <span className="font-bold text-neutral-700">{batch.location}</span>
                                                </div>
                                            </div>

                                            {/* Action */}
                                            <div className="mt-auto pt-2 flex items-center gap-4">
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-neutral-400 uppercase mb-1">Available</p>
                                                    <p className="text-3xl font-black text-neutral-800">{batch.units} <span className="text-sm font-medium text-neutral-400">Units</span></p>
                                                </div>
                                                <button
                                                    onClick={() => handleUseUnit(batch._id || batch.id)}
                                                    className="px-6 py-3 bg-neutral-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-colors flex items-center gap-2 active:scale-95"
                                                >
                                                    <Droplet size={18} className="fill-current" /> Use Unit
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default BatchManagement;

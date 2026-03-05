import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { hospitalAPI } from '../../../services/api';
import { Download, AlertTriangle, ArrowUp, ArrowDown, Droplet, Calendar, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * BloodStock
 * 
 * Detailed inventory management for hospital blood bank.
 * Allows viewing detailed breakdown and manually updating stock counts.
 */
const BloodStock = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    // Removed unused isLoading
    const [showExpiringOnly, setShowExpiringOnly] = useState(false);
    const [showLowOnly, setShowLowOnly] = useState(false);

    // Inventory State
    const [inventory, setInventory] = useState([]);

    const fetchData = async () => {
        if (!user?.id) return;
        try {
            const inventoryData = await hospitalAPI.getInventory(user.id);
            setInventory(inventoryData.map(item => ({
                ...item,
                source: 'Internal'
            })));

        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    // Handle URL filters
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('filter') === 'low') {
            setShowLowOnly(true);
            // Auto scroll to table
            setTimeout(() => {
                document.getElementById('inventory-table')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }, [location]);



    // Removed unused handleViewExpiring

    const toggleLowFilter = () => {
        const newState = !showLowOnly;
        setShowLowOnly(newState);
    };

    const filteredInventory = inventory.filter(item => {
        if (showExpiringOnly && item.expiring === 0) return false;
        // Logic Moved: Use backend status
        if (showLowOnly && item.status !== 'Low' && item.status !== 'Critical') return false;
        return true;
    });

    const totalExpiring = inventory.reduce((acc, item) => acc + item.expiring, 0);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative bg-slate-50 min-h-screen p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Droplet className="text-blue-600" size={32} /> Blood Stock Inventory
                    </h2>
                    <p className="text-slate-500 font-medium mt-1 ml-11">Manage and monitor blood units in real-time.</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/hospital/batches')}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl shadow-sm hover:shadow hover:text-blue-600 border border-slate-200 transition-all active:scale-95"
                >
                    <Download size={20} />
                    Manage Batches
                </button>
            </div>

            {/* Active Filters Banner */}
            {showLowOnly && (
                <div className="flex items-center justify-between bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-600">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <span className="font-bold text-slate-900 block">Low Stock Filter Active</span>
                            <span className="text-sm text-slate-500 font-medium">Viewing only critical or low units</span>
                        </div>
                    </div>
                    <button onClick={toggleLowFilter} className="text-sm font-bold text-slate-500 hover:text-rose-600 transition-colors bg-slate-50 hover:bg-rose-50 px-4 py-2 rounded-lg border border-slate-200 hover:border-rose-200">
                        Clear Filter
                    </button>
                </div>
            )}

            <div id="inventory-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => (
                        <div
                            key={item.type}
                            onClick={() => navigate(`/dashboard/hospital/batches?bloodGroup=${encodeURIComponent(item.type)}`)}
                            className="cursor-pointer bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 group flex flex-col justify-between"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-slate-50 border border-slate-200 text-slate-800 shadow-sm">
                                        {item.type}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 leading-tight">Blood Group</h3>
                                        <p className="text-sm font-medium text-slate-500">
                                            {item.source === 'Internal & External' ? 'Mixed Sources' : 'Internal Stock'}
                                        </p>
                                    </div>
                                </div>
                                {(item.status === 'Low' || item.status === 'Critical') && (
                                    <span className="px-3 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wide">
                                        {item.status}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Available Units</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-4xl font-bold text-slate-900 tracking-tight leading-none">{item.total}</span>
                                        <span className="text-sm font-semibold text-slate-500">Bags</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Last Updated</p>
                                    <p className="text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                                        {item.lastUpdated}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-slate-500 font-semibold bg-white rounded-2xl border border-dashed border-slate-300">
                        No units found matching criteria.
                    </div>
                )}
            </div>

            {/* Expiring Units Alert - Only show if there are expiring units */}
            {totalExpiring > 0 && (
                <div className={`bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm ${showExpiringOnly ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}>
                    <div className="p-3 bg-white border border-amber-100 rounded-xl text-amber-600 shadow-sm">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="text-amber-800 font-bold text-lg mb-1">Expiring Units Alert</h4>
                        <p className="text-amber-700/80 text-sm font-medium">
                            {totalExpiring} units across all types are expiring within the next 7 days. Consider prioritizing these for immediate use or transfer
                            to reduce wastage.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BloodStock;

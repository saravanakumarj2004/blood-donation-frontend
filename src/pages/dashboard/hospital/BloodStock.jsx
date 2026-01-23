import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { hospitalAPI } from '../../../services/api';
import { Download, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
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
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px]" />
                <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-[80px]" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm bg-white/40 p-6 rounded-[2rem] border border-white/60 shadow-lg">
                <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-600 flex items-center gap-3">
                        <span className="text-4xl filter drop-shadow-sm">🩸</span> Blood Stock Inventory
                    </h2>
                    <p className="text-neutral-500 font-medium mt-1 ml-12">Manage and monitor blood units in real-time.</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/hospital/batches')}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-neutral-700 font-bold rounded-2xl shadow-sm hover:shadow-lg hover:text-primary transition-all active:scale-95 border border-white/60"
                >
                    <Download size={20} className="stroke-2" />
                    Manage Batches
                </button>
            </div>

            {/* Active Filters Banner */}
            {showLowOnly && (
                <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-2xl p-4 mx-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <span className="font-bold text-red-800 block">Filtering by Low Stock</span>
                            <span className="text-xs text-red-600 font-medium">Showing units with less than 10 items</span>
                        </div>
                    </div>
                    <button onClick={toggleLowFilter} className="text-sm font-bold text-neutral-500 hover:text-neutral-800 underline decoration-dashed">
                        Clear Filter
                    </button>
                </div>
            )}

            <div id="inventory-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => (
                        <div
                            key={item.type}
                            onClick={() => navigate(`/dashboard/hospital/batches?bloodGroup=${encodeURIComponent(item.type)}`)}
                            className="cursor-pointer bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 shadow-lg hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                        >
                            {/* Decorative Background Blob */}
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.type.includes('+') ? 'from-red-500/10 to-rose-500/10' : 'from-blue-500/10 to-indigo-500/10'} rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-500`} />

                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm group-hover:scale-110 transition-transform duration-300 ${item.type.includes('+') ? 'bg-gradient-to-br from-red-50 to-rose-100 text-rose-600 border border-rose-200' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 border border-blue-200'
                                        }`}>
                                        {item.type}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-neutral-900">Blood Group</h3>
                                        <p className="text-xs font-medium text-neutral-400">
                                            {item.source === 'Internal & External' ? 'Mixed Sources' : 'Internal Stock'}
                                        </p>
                                    </div>
                                </div>
                                {(item.status === 'Low' || item.status === 'Critical') && (
                                    <span className="px-2 py-1 rounded-lg text-[10px] font-black bg-red-100 text-red-600 animate-pulse border border-red-200 shadow-sm uppercase tracking-wide">
                                        {item.status} Stock
                                    </span>
                                )}
                            </div>

                            <div className="mt-6 flex items-end justify-between relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Available Units</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-4xl font-black text-neutral-800 tracking-tight">{item.total}</span>
                                        <span className="text-sm font-bold text-neutral-400">Bags</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-neutral-400 mb-1">Last Updated</p>
                                    <p className="text-xs font-bold text-neutral-600 bg-neutral-100 px-2 py-1 rounded-lg">
                                        {item.lastUpdated}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-neutral-400 font-bold bg-white/50 rounded-3xl border border-dashed border-neutral-200">
                        No units found matching criteria.
                    </div>
                )
                }
            </div>

            {/* Expiring Units Alert - Only show if there are expiring units */}
            {totalExpiring > 0 && (
                <div className={`bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-[2rem] p-8 flex items-start gap-6 shadow-lg shadow-amber-500/10 transition-all ${showExpiringOnly ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}>
                    <div className="p-4 bg-white rounded-2xl text-amber-500 shadow-md">
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <h4 className="text-amber-800 font-bold text-xl mb-2">Expiring Units Alert</h4>
                        <p className="text-amber-700/80 leading-relaxed font-medium">
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

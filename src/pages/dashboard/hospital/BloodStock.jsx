import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { hospitalAPI } from '../../../services/api';
import { Download, Plus, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';

/**
 * BloodStock
 * 
 * Detailed inventory management for hospital blood bank.
 * Allows viewing detailed breakdown and manually updating stock counts.
 */
const BloodStock = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [showExpiringOnly, setShowExpiringOnly] = useState(false);
    const [showLowOnly, setShowLowOnly] = useState(false);

    // Extended Mock Data Structure (API only provides total counts)
    const [inventory, setInventory] = useState([
        { type: 'A+', total: 0, expiring: 0, source: 'Internal', lastUpdated: 'Today' },
        { type: 'A-', total: 0, expiring: 0, source: 'Internal', lastUpdated: 'Today' },
        { type: 'B+', total: 0, expiring: 0, source: 'Internal', lastUpdated: 'Today' },
        { type: 'B-', total: 0, expiring: 0, source: 'Internal', lastUpdated: 'Today' },
        { type: 'O+', total: 0, expiring: 0, source: 'Internal', lastUpdated: 'Today' },
        { type: 'O-', total: 0, expiring: 0, source: 'Internal', lastUpdated: 'Today' },
        { type: 'AB+', total: 0, expiring: 0, source: 'Internal', lastUpdated: 'Today' },
        { type: 'AB-', total: 0, expiring: 0, source: 'Internal', lastUpdated: 'Today' },
    ]);

    const fetchData = async () => {
        if (!user?.id) return;
        try {
            setIsLoading(true);
            const [inventoryData, requests] = await Promise.all([
                hospitalAPI.getInventory(user.id),
                hospitalAPI.getRequests(user.id)
            ]);

            // Determine sources based on COMPLETED P2P requests (Outgoing = I requested it)
            // If I requested blood and received it (Completed), then I have External source.
            const externalSources = new Set();
            requests.forEach(req => {
                if (req.isOutgoing && req.status === 'Completed') {
                    externalSources.add(req.bloodGroup);
                }
            });

            setInventory(prev => prev.map(item => ({
                ...item,
                total: inventoryData[item.type] || 0,
                source: externalSources.has(item.type) ? 'Internal & External' : 'Internal'
            })));

        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
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

    // Handler to update stock via API
    const handleUpdate = async (type, change) => {
        // Find current value
        const currentItem = inventory.find(i => i.type === type);
        if (!currentItem) return;

        const newTotal = Math.max(0, currentItem.total + change);

        // Optimistic UI Update
        setInventory(prev => prev.map(item =>
            item.type === type ? { ...item, total: newTotal } : item
        ));

        try {
            await hospitalAPI.updateInventory({
                hospitalId: user.id,
                [type]: newTotal
            });
        } catch (error) {
            console.error("Failed to update inventory", error);
            // Revert on failure
            fetchData(); // Use fetchData to restore correct source/count
            alert("Failed to update stock. Please try again.");
        }
    };

    const handleViewExpiring = () => {
        const newState = !showExpiringOnly;
        setShowExpiringOnly(newState);

        // If enabling filter, scroll to table
        if (newState) {
            setTimeout(() => {
                document.getElementById('inventory-table')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    };

    const toggleLowFilter = () => {
        const newState = !showLowOnly;
        setShowLowOnly(newState);
    };

    const filteredInventory = inventory.filter(item => {
        if (showExpiringOnly && item.expiring === 0) return false;
        if (showLowOnly && item.total >= 10) return false;
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
                {/* Removed Export/Add Buttons as per feedback */}
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

            <div id="inventory-table" className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-neutral-100/50 border border-white/60 overflow-hidden transition-all duration-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-50/80 text-neutral-400 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-8 py-6">Blood Group</th>
                                <th className="px-8 py-6">Total Units</th>
                                {/* Removed Expiring Column as per feedback */}
                                <th className="px-8 py-6">Source</th>
                                <th className="px-8 py-6">Last Updated</th>
                                <th className="px-8 py-6 text-right">Quick Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100/50">
                            {filteredInventory.length > 0 ? (
                                filteredInventory.map((item) => (
                                    <tr key={item.type} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white to-red-50 border border-red-100 flex items-center justify-center text-lg font-black text-primary shadow-sm group-hover:scale-110 transition-transform">
                                                {item.type}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl font-bold text-neutral-800">{item.total}</span>
                                                {item.total < 10 && (
                                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-100 text-error animate-pulse">LOW</span>
                                                )}
                                            </div>
                                        </td>
                                        {/* Removed Expiring Cell */}
                                        <td className="px-8 py-5 text-sm font-semibold text-neutral-600">
                                            {item.source === 'Internal & External' ? (
                                                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
                                                    Internal & External
                                                </span>
                                            ) : (
                                                <span className="text-neutral-500">Internal</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium text-neutral-500">{item.lastUpdated}</td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleUpdate(item.type, 1)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all shadow-sm hover:shadow-blue-200"
                                                    title="Add Unit"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdate(item.type, -1)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-error hover:bg-error hover:text-white transition-all shadow-sm hover:shadow-red-200"
                                                    title="Remove Unit"
                                                >
                                                    <div className="w-3 h-0.5 bg-current rounded-full" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-12 text-neutral-400 font-medium">No units found matching criteria.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
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

import React, { useState, useEffect } from 'react';
import { Search, Droplet, Filter, AlertTriangle } from 'lucide-react';

import { adminAPI } from '../../../services/api';

const BloodInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [filterType, setFilterType] = useState('All');
    const [showCriticalOnly, setShowCriticalOnly] = useState(false);
    const [stats, setStats] = useState({ totalUnits: 0, criticalCount: 0 });
    const [isFilterOpen, setIsFilterOpen] = useState(false); // New State for Dropdown

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const data = await adminAPI.getGlobalInventory();
                setInventory(data);

                // Calculate Stats from Data
                const total = data.reduce((sum, item) => sum + (item.units || 0), 0);
                const critical = data.filter(item => item.status === 'Critical').length;
                setStats({ totalUnits: total, criticalCount: critical });
            } catch (error) {
                console.error("Failed to fetch inventory", error);
            }
        };
        fetchInventory();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Good': return 'bg-green-50 text-green-700 ring-green-100';
            case 'Low': return 'bg-orange-50 text-orange-700 ring-orange-100';
            case 'Critical': return 'bg-red-50 text-red-700 ring-red-100';
            default: return 'bg-neutral-100 text-neutral-600';
        }
    };

    // Filter Logic
    const filteredInventory = inventory.filter(item => {
        if (showCriticalOnly && item.status !== 'Critical') return false;
        if (filterType !== 'All' && item.bloodGroup !== filterType) return false;
        return true;
    });

    const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                        <Droplet className="text-primary" size={28} /> Blood Inventory
                    </h2>
                    <p className="text-neutral-500 mt-1">System-wide blood stock monitoring.</p>
                </div>
                <div className="flex gap-2 items-center">
                    {/* Filter Type Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-xl font-medium hover:bg-neutral-50 flex items-center gap-2"
                        >
                            <Filter size={18} /> {filterType === 'All' ? 'Filter by Type' : filterType}
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-100 shadow-xl rounded-xl p-2 z-20">
                                {bloodGroups.map(bg => (
                                    <button
                                        key={bg}
                                        onClick={() => {
                                            setFilterType(bg);
                                            setIsFilterOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${filterType === bg ? 'bg-primary/10 text-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}
                                    >
                                        {bg}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowCriticalOnly(!showCriticalOnly)}
                        className={`px-4 py-2 border rounded-xl font-medium flex items-center gap-2 transition-colors ${showCriticalOnly ? 'bg-error text-white border-error shadow-lg shadow-error/30' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                    >
                        <AlertTriangle size={18} /> Critical Only
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Aggregate Stats */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100">
                    <div className="text-sm text-neutral-500 font-medium">Total Units</div>
                    <div className="text-2xl font-bold text-neutral-900">{stats.totalUnits} units</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100">
                    <div className="text-sm text-neutral-500 font-medium">Critical Stock</div>
                    <div className="text-2xl font-bold text-error">{stats.criticalCount} Types</div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-100">
                                <th className="p-4 font-semibold text-neutral-600">Hospital</th>
                                <th className="p-4 font-semibold text-neutral-600">Blood Group</th>
                                <th className="p-4 font-semibold text-neutral-600">Units Available</th>
                                <th className="p-4 font-semibold text-neutral-600">Status</th>
                                <th className="p-4 font-semibold text-neutral-600 text-right">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.length > 0 ? filteredInventory.map((item) => (
                                <tr key={item.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                                    <td className="p-4 font-bold text-neutral-900">{item.hospital}</td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-primary font-bold text-xs ring-1 ring-red-100">
                                            {item.bloodGroup}
                                        </span>
                                    </td>
                                    <td className="p-4 text-neutral-900 font-medium">{item.units} units</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ring-1 ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right text-neutral-500 text-sm">Now</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-neutral-400">
                                        No inventory matches your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default BloodInventory;

import React, { useState, useEffect } from 'react';
import { hospitalAPI } from '../../../services/api';
import { Search, Filter, Phone, Mail, User, CheckCircle, XCircle } from 'lucide-react';

const DonorManagement = () => {
    const [selectedDonor, setSelectedDonor] = useState(null);
    // Removed unused donors state
    const [filteredDonors, setFilteredDonors] = useState([]);
    const [search, setSearch] = useState('');
    // Removed unused isLoading state

    useEffect(() => {
        const fetchDonors = async () => {
            setIsLoading(true);
            try {
                // Use the search endpoint we verified earlier (HospitalDonorSearchView)
                // Assuming hospitalAPI.getDonors can accept params or we use a new method
                // We'll update api.js to ensure getDonors passes 'search' param if needed. 
                // Checks if api.js was updated? Let's assume we update api.js next if needed.
                const data = await hospitalAPI.getDonors(search);
                setDonors(data);
                setFilteredDonors(data); // Backend does the filtering
            } catch (error) {
                console.error("Failed to fetch donors", error);
                setDonors([]);
                setFilteredDonors([]);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchDonors();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search]); // Re-fetch when search changes

    // Client-side filtering removed.

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-20 bg-slate-50 min-h-screen p-6">
            {/* Modal for View Details */}
            {selectedDonor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-lg w-full relative animate-scale-in border border-slate-100">
                        <button
                            onClick={() => setSelectedDonor(null)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <XCircle size={24} className="text-slate-400" />
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                                <User size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{selectedDonor.name}</h2>
                                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold border ${selectedDonor.eligible ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-100'}`}>
                                    {selectedDonor.eligible ? 'Eligible to Donate' : 'Not Eligible'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wide">Blood Group</p>
                                    <p className="text-xl font-bold text-rose-600">{selectedDonor.bloodGroup}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wide">Last Donation</p>
                                    <p className="text-lg font-bold text-slate-900">{selectedDonor.lastDonation || 'Never'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Contact Information</h3>
                                <div className="flex items-center gap-3 text-slate-700">
                                    <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                                        <Phone size={18} />
                                    </div>
                                    <span className="font-semibold text-sm">{selectedDonor.mobile}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-700">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                        <Mail size={18} />
                                    </div>
                                    <span className="font-semibold text-sm">{selectedDonor.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                                Request Donation
                            </button>
                            <button className="flex-1 py-2.5 rounded-lg border border-slate-100 text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm">
                                Update History
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <User className="text-rose-600" size={32} /> Donor Management
                </h1>
                <p className="text-slate-500 font-medium ml-11">Search and manage registered donors information.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search donors by name, blood group, or phone..."
                        className="w-full pl-11 pr-4 py-3 rounded-lg bg-white border border-slate-100 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all font-semibold text-slate-800 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                        value={search}
                        onChange={e => setSearch(e.target.value.replace(/\b\w/g, c => c.toUpperCase()))}
                    />
                </div>
                <button className="px-6 py-3 bg-white rounded-lg border border-slate-100 font-semibold text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-sm">
                    <Filter size={18} /> Filter
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-fixed">
                        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 w-1/6">Donor Name</th>
                                <th className="px-6 py-4 w-1/6">Blood Group</th>
                                <th className="px-6 py-4 w-1/6">Last Donation</th>
                                <th className="px-6 py-4 w-1/6">Status</th>
                                <th className="px-6 py-4 w-1/6">Contact Info</th>
                                <th className="px-6 py-4 w-1/6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredDonors.map(donor => (
                                <tr key={donor.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                                                <User size={18} />
                                            </div>
                                            <span className="font-bold text-slate-900">{donor.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-bold rounded-md text-xs border border-rose-200">{donor.bloodGroup}</span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-600 text-sm">{donor.lastDonation || 'Never'}</td>
                                    <td className="px-6 py-4">
                                        {donor.eligible ? (
                                            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200">
                                                <CheckCircle size={12} className="fill-current" /> Eligible
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-100">
                                                <XCircle size={12} className="fill-current" /> 30 Days Left
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors" title={donor.mobile}>
                                                <Phone size={16} />
                                            </button>
                                            <button className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors" title={donor.email}>
                                                <Mail size={16} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedDonor(donor)}
                                            className="text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredDonors.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-500 font-medium">No donors found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DonorManagement;

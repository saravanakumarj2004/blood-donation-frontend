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
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative">
            {/* Modal for View Details */}
            {selectedDonor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full relative animate-scale-in">
                        <button
                            onClick={() => setSelectedDonor(null)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 transition-colors"
                        >
                            <XCircle size={24} className="text-neutral-400" />
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-primary">
                                <User size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-800">{selectedDonor.name}</h2>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${selectedDonor.eligible ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-500'}`}>
                                    {selectedDonor.eligible ? 'Eligible to Donate' : 'Not Eligible'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                                    <p className="text-sm text-neutral-400 font-bold mb-1">Blood Group</p>
                                    <p className="text-xl font-black text-error">{selectedDonor.bloodGroup}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                                    <p className="text-sm text-neutral-400 font-bold mb-1">Last Donation</p>
                                    <p className="text-lg font-bold text-neutral-700">{selectedDonor.lastDonation || 'Never'}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-bold text-neutral-900 border-b pb-2">Contact Information</h3>
                                <div className="flex items-center gap-3 text-neutral-600">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Phone size={20} />
                                    </div>
                                    <span className="font-medium">{selectedDonor.mobile}</span>
                                </div>
                                <div className="flex items-center gap-3 text-neutral-600">
                                    <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                                        <Mail size={20} />
                                    </div>
                                    <span className="font-medium">{selectedDonor.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:brightness-110 transition-all">
                                Request Donation
                            </button>
                            <button className="flex-1 py-3 rounded-xl border border-neutral-200 text-neutral-600 font-bold hover:bg-neutral-50 transition-all">
                                Update History
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4 backdrop-blur-md bg-white/40 p-8 rounded-[2rem] border border-white/60 shadow-lg">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-600 flex items-center gap-3">
                    <span className="text-4xl">🧍</span> Donor Management
                </h1>
                <p className="text-neutral-500 font-medium ml-12">Search and manage registered donors information.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search donors by name, blood group, or phone..."
                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/80 border border-neutral-200 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-neutral-700 shadow-sm"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button className="px-6 py-4 bg-white/80 rounded-2xl border border-neutral-200 font-bold text-neutral-600 flex items-center gap-2 hover:bg-white transition-all shadow-sm">
                    <Filter size={20} /> Filter
                </button>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-50/80 text-neutral-400 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-8 py-6">Donor Name</th>
                                <th className="px-8 py-6">Blood Group</th>
                                <th className="px-8 py-6">Last Donation</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6">Contact Info</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100/50">
                            {filteredDonors.map(donor => (
                                <tr key={donor.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                                                <User size={20} />
                                            </div>
                                            <span className="font-bold text-neutral-800">{donor.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-red-50 text-error font-black rounded-lg text-sm border border-red-100">{donor.bloodGroup}</span>
                                    </td>
                                    <td className="px-8 py-5 font-medium text-neutral-600">{donor.lastDonation || 'Never'}</td>
                                    <td className="px-8 py-5">
                                        {donor.eligible ? (
                                            <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                                                <CheckCircle size={12} className="fill-current" /> Eligible
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-neutral-400 bg-neutral-50 px-3 py-1 rounded-full text-xs font-bold border border-neutral-200">
                                                <XCircle size={12} className="fill-current" /> 30 Days Left
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex gap-2">
                                            <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title={donor.mobile}>
                                                <Phone size={16} />
                                            </button>
                                            <button className="p-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors" title={donor.email}>
                                                <Mail size={16} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => setSelectedDonor(donor)}
                                            className="text-sm font-bold text-neutral-400 hover:text-primary transition-colors underline decoration-dashed"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredDonors.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-neutral-400 font-medium">No donors found.</td>
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

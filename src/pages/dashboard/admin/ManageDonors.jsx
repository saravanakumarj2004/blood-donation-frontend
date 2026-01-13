import React, { useState, useEffect } from 'react';
import { Search, User, Trash2, Phone, Mail, Droplet, Clock, ShieldCheck, AlertCircle, CheckCircle, X } from 'lucide-react';
import { adminAPI } from '../../../services/api';
import CustomSelect from '../../../components/CustomSelect';

const ManageDonors = () => {
    const [donors, setDonors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGroup, setFilterGroup] = useState('');
    const [eligibleOnly, setEligibleOnly] = useState(false);

    // Feedback & Modal State
    const [feedback, setFeedback] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 3000);
    };

    const fetchDonors = async () => {
        try {
            setIsLoading(true);
            const data = await adminAPI.searchDonors(filterGroup, eligibleOnly);
            setDonors(data);
        } catch (error) {
            console.error("Failed to fetch donors", error);
            showFeedback('error', "Failed to fetch donors");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDonors();
    }, [filterGroup, eligibleOnly]);

    const initiateDelete = (id) => {
        setDeleteModal({ show: true, id });
    };

    const confirmDelete = async () => {
        const id = deleteModal.id;
        try {
            await adminAPI.deleteUser(id);
            setDonors(donors.filter(d => d.id !== id));
            showFeedback('success', "Donor deleted successfully");
        } catch (error) {
            console.error("Failed to delete", error);
            showFeedback('error', "Failed to delete donor");
        } finally {
            setDeleteModal({ show: false, id: null });
        }
    };

    const filteredDonors = donors.filter(d => {
        const matchesSearch = (d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (d.email && d.email.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-40 left-10 w-[500px] h-[500px] bg-red-50/40 rounded-full blur-[100px]" />
                <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-indigo-50/40 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-30 backdrop-blur-md bg-white/40 p-8 rounded-[2.5rem] border border-white/60 shadow-xl shadow-neutral-100/50 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-600 flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                            <User size={32} />
                        </div>
                        Manage Donors
                    </h2>
                    <p className="text-neutral-500 font-medium mt-2 ml-16">View and manage registered donor database.</p>
                </div>

                <div className="flex gap-4">
                    {/* Eligibility Toggle */}
                    <button
                        onClick={() => setEligibleOnly(!eligibleOnly)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold transition-all border ${eligibleOnly
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-white/80 text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                            }`}
                    >
                        <ShieldCheck size={20} className={eligibleOnly ? 'fill-emerald-100' : ''} />
                        <span className="hidden sm:inline">Eligible Only</span>
                    </button>

                    {/* Filter Dropdown */}
                    <div className="w-48">
                        <CustomSelect
                            options={['All Groups', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
                            value={filterGroup || 'All Groups'} // Map empty to 'All Groups' for display
                            onChange={(val) => setFilterGroup(val === 'All Groups' ? '' : val)}
                            placeholder="Filter by Group"
                            icon={Droplet}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-neutral-100/50 border border-white/60 overflow-hidden flex flex-col h-[calc(100vh-280px)]">
                <div className="p-6 border-b border-neutral-100/50 flex gap-4 bg-white/50 backdrop-blur-md sticky top-0 z-20">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={20} />
                        <input
                            type="text"
                            placeholder="Search donors by name or email..."
                            className="w-full pl-12 pr-6 py-4 border border-neutral-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-neutral-700 bg-white/80 transition-all placeholder:text-neutral-400 placeholder:font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-neutral-50/80 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-6 font-bold text-neutral-500 uppercase tracking-wider text-xs">Donor Details</th>
                                <th className="p-6 font-bold text-neutral-500 uppercase tracking-wider text-xs">Blood Group</th>
                                <th className="p-6 font-bold text-neutral-500 uppercase tracking-wider text-xs">Contact Info</th>
                                <th className="p-6 font-bold text-neutral-500 uppercase tracking-wider text-xs">Status</th>
                                <th className="p-6 font-bold text-neutral-500 uppercase tracking-wider text-xs">Last Donation</th>
                                <th className="p-6 font-bold text-neutral-500 uppercase tracking-wider text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100/50">
                            {filteredDonors.length > 0 ? filteredDonors.map((donor) => (
                                <tr key={donor.id} className="group hover:bg-blue-50/30 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-black text-lg shadow-sm border border-blue-100 group-hover:scale-110 transition-transform">
                                                {donor.name ? donor.name[0] : 'D'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg text-neutral-900 group-hover:text-blue-700 transition-colors">{donor.name}</div>
                                                <div className="text-xs font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md w-fit mt-1">ID: #{donor.id.substring(0, 8)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 text-error font-black text-sm shadow-sm border border-red-100 group-hover:rotate-12 transition-transform">
                                            {donor.bloodGroup}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-neutral-600 font-medium text-sm">
                                                <Mail size={14} className="text-neutral-400" /> {donor.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 w-fit ${donor.status === 'Active'
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                }`}>
                                                <span className={`w-2 h-2 rounded-full ${donor.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                                {donor.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-neutral-500 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-neutral-400" />
                                            {donor.lastDonationDate
                                                ? new Date(donor.lastDonationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                                                : 'Never'}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => initiateDelete(donor.id)}
                                            className="p-3 text-neutral-400 hover:text-white hover:bg-error rounded-xl transition-all shadow-sm hover:shadow-lg hover:shadow-red-500/30 active:scale-95 group/del"
                                            title="Delete Donor"
                                        >
                                            <Trash2 size={20} className="group-hover/del:animate-bounce" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-neutral-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center">
                                                <User size={32} className="opacity-30" />
                                            </div>
                                            <p className="font-medium">No donors found matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 animate-scale-in text-center">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Trash2 size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-neutral-900 mb-2">Delete Donor?</h3>
                        <p className="text-neutral-500 font-medium mb-8">
                            Are you sure you want to remove this donor from the system? This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteModal({ show: false, id: null })}
                                className="flex-1 py-3 bg-neutral-100 text-neutral-700 font-bold rounded-xl hover:bg-neutral-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:bg-red-600 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Toast */}
            {feedback && (
                <div className="fixed bottom-6 right-6 z-50 animate-slide-in-right">
                    <div className={`px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border ${feedback.type === 'success' ? 'bg-white border-emerald-100 text-emerald-800' :
                        feedback.type === 'error' ? 'bg-white border-red-100 text-red-800' :
                            'bg-white border-blue-100 text-blue-800'
                        }`}>
                        {feedback.type === 'success' ? <CheckCircle className="text-emerald-500" size={24} /> :
                            <AlertCircle className="text-red-500" size={24} />}
                        <span className="font-bold">{feedback.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageDonors;

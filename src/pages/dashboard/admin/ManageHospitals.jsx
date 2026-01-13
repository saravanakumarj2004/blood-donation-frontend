import React, { useState, useEffect } from 'react';
import { Search, Building2, Trash2, Edit, Filter, MapPin, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { adminAPI } from '../../../services/api';

const ManageHospitals = () => {
    const [hospitals, setHospitals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Feedback & Modal State
    const [feedback, setFeedback] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 3000);
    };

    const fetchHospitals = async () => {
        try {
            setIsLoading(true);
            const data = await adminAPI.getUsers('hospital');
            setHospitals(data);
        } catch (error) {
            console.error("Failed to fetch hospitals", error);
            showFeedback('error', "Failed to fetch hospitals");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHospitals();
    }, []);

    const initiateDelete = (id) => {
        setDeleteModal({ show: true, id });
    };

    const confirmDelete = async () => {
        const id = deleteModal.id;
        try {
            await adminAPI.deleteUser(id);
            setHospitals(hospitals.filter(h => h.id !== id));
            showFeedback('success', "Hospital deleted successfully");
        } catch (error) {
            console.error("Failed to delete", error);
            showFeedback('error', "Failed to delete hospital");
        } finally {
            setDeleteModal({ show: false, id: null });
        }
    };

    const filteredHospitals = hospitals.filter(h =>
        (h.name && h.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (h.location && h.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-purple-100/40 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 right-20 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-[100px]" />
            </div>

            <div className="backdrop-blur-md bg-white/40 p-8 rounded-[2.5rem] border border-white/60 shadow-xl shadow-neutral-100/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-600 flex items-center gap-3">
                        <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                            <Building2 size={32} />
                        </div>
                        Manage Hospitals
                    </h2>
                    <p className="text-neutral-500 font-medium mt-2 ml-16">Register and manage partner hospitals.</p>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-neutral-100/50 border border-white/60 overflow-hidden flex flex-col h-[calc(100vh-280px)]">
                <div className="p-6 border-b border-neutral-100/50 flex gap-4 bg-white/50 backdrop-blur-md sticky top-0 z-20">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={20} />
                        <input
                            type="text"
                            placeholder="Search hospitals by name or location..."
                            className="w-full pl-12 pr-6 py-4 border border-neutral-200 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 font-bold text-neutral-700 bg-white/80 transition-all placeholder:text-neutral-400 placeholder:font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-neutral-50/80 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-6 font-bold text-neutral-500 uppercase tracking-wider text-xs">Hospital Details</th>
                                <th className="p-6 font-bold text-neutral-500 uppercase tracking-wider text-xs">Contact Info</th>
                                <th className="p-6 font-bold text-neutral-500 uppercase tracking-wider text-xs">Location</th>
                                <th className="p-6 font-bold text-neutral-500 uppercase tracking-wider text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100/50">
                            {filteredHospitals.map((hospital) => (
                                <tr key={hospital.id} className="group hover:bg-purple-50/30 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center text-purple-600 font-black text-lg shadow-sm border border-purple-100 group-hover:scale-110 transition-transform">
                                                {hospital.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg text-neutral-900 group-hover:text-purple-700 transition-colors">{hospital.name}</div>
                                                <div className="text-xs font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md w-fit mt-1">ID: #{hospital.id.substring(0, 8)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-neutral-600 font-medium">
                                            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500">
                                                <Phone size={16} />
                                            </div>
                                            {hospital.contact || hospital.phone || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-neutral-600 font-medium">
                                            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500">
                                                <MapPin size={16} />
                                            </div>
                                            {hospital.location || 'Location Pending'}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => initiateDelete(hospital.id)}
                                            className="p-3 text-neutral-400 hover:text-white hover:bg-error rounded-xl transition-all shadow-sm hover:shadow-lg hover:shadow-red-500/30 active:scale-95 group/del"
                                            title="Delete Hospital"
                                        >
                                            <Trash2 size={20} className="group-hover/del:animate-bounce" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredHospitals.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-neutral-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <Search size={40} className="opacity-20" />
                                            <p className="font-medium">No hospitals found matching your search.</p>
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
                        <h3 className="text-2xl font-black text-neutral-900 mb-2">Delete Hospital?</h3>
                        <p className="text-neutral-500 font-medium mb-8">
                            Are you sure you want to remove this hospital from the system? This action cannot be undone.
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

export default ManageHospitals;

import React, { useState, useEffect } from 'react';
import { donorAPI } from '../../../services/api';
import { User, MapPin, Phone, Heart, CheckCircle, AlertTriangle } from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect';
import MultiSelect from '../../../components/MultiSelect';

import { useAuth } from '../../../hooks/useAuth';

const DonorRequest = () => {
    const { user } = useAuth();
    const [form, setForm] = useState({
        bloodGroup: '',
        units: '',
        urgency: 'Normal',
        city: '', // Legacy support
        cities: [], // New Multi-City Support
        hospitalName: '',
        location: '',
        patientName: '',
        patientNumber: '',
        attenderName: '',
        attenderNumber: ''
    });
    const [feedback, setFeedback] = useState(null);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [selectedCities, setSelectedCities] = useState([]);

    const handleInitialSubmit = (e) => {
        e.preventDefault();
        setShowLocationModal(true);
    };

    const handleFinalSubmit = async () => {
        if (selectedCities.length === 0) {
            setFeedback({ type: 'error', message: 'Please select at least one city to broadcast to.' });
            return;
        }

        if (!user || !user.id) {
            setFeedback({ type: 'error', message: 'User session invalid. Please login again.' });
            return;
        }

        try {
            const finalData = {
                ...form,
                cities: selectedCities,
                city: selectedCities.join(', '), // Fallback for display
                requesterId: user.id
            };
            await donorAPI.createRequest(finalData);
            setFeedback({ type: 'success', message: 'Request Broadcasted! Donors in selected areas notified.' });
            setForm({
                bloodGroup: '', units: '', urgency: 'Normal', city: '', cities: [], hospitalName: '', location: '',
                patientName: '', patientNumber: '', attenderName: '', attenderNumber: ''
            });
            setShowLocationModal(false);
            setSelectedCities([]);
        } catch (error) {
            console.error(error);
            setFeedback({ type: 'error', message: 'Failed to create request.' });
        }
    };

    // Fetch available cities when modal opens
    const [availableCities, setAvailableCities] = useState([]);
    const [loadingCities, setLoadingCities] = useState(false);

    useEffect(() => {
        if (showLocationModal) {
            setLoadingCities(true);
            donorAPI.getActiveLocations()
                .then(cities => {
                    setAvailableCities(cities);
                    setLoadingCities(false);
                })
                .catch(() => setLoadingCities(false));
        }
    }, [showLocationModal]);

    // Fetch count when city selected
    const [donorCount, setDonorCount] = useState(null);
    const [checkingCount, setCheckingCount] = useState(false);

    useEffect(() => {
        if (selectedCities.length > 0) {
            setCheckingCount(true);
            donorAPI.getDonorCount(selectedCities, form.bloodGroup)
                .then(res => setDonorCount(res.count))
                .catch(() => setDonorCount(0))
                .finally(() => setCheckingCount(false));
        } else {
            setDonorCount(null);
        }
    }, [selectedCities]);

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in relative">
            {feedback && (
                <div className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                    <span className="font-bold">{feedback.message}</span>
                </div>
            )}

            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">
                    Request Help from Peers
                </h1>
                <p className="text-neutral-500 font-medium">Create a P2P request to ask other voluntary donors for help.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-white/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-red-500/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />

                <form onSubmit={handleInitialSubmit} className="space-y-6 relative z-10">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2">Blood Group Required</label>
                            <CustomSelect
                                options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
                                value={form.bloodGroup}
                                onChange={v => setForm({ ...form, bloodGroup: v })}
                                placeholder="Select Group" icon={Heart} required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2">Urgency Level</label>
                            <CustomSelect
                                options={['Normal', 'Critical', 'Emergency']}
                                value={form.urgency}
                                onChange={v => setForm({ ...form, urgency: v })}
                                placeholder="Select Urgency" icon={AlertTriangle} required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2">Units Required</label>
                        <input
                            type="number"
                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none font-bold transition-all"
                            value={form.units}
                            onChange={e => setForm({ ...form, units: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2">Patient Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                <input type="text" className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold outline-none"
                                    value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2">Patient Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                <input type="tel" className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold outline-none"
                                    value={form.patientNumber} onChange={e => setForm({ ...form, patientNumber: e.target.value })} required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2">Patient Admitted Hospital Name</label>
                            <div className="relative">
                                <AlertTriangle className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                <input type="text" className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold outline-none"
                                    value={form.hospitalName} onChange={e => setForm({ ...form, hospitalName: e.target.value })} required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2">Hospital Location (Address)</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                <input type="text" className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold outline-none"
                                    value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required placeholder="e.g. 123 Main St, Springfield"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2">Attender Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                <input type="text" className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold outline-none"
                                    value={form.attenderName} onChange={e => setForm({ ...form, attenderName: e.target.value })} required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2">Attender Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                <input type="tel" className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold outline-none"
                                    value={form.attenderNumber} onChange={e => setForm({ ...form, attenderNumber: e.target.value })} required
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 mt-8 bg-neutral-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 group">
                        <CheckCircle size={20} className="group-hover:scale-110 transition-transform" /> Next Step: Select Area
                    </button>
                </form>
            </div>

            {/* Broadcast Location Modal */}
            {showLocationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl animate-scale-in">
                        <div className="text-center space-y-3 mb-8">
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                                <MapPin size={40} className="fill-current" />
                            </div>
                            <h2 className="text-3xl font-black text-neutral-900">Broadcast Range</h2>
                            <p className="text-neutral-500 font-medium">Select one or more areas to alert eligible donors.</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Target Cities / Regions</label>
                                {loadingCities ? (
                                    <div className="p-4 text-center text-neutral-400 font-bold bg-neutral-50 rounded-xl animate-pulse">
                                        Loading active locations...
                                    </div>
                                ) : (
                                    <MultiSelect
                                        options={availableCities.length > 0 ? availableCities : ['New York']}
                                        value={selectedCities}
                                        onChange={setSelectedCities}
                                        placeholder={availableCities.length === 0 ? "No active donors found" : "Select Areas"}
                                        icon={MapPin}
                                    />
                                )}
                            </div>

                            {/* Donor Count Confirmation */}
                            {selectedCities.length > 0 && (
                                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-center animate-fade-in">
                                    {checkingCount ? (
                                        <p className="text-neutral-400 font-bold">Checking donor availability...</p>
                                    ) : (
                                        <>
                                            <p className="text-2xl font-black text-neutral-900 mb-1">{donorCount} Donors</p>
                                            <p className="text-sm font-bold text-neutral-500">
                                                are eligible (60-day rule) & available.<br />
                                                Are you sure you want to send the request?
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    onClick={() => setShowLocationModal(false)}
                                    className="py-4 rounded-xl font-bold text-neutral-500 hover:bg-neutral-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleFinalSubmit}
                                    disabled={selectedCities.length === 0 || checkingCount}
                                    className="py-4 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Broadcast Now <AlertTriangle size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonorRequest;

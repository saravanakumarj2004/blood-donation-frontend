import React, { useState } from 'react';
import { Search, MapPin, CheckCircle, AlertCircle, Building2, Bell } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { hospitalAPI } from '../../../services/api';
import CustomSelect from '../../../components/CustomSelect';

/**
 * RequestBlood
 * 
 * "Nearby" Hospital Search for emergency blood requests.
 * Features: Search global network, Send P2P Request, Emergency Admin Alert.
 */
const RequestBlood = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useState({ type: 'O+', units: 2 });
    const [requiredTime, setRequiredTime] = useState('2 hours');
    const [isSearching, setIsSearching] = useState(false);
    const [reqStatus, setReqStatus] = useState({}); // { hospitalId: 'sent' | 'emergency_sent' }
    const [results, setResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    // UI Feedback State
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

    // Helper to show feedback
    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 5000); // Auto dismiss
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        setHasSearched(true);
        setResults([]);
        setFeedback(null);

        if (!user?.id) return;

        const performSearch = async (lat = null, lng = null) => {
            try {
                // Call Real API with Geolocation
                const data = await hospitalAPI.searchBlood(searchParams.type, lat, lng);

                const filtered = data.filter(h =>
                    h.id !== user.id &&
                    (h.units || 0) >= parseInt(searchParams.units)
                );

                setResults(filtered);
                if (filtered.length === 0) {
                    // No need for error, the empty state UI shows
                } else {
                    showFeedback('success', `Found ${filtered.length} hospitals with stock availability.`);
                }
            } catch (error) {
                console.error("Search failed", error);
                showFeedback('error', "Failed to search network. The server might be busy.");
            } finally {
                setIsSearching(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    performSearch(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    performSearch(); // Fallback to no-location search
                    showFeedback('info', "Geolocation disabled. Searching global network instead.");
                }
            );
        } else {
            performSearch();
        }
    };

    /**
     * Send P2P Request
     * Calls API to create a request in DB.
     */
    const handleRequest = async (hospitalId) => {
        try {
            const newRequest = {
                hospitalId: hospitalId, // Target (Responder)
                requesterId: user.id,
                requesterName: user.name,
                bloodGroup: searchParams.type,
                units: parseInt(searchParams.units),
                status: 'Pending',
                type: 'P2P'
            };

            await hospitalAPI.createRequest(newRequest);

            setReqStatus(prev => ({ ...prev, [hospitalId]: 'sent' }));
            showFeedback('success', "Request sent successfully to hospital!");
        } catch (error) {
            console.error("Failed to send request", error);
            showFeedback('error', "Failed to send request. Please try again.");
        }
    };

    /**
     * Send Emergency Alert to Admin
     * Triggered when no stock is found.
     */
    const handleEmergencyAlert = async () => {
        const emergencyReq = {
            requesterId: user?.id,
            requesterName: user?.name,
            responderId: 'admin_1', // Target Admin placeholder
            bloodGroup: searchParams.type,
            units: parseInt(searchParams.units),
            requiredTime: requiredTime,
            status: 'Active', // Active status for DB counting
            type: 'EMERGENCY_ALERT',
            hospitalId: user?.id // Vital for Hospital Dashboard to see this request
        };

        try {
            await hospitalAPI.createRequest(emergencyReq);
            setReqStatus(prev => ({ ...prev, emergency: 'sent' }));
            showFeedback('success', "Emergency Alert has been broadcast to all donors and network!");
        } catch (error) {
            console.error("Failed to send alert", error);
            showFeedback('error', "Failed to send alert. Please ensure connection.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative">
            {/* Feedback Toast */}
            {feedback && (
                <div className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-slide-in-right ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                    feedback.type === 'error' ? 'bg-red-50 text-red-800 border-red-100' :
                        'bg-blue-50 text-blue-800 border-blue-100'
                    }`}>
                    {feedback.type === 'success' ? <CheckCircle size={20} className="text-emerald-500" /> :
                        feedback.type === 'error' ? <AlertCircle size={20} className="text-red-500" /> :
                            <Bell size={20} className="text-blue-500" />}
                    <span className="font-bold">{feedback.message}</span>
                    <button onClick={() => setFeedback(null)} className="ml-2 hover:bg-black/5 p-1 rounded-full"><AlertCircle className="opacity-0" size={16} /></button>
                </div>
            )}
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px]" />
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-6 backdrop-blur-md bg-white/40 p-8 rounded-[2rem] border border-white/60 shadow-lg shadow-neutral-100/50">
                <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-600 flex items-center gap-3">
                        <span className="text-4xl filter drop-shadow-sm">🚑</span> Request Blood
                    </h2>
                    <p className="text-neutral-500 font-medium mt-1 ml-14">Search network for available stock and request transfers.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Search Panel */}
                <div className="lg:col-span-4">
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-neutral-100/50 border border-white/60 top-8 sticky z-30">
                        <h4 className="text-xl font-bold text-neutral-900 mb-8 flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                <Search size={24} />
                            </div>
                            Search Parameters
                        </h4>
                        <form onSubmit={handleSearch} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2.5 ml-1">Blood Group</label>
                                <CustomSelect
                                    options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
                                    value={searchParams.type}
                                    onChange={(val) => setSearchParams({ ...searchParams, type: val })}
                                    className="w-full"
                                    placeholder="Select Type"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2.5 ml-1">Units Required</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={searchParams.units}
                                    onChange={(e) => setSearchParams({ ...searchParams, units: e.target.value })}
                                    className="w-full p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-neutral-800"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-primary to-rose-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                                disabled={isSearching}
                            >
                                {isSearching ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        Find Blood <Search size={20} className="group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-8">
                    {!hasSearched && (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 bg-white/50 backdrop-blur-sm border-2 border-dashed border-neutral-200 rounded-[2.5rem] text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <Building2 size={40} className="text-neutral-300" />
                            </div>
                            <h3 className="text-xl font-black text-neutral-700">Ready to Search</h3>
                            <p className="text-neutral-400 max-w-sm mx-auto mt-2 font-medium">
                                Select blood group and units to find shortage supplies from nearby network hospitals.
                            </p>
                        </div>
                    )}

                    {hasSearched && !isSearching && results.length === 0 && (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 bg-red-50/50 backdrop-blur-sm border-2 border-dashed border-red-200 rounded-[2.5rem] text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-multiply" />

                            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 relative z-10 animate-pulse">
                                <AlertCircle size={48} className="text-error" />
                            </div>
                            <h3 className="text-2xl font-black text-error relative z-10">No Availability Found</h3>
                            <p className="text-red-700/80 max-w-sm mx-auto mt-2 mb-8 font-medium relative z-10">
                                No partner hospitals have <span className="font-bold">{searchParams.units} units</span> of <span className="font-bold">{searchParams.type}</span> available.
                            </p>

                            <div className="mb-8 w-full max-w-xs mx-auto text-left relative z-10 bg-white/50 p-4 rounded-xl border border-red-100">
                                <label className="block text-sm font-bold text-red-800 mb-2">Required Within:</label>
                                <CustomSelect
                                    options={[
                                        "Immediate (30 mins)",
                                        "1 Hour",
                                        "2 Hours",
                                        "4 Hours",
                                        "Today"
                                    ]}
                                    value={requiredTime}
                                    onChange={(val) => setRequiredTime(val)}
                                    placeholder="Select Urgency"
                                    className="w-full"
                                />
                            </div>

                            {reqStatus.emergency === 'sent' ? (
                                <button disabled className="px-8 py-4 bg-red-800 text-white font-bold rounded-2xl flex items-center gap-3 cursor-default opacity-90 shadow-lg relative z-10">
                                    <CheckCircle size={24} /> Alert Sent to Admin
                                </button>
                            ) : (
                                <button
                                    onClick={handleEmergencyAlert}
                                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-2xl shadow-xl shadow-red-500/30 hover:scale-105 hover:shadow-red-500/40 transition-all flex items-center gap-3 relative z-10 group"
                                >
                                    <div className="p-1 bg-white/20 rounded-full group-hover:animate-ping">
                                        <Bell size={20} className="fill-current" />
                                    </div>
                                    Send Emergency Alert
                                </button>
                            )}
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-3 px-2">
                                <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                                    <CheckCircle size={20} className="fill-emerald-100" />
                                </div>
                                {results.length} Hospitals Found Nearby ({searchParams.type})
                            </h3>

                            <div className="grid gap-4">
                                {results.map(hospital => (
                                    <div key={hospital.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-neutral-100 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                            <div className="flex items-center gap-5 w-full sm:w-auto">
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                                    <Building2 size={28} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-xl text-neutral-900 group-hover:text-primary transition-colors">{hospital.name}</div>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500 font-medium">
                                                        <span className="flex items-center gap-1.5 bg-neutral-100 px-2 py-0.5 rounded-md">
                                                            <MapPin size={14} className="text-neutral-400" /> {hospital.location} <span className="text-neutral-300">|</span> {hospital.distance}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            {hospital.units} units available
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="w-full sm:w-auto">
                                                {reqStatus[hospital.id] === 'sent' ? (
                                                    <button disabled className="w-full sm:w-auto px-6 py-3 bg-emerald-50 text-emerald-600 font-bold rounded-xl border border-emerald-100 flex items-center justify-center gap-2 cursor-default shadow-sm">
                                                        <CheckCircle size={20} className="fill-emerald-100" /> Request Sent
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRequest(hospital.id)}
                                                        className="w-full sm:w-auto px-8 py-3 bg-white text-primary font-bold rounded-xl border-2 border-primary/10 hover:border-primary hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-primary/20 active:scale-95"
                                                    >
                                                        Request Units
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestBlood;

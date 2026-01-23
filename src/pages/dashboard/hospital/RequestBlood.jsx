import React, { useState } from 'react';
import { Search, MapPin, CheckCircle, AlertCircle, Building2, Bell } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { hospitalAPI, donorAPI } from '../../../services/api';
import CustomSelect from '../../../components/CustomSelect';
import MultiSelect from '../../../components/MultiSelect';

/**
 * RequestBlood
 * 
 * "Nearby" Hospital Search for emergency blood requests.
 * Features: Search global network, Send P2P Request, Emergency Admin Alert.
 */
const RequestBlood = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useState({ type: 'O+', units: 2 });
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [hasSearchedDonors, setHasSearchedDonors] = useState(false); // Track strictly for Donor Search

    // Donor Search State (Fallback)
    const [showDonorSearch, setShowDonorSearch] = useState(false);
    const [selectedCities, setSelectedCities] = useState([]);
    const [activeCities, setActiveCities] = useState([]);
    const [eligibleDonors, setEligibleDonors] = useState([]);
    const [isSearchingDonors, setIsSearchingDonors] = useState(false);
    const [reqStatus, setReqStatus] = useState({}); // { hospitalId: 'sent' | 'broadcast_sent': true }

    // Request Form Details
    const [reqDetails, setReqDetails] = useState({
        patientName: '',
        patientNumber: '',
        attenderName: '',
        attenderNumber: '',
        urgency: 'Urgent',
        hospitalName: '',
        location: ''
    });

    // Auto-fill Hospital Details
    React.useEffect(() => {
        if (user) {
            setReqDetails(prev => ({
                ...prev,
                hospitalName: user.name || '',
                location: user.location || ''
            }));
        }
    }, [user]);

    // UI Feedback State
    const [feedback, setFeedback] = useState(null);

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 5000);
    };

    // Fetch Active Cities for MultiSelect
    React.useEffect(() => {
        const fetchCities = async () => {
            try {
                const cities = await donorAPI.getActiveLocations();
                setActiveCities(cities);
            } catch (err) {
                console.error("Failed to fetch cities", err);
            }
        };
        fetchCities();
    }, []);

    // 1. Hospital Network Search
    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        setHasSearched(true);
        setResults([]);
        setEligibleDonors([]);
        setShowDonorSearch(false);
        setFeedback(null);

        if (!user?.id) return;

        const performSearch = async (lat = null, lng = null) => {
            try {
                // Pass units and userId to Backend for strict filtering
                const data = await hospitalAPI.searchBlood(
                    searchParams.type,
                    searchParams.units,
                    user.id,
                    lat,
                    lng
                );

                // Backend now handles all filtering (units >= required, exclude self)
                const filtered = data;
                setResults(filtered);

                if (filtered.length === 0) {
                    setShowDonorSearch(true); // Trigger Fallback UI
                    showFeedback('info', "No hospital stock found. Switching to Donor Network Search.");
                } else {
                    showFeedback('success', `Found ${filtered.length} hospitals with stock availability.`);
                }
            } catch (error) {
                console.error("Search failed", error);
                showFeedback('error', "Failed to search network.");
            } finally {
                setIsSearching(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => performSearch(position.coords.latitude, position.coords.longitude),
                () => performSearch()
            );
        } else {
            performSearch();
        }
    };

    // 2. Search Eligible Donors (Fallback)
    const handleDonorSearch = async () => {
        if (selectedCities.length === 0) {
            showFeedback('error', "Please select at least one city.");
            return;
        }
        setIsSearchingDonors(true);
        setHasSearchedDonors(true); // Mark search as executed
        try {
            const donors = await hospitalAPI.searchDonors(searchParams.type, selectedCities);
            setEligibleDonors(donors);
            if (donors.length === 0) {
                showFeedback('info', "No eligible donors found matching criteria (60-day rule applied).");
            } else {
                showFeedback('success', `Found ${donors.length} eligible donors in selected cities.`);
            }
        } catch (error) {
            console.error("Donor search failed", error);
            showFeedback('error', "Failed to search donors.");
        } finally {
            setIsSearchingDonors(false);
        }
    };

    // 3. Broadcast P2P Request to Found Donors
    const handleBroadcast = async () => {
        try {
            // Use existing P2P Request logic (City + Blood Group Broadcast)
            const newRequest = {
                requesterId: user.id,
                requesterName: user.name,
                bloodGroup: searchParams.type,
                units: parseInt(searchParams.units),
                status: 'Pending',
                type: 'EMERGENCY_ALERT',
                city: selectedCities.join(', '),
                cities: selectedCities,

                // Detailed Form Data
                patientName: reqDetails.patientName,
                patientNumber: reqDetails.patientNumber,
                attenderName: reqDetails.attenderName,
                attenderNumber: reqDetails.attenderNumber,
                urgency: reqDetails.urgency,
                hospitalName: reqDetails.hospitalName, // From Form (Autofilled)
                location: reqDetails.location // From Form (Autofilled)
            };

            await hospitalAPI.createRequest(newRequest);
            setReqStatus(prev => ({ ...prev, broadcast_sent: true }));
            showFeedback('success', "Message sent successfully to all filtered donors!");

        } catch (error) {
            console.error("Broadcast failed", error);
            showFeedback('error', "Failed to send broadcast.");
        }
    };

    // 4. Request from another Hospital
    const handleRequestHospital = async (hospitalId) => {
        try {
            const newRequest = {
                hospitalId: hospitalId,
                requesterId: user.id,
                requesterName: user.name,
                bloodGroup: searchParams.type,
                units: parseInt(searchParams.units),
                status: 'Pending',
                type: 'StockTransfer' // Fixed Type
            };
            await hospitalAPI.createRequest(newRequest);
            setReqStatus(prev => ({ ...prev, [hospitalId]: 'sent' }));
            showFeedback('success', "Transfer request sent!");
        } catch (error) {
            showFeedback('error', "Transfer request failed.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative pb-20">
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

            <div className="flex flex-col md:flex-row justify-between gap-6 backdrop-blur-md bg-white/40 p-8 rounded-[2rem] border border-white/60 shadow-lg shadow-neutral-100/50">
                <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-600 flex items-center gap-3">
                        <span className="text-4xl filter drop-shadow-sm">🚑</span> Request Blood
                    </h2>
                    <p className="text-neutral-500 font-medium mt-1 ml-14">Search network or find eligible donors.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Search Panel */}
                <div className="lg:col-span-4">
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-neutral-100/50 border border-white/60 sticky top-8 z-30">
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
                                {isSearching ? "Searching..." : "Find Blood Stock"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-8">
                    {!hasSearched && !showDonorSearch && (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 bg-white/50 backdrop-blur-sm border-2 border-dashed border-neutral-200 rounded-[2.5rem] text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <Building2 size={40} className="text-neutral-300" />
                            </div>
                            <h3 className="text-xl font-black text-neutral-700">Ready to Search</h3>
                            <p className="text-neutral-400 max-w-sm mx-auto mt-2 font-medium">Find shortage supplies from nearby network hospitals.</p>
                        </div>
                    )}

                    {/* Hospital Results */}
                    {results.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-3 px-2">
                                <CheckCircle size={20} className="text-emerald-500" />
                                {results.length} Hospitals Found
                            </h3>
                            <div className="grid gap-4">
                                {results.map(hospital => (
                                    <div key={hospital.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-neutral-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                            <div className="flex items-center gap-5 w-full sm:w-auto">
                                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl">
                                                    {hospital.name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-xl text-neutral-900">{hospital.name}</div>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500 font-medium">
                                                        <span><MapPin size={14} className="inline mr-1" /> {hospital.location} ({hospital.distance})</span>
                                                        <span className="text-emerald-600 font-bold">{hospital.units} units</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRequestHospital(hospital.id)}
                                                disabled={reqStatus[hospital.id] === 'sent'}
                                                className={`px-6 py-3 rounded-xl font-bold transition-all ${reqStatus[hospital.id] === 'sent'
                                                    ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                                    : 'bg-neutral-900 text-white hover:bg-black shadow-lg'}`}
                                            >
                                                {reqStatus[hospital.id] === 'sent' ? 'Request Sent' : 'Request Transfer'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Fallback: Donor Search UI */}
                    {showDonorSearch && (
                        <div className="space-y-8 animate-slide-in">
                            <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-3xl">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><AlertCircle size={20} /></div>
                                    <h3 className="text-lg font-bold text-orange-900">No Hospital Stock Available</h3>
                                </div>
                                <p className="text-orange-800/80 text-sm ml-12">
                                    We couldn't find any partner hospitals with sufficient stock.
                                    Please search the donor network below to contact eligible donors directly.
                                </p>
                            </div>

                            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-xl">
                                <h3 className="text-2xl font-black text-neutral-900 mb-6 flex items-center gap-3">
                                    <span className="text-3xl">👥</span> Find Eligible Donors
                                </h3>

                                {/* Request Details Form */}
                                <div className="grid md:grid-cols-2 gap-6 mb-8 border-b border-neutral-100 pb-8">
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-neutral-400 text-xs uppercase tracking-wider">Patient Details</h4>
                                        <input
                                            type="text"
                                            placeholder="Patient Name"
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold outline-none focus:border-primary"
                                            value={reqDetails.patientName}
                                            onChange={e => setReqDetails({ ...reqDetails, patientName: e.target.value })}
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Patient Contact (Optional)"
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold outline-none focus:border-primary"
                                            value={reqDetails.patientNumber}
                                            onChange={e => setReqDetails({ ...reqDetails, patientNumber: e.target.value })}
                                        />
                                        <select
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold outline-none focus:border-primary"
                                            value={reqDetails.urgency}
                                            onChange={e => setReqDetails({ ...reqDetails, urgency: e.target.value })}
                                        >
                                            <option value="Urgent">Urgent</option>
                                            <option value="Critical">Critical</option>
                                            <option value="Flexible">Flexible</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-neutral-400 text-xs uppercase tracking-wider">Attender / Hospital Details</h4>
                                        <input
                                            type="text"
                                            placeholder="Attender Name"
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold outline-none focus:border-primary"
                                            value={reqDetails.attenderName}
                                            onChange={e => setReqDetails({ ...reqDetails, attenderName: e.target.value })}
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Attender Contact"
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold outline-none focus:border-primary"
                                            value={reqDetails.attenderNumber}
                                            onChange={e => setReqDetails({ ...reqDetails, attenderNumber: e.target.value })}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Hospital Name"
                                                className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-transparent font-bold text-neutral-500 cursor-not-allowed"
                                                value={reqDetails.hospitalName}
                                                readOnly
                                            />
                                            <input
                                                type="text"
                                                placeholder="Location"
                                                className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-transparent font-bold text-neutral-500 cursor-not-allowed"
                                                value={reqDetails.location}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 items-end mb-8">
                                    <div className="flex-1 w-full relative z-50">
                                        <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">Target City / Location (Select Multiple)</label>
                                        <MultiSelect
                                            options={activeCities}
                                            value={selectedCities}
                                            onChange={setSelectedCities}
                                            placeholder="Select Cities..."
                                            className="w-full"
                                        />
                                    </div>
                                    <button
                                        onClick={handleDonorSearch}
                                        disabled={isSearchingDonors || selectedCities.length === 0}
                                        className="py-4 px-8 bg-neutral-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all disabled:opacity-50 h-[58px]"
                                    >
                                        {isSearchingDonors ? 'Scanning...' : 'Search Donors'}
                                    </button>
                                </div>
                            </div>

                            {/* Donor Results Table */}
                            {eligibleDonors.length > 0 ? (
                                <div className="space-y-6">
                                    <div className="bg-neutral-50 rounded-2xl border border-neutral-100 overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-neutral-100 text-neutral-500 font-bold text-xs uppercase">
                                                <tr>
                                                    <th className="px-6 py-4">Donor Name</th>
                                                    <th className="px-6 py-4">Blood Group</th>
                                                    <th className="px-6 py-4">Contact</th>
                                                    <th className="px-6 py-4">Location</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100">
                                                {eligibleDonors.map(d => (
                                                    <tr key={d.id} className="hover:bg-white transition-colors">
                                                        <td className="px-6 py-4 font-bold text-neutral-900">{d.name}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-black">{d.bloodGroup}</span>
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-sm text-neutral-600">{d.phone}</td>
                                                        <td className="px-6 py-4 text-sm text-neutral-500">{d.location}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex justify-end">
                                        {reqStatus.broadcast_sent ? (
                                            <button disabled className="px-8 py-4 bg-emerald-100 text-emerald-700 font-bold rounded-xl flex items-center gap-2 cursor-default">
                                                <CheckCircle size={20} /> Message Sent to All
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleBroadcast}
                                                className="px-8 py-4 bg-gradient-to-r from-primary to-rose-600 text-white font-bold rounded-xl shadow-xl shadow-primary/30 hover:-translate-y-1 transition-all flex items-center gap-2"
                                            >
                                                <Bell size={20} className="fill-current" /> Send Message to {eligibleDonors.length} Donors
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                hasSearchedDonors && selectedCities.length > 0 && !isSearchingDonors && (
                                    <div className="text-center py-12 text-neutral-400 font-medium">
                                        No eligible donors found in selected cities matching the stricter criteria (60-day rule).
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default RequestBlood;

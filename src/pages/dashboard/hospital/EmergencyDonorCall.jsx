import React, { useState } from 'react';
import { hospitalAPI } from '../../../services/api';
import { Search, Phone, MapPin, Bell, AlertTriangle } from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect';

const EmergencyDonorCall = () => {
    const [searchParams, setSearchParams] = useState({
        bloodGroup: '',
        units: '',
        urgency: 'Immediate',
        location: ''
    });
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        setHasSearched(true);
        setResults([]);

        try {
            // Real Backend Search (Strict Logic Moved to Server)
            // Passing location as 'city' param roughly (splitting by comma if needed, or simple string)
            // Note: Our backend expects 'city' matches 'location' field.
            const data = await hospitalAPI.searchDonors(searchParams.bloodGroup, searchParams.location);
            setResults(data);
        } catch (e) {
            console.error("Search failed", e);
            // No mock fallback anymore - strict consistency
        }
        setIsSearching(false);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative">
            <div className="flex flex-col gap-4 backdrop-blur-md bg-white/40 p-8 rounded-[2rem] border border-white/60 shadow-lg">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600 flex items-center gap-3">
                    <span className="text-4xl">📞</span> Emergency Donor Call
                </h1>
                <p className="text-neutral-500 font-medium ml-12">Locate and contact nearby eligible donors for urgent requirements.</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Inputs */}
                <div className="lg:col-span-4">
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/60 sticky top-8">
                        <h4 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600"><AlertTriangle size={18} /></span>
                            Requirement Details
                        </h4>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">Blood Group Needed</label>
                                <CustomSelect
                                    options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
                                    value={searchParams.bloodGroup}
                                    onChange={v => setSearchParams({ ...searchParams, bloodGroup: v })}
                                    placeholder="Select Group"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">Units Required</label>
                                <input
                                    type="number" className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-200 font-bold outline-none focus:border-red-500 transition-all"
                                    value={searchParams.units} onChange={e => setSearchParams({ ...searchParams, units: e.target.value })}
                                    placeholder="e.g. 2" required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">Urgency</label>
                                <CustomSelect
                                    options={['Critical (1 hr)', 'Urgent (4 hrs)', 'High (24 hrs)']}
                                    value={searchParams.urgency}
                                    onChange={v => setSearchParams({ ...searchParams, urgency: v })}
                                    placeholder="Select Urgency"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">Hospital Location (Area)</label>
                                <input
                                    type="text" className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-200 font-bold outline-none focus:border-red-500 transition-all"
                                    value={searchParams.location} onChange={e => setSearchParams({ ...searchParams, location: e.target.value })}
                                    placeholder="e.g. Downtown" required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="w-full py-4 mt-4 bg-gradient-to-r from-red-500 to-rose-700 text-white font-black rounded-2xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isSearching ? 'Scanning Network...' : 'FIND DONORS'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-8">
                    {!hasSearched ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 bg-white/50 backdrop-blur-sm border-2 border-dashed border-neutral-200 rounded-[2.5rem] text-center">
                            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                                <Search size={40} className="text-red-300" />
                            </div>
                            <h3 className="text-xl font-black text-neutral-700">Waiting for Input</h3>
                            <p className="text-neutral-400 max-w-sm mx-auto mt-2 font-medium">
                                Enter requirements to find the nearest eligible donors.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-neutral-800">Found {results.length} Eligible Donors</h3>
                                <span className="text-sm font-bold text-neutral-400">Sorted by proximity</span>
                            </div>

                            {results.map(donor => (
                                <div key={donor.id} className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-md border border-white/60 hover:shadow-xl transition-all flex flex-col sm:flex-row items-center justify-between gap-6 group">
                                    <div className="flex items-center gap-6 w-full sm:w-auto">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold text-xl">
                                                {donor.bloodGroup}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-neutral-900 group-hover:text-primary transition-colors">{donor.name}</h4>
                                            <div className="flex items-center gap-3 text-sm font-medium text-neutral-500 mt-1">
                                                <span className="flex items-center gap-1"><MapPin size={14} /> {donor.distance} away</span>
                                                <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                                                <span className="text-emerald-600">{donor.status}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <button className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-neutral-50 text-neutral-600 font-bold flex items-center justify-center gap-2 hover:bg-neutral-100 transition-colors">
                                            <Bell size={18} /> Alert
                                        </button>
                                        <a href={`tel:${donor.mobile}`} className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-105 transition-all">
                                            <Phone size={18} /> Call
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmergencyDonorCall;

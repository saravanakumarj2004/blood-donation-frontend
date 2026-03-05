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
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-20 bg-slate-50 min-h-screen p-6">
            <div className="flex flex-col gap-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <AlertTriangle className="text-rose-600" size={32} /> Emergency Donor Call
                </h1>
                <p className="text-slate-500 font-medium ml-11">Locate and contact nearby eligible donors for urgent requirements.</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
                {/* Inputs */}
                <div className="lg:col-span-4">
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 sticky top-8">
                        <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-rose-600 rounded-full" />
                            Requirement Details
                        </h4>
                        <form onSubmit={handleSearch} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Blood Group Needed</label>
                                <CustomSelect
                                    options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
                                    value={searchParams.bloodGroup}
                                    onChange={v => setSearchParams({ ...searchParams, bloodGroup: v })}
                                    placeholder="Select Group"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Units Required</label>
                                <input
                                    type="number" className="w-full p-2.5 rounded-lg border border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all font-semibold text-slate-800 text-sm"
                                    value={searchParams.units} onChange={e => setSearchParams({ ...searchParams, units: e.target.value })}
                                    placeholder="e.g. 2" required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Urgency</label>
                                <CustomSelect
                                    options={['Critical (1 hr)', 'Urgent (4 hrs)', 'High (24 hrs)']}
                                    value={searchParams.urgency}
                                    onChange={v => setSearchParams({ ...searchParams, urgency: v })}
                                    placeholder="Select Urgency"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Hospital Location (Area)</label>
                                <input
                                    type="text" className="w-full p-2.5 rounded-lg border border-slate-100 bg-slate-50 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all font-semibold text-slate-800 text-sm"
                                    value={searchParams.location} onChange={e => setSearchParams({ ...searchParams, location: e.target.value })}
                                    placeholder="e.g. Downtown" required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="w-full py-3 mt-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-rose-700 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                {isSearching ? 'Scanning Network...' : 'FIND DONORS'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-8">
                    {!hasSearched ? (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 bg-white border border-dashed border-slate-200 rounded-2xl text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 border border-rose-100">
                                <Search size={32} className="text-rose-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">Waiting for Input</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium text-sm">
                                Enter requirements to find the nearest eligible donors.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-800">Found {results.length} Eligible Donors</h3>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sorted by proximity</span>
                            </div>

                            {results.map(donor => (
                                <div key={donor.id} className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 hover:border-slate-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all flex flex-col sm:flex-row items-center justify-between gap-6 group">
                                    <div className="flex items-center gap-5 w-full sm:w-auto">
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 font-bold border border-rose-100">
                                                {donor.bloodGroup}
                                            </div>
                                            <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors">{donor.name}</h4>
                                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 mt-1">
                                                <span className="flex items-center gap-1"><MapPin size={12} /> {donor.distance} away</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span className="text-emerald-600">{donor.status}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-slate-50 text-slate-700 border border-slate-100 font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors text-sm">
                                            <Bell size={16} /> Alert
                                        </button>
                                        <a href={`tel:${donor.mobile}`} className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-emerald-700 active:scale-[0.98] transition-all text-sm">
                                            <Phone size={16} /> Call
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

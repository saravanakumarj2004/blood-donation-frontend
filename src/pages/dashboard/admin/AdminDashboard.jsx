import React, { useState, useEffect } from 'react';
import { Users, Building2, Activity, AlertTriangle, ShieldCheck, Bell, Search, Send, X, ClipboardList, Calendar, Heart, Clock, MapPin } from 'lucide-react';
import { adminAPI } from '../../../services/api';
import { Link } from 'react-router-dom';

/**
 * AdminDashboard - Main Dashboard for Administrators
 * 
 * Features: System overview, stats, critical alerts (including Hospital Emergency Alerts).
 * Updated: Admin can finding eligible donors and send urgent alerts.
 */
const AdminDashboard = () => {
    const [emergencyAlerts, setEmergencyAlerts] = useState([]);
    const [donationHistory, setDonationHistory] = useState([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    // Donor Search Modal State
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [isSearchingDonors, setIsSearchingDonors] = useState(false);
    const [foundDonors, setFoundDonors] = useState([]);
    const [notificationStatus, setNotificationStatus] = useState(null);

    // Old effect replaced by the one that fetches stats + alerts
    // Kept empty to remove old code cleanly


    // Handle "Find Donors" Action
    const handleFindDonors = async (alert) => {
        setSelectedAlert(alert);
        setIsSearchingDonors(true);
        setFoundDonors([]);
        setNotificationStatus(null);

        try {
            // Pass true for eligibleOnly to enforce 60-day rule
            const donors = await adminAPI.searchDonors(alert.bloodGroup, true);
            setFoundDonors(donors);
        } catch (error) {
            console.error("Failed to find donors", error);
        } finally {
            setIsSearchingDonors(false);
        }
    };

    // Handle "Notify Donors" Action
    const handleNotifyDonors = async () => {
        if (!selectedAlert) return;

        // Create Notifications Payload
        const newNotifications = foundDonors.map(donor => ({
            recipientId: donor.id, // Target Donor
            type: 'EMERGENCY_ALERT', // Match backend type so 'I Can Donate' button appears
            // Use same message format as backend for consistency
            message: `Urgent: ${selectedAlert.units} units of ${selectedAlert.bloodGroup} needed at ${selectedAlert.requesterName}!`,
            relatedRequestId: selectedAlert.id,
            timestamp: new Date().toISOString(),
            status: 'UNREAD',
            expiresAt: selectedAlert.expiresAt // Pass expiration if available
        }));

        try {
            await adminAPI.notifyDonors(newNotifications);
            setNotificationStatus('sent');
            setTimeout(() => {
                setSelectedAlert(null); // Close modal
                setNotificationStatus(null);
            }, 2000);
        } catch (error) {
            console.error("Failed to notify", error);
            alert("Failed to send notifications.");
        }
    };

    const [stats, setStats] = useState([
        { id: 1, label: 'Total Donors', value: '...', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/dashboard/admin/donors' },
        { id: 2, label: 'Registered Hospitals', value: '...', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50', link: '/dashboard/admin/hospitals' },
        { id: 3, label: 'Active Requests (Accepted)', value: '...', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '#' },
        { id: 4, label: 'Emergency Alerts', value: '0', icon: AlertTriangle, color: 'text-error', bg: 'bg-red-50', link: '#' },
        { id: 5, label: 'Total Voluntary Donors', value: '...', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50', onClick: () => setShowHistoryModal(true) },
    ]);

    const [hospitals, setHospitals] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch Stats from Backend
                const data = await import('../../../services/api').then(m => m.adminAPI.getStats());

                // Fetch Emergency Alerts (Mock or Real)
                // Integrating logic:
                const alerts = await import('../../../services/api').then(m => m.adminAPI.getAlerts());
                setEmergencyAlerts(alerts);

                // Fetch Donation History
                const history = await import('../../../services/api').then(m => m.adminAPI.getDonationHistory());
                setDonationHistory(history);

                // Fetch Hospitals for Network Card
                const hospitalList = await import('../../../services/api').then(m => m.adminAPI.getUsers('hospital'));
                setHospitals(hospitalList);

                // Calculate Unique Voluntary Donors (Exclude Emergency)
                const voluntaryDonations = history.filter(d => d.type !== 'Emergency Donation' && d.type !== 'EMERGENCY_ALERT');
                const uniqueVoluntaryDonors = new Set(voluntaryDonations.map(d => d.donorId).filter(Boolean)).size;

                // Update Stats
                setStats([
                    { id: 1, label: 'Total Donors', value: data.totalDonors, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/dashboard/admin/donors' },
                    { id: 2, label: 'Registered Hospitals', value: data.totalHospitals, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50', link: '/dashboard/admin/hospitals' },
                    { id: 3, label: 'Active Requests (Accepted)', value: data.activeRequests, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '#' },
                    { id: 4, label: 'Emergency Alerts', value: data.emergencyAlerts || alerts.length, icon: AlertTriangle, color: 'text-error', bg: 'bg-red-50', link: '#' },
                    { id: 5, label: 'Total Voluntary Donors', value: uniqueVoluntaryDonors, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50', onClick: () => setShowHistoryModal(true) },
                ]);

            } catch (error) {
                console.error("Failed to load admin stats", error);
            }
        };

        fetchStats();
        // Polling
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    // Helper to get only voluntary donations for the modal
    const voluntaryHistory = donationHistory.filter(d => d.type !== 'Emergency Donation' && d.type !== 'EMERGENCY_ALERT');

    return (
        <div className="relative min-h-screen space-y-8 animate-fade-in font-sans">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50/40 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-50/40 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 backdrop-blur-md bg-white/40 p-8 rounded-[2.5rem] border border-white/60 shadow-xl shadow-neutral-100/50">
                <div>
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 tracking-tight flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-neutral-900 rounded-xl text-white shadow-lg shadow-neutral-900/20">
                            <ShieldCheck size={32} />
                        </div>
                        Admin Dashboard
                    </h2>
                    <p className="text-neutral-500 font-bold ml-1">System-wide monitoring and management centre.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.id}
                        onClick={stat.onClick}
                        className={`relative overflow-hidden bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer group`}
                    >
                        {/* Gradient Blob Background */}
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.bg.replace('bg-', 'from-').replace('-50', '-500')} to-transparent opacity-10 rounded-bl-full group-hover:scale-125 transition-transform duration-500`} />

                        {stat.link && <Link to={stat.link} className="absolute inset-0 z-20" />}

                        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} shadow-sm group-hover:rotate-12 transition-transform duration-300`}>
                                <stat.icon size={26} strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="text-3xl font-black text-neutral-800 group-hover:scale-105 transition-transform origin-left">{stat.value}</div>
                                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Emergency Alerts Feed (Left Column) */}
                <div className="lg:col-span-7 bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-xl shadow-neutral-100/50">
                    <h3 className="text-xl font-bold text-neutral-900 mb-8 flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-xl text-error">
                            <AlertTriangle size={24} />
                        </div>
                        Emergency Alerts
                    </h3>

                    {emergencyAlerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-neutral-400 bg-neutral-50/50 rounded-3xl border border-neutral-100 border-dashed">
                            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                                <ShieldCheck size={40} className="opacity-50" />
                            </div>
                            <p className="font-bold text-lg">System Secure</p>
                            <p className="text-sm">No active emergencies reported.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {emergencyAlerts.map((alert) => (
                                <div key={alert.id} className="relative overflow-hidden p-6 bg-gradient-to-br from-red-50 via-white to-red-50/30 border border-red-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                                        <AlertTriangle size={120} />
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-5 relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-black shadow-lg shadow-red-500/30 flex-shrink-0 animate-pulse">!</div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-neutral-900 font-bold text-lg leading-tight">
                                                        URGENT: <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">{alert.units} units of {alert.bloodGroup}</span> needed
                                                    </p>
                                                    <p className="text-sm text-neutral-500 font-medium mt-1 flex items-center gap-1.5">
                                                        Requested by <span className="font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md">{alert.requesterName}</span>
                                                    </p>
                                                </div>
                                                {alert.status === 'Accepted' && (
                                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wide border border-emerald-200">
                                                        Accepted
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 mt-4 text-sm font-bold">
                                                <span className="flex items-center gap-1.5 text-error bg-red-100/50 px-3 py-1.5 rounded-xl border border-red-100">
                                                    <Clock size={16} /> Needed {alert.requiredTime || 'Immediately'}
                                                </span>
                                                <span className="text-neutral-400 font-medium text-xs">
                                                    {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'Just now'}
                                                </span>
                                            </div>

                                            {alert.status !== 'Accepted' && (
                                                <button
                                                    onClick={() => handleFindDonors(alert)}
                                                    className="mt-6 w-full sm:w-auto px-6 py-3 bg-white text-error font-bold rounded-xl shadow-lg border border-red-100 hover:bg-error hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                                                >
                                                    <Search size={18} className="group-hover/btn:scale-110 transition-transform" /> Find Eligible Donors
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Community Stats preview */}
                    <div className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white p-8 rounded-[2.5rem] shadow-xl shadow-cyan-400/30 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                    <Activity size={24} />
                                </div>
                                Community Impact
                            </h3>
                            <p className="text-blue-100 font-medium text-lg leading-relaxed mb-6">
                                Your platform has facilitated over <span className="text-white font-black text-2xl bg-white/20 px-2 py-0.5 rounded-lg mx-1 shadow-inner">120+</span> life-saving donations this month.
                            </p>
                            <div className="h-1.5 bg-blue-900/30 rounded-full overflow-hidden">
                                <div className="h-full w-3/4 bg-white/40 rounded-full relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/40 animate-pulse-slow" />
                                </div>
                            </div>
                            <p className="text-xs font-bold text-blue-200 mt-2 text-right">75% of Monthly Goal</p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-lg">
                        <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                            <Send size={20} className="text-neutral-400" /> Quick Navigation
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Link to="/dashboard/admin/donors" className="p-5 rounded-2xl bg-white border border-neutral-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200 transition-all group">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Users size={24} />
                                </div>
                                <span className="block font-bold text-neutral-800 text-lg">Donors</span>
                                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Manage Database</span>
                            </Link>
                            <Link to="/dashboard/admin/reports" className="p-5 rounded-2xl bg-white border border-neutral-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-purple-200 transition-all group">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <ClipboardList size={24} />
                                </div>
                                <span className="block font-bold text-neutral-800 text-lg">Inventory</span>
                                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Global Report</span>
                            </Link>
                        </div>
                    </div>

                    {/* Hospital Network Activity */}
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                                    <Building2 size={20} />
                                </div>
                                Hospital Network
                            </h3>
                            <Link to="/dashboard/admin/hospitals" className="text-xs font-bold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-lg">View All</Link>
                        </div>

                        <div className="space-y-4">
                            {hospitals.slice(0, 3).map((hospital, index) => (
                                <div key={hospital.id || index} className="flex items-center justify-between p-4 bg-white border border-neutral-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-black text-lg border border-purple-100">
                                            {hospital.name ? hospital.name[0] : 'H'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-neutral-900">{hospital.name || 'Unknown Hospital'}</p>
                                            <p className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                                                <MapPin size={10} /> {hospital.location || 'Location N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse"></span>
                                </div>
                            ))}
                            {hospitals.length === 0 && (
                                <p className="text-sm text-neutral-400 text-center py-4 bg-neutral-50 rounded-xl border border-neutral-100 border-dashed">No hospitals registered yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Donation History Modal */}
            {
                showHistoryModal && (
                    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-scale-in">
                            <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-white">
                                <h3 className="font-black text-2xl text-neutral-900 flex items-center gap-3">
                                    <div className="p-2.5 bg-rose-50 rounded-2xl text-rose-600">
                                        <ClipboardList size={28} />
                                    </div>
                                    Voluntary Donation History
                                </h3>
                                <button onClick={() => setShowHistoryModal(false)} className="p-2.5 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-900 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-0 flex-1 custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-neutral-50/80 sticky top-0 z-10 backdrop-blur-md text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="p-6">Donor Name</th>
                                            <th className="p-6">Hospital</th>
                                            <th className="p-6">Donation Date</th>
                                            <th className="p-6">Blood Group</th>
                                            <th className="p-6">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {voluntaryHistory.length > 0 ? voluntaryHistory.map((donation) => (
                                            <tr key={donation.id} className="hover:bg-neutral-50/50 transition-colors">
                                                <td className="p-6 font-bold text-neutral-900">
                                                    {donation.userName || donation.donorName || 'Unknown Donor'}
                                                </td>
                                                <td className="p-6 text-neutral-600 font-medium">
                                                    {donation.hospitalName || 'Unknown Hospital'}
                                                </td>
                                                <td className="p-6 text-neutral-500">
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <Calendar size={16} className="text-neutral-400" />
                                                        {donation.date ? new Date(donation.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                                        <span className="text-neutral-300">|</span>
                                                        <span className="text-xs text-neutral-400">
                                                            {donation.time || ''}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-red-100 text-error font-black shadow-sm ring-1 ring-white">
                                                        {donation.bloodGroup || '?'}
                                                    </span>
                                                </td>
                                                <td className="p-6">
                                                    <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full font-bold border border-emerald-100 flex items-center gap-1 w-fit">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        {donation.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="p-16 text-center text-neutral-400">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center">
                                                            <ClipboardList size={40} className="opacity-30" />
                                                        </div>
                                                        <p className="font-bold text-lg">No history found</p>
                                                        <p className="max-w-xs mx-auto text-sm">No voluntary donation records have been logged in the system yet.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Donor Search Modal */}
            {
                selectedAlert && (
                    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                            <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-gradient-to-r from-white to-red-50/50">
                                <div>
                                    <h3 className="font-black text-2xl text-neutral-900">Find Donors</h3>
                                    <p className="text-sm font-bold text-error mt-1 flex items-center gap-1">
                                        <AlertTriangle size={14} /> For {selectedAlert.bloodGroup} Request
                                    </p>
                                </div>
                                <button onClick={() => setSelectedAlert(null)} className="p-2.5 hover:bg-white rounded-full text-neutral-400 hover:text-neutral-900 transition-all shadow-sm"><X size={24} /></button>
                            </div>

                            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                                {isSearchingDonors ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
                                        <p className="text-neutral-900 font-bold text-lg">Searching Database...</p>
                                        <p className="text-neutral-500 text-sm mt-1">Locating eligible donors nearby</p>
                                    </div>
                                ) : notificationStatus === 'sent' ? (
                                    <div className="text-center py-12 text-success animate-in fade-in zoom-in">
                                        <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
                                            <Send size={40} className="ml-1" />
                                        </div>
                                        <h4 className="text-2xl font-black text-neutral-900">Alert Sent!</h4>
                                        <p className="text-neutral-500 font-medium mt-2 max-w-xs mx-auto">Selected donors have been notified via their dashboard.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-6 flex items-center justify-between">
                                            <span className="text-sm font-bold text-neutral-500">Match Results</span>
                                            <span className="text-xs font-black bg-neutral-100 text-neutral-700 px-2 py-1 rounded-md">{foundDonors.length} Found</span>
                                        </div>

                                        <div className="space-y-3 mb-8">
                                            {foundDonors.map(donor => (
                                                <div key={donor.id} className="p-4 border border-neutral-200 rounded-2xl flex items-center justify-between hover:border-primary/50 hover:bg-neutral-50 transition-all group cursor-default">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center text-neutral-600 font-bold border-2 border-white shadow-sm">
                                                            {donor.name[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-neutral-900 group-hover:text-primary transition-colors">{donor.name}</div>
                                                            <div className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                                                                <MapPin size={10} /> {donor.location}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="text-[10px] font-black text-white bg-gradient-to-r from-red-500 to-rose-500 px-2 py-0.5 rounded-full shadow-sm shadow-red-200">
                                                            MATCH
                                                        </div>
                                                        <div className="text-[10px] text-neutral-400 font-medium">
                                                            Last: {donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {foundDonors.length === 0 && (
                                                <div className="text-center py-8 bg-neutral-50 rounded-2xl border border-neutral-100 border-dashed">
                                                    <p className="text-neutral-400 font-medium">No matching donors found nearby.</p>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            disabled={foundDonors.length === 0}
                                            onClick={handleNotifyDonors}
                                            className="w-full py-4 bg-gradient-to-r from-primary to-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-2.5 active:scale-95"
                                        >
                                            <Bell size={20} /> Send Urgent Alert to {foundDonors.length} Donors
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminDashboard;

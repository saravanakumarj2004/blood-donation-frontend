import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { hospitalAPI } from '../../../services/api';
import {
    Droplet,
    AlertTriangle,
    Truck,
    Clock,
    Plus,
    Download,
    ArrowRight,
    Calendar,
    CheckCircle,
    Activity,
    Search,
    Filter,
    HeartPulse,
    Thermometer,
    Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HospitalDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    const [stock, setStock] = useState({
        'A+': { units: 0, status: 'low' },
        'A-': { units: 0, status: 'low' },
        'B+': { units: 0, status: 'low' },
        'B-': { units: 0, status: 'low' },
        'O+': { units: 0, status: 'low' },
        'O-': { units: 0, status: 'low' },
        'AB+': { units: 0, status: 'low' },
        'AB-': { units: 0, status: 'low' },
    });

    const [requestCount, setRequestCount] = useState(0);
    const [appointmentCount, setAppointmentCount] = useState(0);
    const [incompleteApptCount, setIncompleteApptCount] = useState(0);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.id) return;
            try {
                setIsLoading(true);
                const inventoryData = await hospitalAPI.getInventory(user.id);

                const transformedStock = {};
                ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].forEach(group => {
                    const units = inventoryData[group] || 0;
                    let status = 'med';
                    if (units < 10) status = 'low';
                    if (units > 50) status = 'high';
                    transformedStock[group] = { units, status };
                });
                setStock(transformedStock);

                const requests = await hospitalAPI.getRequests(user.id);
                setRequestCount(requests.filter(r => r.status === 'Pending' || r.status === 'Active').length);

                const appointments = await hospitalAPI.getAppointments(user.id);
                setAppointmentCount(appointments.length);
                setIncompleteApptCount(appointments.filter(a => a.status === 'Scheduled').length);

                const allRequests = requests.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));
                const recentFive = allRequests.slice(0, 5);

                const mappedActivity = recentFive.map(req => {
                    const dateObj = new Date(req.date || req.timestamp);
                    const time = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
                        ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    if (req.isOutgoing) {
                        return {
                            id: req.id || req._id,
                            action: req.status,
                            type: req.type === 'EMERGENCY_ALERT' ? 'Emergency' : 'Standard',
                            units: req.units,
                            recipient: req.status === 'Accepted' ? 'Donor Found' : 'Pending',
                            time,
                            status: req.status.toLowerCase(),
                            donorName: req.donorName,
                            isOutgoing: true
                        };
                    } else {
                        return {
                            id: req.id || req._id,
                            hospitalName: req.hospitalName,
                            bloodGroup: req.bloodGroup,
                            units: req.units,
                            status: req.status,
                            time,
                            isOutgoing: false
                        };
                    }
                });

                setRecentActivity(mappedActivity);

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 5000);
        return () => clearInterval(interval);
    }, [user]);

    const totalUnits = Object.values(stock).reduce((acc, curr) => acc + curr.units, 0);
    const lowStockCount = Object.values(stock).filter(item => item.status === 'low').length;

    const handleExport = () => {
        let sc = "data:text/csv;charset=utf-8,Blood Group,Units,Status\n";
        Object.entries(stock).forEach(([g, d]) => sc += `${g},${d.units},${d.status}\n`);
        const link = document.createElement("a");
        link.href = encodeURI(sc);
        link.download = `blood_inventory_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const [confirmAction, setConfirmAction] = useState(null); // { id }
    const [feedback, setFeedback] = useState(null); // { type, message }

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 4000);
    };

    const triggerConfirm = (reqId) => {
        setConfirmAction({ id: reqId });
    };

    const handleConfirmReceipt = async () => {
        if (!confirmAction) return;
        const { id } = confirmAction;

        try {
            setIsLoading(true);
            await hospitalAPI.updateRequestStatus({ id, status: 'Completed', hospitalId: user.id });

            // Optimistic update of Recent Activity
            setRecentActivity(prev => prev.map(item =>
                item.id === id ? { ...item, status: 'completed' } : item
            ));

            setConfirmAction(null);
            showFeedback('success', "Receipt confirmed! Inventory updated.");

            // Refresh full dashboard data slightly delayed to allow backend propagation
            setTimeout(() => {
                // Re-trigger the fetch via a dummy state change or calling fetch directly if it was extracted?
                // For now, let the polling (5s) catch it or we could extract fetchDashboardData
                // But optimistic update handles immediate UI feedback.
            }, 1000);

        } catch (e) {
            console.error(e);
            showFeedback('error', "Update failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen p-4 space-y-8 animate-fade-in font-sans">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-neutral-50/50">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-400/10 rounded-full blur-[100px] animate-pulse delay-700" />
            </div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 backdrop-blur-md bg-white/40 p-8 rounded-[2.5rem] border border-white/60 shadow-xl shadow-neutral-100/50">
                <div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 tracking-tight mb-2">
                        Overview
                    </h1>
                    <p className="text-neutral-500 font-medium text-lg flex items-center gap-2">
                        Welcome back, <span className="text-primary font-bold bg-primary/10 px-3 py-0.5 rounded-full border border-primary/20">{user?.name || 'Hospital Staff'}</span>
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <button onClick={handleExport} className="group flex items-center gap-2 px-6 py-3 bg-white text-neutral-600 font-bold rounded-2xl shadow-sm hover:shadow-lg hover:shadow-neutral-200 hover:text-primary transition-all active:scale-95 border border-neutral-100">
                        <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                        <span>Export Data</span>
                    </button>
                    <button onClick={() => navigate('/dashboard/hospital/request')} className="relative overflow-hidden flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 transition-all hover:-translate-y-1 active:scale-95">
                        <Plus size={22} className="relative z-10" />
                        <span className="relative z-10">Request Blood</span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Units', val: totalUnits, icon: Droplet, color: 'text-blue-500', from: 'from-blue-500', to: 'to-cyan-400', shadow: 'shadow-blue-500/20', path: '/dashboard/hospital/stock' },
                    { label: 'Low Alerts', val: lowStockCount, icon: AlertTriangle, color: 'text-rose-500', from: 'from-rose-500', to: 'to-orange-400', shadow: 'shadow-rose-500/20', path: '/dashboard/hospital/stock?filter=low' },
                    { label: 'Pending Requests', val: requestCount, icon: Clock, color: 'text-violet-500', from: 'from-violet-500', to: 'to-purple-400', shadow: 'shadow-violet-500/20', path: '/dashboard/hospital/incoming-requests' },
                    { label: 'New Appointments', val: incompleteApptCount, icon: Calendar, color: 'text-emerald-500', from: 'from-emerald-500', to: 'to-teal-400', shadow: 'shadow-emerald-500/20', path: '/dashboard/hospital/appointments' }
                ].map((stat, i) => (
                    <div
                        key={i}
                        onClick={() => stat.path && navigate(stat.path)}
                        className={`group relative bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-lg hover:shadow-2xl ${stat.shadow} transition-all duration-300 hover:-translate-y-1.5 overflow-hidden ${stat.path ? 'cursor-pointer' : ''}`}
                    >
                        {/* Gradient Blob Background */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.from} ${stat.to} opacity-5 rounded-bl-full group-hover:scale-110 transition-transform duration-500`} />

                        {stat.badge > 0 && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-20 animate-pulse">
                                {stat.badge}
                            </div>
                        )}

                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <div className={`text-5xl font-black text-neutral-800 mb-2 group-hover:scale-105 transition-transform origin-left`}>
                                    {stat.val}
                                </div>
                                <div className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest">{stat.label}</div>
                            </div>
                            <div className={`p-4 rounded-2xl bg-white shadow-md ${stat.color} group-hover:rotate-12 transition-transform duration-300`}>
                                <stat.icon size={32} className="fill-current opacity-20" />
                                <stat.icon size={32} className="absolute inset-0 m-auto stroke-[2.5px]" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Inventory Table */}
                <div className="lg:col-span-8 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl shadow-neutral-100/50 overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-neutral-100/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <Search size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-neutral-900">Inventory Status</h3>
                                <p className="text-sm text-neutral-400 mt-1 font-medium">Live tracking of all blood groups</p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/dashboard/hospital/stock')} className="px-5 py-2 rounded-xl bg-neutral-50 text-neutral-600 font-bold text-sm hover:bg-primary hover:text-white transition-all flex items-center gap-2">
                            Manage Stock <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-50/80 text-neutral-400 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-8 py-6">Blood Group</th>
                                    <th className="px-8 py-6">Availability</th>
                                    <th className="px-8 py-6">Status</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100/50">
                                {Object.entries(stock).map(([group, data]) => (
                                    <tr key={group} className="group hover:bg-blue-50/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-neutral-50 border border-neutral-100 flex items-center justify-center text-lg font-black text-neutral-700 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-rose-600">{group}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-neutral-700 text-2xl">{data.units}</span>
                                                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wide bg-neutral-100 px-2 py-0.5 rounded-md">Units</span>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="w-32 h-2 bg-neutral-100 rounded-full mt-3 overflow-hidden shadow-inner">
                                                <div
                                                    className={`h-full rounded-full ${data.status === 'low' ? 'bg-error' : data.status === 'high' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${Math.min(data.units * 2, 100)}%` }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${data.status === 'low' ? 'bg-red-50 text-error border-red-100 shadow-red-100' :
                                                data.status === 'high' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100' :
                                                    'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100'
                                                }`}>
                                                <span className={`w-2 h-2 rounded-full ${data.status === 'low' ? 'bg-error animate-pulse' : data.status === 'high' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                                {data.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button onClick={() => navigate('/dashboard/hospital/request')} className="p-3 text-neutral-400 hover:text-white hover:bg-primary rounded-xl transition-all shadow-sm hover:shadow-lg hover:shadow-primary/30">
                                                <Plus size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Alerts Block */}
                    {lowStockCount > 0 && (
                        <div className="bg-gradient-to-br from-red-500 to-rose-600 p-8 rounded-[2.5rem] shadow-xl shadow-red-500/30 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                            {/* Floating Icon Background */}
                            <div className="absolute -top-10 -right-10 p-4 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                                <AlertTriangle size={180} className="text-white fill-white" />
                            </div>

                            <h4 className="flex items-center gap-3 text-white font-black text-2xl mb-6 relative z-10">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                    <AlertTriangle size={24} className="text-white fill-white" />
                                </div>
                                Critical Alerts
                            </h4>

                            <div className="space-y-3 relative z-10">
                                {Object.entries(stock).filter(([_, d]) => d.status === 'low').slice(0, 3).map(([g, d]) => (
                                    <div key={g} className="flex items-center justify-between bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-lg hover:bg-white/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white">
                                                {g}
                                            </div>
                                            <span className="font-bold text-white opacity-90">Low Stock</span>
                                        </div>
                                        <span className="text-xs font-bold text-red-600 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                                            {d.units} Units
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => navigate('/dashboard/hospital/request')} className="w-full mt-8 py-4 bg-white text-error font-extrabold rounded-2xl shadow-lg relative z-10 hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                                Resolve Now <ArrowRight size={20} />
                            </button>
                        </div>
                    )}

                    {/* Activity Feed */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl shadow-neutral-100/50 p-8 h-fit">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-3">
                                <div className="p-2 bg-violet-100 rounded-xl text-violet-600">
                                    <Activity size={24} />
                                </div>
                                Activity
                            </h3>
                            <button className="text-xs font-bold text-neutral-400 hover:text-primary transition-colors">VIEW ALL</button>
                        </div>

                        <div className="space-y-8 relative">
                            {/* Timeline Line */}
                            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-neutral-100 rounded-full" />

                            {recentActivity.length > 0 ? recentActivity.map((item, idx) => (
                                <div key={idx} className="relative pl-12">
                                    {/* Timeline Dot */}
                                    <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl border-4 border-white shadow-md flex items-center justify-center z-10 ${item.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                                        {item.isOutgoing ? <ArrowRight size={16} className="text-white -rotate-45" /> : <ArrowRight size={16} className="text-white rotate-135" />}
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-lg hover:shadow-neutral-200/50 transition-all duration-300 hover:-translate-y-1 group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg ${item.isOutgoing ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100'
                                                } transition-colors`}>
                                                {item.isOutgoing ? 'Outgoing' : 'Incoming'}
                                            </span>
                                            <span className="text-[10px] font-bold text-neutral-400">{item.time}</span>
                                        </div>
                                        <p className="text-sm font-bold text-neutral-800 leading-relaxed">
                                            {item.isOutgoing ? `Requested ${item.units} Units` : `Request from ${item.hospitalName}`}
                                        </p>

                                        {/* Status Indicator */}
                                        <div className="mt-3 flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${item.status === 'pending' ? 'bg-yellow-400' : 'bg-emerald-500'}`} />
                                            <span className="text-xs font-medium text-neutral-500 capitalize">{item.status}</span>
                                        </div>

                                        <div className="mt-4 flex gap-2">
                                            {item.isOutgoing && item.status === 'accepted' && (
                                                <button onClick={() => triggerConfirm(item.id)} className="w-full py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-emerald-500/30 transition-all">
                                                    Confirm Receipt
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center text-neutral-400 text-sm py-8 font-medium bg-neutral-50 rounded-2xl border border-neutral-100">No recent activity</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Confirmation Dialog */}
            {confirmAction && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-scale-in">
                        <h3 className="text-xl font-black text-neutral-900 mb-2">Confirm Receipt</h3>
                        <p className="text-neutral-500 font-medium mb-6">
                            Have you received the blood units from the donor? This will add the units to your inventory.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="flex-1 py-3 text-neutral-600 font-bold hover:bg-neutral-50 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmReceipt}
                                className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
                            >
                                Confirm
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
                            feedback.type === 'error' ? <AlertTriangle className="text-red-500" size={24} /> :
                                <Activity className="text-blue-500" size={24} />}
                        <span className="font-bold">{feedback.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HospitalDashboard;

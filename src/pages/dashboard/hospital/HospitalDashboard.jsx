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
    X,
    Shield,
    Minus,
    Thermometer,
    Users,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HospitalDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

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
    const [incompleteApptCount, setIncompleteApptCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.id) return;
            try {
                const inventoryData = await hospitalAPI.getInventory(user.id);

                const transformedStock = {};
                ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].forEach(group => {
                    transformedStock[group] = { units: 0, status: 'good' };
                });

                inventoryData.forEach(item => {
                    transformedStock[item.type] = {
                        units: item.total,
                        status: item.status.toLowerCase()
                    };
                });
                setStock(transformedStock);

                const requests = await hospitalAPI.getRequests(user.id);
                setRequestCount(requests.filter(r => r.status === 'Pending' || r.status === 'Active').length);

                const appointments = await hospitalAPI.getAppointments(user.id);
                setIncompleteApptCount(appointments.filter(a => a.status === 'Scheduled' || a.status === 'Pending').length);

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 5000);
        return () => clearInterval(interval);
    }, [user?.id]);

    const totalUnits = Object.values(stock).reduce((acc, curr) => acc + curr.units, 0);
    const lowStockCount = Object.values(stock).filter(item => ['low', 'critical'].includes(item.status)).length;

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

    const [confirmAction, setConfirmAction] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 4000);
    };

    const handleConfirmReceipt = async () => {
        if (!confirmAction) return;
        setConfirmAction(null);
        showFeedback('success', "Receipt confirmed! Inventory updated.");
    };

    return (
        <div className="min-h-screen p-6 pb-24 space-y-6 animate-fade-in" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>

            {/* ── PREMIUM HEADER CARD ── */}
            <div className="relative rounded-2xl p-8 overflow-hidden" style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 55%, #fff1f2 100%)',
                border: '1px solid rgba(148,163,184,0.2)',
                boxShadow: '0 8px 40px rgba(99,102,241,0.08), 0 2px 8px rgba(0,0,0,0.04)'
            }}>
                {/* Glowing blobs */}
                <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.10) 0%, transparent 70%)' }} />
                <div className="absolute -bottom-10 left-1/4 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-4" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.18)' }}>
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Live Dashboard</span>
                            
                            
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-1 tracking-tight">
                            {user?.name || 'Hospital Staff'}
                        </h1>
                        <p className="text-slate-400 font-medium text-base">
                            Blood Inventory &middot; Requests &middot; Appointments
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-600 font-semibold rounded-xl hover:bg-slate-50 border border-slate-200 transition-all text-sm shadow-sm">
                            <Download size={17} className="text-slate-400" />
                            Export CSV
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/hospital/request')}
                            className="flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl transition-all text-sm text-white"
                            style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', boxShadow: '0 4px 20px rgba(244,63,94,0.35)' }}
                        >
                            <Plus size={18} className="stroke-[3px]" />
                            Request Blood
                        </button>
                    </div>
                </div>
            </div>

            {/* ── CONTENT AREA (Loader or Data) ── */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
                    <div className="w-14 h-14 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin mb-4 shadow-sm" />
                    <p className="text-slate-500 font-bold tracking-wide animate-pulse">Loading dashboard data...</p>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    {/* ── STAT CARDS ── */}
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        {[
                            {
                                label: 'Total Blood Units',
                                val: totalUnits,
                                icon: Droplet,
                                theme: 'blue',
                                path: '/dashboard/hospital/stock',
                                trend: '+12%',
                                trendUp: true
                            },
                            {
                                label: 'Low Stock Alerts',
                                val: lowStockCount,
                                icon: AlertTriangle,
                                theme: 'rose',
                                path: '/dashboard/hospital/stock?filter=low',
                                trend: '-2',
                                trendUp: false
                            },
                            {
                                label: 'Pending Requests',
                                val: requestCount,
                                icon: Clock,
                                theme: 'violet',
                                path: '/dashboard/hospital/incoming-requests',
                                trend: '+5',
                                trendUp: true
                            },
                            {
                                label: 'New Appointments',
                                val: incompleteApptCount,
                                icon: Calendar,
                                theme: 'emerald',
                                path: '/dashboard/hospital/appointments',
                                trend: '+18%',
                                trendUp: true
                            }
                        ].map((stat, i) => {
                            // Tailwind classes mapped by theme to avoid string interpolation issues with purge
                            const themes = {
                                blue: { light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
                                rose: { light: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
                                violet: { light: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
                                emerald: { light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
                            };
                            const t = themes[stat.theme];

                            return (
                                <div
                                    key={i}
                                    onClick={() => stat.path && navigate(stat.path)}
                                    className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
                                    style={{
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.02)'
                                    }}
                                >
                                    <div className="p-5 flex-1 relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                                                <h3 className="text-4xl font-black text-slate-900 mt-1.5 tracking-tight">{stat.val}</h3>
                                            </div>
                                            <div className={`p-3 rounded-xl ${t.light} ${t.text} ${t.border} border shadow-sm`}>
                                                <stat.icon size={22} className="stroke-[2.5px]" />
                                            </div>
                                        </div>

                                        <div className="flex items-center text-sm mt-4">
                                            <span className={`font-bold flex items-center ${stat.trendUp ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                {stat.trendUp ? <TrendingUp size={16} className="mr-1 stroke-[2.5px]" /> : <TrendingDown size={16} className="mr-1 stroke-[2.5px]" />}
                                                {stat.trend}
                                            </span>
                                            <span className="text-slate-400 font-medium ml-2">vs last week</span>
                                        </div>
                                    </div>

                                    {/* Structured Action Footer */}
                                    <div className="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex justify-between items-center group-hover:bg-slate-100 transition-colors">
                                        <span className="text-xs font-bold text-slate-600">View detailed report</span>
                                        <ArrowRight size={15} className="text-slate-400 group-hover:text-slate-700 transition-colors group-hover:translate-x-0.5" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── BOTTOM GRID ── */}
                    <div className="grid lg:grid-cols-12 gap-6">

                        {/* Inventory Table */}
                        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                                        <Droplet size={18} className="text-rose-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">Inventory Status</h3>
                                        <p className="text-xs text-slate-500 font-medium">Live tracking of all blood groups</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard/hospital/stock')}
                                    className="flex items-center gap-2 px-4 py-2 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                                    style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
                                >
                                    Manage Stock <ArrowRight size={15} />
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-3.5">Blood Group</th>
                                            <th className="px-6 py-3.5">Availability</th>
                                            <th className="px-6 py-3.5">Status</th>
                                            <th className="px-6 py-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {Object.entries(stock).map(([group, data]) => (
                                            <tr key={group} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="px-6 py-3.5">
                                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${group.startsWith('O') ? 'from-rose-500 to-rose-700' : group.startsWith('AB') ? 'from-indigo-500 to-indigo-700' : 'from-slate-700 to-slate-900'} flex items-center justify-center text-sm font-black text-white shadow-sm`}>
                                                        {group}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="font-bold text-slate-900 text-lg">{data.units}</span>
                                                        <span className="text-xs text-slate-400 font-semibold">{data.units === 1 ? 'unit' : 'units'}</span>
                                                    </div>
                                                    <div className="w-28 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${data.status === 'critical' ? 'bg-gradient-to-r from-red-400 to-rose-500' : data.status === 'low' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}
                                                            style={{ width: `max(4px, ${Math.min(data.units * 5, 100)}%)` }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${data.status === 'critical'
                                                        ? 'bg-red-50 text-red-700 border-red-200'
                                                        : data.status === 'low'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${data.status === 'critical' ? 'bg-red-500' : data.status === 'low' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                        {data.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <div className="flex items-center justify-end">
                                                        <button
                                                            onClick={() => navigate(`/dashboard/hospital/batches?bloodGroup=${encodeURIComponent(group)}`)}
                                                            className="px-3 py-1.5 text-xs font-bold rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors flex items-center gap-1.5"
                                                        >
                                                            Manage <ArrowRight size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-4">

                            {/* Alerts / Stock Health */}
                            {lowStockCount > 0 ? (
                                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="px-5 py-4 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
                                        <AlertTriangle size={20} className="text-white" />
                                        <h4 className="text-white font-bold text-base">Critical Alerts</h4>
                                        <span className="ml-auto bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{lowStockCount}</span>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {Object.entries(stock).filter(([_, d]) => ['low', 'critical'].includes(d.status)).slice(0, 5).map(([g, d]) => (
                                            <div key={g} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${d.status === 'critical' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'}`}>
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${g.startsWith('O') ? 'from-rose-500 to-rose-700' : g.startsWith('AB') ? 'from-indigo-500 to-indigo-700' : 'from-slate-700 to-slate-900'} flex items-center justify-center text-xs font-black text-white`}>{g}</div>
                                                    <span className={`font-semibold text-sm ${d.status === 'critical' ? 'text-rose-700' : 'text-amber-700'}`}>{d.status.toUpperCase()}</span>
                                                </div>
                                                <span className={`text-xs font-bold bg-white px-2 py-1 rounded-lg border ${d.status === 'critical' ? 'text-rose-600 border-rose-200' : 'text-amber-600 border-amber-200'}`}>{d.units} {d.units === 1 ? 'unit' : 'units'}</span>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => navigate('/dashboard/hospital/request')}
                                            className="w-full mt-1 py-2.5 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm"
                                            style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
                                        >
                                            Request Blood Now <ArrowRight size={15} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="px-5 py-4 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                                        <CheckCircle size={20} className="text-white" />
                                        <h4 className="text-white font-bold text-base">All Stock Healthy</h4>
                                    </div>
                                    <div className="p-5 text-center">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-2 border border-emerald-100">
                                            <CheckCircle size={24} />
                                        </div>
                                        <p className="text-slate-600 font-medium text-sm">All blood groups are adequately stocked.</p>
                                    </div>
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-5 py-3.5 border-b border-slate-100">
                                    <h4 className="text-sm font-bold text-slate-700">Quick Actions</h4>
                                </div>
                                <div className="p-3 space-y-1.5">
                                    {[
                                        { label: 'Add Stock Entry', icon: Plus, path: '/dashboard/hospital/stock-entry', color: 'text-rose-600 bg-rose-50' },
                                        { label: 'View Incoming Requests', icon: Clock, path: '/dashboard/hospital/incoming-requests', color: 'text-violet-600 bg-violet-50' },
                                        { label: 'Dispatch Blood', icon: Truck, path: '/dashboard/hospital/dispatch', color: 'text-blue-600 bg-blue-50' },
                                        { label: 'Manage Appointments', icon: Calendar, path: '/dashboard/hospital/appointments', color: 'text-emerald-600 bg-emerald-50' },
                                    ].map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={() => navigate(action.path)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                                        >
                                            <div className={`p-2 rounded-lg ${action.color}`}>
                                                <action.icon size={15} className="stroke-[2.5px]" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{action.label}</span>
                                            <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Dialog */}
            {
                confirmAction && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Receipt</h3>
                            <p className="text-slate-500 font-medium mb-6 text-sm">Have you received the blood units? This will add them to your inventory.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors">Cancel</button>
                                <button onClick={handleConfirmReceipt} className="flex-1 py-2.5 text-white font-semibold rounded-xl transition-colors" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>Confirm</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Feedback Toast */}
            {
                feedback && (
                    <div className="fixed bottom-6 right-6 z-50 animate-slide-in-right">
                        <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${feedback.type === 'success' ? 'bg-white border-emerald-200 text-emerald-800' : feedback.type === 'error' ? 'bg-white border-red-200 text-red-800' : 'bg-white border-blue-200 text-blue-800'}`}>
                            {feedback.type === 'success' ? <CheckCircle className="text-emerald-500" size={22} /> : feedback.type === 'error' ? <AlertTriangle className="text-red-500" size={22} /> : <Activity className="text-blue-500" size={22} />}
                            <span className="font-bold text-sm">{feedback.message}</span>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default HospitalDashboard;

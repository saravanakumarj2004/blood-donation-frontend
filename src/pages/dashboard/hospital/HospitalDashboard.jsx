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
    TrendingDown,
    ArrowDownLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

            {/* ── STUNNING DYNAMIC HERO SECTION ── */}
            <div className="relative rounded-3xl p-8 overflow-hidden flex flex-col xl:flex-row xl:items-center justify-between gap-8 animate-fade-in shadow-2xl shadow-rose-900/5 border border-slate-800/10 group"
                style={{
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #2d1b69 50%, #be123c 100%)',

                }}
            >
                {/* Dynamic Background Animated Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-rose-500/30 transition-colors duration-700" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4 group-hover:bg-indigo-500/30 transition-colors duration-700" />

                {/* Subtle Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                <div className="relative z-10 flex flex-col items-start xl:pr-0">
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-white/10 border border-white/20 backdrop-blur-md mb-4 shadow-xl">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                        </span>
                        <span className="text-[11px] font-bold text-rose-100 uppercase tracking-widest leading-none">Live</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4 drop-shadow-md">
                        {user?.name || 'City General Hospital'}
                    </h1>

                    {/* Glassmorphic Info Tags */}
                    <div className="flex flex-wrap items-center gap-3 text-slate-300 font-medium text-sm">
                        <div
                            onClick={() => navigate('/dashboard/hospital/stock')}
                            className="flex items-center gap-2 bg-slate-800/40 hover:bg-slate-800/60 hover:text-white transition-colors px-3.5 py-2 rounded-xl border border-slate-700/50 backdrop-blur-sm cursor-pointer group/pill"
                        >
                            <Activity size={16} className="text-rose-400 group-hover/pill:scale-110 transition-transform" />
                            <span>Blood Inventory</span>
                        </div>
                        <div
                            onClick={() => navigate('/dashboard/hospital/incoming-requests')}
                            className="flex items-center gap-2 bg-slate-800/40 hover:bg-slate-800/60 hover:text-white transition-colors px-3.5 py-2 rounded-xl border border-slate-700/50 backdrop-blur-sm cursor-pointer group/pill"
                        >
                            <Clock size={16} className="text-indigo-400 group-hover/pill:scale-110 transition-transform" />
                            <span>Live Requests</span>
                        </div>
                        <div
                            onClick={() => navigate('/dashboard/hospital/appointments')}
                            className="flex items-center gap-2 bg-slate-800/40 hover:bg-slate-800/60 hover:text-white transition-colors px-3.5 py-2 rounded-xl border border-slate-700/50 backdrop-blur-sm cursor-pointer group/pill"
                        >
                            <Calendar size={16} className="text-emerald-400 group-hover/pill:scale-110 transition-transform" />
                            <span>Appointments</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex flex-wrap items-center gap-4 mt-2 xl:mt-0">
                    <button onClick={handleExport} className="flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 backdrop-blur-md transition-all duration-300 shadow-xl hover:-translate-y-0.5 group/btn">
                        <Download size={18} className="stroke-[2.5px] text-rose-300 group-hover/btn:-translate-y-0.5 group-hover/btn:text-rose-200 transition-all" />
                        Export Data
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/hospital/request')}
                        className="flex items-center gap-2 px-8 py-3.5 font-bold rounded-xl transition-all duration-300 text-sm text-white hover:-translate-y-0.5 group/btn2"
                        style={{
                            background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
                            boxShadow: '0 8px 24px -6px rgba(225,29,72,0.6), inset 0 1px 0 rgba(255,255,255,0.2)'
                        }}
                    >
                        <HeartPulse size={20} className="stroke-[2.5px] group-hover/btn2:scale-110 transition-transform" />
                        Request Blood
                    </button>
                </div>
            </div>

            {/* ── CONTENT AREA (Loader or Data) ── */}
            {
                isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
                        <div className="w-14 h-14 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]" />
                        <p className="text-slate-500 font-bold tracking-wide animate-pulse">Loading dashboard data...</p>
                    </div>
                ) : (
                    <div className="space-y-10 animate-fade-in mt-9">
                        {/* ── STAT CARDS ── */}
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-7">
                            {[
                                {
                                    label: 'Total Blood Units',
                                    val: totalUnits,
                                    icon: Droplet,
                                    theme: 'blue',
                                    path: '/dashboard/hospital/stock',
                                    trend: '+12%',
                                    trendUp: true,
                                    data: [{ v: 45 }, { v: 52 }, { v: 48 }, { v: 61 }, { v: 59 }, { v: Math.max(totalUnits - 5, 0) }, { v: totalUnits }]
                                },
                                {
                                    label: 'Low Stock Alerts',
                                    val: lowStockCount,
                                    icon: AlertTriangle,
                                    theme: 'rose',
                                    path: '/dashboard/hospital/stock?filter=low',
                                    trend: '-2',
                                    trendUp: false,
                                    isAlert: lowStockCount > 0, // Triggers visual scream when there are any alerts
                                    data: [{ v: 12 }, { v: 14 }, { v: 10 }, { v: 15 }, { v: 11 }, { v: Math.max(lowStockCount + 2, 0) }, { v: lowStockCount }]
                                },
                                {
                                    label: 'Pending Requests',
                                    val: requestCount,
                                    icon: Clock,
                                    theme: 'violet',
                                    path: '/dashboard/hospital/incoming-requests',
                                    trend: '+5',
                                    trendUp: true,
                                    data: [{ v: 2 }, { v: 5 }, { v: 3 }, { v: 8 }, { v: 4 }, { v: Math.max(requestCount - 1, 0) }, { v: requestCount }]
                                },
                                {
                                    label: 'New Appointments',
                                    val: incompleteApptCount,
                                    icon: Calendar,
                                    theme: 'emerald',
                                    path: '/dashboard/hospital/appointments',
                                    trend: '+18%',
                                    trendUp: true,
                                    data: [{ v: 10 }, { v: 15 }, { v: 12 }, { v: 20 }, { v: 18 }, { v: Math.max(incompleteApptCount - 2, 0) }, { v: incompleteApptCount }]
                                }
                            ].map((stat, i) => {
                                // Premium Theme Config
                                const themes = {
                                    blue: {
                                        gradient: 'from-blue-500 to-indigo-600',
                                        shadow: 'rgba(59, 130, 246, 0.4)',
                                        hex: '#3b82f6',
                                        unit: 'Total Units',
                                        border: 'border-blue-200',
                                        bg: 'bg-white', // Make card solid white
                                        text: 'text-blue-700',
                                        footerBg: 'bg-blue-50', // Solid light blue footer
                                        footerBorder: 'border-blue-100',
                                        footerHover: 'group-hover:bg-blue-100/50'
                                    },
                                    rose: {
                                        gradient: 'from-rose-500 to-pink-600',
                                        shadow: 'rgba(244, 63, 94, 0.4)',
                                        hex: '#e11d48',
                                        unit: 'Stock Alerts',
                                        border: 'border-rose-200',
                                        bg: 'bg-white',
                                        text: 'text-rose-700',
                                        footerBg: 'bg-rose-50',
                                        footerBorder: 'border-rose-100',
                                        footerHover: 'group-hover:bg-rose-100/50'
                                    },
                                    violet: {
                                        gradient: 'from-violet-500 to-purple-600',
                                        shadow: 'rgba(124, 58, 237, 0.4)',
                                        hex: '#8b5cf6',
                                        unit: 'Requests',
                                        border: 'border-violet-200',
                                        bg: 'bg-white',
                                        text: 'text-violet-700',
                                        footerBg: 'bg-violet-50',
                                        footerBorder: 'border-violet-100',
                                        footerHover: 'group-hover:bg-violet-100/50'
                                    },
                                    emerald: {
                                        gradient: 'from-emerald-400 to-teal-500',
                                        shadow: 'rgba(16, 185, 129, 0.4)',
                                        hex: '#10b981',
                                        unit: 'Appointments',
                                        border: 'border-emerald-200',
                                        bg: 'bg-white',
                                        text: 'text-emerald-700',
                                        footerBg: 'bg-emerald-50',
                                        footerBorder: 'border-emerald-100',
                                        footerHover: 'group-hover:bg-emerald-100/50'
                                    },
                                };
                                const t = themes[stat.theme];
                                const isCritical = stat.isAlert;

                                return (
                                    <div
                                        key={i}
                                        onClick={() => stat.path && navigate(stat.path)}
                                        className={`group relative rounded-2xl border ${t.border} ${t.bg} hover:border-opacity-100 border-opacity-60 transition-all duration-300 ease-out overflow-hidden flex flex-col cursor-pointer animate-fade-in hover:-translate-y-1`}
                                        style={{
                                            boxShadow: `0 4px 0px -8px ${t.shadow}`,
                                            animationDelay: `${i * 100}ms`,
                                            animationFillMode: 'both'
                                        }}
                                    >
                                        <div className="p-5 flex-1 relative z-10">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    {/* Category Label */}
                                                    <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 mb-1">{stat.label}</p>

                                                    {/* Number & Critical Badge Row */}
                                                    <div className="flex items-center gap-3">
                                                        <h3 className={`text-3xl font-black tracking-tight leading-none ${t.text}`}>
                                                            <CountUp end={stat.val} duration={2} separator="," useEasing={true} />
                                                        </h3>
                                                        {isCritical && (
                                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white border border-rose-100 rounded-full shadow-sm">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
                                                                <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider">Critical</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Unit Label */}
                                                    <p className="text-[11px] font-semibold mt-1 text-slate-400">{t.unit}</p>
                                                </div>

                                                {/* Premium Icon Container */}
                                                <div
                                                    className={`p-3 rounded-xl bg-gradient-to-br ${isCritical ? themes.rose.gradient : t.gradient} text-white relative group-hover:scale-105 transition-transform duration-300`}
                                                    style={{
                                                        boxShadow: `0 4px 12px -2px ${isCritical ? themes.rose.shadow : t.shadow}`
                                                    }}
                                                >
                                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                                                    <stat.icon size={20} className="relative z-10 stroke-[2px]" />
                                                </div>
                                            </div>

                                            {/* Refined Sparkline */}
                                            <div className="h-10 w-full mt-2 px-1">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={stat.data}>
                                                        <Line
                                                            type="monotone"
                                                            dataKey="v"
                                                            stroke={t.hex}
                                                            strokeWidth={2.5}
                                                            dot={false}
                                                            isAnimationActive={true}
                                                            animationDuration={1500}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>

                                            {/* Trend Indicator */}
                                            <div className="flex items-center text-[11px] mt-2">
                                                <div className={`px-1.5 py-0.5 rounded font-bold flex items-center gap-1 ${stat.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                                                    {stat.trendUp ? <TrendingUp size={12} className="stroke-[2px]" /> : <TrendingDown size={12} className="stroke-[2px]" />}
                                                    {stat.trend}
                                                </div>
                                                <span className="text-slate-400 font-medium ml-1.5">vs last week</span>
                                            </div>
                                        </div>

                                        {/* Seamless Footer */}
                                        <div className={`px-5 py-3 border-t ${t.footerBorder} ${t.footerBg} flex justify-between items-center ${t.footerHover} transition-colors`}>
                                            <span className="text-[10px] font-bold text-zinc-800 group-hover:text-slate-700 uppercase tracking-wide">View Report</span>
                                            <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── BOTTOM GRID ── */}
                        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 mt-6 md:mt-10">

                            {/* Inventory Table */}
                            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
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
                                        className="flex items-center gap-2 px-4 py-2 text-white text-sm font-bold rounded-xl transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                                        style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
                                    >
                                        Manage Stock <ArrowRight size={15} />
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left table-fixed">
                                        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-3.5 w-1/4">Blood Group</th>
                                                <th className="px-6 py-3.5 w-1/4">Availability</th>
                                                <th className="px-6 py-3.5 w-1/4">Status</th>
                                                <th className="px-6 py-3.5 w-1/4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {Object.entries(stock).map(([group, data], index) => (
                                                <tr
                                                    key={group}
                                                    className="group hover:bg-slate-50/70 transition-colors animate-fade-in"
                                                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                                                >
                                                    <td className="px-6 py-3.5">
                                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${group.startsWith('O') ? 'from-orange-400 to-orange-600' : group.startsWith('AB') ? 'from-purple-500 to-purple-700' : group.startsWith('B') ? 'from-blue-500 to-blue-700' : 'from-slate-700 to-slate-800'} flex items-center justify-center text-sm font-black text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]`}>
                                                            {group}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3.5">
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="font-bold text-slate-900 text-lg">{data.units}</span>
                                                            <span className="text-xs text-slate-400 font-semibold">{data.units === 1 ? 'unit' : 'units'}</span>
                                                        </div>
                                                        {/* FULL AVAILABLE WIDTH PROGRESS BAR */}
                                                        <div className="w-full min-w-[120px] h-[6px] bg-slate-100 rounded-full mt-2 overflow-hidden border border-slate-200/60 shadow-inner">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-1000 ${data.status === 'critical' ? 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.4)]' : data.status === 'low' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'}`}
                                                                style={{ width: `max(8px, ${Math.min(data.units * 5, 100)}%)` }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3.5">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${data.status === 'critical'
                                                            ? 'bg-red-50 text-red-700 border-red-200'
                                                            : data.status === 'low'
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${data.status === 'critical' ? 'bg-red-500 animate-pulse' : data.status === 'low' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                            {data.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3.5">
                                                        <div className="flex items-center">
                                                            <button
                                                                onClick={() => navigate(`/dashboard/hospital/batches?bloodGroup=${encodeURIComponent(group)}`)}
                                                                className="group/btn px-3.5 py-1.5 text-xs font-bold rounded-lg text-slate-600 bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 flex items-center gap-1.5 shadow-sm hover:shadow-md"
                                                            >
                                                                Manage <ArrowRight size={13} className="text-slate-400 group-hover/btn:text-rose-500 group-hover/btn:translate-x-0.5 transition-all" />
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

                                {/* Alerts / Stock Health with Donut Visualization */}
                                {lowStockCount > 0 ? (
                                    <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
                                        <div className="px-5 py-4 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
                                            <AlertTriangle size={20} className="text-white" />
                                            <h4 className="text-white font-bold text-base">Critical Alerts</h4>
                                            <span className="ml-auto bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{lowStockCount}</span>
                                        </div>

                                        {/* Donut Chart Visualization */}
                                        <div className="px-4 pt-6 pb-2 border-b border-slate-100 flex flex-col items-center">
                                            <div className="h-40 w-full relative">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={Object.entries(stock).map(([name, data]) => ({
                                                                name,
                                                                value: data.units === 0 ? 1 : data.units, // Give empty stock a tiny sliver so it shows up on chart
                                                                actual: data.units,
                                                                fill: data.status === 'critical' ? '#f43f5e' : data.status === 'low' ? '#f59e0b' : '#10b981'
                                                            }))}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={50}
                                                            outerRadius={70}
                                                            paddingAngle={3}
                                                            dataKey="value"
                                                            stroke="none"
                                                        >
                                                            {Object.entries(stock).map(([key], index) => (
                                                                <Cell key={`cell-${index}`} />
                                                            ))}
                                                        </Pie>
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <span className="text-2xl font-black text-slate-800">{totalUnits}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Units</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 mt-2 mb-2 text-xs font-bold text-slate-500">
                                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Good</div>
                                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Low</div>
                                                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical</div>
                                            </div>
                                        </div>

                                        <div className="p-4 space-y-2">
                                            {Object.entries(stock).filter(([_, d]) => ['low', 'critical'].includes(d.status)).slice(0, 4).map(([g, d]) => (
                                                <div key={g} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${g.startsWith('O') ? 'from-orange-400 to-orange-600' : g.startsWith('AB') ? 'from-purple-500 to-purple-700' : g.startsWith('B') ? 'from-blue-500 to-blue-700' : 'from-slate-700 to-slate-800'} flex items-center justify-center text-xs font-black text-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]`}>{g}</div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-800 tracking-wide">{g} Blood Group</span>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${d.status === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{d.status}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-lg font-black text-slate-800">{d.units}</span>
                                                        <span className="text-xs font-semibold text-slate-400 ml-1">units</span>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => navigate('/dashboard/hospital/request')}
                                                className="w-full mt-2 py-2.5 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-0.5"
                                                style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
                                            >
                                                Request Blood Now <ArrowRight size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-emerald-100 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
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

                                {/* Today's Digest */}
                                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-slate-800">Today's Digest</h4>
                                        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><ArrowDownLeft size={16} className="stroke-[2.5px]" /></div>
                                                <span className="text-sm font-bold text-slate-700">Units Received</span>
                                            </div>
                                            <span className="font-black text-slate-900">+12</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><Truck size={16} className="stroke-[2.5px]" /></div>
                                                <span className="text-sm font-bold text-slate-700">Units Dispatched</span>
                                            </div>
                                            <span className="font-black text-slate-900">-8</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-violet-100 text-violet-600 rounded-lg"><Clock size={16} className="stroke-[2.5px]" /></div>
                                                <span className="text-sm font-bold text-slate-700">Pending Approvals</span>
                                            </div>
                                            <span className="font-black text-slate-900">4</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions Removed */}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Confirmation Dialog */}
            {
                confirmAction && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Receipt</h3>
                            <p className="text-slate-500 font-medium mb-6 text-sm">Have you received the blood units? This will add them to your inventory.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">Cancel</button>
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
                        <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${feedback.type === 'success' ? 'bg-white border-emerald-200 text-emerald-800' : feedback.type === 'error' ? 'bg-white border-red-200 text-red-800' : 'bg-white border-rose-200 text-rose-800'}`}>
                            {feedback.type === 'success' ? <CheckCircle className="text-emerald-500" size={22} /> : feedback.type === 'error' ? <AlertTriangle className="text-red-500" size={22} /> : <Activity className="text-rose-500" size={22} />}
                            <span className="font-bold text-sm">{feedback.message}</span>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default HospitalDashboard;

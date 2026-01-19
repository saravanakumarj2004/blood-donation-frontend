import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import {
    Calendar,
    Droplet,
    Heart,
    MapPin,
    ChevronRight,
    Clock,
    AlertCircle,
    Bell,
    CheckCircle,
    X,
    Shield
} from 'lucide-react';
import { donorAPI } from '../../../services/api';

const DonorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ livesSaved: 0, bloodUnits: 0, nextDonationDate: 'Available Now' });
    const [urgentNeeds, setUrgentNeeds] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (user?.id) {
                try {
                    const statsData = await donorAPI.getStats(user.id);
                    const historyData = await donorAPI.getHistory(user.id);

                    // Calculate Next Eligible Date (3 months from last donation)
                    let nextDate = 'Available Now';
                    if (historyData.length > 0) {
                        const lastDonation = new Date(historyData[0].date); // Assuming sorted desc
                        const eligibleDate = new Date(lastDonation);
                        eligibleDate.setMonth(eligibleDate.getMonth() + 3);

                        if (eligibleDate > new Date()) {
                            nextDate = eligibleDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
                        }
                    }

                    setStats({ ...statsData, nextDonationDate: nextDate });
                    setHistory(historyData.slice(0, 3));

                    // Pass user.id to filter out own requests and check eligibility properly
                    const requestsData = await donorAPI.getUrgentRequests(user.id);
                    setUrgentNeeds(requestsData.length > 0 ? requestsData : []);

                } catch (e) {
                    console.error("Dashboard fetch error", e);
                }
            }
        };
        fetchData();
        const dataInterval = setInterval(fetchData, 5000);

        const fetchNotifications = async () => {
            if (user?.id) {
                try {
                    const data = await donorAPI.getNotifications(user.id);
                    setNotifications(data);
                } catch (e) { console.error("Notif init error", e); }
            }
        };
        fetchNotifications();
        const notifInterval = setInterval(fetchNotifications, 5000);

        return () => {
            clearInterval(dataInterval);
            clearInterval(notifInterval);
        };
    }, [user]);

    const [feedback, setFeedback] = useState(null);

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 4000);
    };

    const handleRespondToAlert = async (notifId, response) => {
        try {
            setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, status: response } : n));
            await donorAPI.updateNotificationStatus(notifId, response);
            if (response === 'ACCEPTED') {
                showFeedback('success', "Thank you! The hospital has been notified.");
            }
        } catch (error) {
            console.error("Failed to update notification", error);
            showFeedback('error', "Action failed. Please check connection.");
        }
    };

    const statsList = [
        {
            id: 1,
            label: 'Total Donations',
            value: stats.bloodUnits || 0,
            unit: 'Units',
            icon: Droplet,
            color: 'from-orange-400 to-red-500',
            iconColor: 'text-red-500'
        },
        {
            id: 2,
            label: 'Lives Impacted',
            value: stats.livesSaved || 0,
            unit: 'Lives',
            icon: Heart,
            color: 'from-pink-400 to-rose-500',
            iconColor: 'text-rose-500'
        },
        {
            id: 3,
            label: 'Next Eligible Date',
            value: stats.nextDonationDate || 'Available Now',
            unit: 'Date',
            icon: Calendar,
            color: 'from-blue-400 to-indigo-500',
            iconColor: 'text-blue-500'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-red-100/40 rounded-full blur-[100px]" />
                <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px]" />
            </div>

            {/* Urgent Notifications Banner */}
            {notifications.some(n => n.status === 'UNREAD') && (
                <div className="backdrop-blur-xl bg-red-50/90 border border-red-200 rounded-[2rem] p-6 relative overflow-hidden shadow-xl shadow-red-500/10 animate-slide-in">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="flex items-start gap-5 relative z-10">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/30 animate-pulse">
                            <Bell size={28} className="fill-current" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <h3 className="text-xl font-black text-neutral-900 mb-2">Urgent Request Nearby</h3>
                            {notifications.filter(n => n.status === 'UNREAD').map(notif => {
                                const isExpired = notif.expiresAt && new Date(notif.expiresAt) < new Date();
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => {
                                            if (notif.type === 'REQUEST_ACCEPTED') {
                                                navigate('/dashboard/donor/my-requests');
                                            } else {
                                                navigate('/dashboard/donor/nearby');
                                            }
                                        }}
                                        className="p-4 rounded-xl border flex items-start justify-between gap-4 bg-white/50 border-red-100 cursor-pointer hover:bg-white transition-colors"
                                    >
                                        <div>
                                            <p className="font-bold text-neutral-800 text-sm leading-relaxed">{notif.message}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-neutral-500 font-bold bg-white px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                                                    <Clock size={12} /> {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isExpired && (
                                                    <span className="text-[10px] font-black uppercase text-neutral-400 bg-neutral-200 px-2 py-1 rounded-md">Expired</span>
                                                )}
                                            </div>
                                        </div>
                                        {notif.type === 'EMERGENCY_ALERT' && !isExpired && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent double navigation
                                                    handleRespondToAlert(notif.id, 'ACCEPTED');
                                                }}
                                                className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-black shadow-lg shadow-neutral-900/20 active:scale-95 transition-all whitespace-nowrap flex items-center gap-1.5"
                                            >
                                                <CheckCircle size={14} /> I Can Donate
                                            </button>
                                        )}
                                        {isExpired && (
                                            <span className="text-xs font-bold text-neutral-400 italic px-4 py-2">Expired</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-primary/20 group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-rose-600 to-indigo-700 transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

                <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            Ready to save lives
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                            Hello, {user?.name?.split(' ')[0] || 'Hero'}! 👋
                        </h1>
                        <p className="text-xl text-primary-100 font-medium leading-relaxed">
                            Your commitment makes a difference. Every drop counts towards saving a life. Ready for your next mission?
                        </p>
                        <button
                            onClick={() => navigate('/dashboard/donor/appointments')}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-black text-lg rounded-2xl shadow-xl shadow-black/10 hover:shadow-2xl hover:bg-neutral-50 hover:-translate-y-1 transition-all"
                        >
                            Book Appointment <ChevronRight size={20} className="text-primary-500" />
                        </button>
                    </div>

                    <div className="hidden md:flex relative">
                        <div className="w-40 h-40 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-2xl animate-float">
                            <Heart size={80} className="text-white fill-current" />
                        </div>
                        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl animate-float-delayed">
                            <Droplet size={40} className="text-white fill-current" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <button onClick={() => navigate('/dashboard/donor/request')} className="group p-6 bg-white/60 hover:bg-white backdrop-blur-md rounded-[2rem] border border-white/60 shadow-lg hover:shadow-xl transition-all text-left">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Heart size={24} className="fill-current" />
                    </div>
                    <div className="font-black text-neutral-900 text-lg">Find Donors</div>
                    <div className="text-sm font-bold text-neutral-400 mt-1">Request P2P Help</div>
                </button>

                <button onClick={() => navigate('/dashboard/donor/nearby')} className="group p-6 bg-white/60 hover:bg-white backdrop-blur-md rounded-[2rem] border border-white/60 shadow-lg hover:shadow-xl transition-all text-left relative overflow-hidden">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <MapPin size={24} className="fill-current" />
                    </div>
                    <div className="font-black text-neutral-900 text-lg flex items-center gap-2">
                        Nearby Help
                        {urgentNeeds.length > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-lg shadow-red-500/20">
                                {urgentNeeds.length}
                            </span>
                        )}
                    </div>
                    <div className="text-sm font-bold text-neutral-400 mt-1">Respond to Requests</div>
                </button>

                <button onClick={() => navigate('/dashboard/donor/eligibility')} className="group p-6 bg-white/60 hover:bg-white backdrop-blur-md rounded-[2rem] border border-white/60 shadow-lg hover:shadow-xl transition-all text-left">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <CheckCircle size={24} className="fill-current" />
                    </div>
                    <div className="font-black text-neutral-900 text-lg">Check Eligibility</div>
                    <div className="text-sm font-bold text-neutral-400 mt-1">Am I safe to donate?</div>
                </button>

                <button onClick={() => navigate('/dashboard/donor/history')} className="group p-6 bg-white/60 hover:bg-white backdrop-blur-md rounded-[2rem] border border-white/60 shadow-lg hover:shadow-xl transition-all text-left">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Clock size={24} className="fill-current" />
                    </div>
                    <div className="font-black text-neutral-900 text-lg">History</div>
                    <div className="text-sm font-bold text-neutral-400 mt-1">Track your impact</div>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statsList.map((stat) => (
                    <div key={stat.id} className="relative group bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-xl shadow-neutral-100/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-neutral-200/50 transition-all duration-300">
                        <div className={`absolute top-0 right-0 p-32 bg-gradient-to-br ${stat.color} opacity-[0.03] rounded-bl-[100%] transition-opacity group-hover:opacity-[0.08]`} />
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-14 h-14 rounded-2xl bg-white shadow-lg shadow-neutral-100 flex items-center justify-center ${stat.iconColor} ring-4 ring-white`}>
                                <stat.icon size={28} className="fill-current opacity-90" />
                            </div>
                            <span className={`text-xs font-black uppercase tracking-wider py-1 px-3 rounded-lg bg-neutral-100/50 text-neutral-500`}>
                                {stat.unit}
                            </span>
                        </div>
                        <div>
                            <div className="text-4xl font-black text-neutral-900 tracking-tight mb-1 group-hover:scale-105 transition-transform origin-left">
                                {stat.value}
                            </div>
                            <div className="text-neutral-500 font-bold text-sm tracking-wide uppercase">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Urgent Needs Section */}
                <section className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
                            <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                                <AlertCircle size={24} />
                            </div>
                            Urgent Needs Nearby
                        </h2>
                        <button className="text-neutral-500 font-bold text-sm hover:text-primary transition-colors">View All</button>
                    </div>

                    <div className="space-y-4">
                        {urgentNeeds.length > 0 ? (
                            urgentNeeds.map((need, idx) => (
                                <div key={need.id || idx} className="group bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-lg shadow-neutral-100/50 hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-5 w-full md:w-auto">
                                        <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center text-red-600 font-black text-xl border border-red-200 shadow-inner shrink-0 group-hover:rotate-6 transition-transform">
                                            {need.bloodGroup}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl text-neutral-900">{need.hospitalName}</h4>
                                            <div className="flex items-center gap-4 text-sm font-medium text-neutral-500 mt-2">
                                                <span className="flex items-center gap-1.5"><MapPin size={16} /> {need.location}</span>
                                                <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                                                <span className="text-neutral-700">{need.units} Unit(s) required</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/dashboard/donor/nearby')}
                                        className="w-full md:w-auto px-6 py-3 bg-neutral-900 text-white font-bold rounded-xl shadow-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
                                    >
                                        Donate Now <ChevronRight size={16} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center bg-white/40 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-neutral-200/60">
                                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
                                    <Shield size={32} />
                                </div>
                                <p className="text-lg font-bold text-neutral-600">No urgent requests nearby.</p>
                                <p className="text-neutral-400">Great news! Everyone is safe for now.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Recent History Section */}
                <section className="h-full flex flex-col space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                                <Clock size={24} />
                            </div>
                            History
                        </h2>
                    </div>

                    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/60 shadow-xl shadow-neutral-100/50 flex flex-col flex-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />

                        {history.length > 0 ? (
                            <div className="space-y-4 relative z-10">
                                {history.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 bg-white/80 rounded-2xl border border-white shadow-sm">
                                        <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                            <CheckCircle size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-neutral-900">{item.hospitalName}</div>
                                            <div className="text-xs font-bold text-neutral-400 mt-0.5">{new Date(item.date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => navigate('/dashboard/donor/history')} className="w-full py-3 mt-4 text-center text-sm font-bold text-neutral-500 hover:text-primary transition-colors border-t border-dashed border-neutral-200">
                                    View Full History
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-10 flex flex-col items-center justify-center h-full">
                                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4 inner-shadow">
                                    <Clock size={32} className="text-neutral-300" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900">No donations yet</h3>
                                <p className="text-neutral-500 text-sm mt-2 mb-6 max-w-[200px]">
                                    Your journey starts with a single step.
                                </p>
                                <button
                                    onClick={() => navigate('/dashboard/donor/appointments')}
                                    className="w-full py-3 bg-neutral-900 text-white font-bold rounded-xl shadow-lg hover:bg-neutral-800 transition-all"
                                >
                                    Start Journey
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Feedback Toast */}
            {feedback && (
                <div className="fixed bottom-6 right-6 z-50 animate-slide-in-right">
                    <div className={`px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border ${feedback.type === 'success' ? 'bg-white border-emerald-100 text-emerald-800' :
                        feedback.type === 'error' ? 'bg-white border-red-100 text-red-800' :
                            'bg-white border-blue-100 text-blue-800'
                        }`}>
                        {feedback.type === 'success' ? <CheckCircle className="text-emerald-500" size={24} /> :
                            feedback.type === 'error' ? <AlertCircle className="text-red-500" size={24} /> :
                                <Bell className="text-blue-500" size={24} />}
                        <span className="font-bold">{feedback.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonorDashboard;

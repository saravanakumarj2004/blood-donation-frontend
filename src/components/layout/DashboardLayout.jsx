import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    LayoutDashboard,
    History,
    Calendar,
    User,
    LogOut,
    Bell,
    Menu,
    X,
    Droplet,
    Box,
    Users,
    Building2,
    Inbox,
    MapPin,
    HeartPulse,
    ArrowDownLeft,
    Package,
    PlusCircle,
    FileText
} from 'lucide-react';
import api from '../../services/api';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

    // Popup State
    const [popupNotif, setPopupNotif] = useState(null);
    const prevCountRef = React.useRef(0);

    // Fetch Notifications
    const fetchNotifications = async () => {
        if (!user?.id) return;
        try {
            const response = await api.get(`/notifications/?userId=${user.id}`);
            const data = response.data;

            // Detect new notifications
            if (data.length > prevCountRef.current && prevCountRef.current > 0) {
                const newNotifs = data.filter(n => n.status === 'UNREAD'); // Simple filter
                if (newNotifs.length > 0) {
                    // Show the latest one
                    setPopupNotif(newNotifs[0]);
                    // Auto hide after 5s
                    setTimeout(() => setPopupNotif(null), 5000);
                }
            }
            prevCountRef.current = data.length;
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 10 seconds
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [user?.id]);

    const handleMarkAsRead = async (notification) => {
        if (notification.status === 'READ') return;
        try {
            await api.put('/notifications/', { id: notification.id, status: 'READ' });
            setNotifications(notifications.map(n =>
                n.id === notification.id ? { ...n, status: 'READ' } : n
            ));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    // Define Links based on Role
    const getLinks = () => {
        switch (user?.role) {
            case 'donor':
                return [
                    { path: '/dashboard/donor', label: 'Overview', icon: LayoutDashboard },
                    { path: '/dashboard/donor/request', label: 'Find Donors', icon: Users },
                    { path: '/dashboard/donor/my-requests', label: 'My Requests', icon: Inbox }, // New Link
                    { path: '/dashboard/donor/nearby', label: 'Nearby Requests', icon: MapPin }, // MapPin missing import check
                    { path: '/dashboard/donor/history', label: 'Donation History', icon: History },
                    { path: '/dashboard/donor/appointments', label: 'Appointments', icon: Calendar },
                    { path: '/dashboard/donor/eligibility', label: 'Eligibility Check', icon: Droplet },
                    { path: '/dashboard/donor/profile', label: 'My Profile', icon: User },
                ];
            case 'hospital':
                return [
                    { path: '/dashboard/hospital', label: 'Overview', icon: LayoutDashboard },
                    { path: '/dashboard/hospital/request', label: 'Request Blood', icon: HeartPulse },
                    { path: '/dashboard/hospital/incoming-requests', label: 'Incoming Requests', icon: ArrowDownLeft },
                    { path: '/dashboard/hospital/stock', label: 'Stock Manager', icon: Droplet },
                    { path: '/dashboard/hospital/batches', label: 'Batch Management', icon: Package }, // Swapped
                    { path: '/dashboard/hospital/stock-entry', label: 'Stock Entry', icon: PlusCircle },
                    { path: '/dashboard/hospital/appointments', label: 'Appointments', icon: Calendar },
                    { path: '/dashboard/hospital/reports', label: 'Reports', icon: FileText }
                ];

            default:
                return [];
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const links = getLinks();
    const currentTitle = links.find(l => l.path === location.pathname)?.label || 'Dashboard';

    return (
        <div className="min-h-screen bg-neutral-50 flex font-sans text-neutral-800">

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-72 bg-white/80 backdrop-blur-xl border-r border-white/50 shadow-2xl transform transition-transform duration-300 ease-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col bg-gradient-to-b from-white/50 to-white/30">
                    {/* Brand */}
                    <div className="h-24 flex items-center gap-3 px-8 border-b border-neutral-100/50 shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-rose-600 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center text-white transform hover:rotate-12 transition-transform duration-300">
                            <Droplet size={20} className="fill-current" />
                        </div>
                        <span className="font-extrabold text-2xl tracking-tight text-neutral-900">
                            Blood<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-600">Stock</span>
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                        {links.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => `group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 overflow-hidden ${isActive
                                    ? 'text-white shadow-lg shadow-primary/25 translate-x-2'
                                    : 'text-neutral-500 hover:text-primary hover:bg-white/60 hover:shadow-sm hover:translate-x-1'
                                    }`}
                                end
                            >
                                {({ isActive }) => (
                                    <>
                                        {/* Active Background Gradient */}
                                        {isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-rose-600 -z-10" />
                                        )}

                                        <link.icon size={20} className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white fill-white/20' : ''}`} />
                                        <span className="tracking-wide">{link.label}</span>

                                        {/* Active Indicator Dot */}
                                        {isActive && (
                                            <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-neutral-100/50 backdrop-blur-md bg-white/40 m-3 rounded-2xl shadow-sm border border-white/60 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 border-2 border-white shadow-inner flex items-center justify-center text-neutral-500">
                                <User size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-neutral-900 truncate">{user?.name || 'User'}</div>
                                <div className="text-[10px] font-medium text-neutral-400 capitalize bg-neutral-100 px-2 py-0.5 rounded-full w-fit mt-0.5">
                                    {user?.role} Access
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="mt-3 w-full py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-all duration-300 border border-neutral-200 hover:border-neutral-900 hover:shadow-lg"
                        >
                            <LogOut size={14} /> Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {
                isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )
            }

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 flex flex-col min-h-screen relative z-0">
                {/* Background Pattern */}
                <div className="fixed inset-0 bg-[#fafafa] -z-20" />
                <div className="fixed inset-0 opacity-[0.015] pointer-events-none -z-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                {/* Topbar */}
                <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 -ml-2 text-neutral-600 lg:hidden hover:bg-neutral-100 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-neutral-800">{currentTitle}</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="relative p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 rounded-full transition-colors"
                            >
                                <Bell size={20} />
                                {notifications.filter(n => (n.status || 'UNREAD').toUpperCase() === 'UNREAD').length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                        {notifications.filter(n => (n.status || 'UNREAD').toUpperCase() === 'UNREAD').length}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {isNotifOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-100 shadow-xl rounded-xl overflow-hidden z-[100]">
                                    <div className="p-3 border-b border-neutral-100 bg-neutral-50 flex justify-between items-center">
                                        <h3 className="font-bold text-sm text-neutral-700">Notifications</h3>
                                        <button onClick={() => setIsNotifOpen(false)} className="text-neutral-400 hover:text-neutral-600"><X size={16} /></button>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => {
                                                        handleMarkAsRead(n);
                                                        // Navigation Logic
                                                        if (n.type === 'EMERGENCY_ALERT' || n.type === 'URGENT_REQUEST') {
                                                            if (user?.role === 'hospital') {
                                                                navigate('/dashboard/hospital/incoming-requests');
                                                            } else {
                                                                navigate('/dashboard/donor/nearby');
                                                            }
                                                        } else if (n.type === 'REQUEST_ACCEPTED') {
                                                            if (user?.role === 'hospital') {
                                                                navigate('/dashboard/hospital/incoming-requests'); // To "My Outgoing"
                                                            } else {
                                                                navigate('/dashboard/donor/my-requests');
                                                            }
                                                        }
                                                        setIsNotifOpen(false);
                                                    }}
                                                    className={`p-4 border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer transition-colors ${(n.status || 'UNREAD').toUpperCase() === 'UNREAD' ? 'bg-blue-50/50' : 'opacity-75'
                                                        }`}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.status === 'UNREAD' ? 'bg-primary' : 'bg-transparent'}`}></div>
                                                        <div>
                                                            <p className={`text-sm ${n.status === 'UNREAD' ? 'font-semibold text-neutral-900' : 'text-neutral-600'}`}>
                                                                {n.message}
                                                            </p>
                                                            <p className="text-xs text-neutral-400 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-neutral-400 text-sm">
                                                No notifications
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <Outlet />
                </div>

                {/* Global Notification Popup */}
                {popupNotif && (
                    <div className="fixed top-24 right-6 z-[100] animate-slide-in-right">
                        <div className="bg-white/90 backdrop-blur-xl border border-red-100 p-5 rounded-[1.5rem] shadow-2xl w-80 flex items-start gap-4">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                                <Bell size={24} className="fill-current animate-wiggle" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-neutral-900 text-sm">New Alert!</h4>
                                <p className="text-sm font-bold text-neutral-600 mt-1 leading-snug">
                                    {popupNotif.message}
                                </p>
                                <button
                                    onClick={() => {
                                        setPopupNotif(null);
                                        navigate('/dashboard/donor/nearby');
                                    }}
                                    className="mt-3 text-xs font-black text-red-600 hover:text-red-700 uppercase tracking-wide"
                                >
                                    View Request →
                                </button>
                            </div>
                            <button onClick={() => setPopupNotif(null)} className="text-neutral-400 hover:text-neutral-600">
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div >
    );
};

export default DashboardLayout;

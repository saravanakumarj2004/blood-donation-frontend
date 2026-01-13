import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, ChevronRight, CheckCircle, FileText, Activity, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { donorAPI } from '../../../services/api';
import CustomSelect from '../../../components/CustomSelect';

const convertTo12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m < 10 ? '0' + m : m} ${ampm}`;
};

const AppointmentBooking = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'
    const [bookingStep, setBookingStep] = useState(1);
    const [hospitals, setHospitals] = useState([]);

    // Mock Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0], // Default to today
        time: '',
        hospitalId: '',
        center: '',
        reason: 'Voluntary Donation',
        units: 1 // Default to 1 unit
    });

    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [eligibility, setEligibility] = useState({ isEligible: true, nextDate: '' });

    const [appointments, setAppointments] = useState([]);
    const [isBookingSuccess, setIsBookingSuccess] = useState(false);

    React.useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const data = await donorAPI.getHospitals();
                setHospitals(data);
            } catch (err) {
                console.error("Failed to load hospitals", err);
            }
        };
        fetchHospitals();

        const fetchAppointments = async () => {
            if (user?.id) {
                try {
                    // Use getHistory which returns donations/appointments
                    const data = await donorAPI.getHistory(user.id);
                    // Filter or just use all (history includes appointments)
                    setAppointments(data);
                } catch (e) { console.error(e); }
            }
        }
        fetchAppointments();
        const interval = setInterval(fetchAppointments, 5000);
        return () => clearInterval(interval);

    }, [user?.id]);

    const checkEligibility = async () => {
        if (!user?.id) return;
        try {
            const stats = await donorAPI.getStats(user.id);
            // If nextDonationDate is NOT "Available Now", then user is ineligible
            if (stats && stats.nextDonationDate && stats.nextDonationDate !== 'Available Now') {
                setEligibility({
                    isEligible: false,
                    nextDate: stats.nextDonationDate
                });
            } else {
                setEligibility({ isEligible: true, nextDate: '' });
            }
        } catch (error) {
            console.error("Failed to check eligibility", error);
        }
    };

    React.useEffect(() => {
        checkEligibility();
    }, [user?.id]);

    const handleBook = async (e) => {
        e.preventDefault();

        if (!eligibility.isEligible) {
            alert(`You are not eligible to donate yet. Next eligible date: ${eligibility.nextDate}`);
            return;
        }

        setIsLoading(true);

        try {
            await donorAPI.donate({
                ...formData,
                donorId: user?.id,
                status: 'Scheduled',
                units: parseInt(formData.units)
            });
            // Show Success UI
            setIsBookingSuccess(true);

            // Reset Form Data
            setFormData({
                date: new Date().toISOString().split('T')[0],
                time: '',
                hospitalId: '',
                center: '',
                reason: 'Voluntary Donation',
                units: 1
            });
        } catch (error) {
            console.error(error);
            alert("Booking failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in relative">
            {/* Header Section */}
            <div>
                <h2 className="text-3xl font-black text-neutral-900 flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                        <Calendar size={32} />
                    </div>
                    Book Appointment
                </h2>
                <p className="text-neutral-500 mt-2 text-lg font-medium ml-1">Schedule your next life-saving donation.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-1 bg-white rounded-2xl border border-neutral-200 shadow-sm w-fit">
                <button
                    onClick={() => setActiveTab('new')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'new'
                        ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20'
                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                        }`}
                >
                    <Calendar size={18} />
                    Book New
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'history'
                        ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20'
                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                        }`}
                >
                    <FileText size={18} />
                    My History
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'new' ? (
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-neutral-100/50 border border-white/60 relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-indigo-600" />

                    <div className="p-8 md:p-12">
                        {isBookingSuccess ? (
                            <div className="text-center py-16 animate-fade-in">
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
                                    <CheckCircle size={48} />
                                </div>
                                <h3 className="text-3xl font-black text-neutral-900 mb-2">Booking Confirmed!</h3>
                                <p className="text-neutral-500 text-lg mb-8 max-w-md mx-auto">
                                    Your appointment for <span className="font-bold text-neural-800">{formData.date}</span> at <span className="font-bold text-neutral-800">{formData.center}</span> has been scheduled.
                                </p>
                                <button
                                    onClick={() => {
                                        setIsBookingSuccess(false);
                                        setActiveTab('history');
                                    }}
                                    className="px-8 py-3 bg-neutral-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                                >
                                    View My Appointments
                                </button>
                            </div>
                        ) : (
                            <>
                                {!eligibility.isEligible && (
                                    <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 text-amber-900 shadow-sm animate-fade-in-up">
                                        <AlertCircle size={28} className="text-amber-600 shrink-0 mt-1" />
                                        <div>
                                            <h3 className="font-bold text-lg">Waiting Period Active</h3>
                                            <p className="mt-1 text-amber-800 leading-relaxed">
                                                To ensure your safety and wellbeing, a 60-day waiting period is currently active.
                                                You will be eligible to donate again on <span className="font-bold bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200">{eligibility.nextDate}</span>.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* ... Form Header ... */}

                                <form onSubmit={handleBook} className={`space-y-8 ${!eligibility.isEligible ? 'opacity-50 pointer-events-none grayscale filter blur-[1px]' : ''}`}>
                                    <div>
                                        <label className="block text-sm font-bold text-neutral-700 mb-3 ml-1">Select Donation Center</label>
                                        <CustomSelect
                                            options={hospitals.map(h => ({ value: h.id, label: `${h.name} (${h.location || 'Unknown'})` }))}
                                            value={formData.hospitalId}
                                            onChange={(val) => {
                                                const selectedHospital = hospitals.find(h => h.id === val);
                                                setFormData({
                                                    ...formData,
                                                    hospitalId: val,
                                                    center: selectedHospital?.name || ''
                                                });
                                            }}
                                            placeholder="Choose a Center"
                                            icon={MapPin}
                                            required
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-sm font-bold text-neutral-700 mb-3 ml-1">Preferred Date</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary transition-colors">
                                                    <Calendar size={22} className="fill-current opacity-20" />
                                                </div>
                                                <input
                                                    type="date"
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-neutral-800"
                                                    required
                                                    min={new Date().toISOString().split('T')[0]} // Allow only future dates
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-neutral-700 mb-3 ml-1">Preferred Time</label>
                                            <CustomSelect
                                                options={[
                                                    "09:00 AM", "10:00 AM", "11:00 AM",
                                                    "02:00 PM", "03:00 PM", "04:00 PM"
                                                ]}
                                                value={formData.time}
                                                onChange={(val) => setFormData({ ...formData, time: val })}
                                                placeholder="Select Time"
                                                icon={Clock}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-sm font-bold text-neutral-700 mb-3 ml-1">Number of Units</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-primary transition-colors">
                                                    <Activity size={22} />
                                                </div>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="5"
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-neutral-800"
                                                    value={formData.units}
                                                    onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-neutral-700 mb-3 ml-1">Donation Type</label>
                                            <CustomSelect
                                                options={[
                                                    "Voluntary Donation",
                                                    "Replacement (For a Patient)",
                                                    "Platelet Donation"
                                                ]}
                                                value={formData.reason}
                                                onChange={(val) => setFormData({ ...formData, reason: val })}
                                                placeholder="Select Type"
                                            // No specific icon for type in original select, but logic implies maybe? kept simple.
                                            // Actually original select wrapper didn't have specific icon besides chevron, 
                                            // but let's stick to consistent style. 
                                            // Use CheckCircle or something generic? Or just no icon.
                                            // Original had no left icon for this one. CustomSelect supports icon optional.
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <button type="submit" className="px-10 py-4 bg-primary text-white font-bold text-lg rounded-2xl shadow-xl shadow-primary/25 hover:bg-primary-hover hover:-translate-y-1 hover:shadow-2xl transition-all flex items-center gap-3 group">
                                            Confirm Booking <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                /* History Tab */
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-neutral-100/50 border border-white/60 overflow-hidden min-h-[500px]">
                    <div className="p-8 md:p-12">
                        <h3 className="text-xl font-black text-neutral-900 mb-8 flex items-center gap-3">
                            <span className="w-2 h-8 bg-primary rounded-full" />
                            Your Appointments
                        </h3>

                        {appointments.length === 0 ? (
                            <div className="text-center py-20 flex flex-col items-center justify-center">
                                <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-neutral-200">
                                    <Calendar size={40} className="text-neutral-300" />
                                </div>
                                <h4 className="text-lg font-bold text-neutral-500">No appointments found</h4>
                                <p className="text-neutral-400 mt-2">Book your first donation today!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {appointments.map((apt, idx) => (
                                    <div key={apt.id || idx} className="group p-6 bg-white border border-neutral-100/80 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg hover:border-primary/20 transition-all">
                                        <div className="flex items-start gap-5">
                                            <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 text-primary rounded-2xl flex items-center justify-center font-black text-xl border border-primary/10 shadow-inner">
                                                {new Date(apt.date).getDate()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-neutral-900 group-hover:text-primary transition-colors">{apt.center}</h4>
                                                <div className="flex items-center gap-3 text-sm font-medium text-neutral-500 mt-1">
                                                    <span className="bg-neutral-100 px-2 py-0.5 rounded-md">{new Date(apt.date).toLocaleString('default', { month: 'short' })} {new Date(apt.date).getFullYear()}</span>
                                                    <span>•</span>
                                                    <span>
                                                        {apt.time ? convertTo12Hour(apt.time) : 'Time TBD'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">Pledged: {apt.units} Units</span>
                                                    {apt.rejectionReason && (
                                                        <span className="text-xs font-bold bg-red-50 text-error px-2 py-1 rounded-lg">Reason: {apt.rejectionReason}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                apt.status === 'Accepted' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    apt.status === 'Rejected' ? 'bg-red-50 text-error border-red-100' :
                                                        'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                {apt.status === 'Completed' && <CheckCircle size={16} />}
                                                {apt.status === 'Scheduled' && <Clock size={16} />}
                                                {apt.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentBooking;

import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';
import { donorAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

const NearbyRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);
    const [eta, setEta] = useState('');

    useEffect(() => {
        const fetchRequests = async () => {
            if (!user?.id) return;
            try {
                const data = await donorAPI.getUrgentRequests(user.id);
                setRequests(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch requests", error);
                setRequests([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [user?.id]);

    const handleAccept = (req) => {
        setSelectedReq(req);
        setModalOpen(true);
    };

    const handleIgnore = async (requestId) => {
        if (!user?.id) return;
        try {
            await donorAPI.ignoreRequest(requestId, user.id);
            // Optimistically remove from list
            setRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (error) {
            console.error("Failed to ignore", error);
        }
    };

    const confirmResponse = async () => {
        if (!user) return;

        // Helper to get location
        const getLocation = () => {
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error("Geolocation not supported"));
                } else {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            resolve(`${position.coords.latitude},${position.coords.longitude}`);
                        },
                        (error) => {
                            console.warn("Location access denied or failed", error);
                            resolve(null); // Proceed even if location fails, or enforce it? User asked to "collect location". Let's try best effort.
                        }
                    );
                }
            });
        };

        try {
            const location = await getLocation();
            // If location is critical we could block here: if(!location) return alert("Location access required!");

            await donorAPI.respondToAlert({
                alertId: selectedReq.id,
                donorId: user.id,
                status: 'Accepted',
                eta: eta,
                location: location || 'Unknown'
            });
            setModalOpen(false);
            // Instead of removing, we update the status locally to trigger the "Accepted Card" view
            setRequests(prev => prev.map(r =>
                r.id === selectedReq.id
                    ? { ...r, status: 'Accepted', acceptedBy: user.id }
                    : r
            ));

            // Show Success Modal/Toast instead of alert
            const contactMsg = selectedReq.attenderNumber
                ? `Thank you! Please contact ${selectedReq.attenderName || 'the attender'} at ${selectedReq.attenderNumber} for coordination.`
                : `Thanks! ${selectedReq.patientName || 'The patient'} is waiting. Contact the hospital/attender immediately.`;

            // We can use a simple overlay state here or assume the DashboardLayout's generic feedback can't be reached easily. 
            // Let's use a local 'successModal' state.
            setSuccessMsg(contactMsg);

        } catch (error) {
            console.error(error);
            alert('Failed to send response. Please try again.');
        }
    };

    // New State for Success Modal
    const [successMsg, setSuccessMsg] = useState(null);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 backdrop-blur-md bg-white/40 p-8 rounded-[2rem] border border-white/60 shadow-lg">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 flex items-center gap-3">
                        <span className="text-4xl">🚑</span> Nearby Requests
                    </h1>
                    <p className="text-neutral-500 font-medium ml-12">Urgent blood needs in your vicinity.</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-neutral-400 font-bold">Loading nearby requests...</div>
            ) : (
                <div className="grid gap-6">
                    {requests.length === 0 ? (
                        <div className="p-12 text-center bg-white/60 rounded-[2rem] border-2 border-dashed border-neutral-200">
                            <p className="text-neutral-500 font-bold text-lg">No urgent requests nearby.</p>
                            <p className="text-neutral-400">You're a hero in waiting!</p>
                        </div>
                    ) : (
                        requests
                            .filter(req => {
                                // FCFS: Hide if accepted by someone else
                                if ((req.status === 'Accepted' || req.status === 'Donated') && req.acceptedBy !== user?.id) {
                                    return false;
                                }
                                return true;
                            })
                            .map(req => {
                                const isAcceptedByMe = req.acceptedBy === user?.id;

                                if (isAcceptedByMe) {
                                    return (
                                        <div key={req.id} className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden animate-slide-up">
                                            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-bl-[100%] pointer-events-none" />

                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/40 animate-pulse">
                                                            <CheckCircle size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-green-400">Accepted & Active</h3>
                                                            <p className="text-neutral-400 text-sm">You are the hero for this request.</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-3xl font-black">{req.bloodGroup}</div>
                                                        <div className="text-sm font-bold text-neutral-400">{req.units} Units</div>
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-8 mb-8">
                                                    <div className="space-y-4">
                                                        <h4 className="text-neutral-400 font-bold uppercase text-xs tracking-wider border-b border-neutral-700/50 pb-2">Patient Details</h4>
                                                        <div>
                                                            <label className="text-neutral-500 text-sm">Patient Name</label>
                                                            <p className="text-xl font-bold">{req.patientName}</p>
                                                        </div>
                                                        {req.patientNumber && (
                                                            <div>
                                                                <label className="text-neutral-500 text-sm">Patient Phone</label>
                                                                <p className="text-xl font-bold">{req.patientNumber}</p>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <label className="text-neutral-500 text-sm">Hospital</label>
                                                            <p className="text-lg font-bold text-white/90">{req.hospitalName}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        {req.location && (
                                                            <div>
                                                                <label className="text-neutral-500 text-sm">Location</label>
                                                                <p className="text-sm font-bold text-neutral-300 flex items-center gap-2">
                                                                    <MapPin size={14} /> {req.location}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="bg-white/10 rounded-xl p-4 flex items-center gap-4 border border-white/5">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-neutral-300">
                                                            Please proceed to the hospital immediately.
                                                        </p>
                                                        <p className="text-xs text-neutral-500 mt-1">
                                                            The requester has been notified of your arrival.
                                                        </p>
                                                    </div>
                                                    <button className="px-6 py-2 bg-white text-neutral-900 rounded-lg font-bold text-sm hover:bg-neutral-200 transition-colors">
                                                        Call Contact
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={req.id} className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-white/60 flex flex-col md:flex-row items-center gap-6 group hover:scale-[1.01] transition-transform">
                                        <div className="w-20 h-20 rounded-2xl bg-red-50 text-red-600 flex flex-col items-center justify-center shrink-0 border border-red-100 shadow-inner">
                                            <span className="text-2xl font-black">{req.bloodGroup}</span>
                                            <span className="text-xs font-bold uppercase">{req.units} Units</span>
                                        </div>

                                        <div className="flex-1 text-center md:text-left space-y-2">
                                            <div>
                                                <h3 className="text-xl font-black text-neutral-900">{req.hospitalName || 'Unknown Hospital'}</h3>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 items-center justify-center md:justify-start">
                                                    {req.patientName && (
                                                        <p className="text-sm font-bold text-neutral-600 flex items-center gap-1">
                                                            <span className="text-neutral-400">Patient:</span> {req.patientName}{req.patientNumber && <span className="text-neutral-400 font-normal">({req.patientNumber})</span>}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-1 text-sm font-medium text-neutral-500">
                                                <div className="flex items-center justify-center md:justify-start gap-1">
                                                    <MapPin size={16} className="shrink-0" />
                                                    <span>{req.location || 'Unknown Location'}</span>
                                                </div>

                                                {req.attenderName && (
                                                    <div className="text-xs text-neutral-400 flex items-center justify-center md:justify-start gap-1">
                                                        <span>Contact details hidden until accepted</span>
                                                    </div>
                                                )}

                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs uppercase font-bold bg-red-100 text-red-600 w-fit mt-2`}>
                                                    {req.urgency || 'Urgent'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            <button
                                                onClick={() => handleIgnore(req.id)}
                                                className="flex-1 md:flex-none px-6 py-3 rounded-xl border-2 border-neutral-200 font-bold text-neutral-400 hover:text-neutral-600 hover:border-neutral-300 transition-colors"
                                            >
                                                Ignore
                                            </button>
                                            <button
                                                onClick={() => handleAccept(req)}
                                                className="flex-1 md:flex-none px-8 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:bg-red-700 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                            >
                                                <Navigation size={18} /> I'm Coming
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                    )}
                </div>
            )}

            {/* Confirmation Modal */}
            {modalOpen && selectedReq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl animate-scale-in">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-center text-neutral-900 mb-2">Confirm Response</h2>
                        <p className="text-center text-neutral-500 font-medium mb-8">
                            Are you sure you can travel to <strong className="text-neutral-800">{selectedReq.hospitalName}</strong> right now?
                        </p>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="ETA (e.g., 20 mins)"
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 font-bold outline-none"
                                value={eta}
                                onChange={e => setEta(e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setModalOpen(false)} className="py-3 rounded-xl font-bold text-neutral-500 hover:bg-neutral-50 transition-colors">Cancel</button>
                                <button onClick={confirmResponse} className="py-3 bg-neutral-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-colors">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Success Message Modal */}
            {successMsg && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl flex flex-col items-center text-center animate-scale-in">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-green-50">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-neutral-900 mb-4">You're a Hero! 🦸‍♂️</h2>
                        <p className="text-lg text-neutral-500 font-medium mb-8 leading-relaxed">
                            {successMsg}
                        </p>
                        <button
                            onClick={() => setSuccessMsg(null)}
                            className="px-10 py-4 bg-neutral-900 text-white font-bold text-lg rounded-2xl shadow-xl hover:bg-black hover:scale-105 transition-all"
                        >
                            Okay, Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NearbyRequests;

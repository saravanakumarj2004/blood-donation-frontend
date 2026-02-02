import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { hospitalAPI } from '../../../services/api';
import { Droplet, Calendar, Archive, AlertCircle, Building2, User, FileText, ArrowRightLeft, TrendingDown, X, Plus, Minus, Mail, Phone } from 'lucide-react';

const BatchManagement = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('incoming');
    const [batches, setBatches] = useState([]);
    const [outgoingBatches, setOutgoingBatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state
    const [showUseUnitModal, setShowUseUnitModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [useUnitForm, setUseUnitForm] = useState({
        quantity: 1,
        patientId: '',
        referenceId: ''
    });

    const fetchBatches = async () => {
        if (!user?.id) return;
        try {
            setIsLoading(true);
            const data = await hospitalAPI.getBatches(user.id);
            setBatches(data);
        } catch (error) {
            console.error("Failed to fetch batches", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOutgoingBatches = async () => {
        if (!user?.id) return;
        try {
            setIsLoading(true);
            const data = await hospitalAPI.getOutgoingBatches(user.id);
            setOutgoingBatches(data);
        } catch (error) {
            console.error("Failed to fetch outgoing batches", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'incoming') {
            fetchBatches();
        } else {
            fetchOutgoingBatches();
        }
    }, [user, activeTab]);

    const openUseUnitModal = (batch) => {
        setSelectedBatch(batch);
        setUseUnitForm({
            quantity: 1,
            patientId: '',
            referenceId: '',
            ward: '',
            doctorName: '',
            issueDateTime: new Date().toISOString().slice(0, 16) // Auto-set current datetime
        });
        setShowUseUnitModal(true);
    };

    const handleUseUnitSubmit = async () => {
        if (!selectedBatch) return;

        const batchId = selectedBatch._id || selectedBatch.id;
        const { quantity, patientId, referenceId, ward, doctorName, issueDateTime } = useUnitForm;

        // Validation
        if (quantity < 1) {
            alert("Quantity must be at least 1");
            return;
        }
        if (quantity > selectedBatch.units) {
            alert(`Only ${selectedBatch.units} units available in this batch`);
            return;
        }

        try {
            const res = await hospitalAPI.useBatchUnit(
                batchId,
                user.id,
                quantity,
                patientId || null,
                referenceId || null,
                ward || null,
                doctorName || null,
                issueDateTime
            );

            setBatches(prev => prev.map(b =>
                (b._id === batchId || b.id === batchId)
                    ? { ...b, units: res.remaining }
                    : b
            ).filter(b => b.units > 0));

            setShowUseUnitModal(false);

            // Show success message with any warnings
            let message = `Successfully used ${quantity} unit(s)`;
            if (res.warning) {
                message += `\n\n⚠️ ${res.warning}`;
            }
            alert(message);

            // Refresh outgoing batches if on that tab
            if (activeTab === 'outgoing') {
                fetchOutgoingBatches();
            }
        } catch (error) {
            // Enhanced error handling
            const errorMessage = error.response?.data?.error || error.message || "Failed to use unit";

            // Check for specific error types
            if (errorMessage.includes("expired")) {
                alert(`❌ Batch Expired\n\n${errorMessage}\n\nPlease use a different batch.`);
            } else if (errorMessage.includes("Insufficient units")) {
                alert(`❌ ${errorMessage}\n\nPlease refresh the page and try again.`);
            } else if (errorMessage.includes("depleted") || errorMessage.includes("discarded")) {
                alert(`❌ ${errorMessage}\n\nThis batch is no longer available.`);
            } else {
                alert(`❌ Error: ${errorMessage}`);
            }

            // Refresh batches to get updated data
            fetchBatches();
        }
    };

    const handleDiscardUnit = async (batchId) => {
        if (!window.confirm("Are you sure you want to discard this unit? This cannot be undone.")) return;
        try {
            const res = await hospitalAPI.discardBatchUnit(batchId, user.id, 1);
            setBatches(prev => prev.map(b =>
                b._id === batchId || b.id === batchId
                    ? { ...b, units: res.remaining }
                    : b
            ).filter(b => b.units > 0));
        } catch (error) {
            alert("Failed to discard unit");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col gap-4 backdrop-blur-md bg-white/40 p-8 rounded-[2rem] border border-white/60 shadow-lg">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-600 flex items-center gap-3">
                    <span className="text-4xl">📦</span> Batch Management
                </h1>
                <p className="text-neutral-500 font-medium ml-12">Track blood batches, usage, and transfers with full traceability.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-neutral-200">
                <button
                    onClick={() => setActiveTab('incoming')}
                    className={`px-6 py-3 font-bold transition-all ${activeTab === 'incoming'
                        ? 'border-b-4 border-blue-600 text-blue-600'
                        : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                >
                    📥 Incoming Batches
                </button>
                <button
                    onClick={() => setActiveTab('outgoing')}
                    className={`px-6 py-3 font-bold transition-all ${activeTab === 'outgoing'
                        ? 'border-b-4 border-red-600 text-red-600'
                        : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                >
                    📤 Outgoing Batches
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-neutral-400 font-bold">Loading batches...</div>
            ) : activeTab === 'incoming' ? (
                <IncomingBatchesView
                    batches={batches}
                    onUseUnit={openUseUnitModal}
                    onDiscardUnit={handleDiscardUnit}
                />
            ) : (
                <OutgoingBatchesView
                    batches={outgoingBatches}
                />
            )}

            {/* Use Unit Modal */}
            {showUseUnitModal && (
                <UseUnitModal
                    batch={selectedBatch}
                    form={useUnitForm}
                    setForm={setUseUnitForm}
                    onSubmit={handleUseUnitSubmit}
                    onClose={() => setShowUseUnitModal(false)}
                />
            )}
        </div>
    );
};

// Use Unit Modal Component
const UseUnitModal = ({ batch, form, setForm, onSubmit, onClose }) => {
    const maxUnits = batch?.units || 1;

    const incrementQuantity = () => {
        if (form.quantity < maxUnits) {
            setForm(prev => ({ ...prev, quantity: prev.quantity + 1 }));
        }
    };

    const decrementQuantity = () => {
        if (form.quantity > 1) {
            setForm(prev => ({ ...prev, quantity: prev.quantity - 1 }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative animate-scale-in my-8">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-xl transition-colors"
                >
                    <X size={20} className="text-neutral-400" />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-black text-neutral-800 flex items-center gap-2">
                        <Droplet className="text-red-600" size={24} />
                        Use Blood Unit
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                        Batch #{String(batch?._id || batch?.id).slice(-6)} • {batch?.bloodGroup}
                    </p>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                    {/* Quantity Selector */}
                    <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2">
                            Quantity <span className="text-red-600">*</span>
                        </label>
                        <div className="flex items-center gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                            <button
                                type="button"
                                onClick={decrementQuantity}
                                className="w-10 h-10 rounded-lg bg-white border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 transition-colors disabled:opacity-50"
                                disabled={form.quantity <= 1}
                            >
                                <Minus size={16} />
                            </button>
                            <div className="flex-1 text-center">
                                <div className="text-3xl font-black text-neutral-800">{form.quantity}</div>
                                <div className="text-xs text-neutral-400">of {maxUnits} available</div>
                            </div>
                            <button
                                type="button"
                                onClick={incrementQuantity}
                                className="w-10 h-10 rounded-lg bg-white border border-neutral-300 flex items-center justify-center hover:bg-neutral-100 transition-colors disabled:opacity-50"
                                disabled={form.quantity >= maxUnits}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Two Column Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Patient ID / IP-OP No */}
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2 flex items-center gap-1">
                                <User size={14} /> Patient ID / IP-OP No
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., IP12345 or OP67890"
                                value={form.patientId}
                                onChange={(e) => setForm(prev => ({ ...prev, patientId: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        {/* Reference/Case ID */}
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2 flex items-center gap-1">
                                <FileText size={14} /> Reference/Case ID
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., CASE-789"
                                value={form.referenceId}
                                onChange={(e) => setForm(prev => ({ ...prev, referenceId: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Date & Time of Issue (Auto-detected) */}
                    <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2 flex items-center gap-1">
                            <Calendar size={14} /> Date & Time of Issue
                        </label>
                        <input
                            type="datetime-local"
                            value={form.issueDateTime}
                            onChange={(e) => setForm(prev => ({ ...prev, issueDateTime: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-blue-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                        />
                        <p className="text-xs text-blue-600 mt-1 ml-1">📌 Auto-detected current date & time</p>
                    </div>

                    {/* Two Column Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Ward / Department */}
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2 flex items-center gap-1">
                                <Building2 size={14} /> Ward / Department
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., ICU, Emergency"
                                value={form.ward}
                                onChange={(e) => setForm(prev => ({ ...prev, ward: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>

                        {/* Doctor Name */}
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2 flex items-center gap-1">
                                👨‍⚕️ Doctor Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Dr. John Smith"
                                value={form.doctorName}
                                onChange={(e) => setForm(prev => ({ ...prev, doctorName: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-700 font-bold rounded-xl hover:bg-neutral-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <Droplet size={18} className="fill-current" />
                        Use {form.quantity} Unit{form.quantity > 1 ? 's' : ''}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Incoming Batches Component (Active Stock)
const IncomingBatchesView = ({ batches, onUseUnit, onDiscardUnit }) => {
    if (batches.length === 0) {
        return (
            <div className="col-span-full p-12 text-center bg-white/50 rounded-3xl border border-dashed border-neutral-200">
                <p className="text-neutral-500 font-bold">No active batches found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {Object.entries(
                batches
                    .sort((a, b) => new Date(a.collectedDate) - new Date(b.collectedDate))
                    .reduce((groups, batch) => {
                        const group = batch.bloodGroup;
                        if (!groups[group]) groups[group] = [];
                        groups[group].push(batch);
                        return groups;
                    }, {})
            ).map(([group, groupBatches]) => (
                <div key={group} className="space-y-6">
                    <h2 className="text-2xl font-black text-neutral-800 flex items-center gap-3 border-b border-neutral-200 pb-2">
                        <span className={`px-4 py-1 rounded-xl text-lg ${group.includes('+') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {group}
                        </span>
                        <span className="text-lg text-neutral-400 font-medium">
                            {groupBatches.length} Batch{groupBatches.length !== 1 ? 'es' : ''}
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupBatches.map(batch => (
                            <div key={batch._id || batch.id} className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-lg border border-white/60 flex flex-col gap-4 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shadow-inner ${batch.bloodGroup.includes('+') ? 'bg-red-50 text-red-600' : 'bg-rose-50 text-rose-600'
                                            }`}>
                                            {batch.bloodGroup}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-neutral-900">{batch.componentType || 'Whole Blood'}</h3>
                                            <p className="text-xs font-medium text-neutral-400">Batch #{String(batch._id || batch.id).slice(-6)}</p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${batch.source === 'transfer' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                        {batch.source === 'transfer' ? 'Transfer' : 'Active'}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-3 bg-neutral-50/50 p-4 rounded-xl border border-neutral-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-400 font-medium flex items-center gap-1"><Calendar size={14} /> Collected</span>
                                        <span className="font-bold text-neutral-700">{new Date(batch.collectedDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-400 font-medium flex items-center gap-1"><AlertCircle size={14} /> Expires</span>
                                        <span className="font-bold text-red-600">{new Date(batch.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                    {batch.donorDetails?.name ? (
                                        <div className="space-y-1 pt-2 border-t border-neutral-200 mt-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400 font-medium flex items-center gap-1"><User size={14} /> Donor</span>
                                                <span className="font-bold text-neutral-800">{batch.donorDetails.name}</span>
                                            </div>
                                            {batch.donorDetails.phone && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-neutral-400 font-medium flex items-center gap-1"><Phone size={14} /> Phone</span>
                                                    <a href={`tel:${batch.donorDetails.phone}`} className="font-bold text-blue-600 hover:underline">{batch.donorDetails.phone}</a>
                                                </div>
                                            )}
                                            {batch.donorDetails.email && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-neutral-400 font-medium flex items-center gap-1"><Mail size={14} /> Email</span>
                                                    <span className="font-bold text-neutral-600 truncate max-w-[150px]" title={batch.donorDetails.email}>{batch.donorDetails.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : batch.fromHospitalId ? (
                                        <div className="flex justify-between text-sm pt-2 border-t border-neutral-200 mt-2">
                                            <span className="text-neutral-400 font-medium flex items-center gap-1"><ArrowRightLeft size={14} /> From</span>
                                            <span className="font-bold text-purple-600">{batch.sourceName || "Hospital Transfer"}</span>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between text-sm pt-2 border-t border-neutral-200 mt-2">
                                            <span className="text-neutral-400 font-medium flex items-center gap-1"><User size={14} /> Source</span>
                                            <span className="font-bold text-neutral-600">{batch.sourceName}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action */}
                                <div className="mt-auto pt-2 flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-neutral-400 uppercase mb-1">Available</p>
                                        <p className="text-3xl font-black text-neutral-800">{batch.units} <span className="text-sm font-medium text-neutral-400">Units</span></p>
                                    </div>
                                    <button
                                        onClick={() => onUseUnit(batch)}
                                        className="px-6 py-3 bg-neutral-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-colors flex items-center gap-2 active:scale-95"
                                    >
                                        <Droplet size={18} className="fill-current" /> Use Unit
                                    </button>
                                    <button
                                        onClick={() => onDiscardUnit(batch._id || batch.id)}
                                        className="px-6 py-3 bg-red-100 text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-200 transition-colors flex items-center gap-2 active:scale-95"
                                        title="Discard damaged or expired unit"
                                    >
                                        <Archive size={18} /> Discard
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Outgoing Batches Component (Patient Usage & Transfers) - REDESIGNED
const OutgoingBatchesView = ({ batches }) => {
    const [expandedBatch, setExpandedBatch] = useState(null);

    if (batches.length === 0) {
        return (
            <div className="col-span-full p-12 text-center bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-3xl border border-dashed border-neutral-300">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-4">
                    <TrendingDown size={40} className="text-neutral-300" />
                </div>
                <p className="text-neutral-500 font-bold text-lg">No outgoing batches recorded yet.</p>
                <p className="text-neutral-400 text-sm mt-2">Patient usage and transfers will appear here</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {batches.map(batch => {
                const isPatientUsage = batch.type === 'patient_usage';
                const isExpanded = expandedBatch === (batch._id || batch.id);

                return (
                    <div
                        key={batch._id || batch.id}
                        className="relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    >
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 ${isPatientUsage
                            ? 'bg-gradient-to-br from-rose-500 via-red-500 to-pink-600'
                            : 'bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600'
                            } opacity-10`}></div>

                        {/* Content */}
                        <div className="relative bg-white/95 backdrop-blur-xl p-6 h-full flex flex-col">
                            {/* Header Row */}
                            <div className="flex items-start justify-between mb-4">
                                {/* Icon & Type */}
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg ${isPatientUsage
                                        ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-red-200'
                                        : 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-200'
                                        }`}>
                                        {isPatientUsage ? '🏥' : '🔄'}
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-black ${isPatientUsage ? 'text-red-600' : 'text-purple-600'
                                            }`}>
                                            {isPatientUsage ? 'Patient Usage' : 'Hospital Transfer'}
                                        </h3>
                                        <p className="text-xs text-neutral-500 font-medium flex items-center gap-1 mt-1">
                                            <Calendar size={14} />
                                            {new Date(batch.issuedAt).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Quantity Badge */}
                                <div className="text-right">
                                    <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-black text-white shadow-lg ${isPatientUsage
                                        ? 'bg-gradient-to-r from-red-500 to-pink-600'
                                        : 'bg-gradient-to-r from-purple-500 to-indigo-600'
                                        }`}>
                                        <Droplet size={16} className="fill-current" />
                                        <span className="text-xl">{batch.quantity}</span>
                                        <span className="text-xs opacity-90">Unit{batch.quantity > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className={`mt-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold inline-block ${isPatientUsage
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-purple-100 text-purple-700'
                                        }`}>
                                        {batch.bloodGroup}
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                {isPatientUsage ? (
                                    <>
                                        {batch.patientId && (
                                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-100">
                                                <p className="text-xs font-bold text-blue-600 uppercase flex items-center gap-1 mb-1">
                                                    <User size={12} /> Patient ID
                                                </p>
                                                <p className="font-black text-blue-900 truncate">{batch.patientId}</p>
                                            </div>
                                        )}
                                        {batch.referenceId && (
                                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-100">
                                                <p className="text-xs font-bold text-amber-600 uppercase flex items-center gap-1 mb-1">
                                                    <FileText size={12} /> Reference ID
                                                </p>
                                                <p className="font-black text-amber-900 truncate">{batch.referenceId}</p>
                                            </div>
                                        )}
                                        {batch.ward && (
                                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-xl border border-emerald-100">
                                                <p className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-1 mb-1">
                                                    <Building2 size={12} /> Ward
                                                </p>
                                                <p className="font-black text-emerald-900 truncate">{batch.ward}</p>
                                            </div>
                                        )}
                                        {batch.doctorName && (
                                            <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-3 rounded-xl border border-violet-100">
                                                <p className="text-xs font-bold text-violet-600 uppercase mb-1">
                                                    👨‍⚕️ Doctor
                                                </p>
                                                <p className="font-black text-violet-900 truncate">{batch.doctorName}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-3 rounded-xl border border-indigo-100">
                                            <p className="text-xs font-bold text-indigo-600 uppercase flex items-center gap-1 mb-1">
                                                <Building2 size={12} /> Receiving Hospital
                                            </p>
                                            <p className="font-black text-indigo-900 truncate">{batch.receivingHospitalId}</p>
                                        </div>
                                        {batch.dispatchDetails?.tracker && (
                                            <div className="bg-gradient-to-br from-cyan-50 to-sky-50 p-3 rounded-xl border border-cyan-100">
                                                <p className="text-xs font-bold text-cyan-600 uppercase flex items-center gap-1 mb-1">
                                                    📦 Tracking ID
                                                </p>
                                                <p className="font-black text-cyan-900 truncate">{batch.dispatchDetails.tracker}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Source Batches (Traceability) */}
                            {batch.sourceBatchIds && batch.sourceBatchIds.length > 0 && (
                                <div className="mt-auto pt-4">
                                    <button
                                        onClick={() => setExpandedBatch(isExpanded ? null : (batch._id || batch.id))}
                                        className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${isExpanded
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                                            : 'bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700 hover:from-blue-100 hover:to-cyan-100'
                                            }`}
                                    >
                                        <span className="font-bold text-sm flex items-center gap-2">
                                            <TrendingDown size={16} />
                                            Source Batches ({batch.sourceBatchIds.length})
                                        </span>
                                        <span className={`transform transition-transform text-xs ${isExpanded ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </button>

                                    {isExpanded && (
                                        <div className="mt-3 space-y-2 animate-fade-in">
                                            {batch.sourceBatchIds.map((source, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-white border border-blue-100 p-2.5 rounded-lg flex items-center justify-between hover:border-blue-300 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-neutral-500 uppercase">Batch ID</p>
                                                            <p className="font-bold text-neutral-800 text-xs">#{source.batchId.slice(-8).toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-neutral-500 uppercase">Units</p>
                                                        <p className="text-lg font-black text-blue-600">{source.unitsUsed}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default BatchManagement;

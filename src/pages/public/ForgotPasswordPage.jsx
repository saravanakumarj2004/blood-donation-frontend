import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, ShieldCheck, Lock, HelpCircle } from 'lucide-react';

import { authAPI } from '../../services/api';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 4: Success (Steps 2 & 3 removed as backend handles email reset)
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // State for different steps
    const [email, setEmail] = useState('');

    // STEP 1: Find Account & Request Reset
    const handleFindAccount = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        try {
            // Call Backend API
            const response = await authAPI.forgotPassword(email);

            // Backend returns success even if email not found (security practice) OR detailed error
            // Assuming 200 OK means we proceed.
            if (response.success) {
                setStep(4);
            } else {
                setError(response.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            console.error("Forgot Password Error:", err);
            // If backend throws 400/404 explicitly:
            setError(err.message || 'Unable to process request. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    // Render Steps
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <form onSubmit={handleFindAccount} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-neutral-50 focus:bg-white outline-none transition-all"
                                    placeholder="Enter your registered email"
                                />
                            </div>
                        </div>
                        <button disabled={isLoading} className="w-full py-3.5 bg-neutral-900 text-white font-bold rounded-xl shadow-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
                            {isLoading ? 'Sending Request...' : 'Reset Password'}
                            {!isLoading && <ArrowRight size={20} />}
                        </button>
                    </form>
                );
            case 4:
                return (
                    <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Check your Email</h2>
                        <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
                            If an account exists with <strong>{email}</strong>, we have sent a secure password reset link to it.
                            (For this Demo: Please contact admin if you need manual reset).
                        </p>
                        <Link to="/login" className="block w-full py-3.5 bg-neutral-900 text-white font-bold rounded-xl shadow-lg hover:bg-neutral-800 transition-all">
                            Back to Login
                        </Link>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans text-neutral-800">
            {/* Visual Side */}
            <div className="hidden lg:flex w-1/2 bg-neutral-900 relative overflow-hidden items-center justify-center p-12 text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-neutral-900 to-neutral-900 opacity-90 z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1584036561566-b93a50208c1c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />

                <div className="relative z-20 max-w-lg space-y-8">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                        <ShieldCheck size={32} className="text-white fill-current" />
                    </div>
                    <h1 className="text-5xl font-extrabold leading-tight text-white">
                        Secure<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-200">Recovery.</span>
                    </h1>
                    <p className="text-lg text-neutral-300 leading-relaxed">
                        Don't worry, it happens to the best of us. We'll help you get back to saving lives securely.
                    </p>
                </div>
            </div>

            {/* Form Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
                <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-neutral-500 hover:text-neutral-900 font-medium transition-colors">
                    Back to Home
                </Link>

                <div className="w-full max-w-md space-y-8">
                    {step < 4 && (
                        <div className="text-center lg:text-left">
                            <h2 className="text-3xl font-bold text-neutral-900">
                                {step === 1 && 'Forgot Password?'}
                                {step === 2 && 'Verify Identity'}
                                {step === 3 && 'Reset Password'}
                            </h2>
                            <p className="text-neutral-500 mt-2">
                                {step === 1 && "Enter your email to find your account."}
                                {step === 2 && "Answer your security question to continue."}
                                {step === 3 && "Create a new password for your account."}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            {error}
                        </div>
                    )}

                    {renderStep()}

                    {step === 1 && (
                        <div className="text-center mt-8">
                            <p className="text-neutral-500">
                                Remember your password?{' '}
                                <Link to="/login" className="text-neutral-900 font-bold hover:underline">
                                    Back to Login
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;

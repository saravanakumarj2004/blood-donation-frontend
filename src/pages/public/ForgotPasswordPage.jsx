import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, ShieldCheck, Lock, HelpCircle } from 'lucide-react';

import { authAPI } from '../../services/api';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: Security Question, 3: New Password, 4: Success
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // State for different steps
    const [email, setEmail] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // STEP 1: Verify Email
    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authAPI.forgotPassword(email);

            if (response.success && response.securityQuestion) {
                setSecurityQuestion(response.securityQuestion);
                setStep(2); // Move to security question step
            } else {
                setError(response.message || 'Unable to verify email');
            }
        } catch (err) {
            console.error("Email Verification Error:", err);
            setError(err.error || err.message || 'Unable to find account with this email');
        } finally {
            setIsLoading(false);
        }
    };

    // STEP 2: Verify Security Answer
    const handleVerifyAnswer = async (e) => {
        e.preventDefault();
        setError('');

        if (!securityAnswer.trim()) {
            setError('Please enter your security answer');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authAPI.verifySecurityAnswer(email, securityAnswer);

            if (response.success && response.verified) {
                setStep(3); // Move to password reset step
            } else {
                setError(response.message || 'Security verification failed');
            }
        } catch (err) {
            console.error("Security Answer Error:", err);
            setError(err.error || err.message || 'Incorrect security answer');
        } finally {
            setIsLoading(false);
        }
    };

    // STEP 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (!newPassword || newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authAPI.resetPasswordWithVerification(email, newPassword);

            if (response.success) {
                setStep(4); // Success
            } else {
                setError(response.message || 'Failed to reset password');
            }
        } catch (err) {
            console.error("Password Reset Error:", err);
            setError(err.error || err.message || 'Unable to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    // Render Steps
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <form onSubmit={handleVerifyEmail} className="space-y-6">
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
                            {isLoading ? 'Verifying...' : 'Continue'}
                            {!isLoading && <ArrowRight size={20} />}
                        </button>
                    </form>
                );
            case 2:
                return (
                    <form onSubmit={handleVerifyAnswer} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Security Question</label>
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <HelpCircle size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-neutral-800 font-medium">{securityQuestion}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Your Answer</label>
                            <input
                                type="text"
                                value={securityAnswer}
                                onChange={(e) => setSecurityAnswer(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-neutral-50 focus:bg-white outline-none transition-all"
                                placeholder="Enter your answer"
                                autoFocus
                            />
                        </div>
                        <button disabled={isLoading} className="w-full py-3.5 bg-neutral-900 text-white font-bold rounded-xl shadow-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
                            {isLoading ? 'Verifying...' : 'Verify Answer'}
                            {!isLoading && <ArrowRight size={20} />}
                        </button>
                    </form>
                );
            case 3:
                return (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">New Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-neutral-50 focus:bg-white outline-none transition-all"
                                    placeholder="Enter new password"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-neutral-50 focus:bg-white outline-none transition-all"
                                    placeholder="Re-enter new password"
                                />
                            </div>
                        </div>
                        <button disabled={isLoading} className="w-full py-3.5 bg-neutral-900 text-white font-bold rounded-xl shadow-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
                            {isLoading ? 'Resetting Password...' : 'Reset Password'}
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
                        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Password Reset Successful!</h2>
                        <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
                            Your password has been updated. You can now log in with your new credentials.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3.5 bg-neutral-900 text-white font-bold rounded-xl shadow-lg hover:bg-neutral-800 transition-all"
                        >
                            Back to Login
                        </button>
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
                                {step === 1 && "Enter your email to verify your account."}
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

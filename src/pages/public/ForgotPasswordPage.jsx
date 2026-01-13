import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, ShieldCheck, Lock, HelpCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: Security Question, 3: Reset Password, 4: Success
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // State for different steps
    const [email, setEmail] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });

    // STEP 1: Find Account
    const handleFindAccount = (e) => {
        e.preventDefault();
        setError('');

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
            const user = users.find(u => u.email === email);

            if (user && user.securityQuestion) {
                setFoundUser(user);
                setStep(2);
            } else if (user && !user.securityQuestion) {
                setError('This account does not have security questions set up. Please contact support.');
            } else {
                setError('No account found with this email address.');
            }
            setIsLoading(false);
        }, 1000);
    };

    // STEP 2: Verify Security Answer
    const handleVerifyAnswer = (e) => {
        e.preventDefault();
        setError('');

        if (!securityAnswer.trim()) {
            setError('Please provide an answer');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            // Case-insensitive check
            if (foundUser.securityAnswer && securityAnswer.toLowerCase().trim() === foundUser.securityAnswer.toLowerCase().trim()) {
                setStep(3);
            } else {
                setError('Incorrect answer. Please try again.');
            }
            setIsLoading(false);
        }, 800);
    };

    // STEP 3: Reset Password
    const handleResetPassword = (e) => {
        e.preventDefault();
        setError('');

        if (passwords.new.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (passwords.new !== passwords.confirm) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            // Update user in localStorage
            const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
            const updatedUsers = users.map(u => {
                if (u.email === foundUser.email) {
                    return { ...u, password: passwords.new }; // In real app, hash this!
                }
                return u;
            });

            localStorage.setItem('registered_users', JSON.stringify(updatedUsers));
            setStep(4);
            setIsLoading(false);
        }, 1000);
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
                            {isLoading ? 'Searching...' : 'Find Account'}
                            {!isLoading && <ArrowRight size={20} />}
                        </button>
                    </form>
                );
            case 2:
                return (
                    <form onSubmit={handleVerifyAnswer} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">Security Question</p>
                            <p className="text-neutral-900 font-medium text-lg">{foundUser.securityQuestion}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Your Answer</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                    <HelpCircle size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={securityAnswer}
                                    onChange={(e) => setSecurityAnswer(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-neutral-50 focus:bg-white outline-none transition-all"
                                    placeholder="Enter your answer"
                                />
                            </div>
                        </div>
                        <button disabled={isLoading} className="w-full py-3.5 bg-neutral-900 text-white font-bold rounded-xl shadow-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
                            {isLoading ? 'Verifying...' : 'Verify Answer'}
                            {!isLoading && <CheckCircle size={20} />}
                        </button>
                    </form>
                );
            case 3:
                return (
                    <form onSubmit={handleResetPassword} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">New Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-neutral-50 focus:bg-white outline-none transition-all"
                                    placeholder="Min 6 characters"
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
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-neutral-50 focus:bg-white outline-none transition-all"
                                    placeholder="Re-enter password"
                                />
                            </div>
                        </div>
                        <button disabled={isLoading} className="w-full py-3.5 bg-neutral-900 text-white font-bold rounded-xl shadow-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
                            {isLoading ? 'Resetting...' : 'Reset Password'}
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
                        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Password Reset!</h2>
                        <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
                            Your password has been securely updated. You can now login with your new credentials.
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

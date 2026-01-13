import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Heart,
    Activity,
    Shield,
    Smartphone,
    Users,
    Droplet,
    Lock,
    Zap,
    Globe,
    Award,
    ChevronRight,
    MapPin,
    Bell
} from 'lucide-react';
import Footer from '../../components/common/Footer';
import Navbar from '../../components/common/Navbar';

// Assets
import networkImg from '../../assets/images/illustration_network.png';
import appImg from '../../assets/images/illustration_app.png';

const HomePage = () => {
    return (
        <div className="flex flex-col min-h-screen font-sans text-neutral-800 overflow-x-hidden">
            <Navbar />

            {/* ==================== 
              HERO SECTION 
            ==================== */}
            <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-red-50/30">
                {/* Background Decor */}
                <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-3xl -z-10" />

                <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8 z-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-error font-bold text-xs uppercase tracking-wider border border-red-100 shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error"></span>
                            </span>
                            Emergency Ready Network
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight text-neutral-900">
                            Give the Gift of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-rose-500 to-rose-600 drop-shadow-sm">
                                Life & Hope.
                            </span>
                        </h1>

                        <p className="text-lg lg:text-xl text-neutral-500 max-w-lg leading-relaxed font-medium">
                            Join the city's most advanced blood donation network.
                            Connect with hospitals instantly and track your life-saving impact in real-time.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-2">
                            <Link to="/login" className="group relative px-8 py-4 bg-gradient-to-r from-primary to-rose-600 text-white font-bold rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 overflow-hidden">
                                <span className="relative z-10">Donate Now</span>
                                <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </Link>
                            <button
                                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-4 bg-white text-neutral-700 font-bold rounded-full shadow-sm border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 hover:shadow-md transition-all duration-300 flex items-center gap-2"
                            >
                                How It Works <ChevronRight size={18} />
                            </button>
                        </div>

                        <div className="pt-8 flex items-center gap-6 text-sm font-semibold text-neutral-500">
                            <div className="flex items-center gap-2">
                                <Shield className="text-primary fill-current opacity-20" size={18} /> Secure Data
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="text-primary fill-current opacity-20" size={18} /> Fast Response
                            </div>
                        </div>
                    </motion.div>

                    {/* Visual Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative z-10">
                            <img
                                src={networkImg}
                                alt="Connected Healthcare"
                                className="w-full h-auto max-w-lg mx-auto drop-shadow-2xl animate-float-slow"
                            />
                        </div>

                        {/* Decoration Circles */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/5 to-transparent rounded-full -z-10 blur-3xl" />

                        {/* Floating Cards */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="absolute -top-4 right-4 lg:-right-4 bg-white/90 backdrop-blur-xl p-4 pr-6 rounded-2xl shadow-xl shadow-neutral-200/50 border border-white flex items-center gap-4 animate-float"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-rose-200 rounded-xl flex items-center justify-center text-primary shadow-inner">
                                <Heart className="fill-current" size={26} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Lives Saved</div>
                                <div className="text-2xl font-black text-neutral-800">12k+</div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="absolute -bottom-8 left-4 lg:-left-8 bg-white/90 backdrop-blur-xl p-4 pr-6 rounded-2xl shadow-xl shadow-neutral-200/50 border border-white flex items-center gap-4 animate-float-delayed"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner">
                                <Activity size={26} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Active Donors</div>
                                <div className="text-2xl font-black text-neutral-800">8,540</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ==================== 
              FEATURES SECTION 
            ==================== */}
            <section id="features" className="py-32 bg-white relative">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                        <span className="text-primary font-extrabold tracking-wider uppercase text-sm bg-primary/5 px-4 py-1.5 rounded-full">Why We Exist</span>
                        <h2 className="text-4xl lg:text-5xl font-black text-neutral-900">Technology Meets Compassion.</h2>
                        <p className="text-neutral-500 text-xl">We've built a platform that removes friction from saving lives, making donation seamless and transparent.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                        {[
                            {
                                icon: Globe,
                                title: 'Real-Time Tracking',
                                desc: 'Live monitoring of blood stock levels across all district hospitals ensuring zero delays in emergencies.',
                                color: 'text-blue-600',
                                bg: 'bg-blue-50',
                                shadow: 'shadow-blue-200'
                            },
                            {
                                icon: Shield,
                                title: 'Trusted Network',
                                desc: 'Every donor and hospital is verified. We ensure complete transparency and safety in every drop.',
                                color: 'text-emerald-600',
                                bg: 'bg-emerald-50',
                                shadow: 'shadow-emerald-200'
                            },
                            {
                                icon: Users,
                                title: 'Community Power',
                                desc: 'Join thousands of local heroes. Organize camps, share requests, and build a healthier society.',
                                color: 'text-violet-600',
                                bg: 'bg-violet-50',
                                shadow: 'shadow-violet-200'
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -10 }}
                                className="group relative p-8 lg:p-10 rounded-[2.5rem] bg-white border border-neutral-100 shadow-lg shadow-neutral-100/50 hover:shadow-2xl transition-all duration-300 overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 ${feature.bg} rounded-bl-[100px] opacity-50 transition-transform group-hover:scale-110`} />

                                <div className={`relative w-16 h-16 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md`}>
                                    <feature.icon size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-neutral-900 mb-4">{feature.title}</h3>
                                <p className="text-neutral-500 leading-relaxed text-lg">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== 
              APP SHOWCASE 
            ==================== */}
            <section className="py-32 bg-neutral-900 text-white relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-neutral-800 to-transparent opacity-40" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />

                <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-20 items-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="order-2 lg:order-1 relative"
                    >
                        {/* Glowing effect behind phone */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/30 rounded-full blur-3xl animate-pulse" />
                        <img src={appImg} alt="Mobile App" className="relative z-10 w-full max-w-md mx-auto drop-shadow-2xl transform hover:scale-[1.02] transition-transform duration-500" />
                    </motion.div>

                    <div className="order-1 lg:order-2 space-y-10">
                        <div>
                            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Mobile First</span>
                            <h2 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">Your Health,<br />In Your Pocket.</h2>
                            <p className="text-neutral-400 text-xl leading-relaxed max-w-lg">
                                Experience the future of donation. Book appointments, get notified instantly, and earn rewards for your generosity.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { t: 'Instant Alerts', i: Bell },
                                { t: 'Geolocation Tracking', i: MapPin },
                                { t: 'Digital Donor Card', i: Smartphone }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                        <item.i size={24} />
                                    </div>
                                    <span className="text-xl font-bold text-white tracking-wide">{item.t}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6">
                            <Link to="/register" className="inline-flex px-10 py-5 bg-white text-neutral-900 font-black rounded-full hover:bg-neutral-100 hover:scale-105 transition-all items-center gap-3 shadow-xl">
                                <Smartphone size={24} /> Download & Register
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== 
              STATS SECTION 
            ==================== */}
            <section className="py-24 bg-gradient-to-br from-primary to-rose-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                        {[
                            { value: '50+', label: 'Hospitals', icon: <Building2 className="text-white/60" size={32} /> },
                            { value: '15k', label: 'Donors', icon: <Users className="text-white/60" size={32} /> },
                            { value: '8k', label: 'Litres', icon: <Droplet className="text-white/60" size={32} /> },
                            { value: '100%', label: 'Secure', icon: <Lock className="text-white/60" size={32} /> },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-center hover:bg-white/20 transition-colors"
                            >
                                <div className="flex justify-center mb-4">{stat.icon}</div>
                                <div className="text-4xl lg:text-5xl font-black text-white mb-2">{stat.value}</div>
                                <div className="text-white/80 font-bold uppercase tracking-widest text-xs">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};
import { Building2 } from 'lucide-react'; // Added missing import
export default HomePage;

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCcw, 
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function AdminRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    department: '',
    hubName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await apiFetch('/auth/register-admin', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Administrative registration failed. Please contact root admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex flex-col items-center justify-center p-4 md:p-8 font-medium">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-white"
      >
        {/* Left Side - Visual Content */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-[#164e33] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 opacity-10 rotate-12">
                <Building2 className="w-64 h-64" />
            </div>
            
            <div className="relative z-10">
                <Link href="/" className="flex items-center gap-3 group mb-20 inline-block">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#164e33] group-hover:scale-110 transition-transform shadow-lg">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-semibold ">Admission Master</span>
                </Link>

                <div className="space-y-8">
                    <h1 className="text-5xl font-semibold leading-tight ">Regional Hub <br/><span className="text-[#f58220]">Administrator</span></h1>
                    <p className="text-lg text-white/70 leading-relaxed max-w-sm">
                        Join our global network of administrative hubs. Manage vendors, oversee product listings, and drive regional marketplace growth.
                    </p>
                </div>
            </div>

            <div className="relative z-10 space-y-4 pt-10">
                {['Verified Regional Scoping', 'Direct Lead Control', 'Vendor Lifecycle Management'].map(item => (
                    <div key={item} className="flex items-center gap-3 text-base font-semibold opacity-80">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        {item}
                    </div>
                ))}
            </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="p-10 md:p-16 relative">
            <Link href="/login" className="absolute top-8 left-8 text-slate-500 hover:text-[#164e33] flex items-center gap-2 text-base font-semibold uppercase  transition-all">
                <ChevronLeft className="w-4 h-4" />
                Back to Portal
            </Link>

            <div className="mb-10 text-center lg:text-left mt-6">
                <h2 className="text-3xl font-semibold text-slate-900 ">Secure Onboarding</h2>
                <p className="text-base text-slate-500 mt-2 font-medium">Establish your administrative hub credentials.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700 text-base font-semibold"
                        >
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex flex-col items-center text-center gap-4 text-emerald-700"
                        >
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-base font-semibold">Account Established</h4>
                                <p className="text-base font-semibold uppercase  mt-1 opacity-70">Redirecting to login portal...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!success && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-base font-semibold text-slate-500 uppercase  ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#164e33] transition-all" />
                                <input 
                                    type="text" 
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-lg text-base font-semibold focus:bg-white focus:border-[#164e33]/20 outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-base font-semibold text-slate-500 uppercase  ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#164e33] transition-all" />
                                <input 
                                    type="email" 
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-lg text-base font-semibold focus:bg-white focus:border-[#164e33]/20 outline-none transition-all"
                                    placeholder="admin@hub.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-base font-semibold text-slate-500 uppercase  ml-1">Contact Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#164e33] transition-all" />
                                <input 
                                    type="tel" 
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-lg text-base font-semibold focus:bg-white focus:border-[#164e33]/20 outline-none transition-all"
                                    placeholder="+91 00000 00000"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-base font-semibold text-slate-500 uppercase  ml-1">Security Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#164e33] transition-all" />
                                <input 
                                    type="password" 
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-lg text-base font-semibold focus:bg-white focus:border-[#164e33]/20 outline-none transition-all"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-base font-semibold text-slate-500 uppercase  ml-1">Hub Location</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#164e33] transition-all" />
                                <input 
                                    type="text" 
                                    required
                                    value={formData.hubName}
                                    onChange={(e) => setFormData({...formData, hubName: e.target.value})}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-lg text-base font-semibold focus:bg-white focus:border-[#164e33]/20 outline-none transition-all"
                                    placeholder="e.g. Mumbai North"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-base font-semibold text-slate-500 uppercase  ml-1">Department</label>
                            <div className="relative group">
                                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#164e33] transition-all" />
                                <input 
                                    type="text" 
                                    required
                                    value={formData.department}
                                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-lg text-base font-semibold focus:bg-white focus:border-[#164e33]/20 outline-none transition-all"
                                    placeholder="e.g. Quality Assurance"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {!success && (
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-[#164e33] hover:bg-[#113f29] text-white rounded-[2rem] font-semibold flex items-center justify-center gap-3 shadow-xl shadow-[#164e33]/20 transition-all active:scale-95 disabled:opacity-50 mt-4"
                    >
                        {loading ? <RefreshCcw className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                        {loading ? 'Initializing Credentials...' : 'Complete Hub Onboarding'}
                    </button>
                )}

                <div className="text-center pt-6">
                    <p className="text-base font-semibold text-slate-500 uppercase ">
                        Already in the registry? <Link href="/login" className="text-[#164e33] hover:underline">Access Portal</Link>
                    </p>
                </div>
            </form>
        </div>
      </motion.div>
    </div>
  );
}



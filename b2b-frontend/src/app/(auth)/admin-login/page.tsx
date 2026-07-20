'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  Loader2, 
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      // Verification: Check if user has admin/subadmin role
      if (!['SUPERADMIN', 'ADMIN', 'SUBADMIN'].includes(data.data.user.role)) {
        throw new Error('Access denied. This portal is for administrative personnel only.');
      }
      
      login(data.data.token, data.data.user, false);
    } catch (err: any) {
      setError(err.message || 'Invalid administrative credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor for Admin Portal */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#164e33]" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#164e33]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
            <Link href="/" className="inline-flex mb-6 opacity-80 hover:opacity-100 transition-all">
              <img src="/logo.png" alt="India B2B" className="h-14 w-auto object-contain brightness-0 invert" />
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#164e33]/20 border border-[#164e33]/30 rounded-lg mb-4">
               <ShieldCheck className="w-4 h-4 text-[#164e33]" />
               <span className="text-base font-semibold text-[#164e33] uppercase ">Secure Admin Gateway</span>
            </div>
            <h2 className="text-2xl font-semibold text-white ">Administrative Access</h2>
            <p className="text-slate-700 text-base font-medium mt-1">Super Admin & Admin Authentication Portal</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-10 border border-white/10">
            <div className="space-y-6">
               {error && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 text-red-600 text-base font-semibold border border-red-100 rounded-lg flex items-center gap-2">
                     <AlertCircle className="w-4 h-4 shrink-0" />
                     {error}
                  </motion.div>
               )}

                <form onSubmit={handleAdminLogin} className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-base font-semibold text-slate-500 uppercase  ml-1">Admin Identity (Email)</label>
                          <div className="relative group">
                             <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#164e33] transition-colors" />
                             <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-[#164e33] focus:bg-white text-base font-medium text-slate-800 transition-all"
                                placeholder="admin@indiab2b.com"
                             />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <div className="flex justify-between items-center ml-1 mr-1">
                             <label className="text-base font-semibold text-slate-500 uppercase ">Secret Key (Password)</label>
                          </div>
                          <div className="relative group">
                             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#164e33] transition-colors" />
                             <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-11 py-4 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-[#164e33] focus:bg-white text-base font-medium text-slate-800 transition-all"
                                placeholder="••••••••"
                             />
                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-slate-800 p-1">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                             </button>
                          </div>
                       </div>

                       <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-lg font-semibold text-base hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-gray-200">
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authenticate as Administrator'}
                          {!loading && <ShieldAlert className="w-4 h-4" />}
                       </button>
                </form>
            </div>

            <div className="pt-8 text-center border-t border-gray-50 mt-6">
               <p className="text-base text-slate-500 font-semibold uppercase  leading-relaxed">
                  Unauthorized access attempts are logged and monitored for security purposes.
               </p>
            </div>
        </div>

        <div className="mt-10 flex items-center justify-center">
            <Link href="/" className="text-base font-semibold text-slate-700 hover:text-white flex items-center gap-1.5 transition-colors uppercase ">
                <ArrowLeft className="w-3 h-3" /> Return to Public Portal
            </Link>
        </div>
      </div>
    </div>
  );
}


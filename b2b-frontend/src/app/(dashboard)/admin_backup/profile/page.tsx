'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { 
  User, 
  Mail, 
  MapPin, 
  Shield, 
  Save, 
  Lock, 
  Building2, 
  Phone, 
  Sparkles,
  Camera,
  CheckCircle2,
  RefreshCcw,
  Layers,
  ChevronRight,
  UserCircle,
  Eye,
  EyeOff,
  AlertCircle,
  Key,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminProfile() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    hubName: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.admin?.department || '',
        hubName: user.admin?.hubName || '',
        password: ''
      });
      setLoading(false);
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          department: formData.department,
          hubName: formData.hubName,
          password: formData.password || undefined
        })
      });
      
      setMessage({ type: 'success', text: 'Administrative profile synchronized successfully.' });
      setFormData(prev => ({ ...prev, password: '' }));
      await refreshUser();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update credentials.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const data = new FormData();
      data.append('image', file);

      await apiFetch('/auth/upload-avatar', {
        method: 'POST',
        body: data
      });
      
      setMessage({ type: 'success', text: 'Profile identity updated successfully.' });
      await refreshUser();
    } catch (error: any) {
      console.error('Failed to upload image', error);
      setMessage({ type: 'error', text: error.message || 'Failed to synchronize profile image.' });
    } finally {
      setUploading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  if (authLoading || loading) {
     return (
        <div className="min-h-[60vh] flex items-center justify-center">
           <RefreshCcw className="w-10 h-10 text-[#164e33] animate-spin" />
        </div>
     );
  }

  return (
    <div className="space-y-8 animate-simple-fade pb-20 p-2 md:p-0 font-medium">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 max-w-7xl mx-auto">
        <div className="space-y-1">
           <div className="flex items-center gap-2 text-[#f58220] font-bold uppercase  text-sm mb-1">
              <Sparkles className="w-3 h-3" /> STAFF SETTINGS
           </div>
           <h1 className="text-2xl font-bold text-slate-900  flex items-center gap-3">
             Admin Credentials
             <div className="p-1.5 bg-[#164e33]/5 text-[#164e33] rounded-lg border border-[#164e33]/10">
                <UserCircle className="w-5 h-5" />
             </div>
           </h1>
           <p className="text-slate-900 font-bold text-sm">Manage your personal administrative identity and security settings.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Sidebar / Stats */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-lg border border-gray-100 p-10 text-center  relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-br from-[#164e33] to-[#113f29] opacity-5 group-hover:opacity-10 transition-opacity" />
               
               <div className="relative mb-8 flex justify-center">
                  <div className="relative w-32 h-32">
                    <div className="w-full h-full bg-white rounded-lg border-4 border-gray-50 flex items-center justify-center text-4xl font-bold text-[#164e33]  overflow-hidden group/img">
                       {user?.avatar ? (
                         <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                       ) : (
                         user?.name?.charAt(0) || 'A'
                       )}
                       
                       <div 
                         onClick={() => fileInputRef.current?.click()}
                         className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer text-white"
                       >
                         {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                       </div>
                    </div>
                    <div className="absolute bottom-0 right-0 p-2 bg-[#f58220] text-white rounded-lg  border-2 border-white translate-x-2 translate-y-2">
                       <Shield className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
               </div>

               <h2 className="text-2xl font-bold text-slate-900 capitalize">{user?.name}</h2>
               <p className="text-sm font-bold text-[#f58220] uppercase  mt-2">{user?.role === 'ADMIN' ? 'Strategic Administrator' : user?.role}</p>
               
               <div className="mt-10 pt-8 border-t border-gray-50 space-y-4 text-left">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 group/item hover:bg-white hover:border-[#164e33]/20 transition-all">
                     <p className="text-sm font-bold text-black uppercase  mb-1.5 flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-[#164e33]" /> Department Hub
                     </p>
                     <p className="text-sm font-bold text-slate-900">{user?.admin?.department || 'Operations'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 group/item hover:bg-white hover:border-[#164e33]/20 transition-all">
                     <p className="text-sm font-bold text-black uppercase  mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#164e33]" /> Geographic Region
                     </p>
                     <p className="text-sm font-bold text-slate-900">{user?.admin?.hubName || 'Central Registry'}</p>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-lg p-10 border border-gray-100  space-y-6">
               <div className="w-12 h-12 bg-[#164e33]/5 rounded-lg flex items-center justify-center">
                  <Key className="w-6 h-6 text-[#164e33]" />
               </div>
               <div>
                  <h3 className="text-base font-bold text-slate-900  leading-tight">Security Protocol</h3>
                  <p className="text-sm font-bold text-black mt-2 leading-relaxed">
                     Update your password regularly to maintain hub integrity. Your credentials provide access to sensitive regional business data.
                  </p>
               </div>
               <div className="space-y-3">
                  {['Encrypted Access', 'Global Visibility', 'Full Permissions'].map(p => (
                     <div key={p} className="flex items-center gap-3 text-sm font-bold text-slate-900 uppercase ">
                        <CheckCircle2 className="w-4 h-4 text-[#164e33]" />
                        {p}
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Main Form */}
         <div className="lg:col-span-8 bg-white rounded-lg border border-gray-100 p-10  relative">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
               <h3 className="text-lg font-bold text-slate-900  uppercase ">Identity Profile</h3>
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 text-sm font-bold uppercase ">
                  <Shield className="w-3.5 h-3.5" /> High Privilege Access
               </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-10">
               <AnimatePresence mode="wait">
                  {message.text && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-5 rounded-lg border flex items-center gap-4 text-sm font-bold  ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 ' : 'bg-red-50 text-red-700 border-red-100 '}`}
                    >
                      {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                      {message.text}
                    </motion.div>
                  )}
               </AnimatePresence>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  <div className="space-y-3">
                     <label className="text-sm font-bold text-black uppercase  ml-1">Full Legal Name</label>
                     <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700 group-focus-within:text-[#164e33] transition-colors" />
                        <input 
                           type="text" 
                           value={formData.name}
                           onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                           className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-transparent rounded-lg text-sm font-bold focus:bg-white focus:border-[#164e33]/20 transition-all outline-none placeholder:text-gray-500"
                           placeholder="Enter full name"
                        />
                     </div>
                  </div>
                  
                  <div className="space-y-3">
                     <label className="text-sm font-bold text-black uppercase  ml-1">Official Registry Email</label>
                     <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                        <input 
                           type="email" 
                           value={formData.email}
                           disabled
                           className="w-full pl-12 pr-5 py-4 bg-gray-50/50 border border-transparent rounded-lg text-sm font-bold text-gray-500 cursor-not-allowed outline-none"
                        />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-sm font-bold text-black uppercase  ml-1">Administrative Contact</label>
                     <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700 group-focus-within:text-[#164e33] transition-colors" />
                        <input 
                           type="tel" 
                           value={formData.phone}
                           onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                           className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-transparent rounded-lg text-sm font-bold focus:bg-white focus:border-[#164e33]/20 transition-all outline-none placeholder:text-gray-500"
                           placeholder="+91 00000 00000"
                        />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-sm font-bold text-black uppercase  ml-1">Hub Assignment</label>
                     <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700 group-focus-within:text-[#164e33] transition-colors" />
                        <input 
                           type="text" 
                           value={formData.hubName}
                           onChange={(e) => setFormData({ ...formData, hubName: e.target.value })}
                           className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-transparent rounded-lg text-sm font-bold focus:bg-white focus:border-[#164e33]/20 transition-all outline-none placeholder:text-gray-500"
                           placeholder="Assigned Hub Name"
                        />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-sm font-bold text-black uppercase  ml-1">Organizational Department</label>
                     <div className="relative group">
                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700 group-focus-within:text-[#164e33] transition-colors" />
                        <input 
                           type="text" 
                           value={formData.department}
                           onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                           className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-transparent rounded-lg text-sm font-bold focus:bg-white focus:border-[#164e33]/20 transition-all outline-none placeholder:text-gray-500"
                           placeholder="e.g. Regional Quality Control"
                        />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-sm font-bold text-black uppercase  ml-1">Access Credentials (Optional)</label>
                     <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700 group-focus-within:text-[#164e33] transition-colors" />
                        <input 
                           type={showPassword ? "text" : "password"}
                           value={formData.password}
                           onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                           className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-lg text-sm font-bold focus:bg-white focus:border-[#164e33]/20 transition-all outline-none placeholder:text-gray-500"
                           placeholder="••••••••••••"
                        />
                        <button 
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 hover:text-[#164e33]"
                        >
                           {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                     </div>
                  </div>
               </div>

               <div className="pt-10 border-t border-gray-50 flex flex-col sm:flex-row items-center gap-4">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-12 py-4.5 bg-[#164e33] hover:bg-[#113f29] text-white rounded-lg font-bold flex items-center justify-center gap-3  -[#164e33]/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                     {saving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                     {saving ? 'Synchronizing Data...' : 'Commit Administrative Changes'}
                  </button>
               </div>
            </form>
         </div>
      </div>
    </div>
  );
}



'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { 
  Building2, 
  Search, 
  ShieldCheck, 
  Clock, 
  RefreshCcw,
  CheckCircle2,
  ChevronDown,
  FileText,
  MapPin,
  CheckCheck,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Package,
  Target,
  BarChart3,
  XCircle,
  MoreVertical,
  Mail,
  Smartphone,
  ExternalLink,
  Zap,
  Globe,
  Linkedin,
  Instagram,
  Facebook,
  ChevronRight,
  AlertCircle,
  X,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminVendorApprovals() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'PENDING' | 'VERIFIED' | 'ALL'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('All Cities');
  const [cities, setCities] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState('ALL');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchVendors();
    fetchCities();
  }, [activeTab, timeRange, customRange, searchQuery, city]);

  const fetchCities = async () => {
    try {
      const data = await apiFetch('/vendors/cities');
      setCities(data.success ? data.data : []);
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('status', activeTab);
      if (searchQuery) params.append('search', searchQuery);
      if (city !== 'All Cities') params.append('city', city);
      if (timeRange !== 'ALL') params.append('timeRange', timeRange);
      if (timeRange === 'custom' && customRange.start && customRange.end) {
        params.append('startDate', customRange.start);
        params.append('endDate', customRange.end);
      }
      
      const data = await apiFetch(`/admin/vendors/pending?${params.toString()}`);
      setVendors(data.data || []);
      
      const analytics = await apiFetch('/admin/analytics');
      const s = analytics.data?.summary || {};
      setStats({
        total: s.totalVendors || 0,
        pending: s.pendingVendors || 0,
        verified: s.verifiedVendors || 0,
        rejected: s.rejectedVendors || 0
      });
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, action: 'APPROVE' | 'REJECT' | 'UNVERIFY') => {
    setProcessingId(id);
    try {
      if (action === 'APPROVE') {
        await apiFetch(`/admin/approve-vendor/${id}`, { method: 'PATCH' });
      } else if (action === 'UNVERIFY') {
        await apiFetch(`/admin/unverify-vendor/${id}`, { method: 'PATCH' });
      } else {
        await apiFetch(`/admin/reject-vendor/${id}`, { method: 'DELETE' });
      }
      fetchVendors();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update vendor status:', error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-3 pb-6 border-b border-gray-100 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
           <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Hub Partner Registry</h1>
           <p className="text-slate-500 font-medium text-[11px] uppercase tracking-wider">Manage business on-boarding for your assigned hub.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
           {/* Tab Filter */}
            <select 
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-slate-700 outline-none hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
            >
               <option value="PENDING">Pending Check</option>
               <option value="VERIFIED">Verified Hub</option>
               <option value="ALL">All Hub Members</option>
            </select>

           <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
             <Clock size={14} className="text-slate-400" />
             <select 
               value={timeRange}
               onChange={(e) => setTimeRange(e.target.value)}
               className="text-[11px] font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
             >
               <option value="ALL">Lifetime</option>
               <option value="today">Today</option>
               <option value="yesterday">Yesterday</option>
               <option value="weekly">This Week</option>
               <option value="monthly">This Month</option>
               <option value="yearly">This Year</option>
               <option value="custom">Custom</option>
             </select>
           </div>

           <select 
             value={city}
             onChange={(e) => setCity(e.target.value)}
             className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-slate-700 outline-none hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
           >
              <option value="All Cities">All Cities</option>
              {cities.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
           </select>

           <button onClick={fetchVendors} className="p-2 bg-white border border-gray-200 rounded-lg text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
              <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
        </div>

        {/* Custom Date Range Sub-row */}
        <AnimatePresence>
          {timeRange === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-3 bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
                <div className="flex items-center gap-3">
                  <Clock size={13} className="text-slate-400 shrink-0" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Custom Range:</span>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <input
                    type="date"
                    className="flex-1 md:flex-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all shadow-sm cursor-pointer"
                    onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                  <span className="text-[11px] font-bold text-slate-400">→</span>
                  <input
                    type="date"
                    className="flex-1 md:flex-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all shadow-sm cursor-pointer"
                    onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
                {customRange.start && customRange.end && (
                  <span className="md:ml-auto text-center md:text-left text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 shrink-0">Range Active</span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- SEARCH --- */}
      <div className="max-w-7xl mx-auto w-full">
         <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600" />
            <input 
              type="text" 
              placeholder="Search business by name, mobile, email or city..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-lg text-[13px] font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm placeholder:text-slate-300"
            />
         </div>
      </div>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto w-full">
         <VerificationStatCard 
           label="Total Partners" 
           value={stats.total} 
           icon={Building2}
           iconColor="text-slate-600" 
           iconBg="bg-slate-100/50" 
         />
         <VerificationStatCard 
           label="Pending Review" 
           value={stats.pending} 
           icon={Clock}
           iconColor="text-amber-600" 
           iconBg="bg-amber-100/50" 
         />
         <VerificationStatCard 
           label="Verified Partners" 
           value={stats.verified} 
           icon={CheckCheck}
           iconColor="text-emerald-600" 
           iconBg="bg-emerald-100/50" 
         />
         <VerificationStatCard 
           label="Rejected" 
           value={stats.rejected} 
           icon={XCircle}
           iconColor="text-rose-600" 
           iconBg="bg-rose-100/50" 
         />
      </div>

      {/* --- TABLE AREA --- */}
      <div className="max-w-7xl mx-auto w-full">
         <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto w-full no-scrollbar">
               <table className="w-full text-left whitespace-nowrap min-w-[900px]">
                  <thead>
                  <tr className="bg-slate-50/50 border-b border-gray-100">
                    <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Business Identity</th>
                    <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Location Hub</th>
                    <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Verification</th>
                    <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Applied On</th>
                    <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
            <tbody className="divide-y divide-gray-50">
               {loading ? (
                 [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-10 h-20 bg-gray-50/5"></td>
                   </tr>
                ))
               ) : vendors.length > 0 ? (
                 vendors.map((vendor) => (
                    <tr key={vendor.id} className="group hover:bg-slate-50/50 transition-colors">
                       <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-lg bg-slate-50 border border-gray-100 overflow-hidden flex items-center justify-center text-lg font-bold text-slate-300 shrink-0">
                                {(vendor.logoUrl || vendor.logo) ? (
                                  <img src={vendor.logoUrl || vendor.logo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (vendor.businessName || vendor.user?.name)?.charAt(0)}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-slate-900 leading-tight">{vendor.businessName || vendor.user?.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">GST: {vendor.gstNumber || 'PENDING'}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          <p className="text-[13px] font-bold text-slate-700">{vendor.city || 'India'}</p>
                       </td>
                      <td className="px-6 py-5">
                         <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                             vendor.verified ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm' : 'bg-amber-50 text-amber-600 border border-amber-100 shadow-sm'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${vendor.verified ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                            {vendor.verified ? 'Verified' : 'Review Required'}
                         </div>
                      </td>
                      <td className="px-6 py-5 text-[13px] font-bold text-slate-600">
                         {new Date(vendor.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-5 text-right">
                         <button 
                            onClick={() => { setSelectedVendor(vendor); setIsModalOpen(true); }}
                            className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-black hover:shadow-lg transition-all active:scale-95"
                         >
                            Review
                         </button>
                      </td>
                   </tr>
                 ))
               ) : (
                 <tr>
                    <td colSpan={5} className="py-32">
                       <div className="flex flex-col items-center text-center">
                          <div className="relative mb-8">
                             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                                <FileText size={40} className="text-slate-200" />
                             </div>
                             <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 ">
                                <CheckCircle2 size={24} />
                             </div>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 mb-1">Awaiting hub partner screening.</h3>
                          <p className="text-sm font-medium text-slate-600 mb-8">No pending applications found in your registry.</p>
                          <button 
                            onClick={() => setActiveTab('VERIFIED')}
                            className="px-8 py-3.5 bg-[#164e33] text-white rounded-lg font-bold text-[14px] flex items-center gap-3 hover:bg-[#113f29] transition-all"
                          >
                             View Verified Hub <ArrowRight size={18} />
                          </button>
                       </div>
                    </td>
                 </tr>
               )}
            </tbody>
            </table>
            </div>
         </div>
      </div>

      {/* --- SIDE DRAWER --- */}
      <AnimatePresence>
        {isModalOpen && selectedVendor && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] h-screen overflow-hidden"
            />
            <motion.div 
               initial={{ x: '100%' }} 
               animate={{ x: 0 }} 
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="fixed right-0 top-0 h-screen w-full max-w-2xl bg-[#F8FAFC]  z-[110] flex flex-col overflow-hidden shadow-2xl"
            >
               <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="w-5 h-5 text-[#164e33]" />
                     <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">Partner Authorization</h2>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-slate-600 hover:text-slate-900">
                     <X size={20} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  {/* Business Header Card */}
                  <div className="bg-white p-8 rounded-lg border border-gray-100 flex items-start gap-8 shadow-sm">
                     <div className="w-24 h-24 bg-slate-50 rounded-lg border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-3xl font-bold text-slate-300">
                        {(selectedVendor.logoUrl || selectedVendor.logo) ? <img src={selectedVendor.logoUrl || selectedVendor.logo} className="w-full h-full object-cover" /> : (selectedVendor.businessName || selectedVendor.user?.name)?.charAt(0)}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <h3 className="text-2xl font-bold text-slate-900 truncate">{selectedVendor.businessName || selectedVendor.user?.name}</h3>
                           {selectedVendor.verified && <CheckCircle2 size={18} className="text-emerald-500" />}
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                           <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                              <Mail size={14} /> {selectedVendor.user?.email}
                           </span>
                           <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                              <MapPin size={14} /> {selectedVendor.city || 'India'}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Left Column */}
                     <div className="space-y-6">
                        <div className="space-y-4">
                           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Contact Details</h4>
                           <div className="space-y-3">
                              <InfoRow icon={<Smartphone className="text-emerald-500" />} label="Phone" value={selectedVendor.phone || 'Not provided'} />
                              <InfoRow icon={<Clock className="text-blue-500" />} label="Working Hours" value={selectedVendor.workingHours || '9:00 AM - 6:00 PM'} />
                              <InfoRow icon={<MapPin className="text-rose-500" />} label="Location" value={selectedVendor.address || 'Location details pending'} />
                           </div>
                        </div>

                        <div className="space-y-4">
                           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Social Assets</h4>
                           <div className="grid grid-cols-2 gap-2">
                              {['LinkedIn', 'Instagram', 'Facebook', 'Globe'].map((s, i) => (
                                 <div key={i} className="p-3 bg-white border border-gray-100 rounded-lg flex items-center justify-between group cursor-pointer hover:border-emerald-200 transition-all shadow-sm">
                                    <span className="text-sm font-bold text-slate-600">{s}</span>
                                    <ExternalLink size={12} className="text-slate-300 group-hover:text-emerald-500" />
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     {/* Right Column */}
                     <div className="space-y-6">
                        <div className="space-y-4">
                           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Verifiable ID</h4>
                           <div className="space-y-3">
                              <AssetRow icon={<ShieldCheck className="text-emerald-500" />} label="GSTIN Number" value={selectedVendor.gstNumber || 'PENDING'} />
                              <AssetRow icon={<Zap className="text-amber-500" />} label="Aadhaar ID" value={selectedVendor.aadhaarNumber || 'PENDING'} />
                              <div className="p-4 bg-white border border-gray-100 rounded-lg flex items-center justify-between hover:border-blue-200 transition-all cursor-pointer shadow-sm">
                                 <div className="flex items-center gap-3">
                                    <FileText size={18} className="text-blue-500" />
                                    <span className="text-sm font-bold text-slate-700">Verification Doc</span>
                                 </div>
                                 <ExternalLink size={14} className="text-slate-300" />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Primary Categories</h4>
                           <div className="flex flex-wrap gap-2">
                              {selectedVendor.categories?.map((c: any) => (
                                 <span key={c.id} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-bold uppercase">{c.name}</span>
                              )) || <span className="text-sm font-bold text-slate-400 italic">No category linked</span>}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Business Statement</h4>
                     <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#164e33] opacity-20" />
                        <p className="text-[14px] text-slate-700 font-medium leading-relaxed italic">
                           "{selectedVendor.description || 'Individual or business statement pending submission.'}"
                        </p>
                     </div>
                  </div>

                  {/* Secure Action Hub */}
                  <div className="pt-8 border-t border-gray-100 flex items-center gap-3 shrink-0">
                     <button 
                        onClick={() => handleStatusUpdate(selectedVendor.id, 'APPROVE')}
                        disabled={processingId === selectedVendor.id}
                        className="flex-1 py-4 bg-slate-900 hover:bg-black text-white rounded-lg font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-slate-900/10"
                     >
                        <ShieldCheck size={18} className="text-emerald-400" />
                        {processingId === selectedVendor.id ? 'Processing...' : 'Authorize Partner'}
                     </button>
                     <button 
                        onClick={() => { setSelectedVendor(selectedVendor); setIsRejectConfirmOpen(true); }}
                        disabled={processingId === selectedVendor.id}
                        className="px-6 py-4 bg-white border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-lg font-bold text-[12px] uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                     >
                        <XCircle size={18} />
                     </button>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Rejection */}
      <AnimatePresence>
        {isRejectConfirmOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsRejectConfirmOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white p-8 max-w-md w-full rounded-lg border border-gray-200 shadow-2xl"
            >
               <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Rejection</h3>
               <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">Are you sure you want to decline this partnership application? This action will notify the vendor immediately.</p>
               <div className="flex gap-3">
                  <button 
                    onClick={() => { handleStatusUpdate(selectedVendor.id, 'REJECT'); setIsRejectConfirmOpen(false); }}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-600/20"
                  >
                    Yes, Reject
                  </button>
                  <button 
                    onClick={() => setIsRejectConfirmOpen(false)}
                    className="flex-1 py-3 bg-gray-50 text-slate-700 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
                  >
                    Wait
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const VerificationStatCard = ({ label, value, icon: Icon, iconColor, iconBg }: any) => (
  <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
     <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
     </div>
     <div className={`w-12 h-12 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center`}>
        <Icon size={20} />
     </div>
  </div>
);

const InfoRow = ({ icon, label, value }: any) => (
  <div className="p-4 bg-white border border-gray-100 rounded-lg flex items-center gap-4 shadow-sm">
     <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
        {icon}
     </div>
     <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1 tracking-widest">{label}</p>
        <p className="text-sm font-bold text-slate-900 truncate leading-tight">{value}</p>
     </div>
  </div>
);

const AssetRow = ({ icon, label, value }: any) => (
  <div className="p-4 bg-white border border-gray-100 rounded-lg flex items-center gap-4 shadow-sm">
     <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
        {icon}
     </div>
     <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1 tracking-widest">{label}</p>
        <p className="text-sm font-mono font-bold text-slate-900 truncate leading-none">{value}</p>
     </div>
  </div>
);

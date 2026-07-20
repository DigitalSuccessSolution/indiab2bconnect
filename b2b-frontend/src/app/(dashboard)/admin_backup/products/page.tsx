'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { 
  Briefcase, 
  Search, 
  Filter, 
  XCircle, 
  RefreshCcw, 
  ShieldCheck,
  ChevronRight,
  Zap,
  CheckCheck,
  AlertCircle,
  Package,
  Clock,
  ChevronDown,
  X,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminProducts() {
  const [offerings, setOfferings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffering, setSelectedOffering] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [timeRange, setTimeRange] = useState('ALL');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchOfferings();
  }, [searchTerm, statusFilter, typeFilter, timeRange, customRange]);

  useEffect(() => {
    const header = document.getElementById('main-dashboard-header');
    if (header) {
      if (isModalOpen) {
        header.style.opacity = '0';
        header.style.pointerEvents = 'none';
      } else {
        header.style.opacity = '1';
        header.style.pointerEvents = 'auto';
      }
    }
  }, [isModalOpen]);

  const fetchOfferings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (timeRange !== 'ALL') params.append('timeRange', timeRange);
      if (timeRange === 'custom' && customRange.start && customRange.end) {
        params.append('startDate', customRange.start);
        params.append('endDate', customRange.end);
      }
      
      const data = await apiFetch(`/admin/offerings?${params.toString()}`);
      setOfferings(data.data?.offerings || []);
    } catch (error) {
      console.error('Failed to fetch offerings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(id);
    try {
      const endpoint = status === 'APPROVED' ? 'approve' : 'reject';
      await apiFetch(`/admin/offerings/${id}/${endpoint}`, {
        method: 'PATCH',
        body: JSON.stringify({})
      });
      setOfferings(offerings.map(o => o.id === id ? { ...o, status } : o));
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-simple-fade pb-20 p-2 md:p-0">
      {/* Header & Filter Row */}
      <div className="flex flex-col gap-3 pb-6 border-b border-gray-100 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
           <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Hub Catalogue Review</h1>
           <p className="text-slate-500 font-medium text-[11px] uppercase tracking-wider">Moderate product listings for your hub</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
           {/* Date Range Selector */}
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
               <option value="weekly">7 Days</option>
               <option value="monthly">30 Days</option>
               <option value="custom">Custom</option>
             </select>
           </div>

           {/* Status & Type Filters */}
           <div className="flex items-center gap-2">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-slate-700 outline-none hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Live</option>
                <option value="REJECTED">Hidden</option>
              </select>

              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-slate-700 outline-none hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="PRODUCT">Products</option>
                <option value="SERVICE">Services</option>
              </select>

              <button onClick={fetchOfferings} className="p-2 bg-white border border-gray-200 rounded-lg text-slate-400 hover:text-emerald-600 transition-all shadow-sm">
                <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
           </div>
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

      {/* Dedicated Search Row */}
      <div className="max-w-7xl mx-auto">
         <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600" />
            <input 
              type="text" 
              placeholder="Search by product name, vendor, category or city..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-lg text-[13px] font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm placeholder:text-slate-300"
            />
         </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
         {[
           { label: 'Total Listings', value: offerings.length, icon: Package, color: 'text-slate-600', bg: 'bg-slate-100/50' },
           { label: 'Pending Review', value: offerings.filter(o => o.status === 'PENDING').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100/50' },
           { label: 'Live Products', value: offerings.filter(o => o.status === 'APPROVED').length, icon: CheckCheck, color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
           { label: 'Hidden/Rejected', value: offerings.filter(o => o.status === 'REJECTED').length, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100/50' },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div>
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                 <h4 className="text-2xl font-bold text-slate-900">{stat.value}</h4>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                 <stat.icon size={20} />
              </div>
           </div>
         ))}
      </div>

      <div className="max-w-7xl mx-auto">
         <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto w-full no-scrollbar">
               <table className="w-full text-left whitespace-nowrap min-w-[900px]">
                  <thead>
                  <tr className="bg-slate-50/50 border-b border-gray-100">
                      <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product Info</th>
                      <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vendor Node</th>
                      <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Financials</th>
                      <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Status</th>
                      <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                   </tr>
                </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-10 h-20 bg-gray-50/5"></td>
                   </tr>
                ))
              ) : offerings.length > 0 ? (
                offerings.map((offer) => (
                  <tr key={offer.id} className="group hover:bg-slate-50/50 transition-colors">
                    {/* Product Info */}
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-lg bg-slate-50 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                             {(offer.images?.[0] || offer.imageUrl) ? (
                               <img src={offer.images?.[0] || offer.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                             ) : <Package className="text-slate-200" size={20} />}
                          </div>
                          <div className="max-w-[240px]">
                             <p className="text-sm font-bold text-slate-900 truncate leading-tight">{offer.name}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{offer.category || 'General'}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{offer.type || 'Product'}</span>
                             </div>
                          </div>
                       </div>
                    </td>

                    {/* Vendor Info */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#164e33]/5 border border-[#164e33]/10 overflow-hidden flex items-center justify-center text-[#164e33] text-xs font-bold shrink-0">
                           {(offer.vendor?.logo || offer.vendor?.logoUrl) ? (
                             <img src={offer.vendor?.logo || offer.vendor?.logoUrl} className="w-full h-full object-cover" />
                           ) : offer.vendor?.businessName?.charAt(0)}
                        </div>
                        <div>
                           <p className="text-[13px] font-bold text-slate-800 leading-none">{offer.vendor?.businessName}</p>
                           <p className="text-[10px] font-bold text-[#164e33]/60 mt-1 uppercase tracking-tighter">
                              {offer.vendor?.city || 'Verified'} Node
                           </p>
                        </div>
                      </div>
                    </td>

                    {/* Financials */}
                    <td className="px-6 py-5">
                       <div>
                          <p className="text-sm font-bold text-slate-900">₹{offer.price?.toLocaleString() || 'N/A'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-tight">MOQ: {offer.moq || 1} Units</p>
                       </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                        offer.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100 shadow-sm' :
                        offer.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm' :
                        'bg-rose-50 text-rose-600 border border-rose-100 shadow-sm'
                      }`}>
                         <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                             offer.status === 'PENDING' ? 'bg-amber-500' : 
                             offer.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}></span>
                        {offer.status === 'PENDING' ? 'Awaiting Review' : offer.status === 'APPROVED' ? 'Publicly Live' : 'Hidden'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 text-right">
                       <button 
                         onClick={() => { setSelectedOffering(offer); setIsModalOpen(true); }}
                         className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-black hover:shadow-lg transition-all active:scale-95"
                       >
                         Review
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                       <CheckCheck className="w-10 h-10 text-emerald-500/30" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">Workspace Clear</p>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase">No pending reviews at this time.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <AnimatePresence>
        {isModalOpen && selectedOffering && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100]"
            />
            <motion.div 
               initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="fixed right-0 top-0 h-screen w-full max-w-xl bg-[#F8FAFC]  z-[110] flex flex-col overflow-hidden shadow-2xl"
            >
               {/* Sidebar Header */}
               <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shadow-sm border border-emerald-100">
                       <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                       <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-tight">Review Listing</h2>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Verification Hub node</p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100">
                     <X className="w-5 h-5" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-6 no-scrollbar bg-white/50">
                  {/* Visual Inspection Section */}
                  <div className="space-y-3">
                     <div className="flex items-center justify-between px-1">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Visual Assets</h4>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">HD VIEW</span>
                     </div>
                     <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 snap-x">
                        {selectedOffering.images && selectedOffering.images.length > 0 ? (
                           selectedOffering.images.map((img: string, idx: number) => (
                              <div key={idx} className="aspect-[3/2] w-[320px] shrink-0 bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm snap-center group/img">
                                 <img src={img} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700" alt={`${selectedOffering.name} ${idx + 1}`} />
                              </div>
                           ))
                        ) : selectedOffering.imageUrl ? (
                           <div className="aspect-[3/2] w-full bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm group/img">
                              <img src={selectedOffering.imageUrl} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700" alt={selectedOffering.name} />
                           </div>
                        ) : (
                           <div className="aspect-video w-full bg-white rounded-lg border border-gray-100 flex flex-col items-center justify-center gap-2 shadow-sm">
                              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                 <Package className="w-6 h-6 text-slate-200" />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Visuals</span>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Core Specifications */}
                  <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-5 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-6">
                        <Zap size={32} className="text-slate-50 opacity-10" />
                     </div>
                     
                     <div className="space-y-1.5">
                        <span className="px-2 py-0.5 bg-slate-900 text-white rounded-md text-[8px] font-bold uppercase tracking-widest">{selectedOffering.type || 'PRODUCT'}</span>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight">{selectedOffering.name}</h3>
                     </div>

                     <div className="grid grid-cols-2 gap-6 border-t border-gray-50 pt-5">
                        <div>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Price Point</p>
                           <p className="text-lg font-bold text-slate-900">₹{selectedOffering.price?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Min. Order</p>
                           <p className="text-lg font-bold text-slate-900">{selectedOffering.moq || 1} <span className="text-[10px] text-slate-400 ml-0.5">Units</span></p>
                        </div>
                     </div>

                     <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-center">Summary</p>
                        <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                           {selectedOffering.description || 'No description provided.'}
                        </p>
                     </div>
                  </div>

                  {/* Technical Ledger */}
                  {selectedOffering.specifications && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                           <Layers size={12} className="text-slate-400" />
                           <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Technical Ledger</h4>
                        </div>
                        <div className="p-6 bg-slate-900 rounded-lg shadow-lg relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl -mr-8 -mt-8" />
                           <pre className="text-[12px] text-emerald-50/80 whitespace-pre-wrap font-mono leading-relaxed relative z-10">
                              {selectedOffering.specifications}
                           </pre>
                        </div>
                    </div>
                  )}

                  {/* Business Metadata */}
                  <div className="space-y-3">
                     <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Vendor Context</h4>
                     <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-center gap-4 group transition-all">
                        <div className="w-12 h-12 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center text-slate-400 text-lg font-bold overflow-hidden shrink-0 group-hover:shadow-sm transition-all">
                           {(selectedOffering.vendor?.logo || selectedOffering.vendor?.logoUrl) ? (
                             <img src={selectedOffering.vendor?.logo || selectedOffering.vendor?.logoUrl} className="w-full h-full object-cover" />
                           ) : selectedOffering.vendor?.businessName?.charAt(0)}
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center gap-1.5">
                              <p className="text-[13px] font-bold text-slate-900">{selectedOffering.vendor?.businessName}</p>
                              <ShieldCheck size={12} className="text-emerald-500" />
                           </div>
                           <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">
                              {selectedOffering.vendor?.city || 'Verified'} Node
                           </p>
                        </div>
                        <ChevronRight size={16} className="text-slate-200" />
                     </div>
                  </div>
               </div>

               {/* Secure Action Hub */}
               <div className="p-6 border-t border-gray-100 bg-white flex items-center gap-3 shrink-0">
                  <button 
                     onClick={() => handleStatusUpdate(selectedOffering.id, 'APPROVED')}
                     disabled={!!processingId}
                     className="flex-1 py-3.5 bg-slate-900 hover:bg-black text-white rounded-lg font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-slate-900/10"
                  >
                     <CheckCheck className="w-4 h-4 text-emerald-400" />
                     {processingId === selectedOffering.id ? 'Wait...' : 'Authorize'}
                  </button>
                  <button 
                     onClick={() => handleStatusUpdate(selectedOffering.id, 'REJECTED')}
                     disabled={!!processingId}
                     className="px-5 py-3.5 bg-white border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-lg font-bold text-[12px] uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                  >
                     <XCircle className="w-4 h-4" />
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

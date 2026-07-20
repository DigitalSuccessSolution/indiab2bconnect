'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { 
  Target as TargetIcon, 
  Search, 
  Filter, 
  ChevronRight, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Activity,
  Zap,
  ArrowRight,
  MessageSquare,
  RefreshCcw,
  UserCheck,
  ShieldCheck,
  Package,
  Layers,
  Briefcase,
  X,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LeadStatCard = ({ label, value, sub, icon: Icon, iconColor, iconBg }: any) => (
  <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
     <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
        <p className="text-[10px] font-medium text-slate-400 mt-0.5">{sub}</p>
     </div>
     <div className={`w-12 h-12 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center`}>
        <Icon size={20} />
     </div>
  </div>
);

export default function AdminLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [timeRange, setTimeRange] = useState('ALL');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [assigning, setAssigning] = useState<string | null>(null);
  const [categoryVendors, setCategoryVendors] = useState<any[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [timeRange, customRange]);

  useEffect(() => {
    const header = document.getElementById('main-dashboard-header');
    if (header) {
      if (isDetailOpen) {
        header.style.opacity = '0';
        header.style.pointerEvents = 'none';
      } else {
        header.style.opacity = '1';
        header.style.pointerEvents = 'auto';
      }
    }
  }, [isDetailOpen]);

  useEffect(() => {
    if (selectedLead?.categoryId) {
      fetchVendorsByCategory(selectedLead.categoryId);
    }
  }, [selectedLead]);

  const fetchVendorsByCategory = async (catId: string) => {
    try {
      setVendorsLoading(true);
      const [verifiedData, allCatData, cityData] = await Promise.all([
        apiFetch(`/vendors?categoryId=${catId}&limit=50&verified=true`),
        apiFetch(`/vendors?categoryId=${catId}&limit=50`),
        selectedLead?.city ? apiFetch(`/vendors?city=${encodeURIComponent(selectedLead.city)}&limit=50&verified=true`) : Promise.resolve({ data: { vendors: [] } })
      ]);

      const combinedMap = new Map();
      (verifiedData.data?.vendors || []).forEach((v: any) => combinedMap.set(v.id, v));
      (allCatData.data?.vendors || []).forEach((v: any) => { if (!combinedMap.has(v.id)) combinedMap.set(v.id, v); });
      (cityData.data?.vendors || []).forEach((v: any) => { if (!combinedMap.has(v.id)) combinedMap.set(v.id, v); });

      const finalVendors = Array.from(combinedMap.values());
      if (finalVendors.length === 0) {
        const fallbackData = await apiFetch(`/vendors?limit=20&verified=true`);
        setCategoryVendors(fallbackData.data?.vendors || []);
      } else {
        setCategoryVendors(finalVendors);
      }
    } catch (error) {
      console.error('Failed to fetch vendors for category:', error);
    } finally {
      setVendorsLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (timeRange !== 'ALL') params.append('timeRange', timeRange);
      if (timeRange === 'custom' && customRange.start && customRange.end) {
        params.append('startDate', customRange.start);
        params.append('endDate', customRange.end);
      }
      const data = await apiFetch('/admin/leads?' + params.toString());
      const fetchedLeads = data.data?.leads || [];
      setLeads(fetchedLeads);
      if (selectedLead) {
        const updated = fetchedLeads.find((l: any) => l.id === selectedLead.id);
        if (updated) setSelectedLead(updated);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (leadId: string, vendorId: string) => {
    setAssigning(leadId);
    try {
      await apiFetch(`/admin/leads/${leadId}/reassign`, {
        method: 'PATCH',
        body: JSON.stringify({ vendorId })
      });
      await fetchLeads();
    } catch (error) {
      console.error('Failed to assign lead:', error);
    } finally {
      setAssigning(null);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch = 
      lead.buyerName?.toLowerCase().includes(searchLow) || 
      lead.phone?.toLowerCase().includes(searchLow) ||
      lead.buyerEmail?.toLowerCase().includes(searchLow) ||
      lead.category?.name?.toLowerCase().includes(searchLow) ||
      lead.city?.toLowerCase().includes(searchLow);
    
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || lead.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-simple-fade pb-20 px-4 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-3 pb-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Hub Demand Streams</h1>
           <p className="text-slate-600 font-medium mt-1 text-sm">Review incoming buyer requirements and distribute to matching hub partners.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           <div className="relative w-full md:w-80 lg:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search leads, category or city..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all shadow-sm"
              />
           </div>

           {/* Filters Group */}
           <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <div className="flex-1 min-w-[140px] lg:flex-none flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
                <Clock size={14} className="text-slate-400 shrink-0" />
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full text-xs font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
                >
                  <option value="ALL">Lifetime</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="weekly">Last 7 Days</option>
                  <option value="monthly">Last 30 Days</option>
                  <option value="yearly">Last 12 Months</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
 
              <div className="flex-1 min-w-[120px] lg:flex-none relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-8 pr-6 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-slate-800 outline-none appearance-none cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
                >
                  <option value="ALL">Status</option>
                  <option value="PENDING">Pending (New)</option>
                  <option value="DISTRIBUTED">Distributed</option>
                  <option value="CLOSED">Closed/Converted</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
 
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex-1 min-w-[100px] lg:flex-none px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-slate-800 outline-none appearance-none cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
              >
                <option value="ALL">Type</option>
                <option value="DIRECT">Direct</option>
                <option value="MARKETPLACE">Marketplace</option>
              </select>
 
              <button onClick={fetchLeads} className="p-2.5 bg-white border border-gray-200 rounded-lg text-slate-400 hover:text-emerald-600 transition-all shadow-sm shrink-0">
                <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
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
                    className="flex-1 min-w-[130px] md:flex-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all shadow-sm cursor-pointer"
                    onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                  <span className="text-[11px] font-bold text-slate-400">→</span>
                  <input
                    type="date"
                    className="flex-1 min-w-[130px] md:flex-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all shadow-sm cursor-pointer"
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

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LeadStatCard 
          label="Total Streams" 
          value={leads.length} 
          sub="All market inquiries"
          icon={Activity} 
          iconBg="bg-slate-50" 
          iconColor="text-slate-600" 
        />
        <LeadStatCard 
          label="Open Market" 
          value={leads.filter(l => l.status === 'PENDING').length} 
          sub="Waiting for review"
          icon={Zap} 
          iconBg="bg-amber-50" 
          iconColor="text-amber-600" 
        />
        <LeadStatCard 
          label="Successfully Assigned" 
          value={leads.filter(l => l.status === 'DISTRIBUTED').length} 
          sub="Routed to partners"
          icon={UserCheck} 
          iconBg="bg-emerald-50" 
          iconColor="text-emerald-600" 
        />
        <LeadStatCard 
          label="Today's Velocity" 
          value={leads.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length} 
          sub="New demand today"
          icon={TargetIcon} 
          iconBg="bg-blue-50" 
          iconColor="text-blue-600" 
        />
      </div>

      <div>
        <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Buyer Details</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inquiry Type</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Matched Vendor</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [1,2,3,4,5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-8"><div className="h-10 bg-gray-50 rounded-lg"></div></td>
                    </tr>
                  ))
                ) : filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                  <tr key={lead.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                        <div className="flex flex-col">
                           <span className="text-[15px] font-bold text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
                             {lead.searchKeyword ? `Looking for "${lead.searchKeyword}"` : `Inquiry from ${lead.buyerName}`}
                           </span>
                           <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                                 {lead.phone || 'N/A'}
                              </span>
                           </div>
                           <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                             Posted {new Date(lead.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                           </span>
                        </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">
                         {lead.category?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                        <div className="text-sm font-bold text-slate-700 uppercase tracking-tight">
                           {lead.city || 'Global Reach'}
                        </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                         lead.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                         lead.status === 'DISTRIBUTED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                         'bg-emerald-50 text-emerald-600 border-emerald-100'
                       }`}>
                          <div className={`w-1 h-1 rounded-full ${
                             lead.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : 
                             lead.status === 'DISTRIBUTED' ? 'bg-blue-500' : 'bg-emerald-500'
                          }`}></div>
                          {lead.status === 'PENDING' ? 'Open Market' : lead.status === 'DISTRIBUTED' ? 'Assigned' : 'Closed'}
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       {lead.vendor ? (
                         <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-gray-100 overflow-hidden flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">
                               {(lead.vendor.logo || lead.vendor.logoUrl) ? (
                                 <img src={lead.vendor.logo || lead.vendor.logoUrl} className="w-full h-full object-cover" />
                               ) : lead.vendor.businessName?.charAt(0)}
                            </div>
                            <div>
                               <p className="text-[14px] font-bold text-slate-900 leading-none capitalize truncate max-w-[150px]">{lead.vendor.businessName}</p>
                               <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Verified Partner</p>
                            </div>
                         </div>
                       ) : (
                         <span className="text-[11px] font-bold text-slate-400 uppercase">Unassigned</span>
                       )}
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button 
                         onClick={() => { setSelectedLead(lead); setIsDetailOpen(true); }}
                         className="px-5 py-2 bg-slate-900 text-white rounded-lg text-[12px] font-bold uppercase tracking-tight hover:bg-black transition-all"
                       >
                          Review
                       </button>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                       <Activity className="w-20 h-20 text-gray-100 mx-auto mb-6" />
                       <h3 className="text-lg font-semibold text-slate-700">No Demand Stream Found</h3>
                       <p className="text-sm font-medium text-gray-500 max-w-xs mx-auto mt-2">There are no active market inquiries matching your search criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDetailOpen && selectedLead && (
          <>
             <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setIsDetailOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
             />
             <motion.div 
                initial={{ x: '100%' }} 
                animate={{ x: 0 }} 
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-screen w-full max-w-xl bg-white z-[110] flex flex-col overflow-hidden shadow-2xl"
             >
               <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shadow-sm border border-emerald-100">
                        <TargetIcon className="w-5 h-5" />
                     </div>
                     <div>
                        <h2 className="text-[15px] font-bold text-slate-900 uppercase tracking-tight">Inquiry Intelligence</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Hub Demand Analysis</p>
                     </div>
                  </div>
                  <button onClick={() => setIsDetailOpen(false)} className="p-2.5 hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100">
                     <X className="w-5 h-5" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                   <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-start gap-5">
                      <div className="w-14 h-14 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                         <MessageSquare className="w-7 h-7" />
                      </div>
                      <div>
                         <h3 className="text-base font-bold text-slate-900 leading-tight">
                            {selectedLead.searchKeyword ? `Requirement: ${selectedLead.searchKeyword}` : `Inquiry from ${selectedLead.buyerName}`}
                         </h3>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Reference: {selectedLead.id.split('-')[0].toUpperCase()}</p>
                      </div>
                   </div>

                  <div className="space-y-3">
                     <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Transmission Message</h4>
                     <div className="p-5 bg-white border border-gray-100 rounded-lg text-sm text-slate-700 font-medium leading-relaxed italic border-l-4 border-amber-400 shadow-sm">
                        "{selectedLead.message}"
                     </div>
                  </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                         <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Buyer Credentials</h4>
                          <div className="space-y-2">
                             <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                                <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span className="text-sm font-bold text-slate-900">{selectedLead.buyerName || 'Verification Needed'}</span>
                             </div>
                             <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                                <span className="text-sm font-bold text-slate-900">{selectedLead.phone || 'N/A'}</span>
                             </div>
                          </div>
                      </div>

                      <div className="space-y-3">
                         <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Target Market</h4>
                         <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-lg flex flex-col items-center justify-center text-center gap-3">
                            <Layers className="w-8 h-8 text-emerald-600" />
                            <span className="text-sm font-bold text-emerald-700 uppercase">{selectedLead.category?.name || 'General Hub'}</span>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between px-1">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hub Distribution Center</h4>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">{categoryVendors.length} Partners</span>
                      </div>
                      
                       <div className="space-y-3">
                          {vendorsLoading ? (
                             [1,2,3].map(i => (
                               <div key={i} className="h-20 bg-slate-50 border border-gray-100 rounded-lg animate-pulse" />
                             ))
                          ) : categoryVendors.length > 0 ? (
                            categoryVendors.map(vendor => (
                               <div key={vendor.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:border-emerald-200 hover:shadow-sm transition-all group">
                                   <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center text-slate-400 text-sm font-bold shrink-0 overflow-hidden">
                                          {(vendor.logo || vendor.logoUrl) ? <img src={vendor.logo || vendor.logoUrl} className="w-full h-full object-cover" /> : vendor.businessName?.charAt(0)}
                                       </div>
                                       <div>
                                           <div className="flex items-center gap-2">
                                             <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{vendor.businessName}</span>
                                             {vendor.verified && (
                                               <ShieldCheck size={12} className="text-emerald-500" />
                                             )}
                                           </div>
                                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{vendor.city} Hub</span>
                                       </div>
                                   </div>
                                 <button 
                                   onClick={() => handleAssign(selectedLead.id, vendor.id)}
                                   disabled={assigning === selectedLead.id || selectedLead.vendor?.id === vendor.id}
                                   className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase transition-all ${selectedLead.vendor?.id === vendor.id ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-900 hover:bg-black text-white'}`}
                                 >
                                   {assigning === selectedLead.id ? <RefreshCcw className="w-4 h-4 animate-spin" /> : selectedLead.vendor?.id === vendor.id ? 'Current' : 'Assign'}
                                 </button>
                               </div>
                             ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-8 text-center bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-100">
                                <Activity className="w-12 h-12 text-gray-200 mb-4" />
                                <h5 className="text-sm font-bold text-slate-700 uppercase">No matching partners</h5>
                                <p className="text-xs font-medium text-slate-500 mt-2 max-w-[200px]">No verified vendors found in this category for your hub.</p>
                            </div>
                          )}
                      </div>
                   </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

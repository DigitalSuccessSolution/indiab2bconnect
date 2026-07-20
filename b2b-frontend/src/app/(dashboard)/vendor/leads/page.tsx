'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { io } from 'socket.io-client';
import {
   Users,
   MapPin,
   Calendar,
   CheckCircle,
   RefreshCcw,
   Phone,
   MessageSquare,
   MoreVertical,
   ChevronRight,
   Clock,
   LayoutDashboard,
   Layers,
   Search,
   Filter,
   ArrowUpRight,
   ShieldCheck,
   Building2,
   BadgeCheck,
   Star,
   Activity,
   History,
   ChevronLeft,
   ChevronDown,
   Download,
   CheckCircle2,
   X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VendorLeads() {
   const [leads, setLeads] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [filter, setFilter] = useState('ALL');
   const [searchTerm, setSearchTerm] = useState('');
   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
   const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [totalLeads, setTotalLeads] = useState(0);
   const [stats, setStats] = useState({ totalInquiries: 0, activeDeals: 0, wonDeals: 0 });
   const [notesInput, setNotesInput] = useState<Record<string, string>>({});
   const [addingNoteId, setAddingNoteId] = useState<string | null>(null);
   const [selectedLead, setSelectedLead] = useState<any>(null);
   const { user } = useAuth();
   const itemsPerPage = 10;

   // Initialize state from URL
   useEffect(() => {
      if (typeof window !== 'undefined') {
         const params = new URLSearchParams(window.location.search);
         if (params.get('filter')) setFilter(params.get('filter') as string);
         if (params.get('search')) {
            setSearchTerm(params.get('search') as string);
            setDebouncedSearchTerm(params.get('search') as string);
         }
         if (params.get('sort')) setSortBy(params.get('sort') as string);
         if (params.get('page')) setCurrentPage(parseInt(params.get('page') as string) || 1);
      }
   }, []);

   // Sync state to URL
   useEffect(() => {
      if (typeof window !== 'undefined') {
         const params = new URLSearchParams(window.location.search);
         let changed = false;

         if (currentPage > 1) { params.set('page', currentPage.toString()); changed = true; }
         else if (params.has('page')) { params.delete('page'); changed = true; }

         if (filter !== 'ALL') { params.set('filter', filter); changed = true; }
         else if (params.has('filter')) { params.delete('filter'); changed = true; }

         if (debouncedSearchTerm) { params.set('search', debouncedSearchTerm); changed = true; }
         else if (params.has('search')) { params.delete('search'); changed = true; }

         if (sortBy !== 'newest') { params.set('sort', sortBy); changed = true; }
         else if (params.has('sort')) { params.delete('sort'); changed = true; }

         if (changed) {
            const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
            window.history.replaceState(null, '', newUrl);
         }
      }
   }, [currentPage, filter, debouncedSearchTerm, sortBy]);

   // Debounce search term
   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedSearchTerm(searchTerm);
      }, 500);
      return () => clearTimeout(timer);
   }, [searchTerm]);

   // Reset pagination when filters change
   useEffect(() => {
      setCurrentPage(1);
   }, [filter, debouncedSearchTerm, sortBy]);

   const fetchLeads = React.useCallback(async (silent = false) => {
      if (!silent) setLoading(true);
      try {
         const data = await apiFetch(`/leads/my-leads?page=${currentPage}&limit=${itemsPerPage}&search=${debouncedSearchTerm}&status=${filter}&sort=${sortBy}&_t=${new Date().getTime()}`);
         setLeads(data.data?.leads || []);
         setTotalPages(data.data?.meta?.totalPages || 1);
         setTotalLeads(data.data?.meta?.total || 0);
         setStats(data.data?.stats || { totalInquiries: 0, activeDeals: 0, wonDeals: 0 });
      } catch (error) {
         console.error('Failed to fetch leads:', error);
      } finally {
         setLoading(false);
      }
   }, [currentPage, itemsPerPage, debouncedSearchTerm, filter, sortBy]);

   // Fetch leads initially and when dependencies change
   useEffect(() => {
      fetchLeads();
      
      const handleVisibilityChange = () => {
         if (document.visibilityState === 'visible') {
            fetchLeads();
         }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
         document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
   }, [fetchLeads]);

   // Listen for global new_lead events dispatched by the Layout component
   useEffect(() => {
      const handleNewLead = (event: any) => {
         const newLead = event.detail;
         // Inject the new lead directly into React state
         setLeads((prevLeads: any) => {
            if (prevLeads.some((l: any) => l.id === newLead.id)) return prevLeads;
            return [newLead, ...prevLeads];
         });
      };

      window.addEventListener('new_lead', handleNewLead);
      return () => window.removeEventListener('new_lead', handleNewLead);
   }, []);

   const handleUpdateStatus = async (leadId: string, status: 'CLOSED' | 'REDISTRIBUTE') => {
      const originalLeads = [...leads];
      // Optimistic update
      if (status === 'REDISTRIBUTE') {
         setLeads(leads.filter((l: any) => l.id !== leadId));
      } else if (status === 'CLOSED') {
         setLeads(leads.map((l: any) => l.id === leadId ? { ...l, status: 'CLOSED' } : l));
      }
      
      try {
         await apiFetch(`/leads/${leadId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
         });
         fetchLeads(true); // Fetch fresh data silently to get correct stats and pagination without flashing skeletons
      } catch (error) {
         console.error('Status update failed:', error);
         setLeads(originalLeads);
      }
   };

   const handleExportCSV = () => {
      if (!leads || leads.length === 0) {
         alert("No leads to export on this page.");
         return;
      }
      
      const headers = ['Lead ID', 'Date', 'Buyer Name', 'Phone', 'City', 'Category', 'Message', 'Status'];
      const csvRows = [headers.join(',')];
      
      leads.forEach((lead: any) => {
         const row = [
            lead.id,
            new Date(lead.createdAt).toLocaleDateString(),
            `"${lead.buyerName || ''}"`,
            lead.phone || 'N/A',
            `"${lead.city || ''}"`,
            `"${lead.category?.name || 'General'}"`,
            `"${(lead.message || '').replace(/"/g, '""')}"`,
            lead.status
         ];
         csvRows.push(row.join(','));
      });
      
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Leads_Export_${new Date().toLocaleDateString().split('/').join('-')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   const handleAddNote = async (leadId: string) => {
      const note = notesInput[leadId];
      if (!note || !note.trim()) return;
      
      setAddingNoteId(leadId);
      try {
         await apiFetch(`/leads/${leadId}/notes`, {
            method: 'POST',
            body: JSON.stringify({ note }),
         });
         const newLifecycle = { id: Date.now().toString(), action: 'VENDOR_NOTE', details: note, createdAt: new Date() };
         
         setLeads(leads.map((l: any) => {
            if (l.id === leadId) {
               return {
                  ...l,
                  lifecycle: [ ...(l.lifecycle || []), newLifecycle ]
               };
            }
            return l;
         }));
         
         if (selectedLead && selectedLead.id === leadId) {
            setSelectedLead((prev: any) => ({
               ...prev,
               lifecycle: [ ...(prev.lifecycle || []), newLifecycle ]
            }));
         }
         
         setNotesInput(prev => ({ ...prev, [leadId]: '' }));
      } catch (error) {
         console.error('Failed to add note', error);
      } finally {
         setAddingNoteId(null);
      }
   };



   return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in pb-10">

         {/* Header Row */}
         <div className="pb-2 sm:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
               <h1 className="text-lg sm:text-xl font-semibold text-slate-900 flex items-center gap-2 sm:gap-3 flex-wrap">
                  My Leads
                  <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-emerald-50 text-emerald-600 text-[9px] sm:text-[10px] font-bold rounded-full border border-emerald-100 uppercase tracking-wider">
                     <Activity size={11} /> Receiving Leads
                  </span>
               </h1>
               <p className="text-xs sm:text-sm text-slate-500 mt-1">Review and respond to inquiries from potential buyers.</p>
            </div>
            <button onClick={handleExportCSV} className="h-9 sm:h-10 px-4 sm:px-5 bg-white border border-gray-200 text-slate-700 rounded-lg font-medium text-xs flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm w-fit">
               <Download size={14} /> Export Leads
            </button>
         </div>
 
         {/* Analytics Overview */}
         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <VendorLeadStatCard 
               label="Total Inquiries" 
               value={stats.totalInquiries || 0} 
               sub="Lifetime requirements"
               icon={MessageSquare} 
               iconBg="bg-slate-50" 
               iconColor="text-slate-600" 
            />
            <VendorLeadStatCard 
               label="Active Deals" 
               value={stats.activeDeals || 0} 
               sub="In review phase"
               icon={Clock} 
               iconBg="bg-amber-50" 
               iconColor="text-amber-600" 
            />
            <VendorLeadStatCard 
               label="Won Leads" 
               value={stats.wonDeals || 0} 
               sub="Successfully closed"
               icon={CheckCircle2} 
               iconBg="bg-emerald-50" 
               iconColor="text-emerald-600" 
            />
            <VendorLeadStatCard 
               label="Expired Leads" 
               value={(stats as any).expiredDeals || 0} 
               sub="Missed or timed out"
               icon={X} 
               iconBg="bg-red-50" 
               iconColor="text-red-600" 
            />
         </div>

         {/* Filter Tabs & Sort Row */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-2 sm:pt-4">
            <div className="flex items-center gap-1 sm:gap-1.5 bg-white p-1 sm:p-1.5 rounded-lg border border-gray-100 w-fit max-w-full overflow-x-auto leads-table-scroll">
               {[
                  { id: 'ALL', label: 'All' },
                  { id: 'DISTRIBUTED', label: 'Active' },
                  { id: 'CLOSED', label: 'Won' },
                  { id: 'EXPIRED', label: 'Expired' }
               ].map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => setFilter(tab.id)}
                     className={`shrink-0 px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap text-center ${filter === tab.id ? 'bg-[#062d1d] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50'}`}
                  >
                     {tab.label}
                  </button>
               ))}
            </div>

             <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative flex-1 sm:flex-none">
                   <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                      type="text" 
                      placeholder="Search leads..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-white border border-gray-200 text-slate-700 rounded-lg text-xs font-medium focus:outline-none transition-all w-full sm:w-48"
                   />
                </div>
                <div className="relative shrink-0">
                   <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 appearance-none bg-white border border-gray-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-all cursor-pointer pr-7 sm:pr-8 focus:outline-none"
                   >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                   </select>
                   <ChevronDown size={14} className="text-slate-400 absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
             </div>
         </div>

         {/* Leads List */}
         <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-4 sm:mt-6">
            <div className="overflow-x-auto leads-table-scroll">
               <table className="w-full text-left whitespace-nowrap min-w-[640px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                     <tr>
                        <th className="px-3 sm:px-6 py-3 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Buyer Info</th>
                        <th className="px-3 sm:px-6 py-3 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[180px]">Requirement</th>
                        <th className="px-3 sm:px-6 py-3 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Location</th>
                        <th className="px-3 sm:px-6 py-3 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="px-3 sm:px-6 py-3 text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                     {loading ? (
                        [...Array(5)].map((_, idx) => (
                           <tr key={idx} className="animate-pulse">
                              <td className="px-3 sm:px-6 py-3 sm:py-4">
                                 <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                 <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4">
                                 <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                 <div className="h-3 bg-gray-100 rounded w-full"></div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4">
                                 <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4">
                                 <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                                 <div className="flex justify-end gap-2">
                                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                                 </div>
                              </td>
                           </tr>
                        ))
                     ) : leads.length > 0 ? (
                        leads.map((lead: any) => {
                           const isWon = lead.status === 'CLOSED';
                           const isNew = lead.status === 'DISTRIBUTED' || lead.status === 'PENDING';
                           
                           return (
                              <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                 <td className="px-3 sm:px-6 py-3 sm:py-4">
                                    <div className="flex flex-col">
                                       <span className="text-xs sm:text-sm font-medium text-gray-900 flex items-center gap-1.5">
                                          {lead.buyerName}
                                          {lead.phone && lead.phone !== 'N/A' && (
                                             <span className="text-[9px] sm:text-[10px] bg-emerald-100 text-emerald-700 px-1 sm:px-1.5 py-0.5 rounded font-medium uppercase tracking-wider" title="Verified">Verified</span>
                                          )}
                                       </span>
                                       <span className="text-[11px] sm:text-xs text-gray-600 mt-1">{lead.phone || 'No phone'}</span>
                                       <span className="text-[11px] sm:text-xs text-gray-500 mt-0.5">{new Date(lead.createdAt).toLocaleDateString()}</span>
                                    </div>
                                 </td>
                                 <td className="px-3 sm:px-6 py-3 sm:py-4">
                                    <div className="flex flex-col">
                                       <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-800 w-fit">
                                          {lead.category?.name || 'General'}
                                       </span>
                                       <span className="text-[11px] sm:text-xs text-gray-600 mt-1.5 max-w-[200px] sm:max-w-[250px] whitespace-normal line-clamp-2" title={lead.message}>
                                          {lead.message || (lead.searchKeyword ? `Looking for: ${lead.searchKeyword}` : "No specific message")}
                                       </span>
                                    </div>
                                 </td>
                                 <td className="px-3 sm:px-6 py-3 sm:py-4">
                                    <div className="flex items-center text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                       <MapPin size={13} className="mr-1 sm:mr-1.5 text-gray-400 shrink-0" />
                                       {lead.city || 'N/A'}
                                    </div>
                                 </td>
                                 <td className="px-3 sm:px-6 py-3 sm:py-4">
                                    <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-medium uppercase tracking-wider whitespace-nowrap ${
                                       isNew ? 'bg-blue-100 text-blue-700' : isWon ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                       {isNew ? 'New Lead' : isWon ? 'Won' : lead.status}
                                    </span>
                                 </td>
                                 <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                                       {lead.phone && lead.phone !== 'N/A' && lead.status !== 'EXPIRED' && (
                                          <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()} className="p-1 sm:p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Call">
                                             <Phone size={14} />
                                          </a>
                                       )}
                                       {lead.phone && lead.phone !== 'N/A' && lead.status !== 'EXPIRED' && (
                                          <a href={`https://wa.me/${lead.phone}`} onClick={(e) => e.stopPropagation()} target="_blank" className="p-1 sm:p-1.5 text-gray-500 hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-colors" title="WhatsApp">
                                             <MessageSquare size={14} />
                                          </a>
                                       )}
                                       {isWon ? (
                                          <span className="text-[10px] sm:text-xs font-medium text-emerald-600 flex items-center gap-1 ml-1">
                                             <CheckCircle2 size={13} /> Closed
                                          </span>
                                       ) : lead.status === 'EXPIRED' ? (
                                          <span className="text-[10px] sm:text-xs font-medium text-gray-400 flex items-center gap-1 ml-1">
                                             <X size={13} /> Expired
                                          </span>
                                       ) : (
                                          <>
                                             <button
                                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(lead.id, 'REDISTRIBUTE'); }}
                                                className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-colors ml-1"
                                             >
                                                Decline
                                             </button>
                                             <button
                                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(lead.id, 'CLOSED'); }}
                                                className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-white bg-[#164e33] hover:bg-[#113f29] rounded-lg shadow-sm transition-colors whitespace-nowrap"
                                             >
                                                Mark Won
                                             </button>
                                          </>
                                       )}
                                    </div>
                                 </td>
                              </tr>
                           );
                        })
                     ) : (
                        <tr>
                           <td colSpan={5} className="px-6 py-12 text-center">
                              <History size={24} className="mx-auto text-gray-300 mb-3" />
                              <h3 className="text-sm font-semibold text-gray-900">No leads found</h3>
                              <p className="text-xs text-gray-500 mt-1">Your potential customer inquiries will appear here.</p>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>

            {/* Pagination Footer */}
            {leads.length > 0 && (
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border-t border-gray-100 bg-white">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-700 uppercase tracking-tight text-center sm:text-left">
                     Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalLeads)} of {totalLeads} leads
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3 justify-center">
                     <div className="flex items-center gap-1">
                        <button 
                           onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                           disabled={currentPage === 1}
                           className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <ChevronLeft size={16} />
                        </button>
                        
                        {/* Show max 5 pages dynamically to avoid overflowing if many leads */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                           .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                           .map((page, index, array) => (
                              <React.Fragment key={page}>
                                 {index > 0 && array[index - 1] !== page - 1 && (
                                    <span className="w-8 h-8 flex items-center justify-center text-gray-500 font-medium">...</span>
                                 )}
                                 <button 
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs transition-all ${currentPage === page ? 'bg-[#164e33] text-white border-transparent shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                                 >
                                    {page}
                                 </button>
                              </React.Fragment>
                           ))}

                        <button 
                           onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                           disabled={currentPage === totalPages}
                           className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <ChevronRight size={16} />
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* Side Drawer for Lead Details */}
         <AnimatePresence>
            {selectedLead && (
               <>
                  {/* Backdrop */}
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setSelectedLead(null)}
                     className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
                  />
                  
                  {/* Drawer Panel */}
                  <motion.div
                     initial={{ x: '100%', opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     exit={{ x: '100%', opacity: 0 }}
                     transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                     className="fixed top-0 right-0 w-full sm:max-w-md h-full bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
                  >
                     <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                        <div>
                           <h2 className="text-lg font-bold text-slate-900">Lead Details</h2>
                           <p className="text-xs text-slate-500">ID #{selectedLead.id.slice(0, 8)}</p>
                        </div>
                        <button 
                           onClick={() => setSelectedLead(null)}
                           className="p-2 text-slate-400 hover:text-slate-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                           <X size={20} />
                        </button>
                     </div>
                     
                     <div className="flex-1 overflow-y-auto p-5 space-y-6">
                        {/* Buyer Info */}
                        <div>
                           <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Buyer Information</h3>
                           <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 space-y-3">
                              <div className="flex justify-between items-center">
                                 <span className="text-xs text-slate-500 font-medium">Name</span>
                                 <span className="text-sm font-semibold text-slate-900">{selectedLead.buyerName}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-xs text-slate-500 font-medium">Phone</span>
                                 <span className="text-sm font-semibold text-slate-900">{selectedLead.phone || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-xs text-slate-500 font-medium">Email</span>
                                 <span className="text-sm font-semibold text-slate-900">{selectedLead.buyerEmail || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-xs text-slate-500 font-medium">City</span>
                                 <span className="text-sm font-semibold text-slate-900">{selectedLead.city || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-xs text-slate-500 font-medium">Date</span>
                                 <span className="text-sm font-medium text-slate-900">
                                    {new Date(selectedLead.createdAt).toLocaleString()}
                                 </span>
                              </div>
                           </div>
                        </div>

                        {/* Requirements */}
                        <div>
                           <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Requirements</h3>
                           <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3">
                              <div className="flex items-center gap-2 mb-2">
                                 <span className="px-2 py-1 bg-white text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-200">
                                    {selectedLead.category?.name || 'General Category'}
                                 </span>
                                 <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${
                                    selectedLead.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 
                                    (selectedLead.status === 'DISTRIBUTED' || selectedLead.status === 'PENDING') ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                                    'bg-gray-100 text-gray-800 border-gray-200'
                                 }`}>
                                    Status: {selectedLead.status}
                                 </span>
                              </div>
                              <p className="text-sm text-slate-700 font-medium leading-relaxed">
                                 "{selectedLead.message || (selectedLead.searchKeyword ? `Looking for: ${selectedLead.searchKeyword}` : 'No specific details provided by the buyer.')}"
                              </p>
                           </div>
                        </div>

                        {/* Private Notes */}
                        <div>
                           <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center justify-between">
                              Private Notes
                              <span className="text-[10px] text-gray-500 font-medium normal-case">Only visible to you</span>
                           </h3>
                           <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                              
                              {/* Existing Notes */}
                              {selectedLead.lifecycle && selectedLead.lifecycle.filter((lc: any) => lc.action === 'VENDOR_NOTE').length > 0 && (
                                 <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2">
                                    {selectedLead.lifecycle.filter((lc: any) => lc.action === 'VENDOR_NOTE').map((note: any) => (
                                       <div key={note.id} className="bg-white border border-amber-200 p-3 rounded-lg shadow-sm">
                                          <p className="text-sm font-semibold text-gray-900 mb-1.5">{note.details}</p>
                                          <span className="text-[10px] text-gray-500 font-semibold uppercase">
                                             {new Date(note.createdAt).toLocaleString()}
                                          </span>
                                       </div>
                                    ))}
                                 </div>
                              )}

                              {/* Add Note Input */}
                              <div className="flex flex-col gap-2 mt-2">
                                 <textarea 
                                    rows={2}
                                    placeholder="Type a private note here..."
                                    value={notesInput[selectedLead.id] || ''}
                                    onChange={(e) => setNotesInput({ ...notesInput, [selectedLead.id]: e.target.value })}
                                    className="w-full px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-amber-500 resize-none shadow-sm placeholder:text-gray-400"
                                 />
                                 <button 
                                    onClick={() => handleAddNote(selectedLead.id)}
                                    disabled={!notesInput[selectedLead.id] || addingNoteId === selectedLead.id}
                                    className="self-end px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-lg border border-amber-700 hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-50"
                                 >
                                    {addingNoteId === selectedLead.id ? 'Saving...' : 'Save Note'}
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Actions Footer */}
                     <div className="p-5 border-t border-gray-100 bg-white space-y-3">
                        <div className="flex gap-2">
                           {selectedLead.status !== 'EXPIRED' ? (
                              <>
                                 <a 
                                    href={`tel:${selectedLead.phone}`} 
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-gray-100 transition-all"
                                 >
                                    <Phone size={14} className="text-emerald-600" /> Call Buyer
                                 </a>
                                 <a 
                                    href={`https://wa.me/${selectedLead.phone}`} 
                                    target="_blank" 
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366]/10 border border-[#25D366]/20 text-[#075E54] rounded-lg text-xs font-bold hover:bg-[#25D366]/20 transition-all"
                                 >
                                    <MessageSquare size={14} className="text-[#25D366]" /> WhatsApp
                                 </a>
                              </>
                           ) : (
                              <div className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                                 <p className="text-xs font-medium text-gray-500">Contact details are hidden because this lead has expired.</p>
                              </div>
                           )}
                        </div>
                        
                        {selectedLead.status !== 'CLOSED' && selectedLead.status !== 'EXPIRED' && (
                           <div className="flex gap-2">
                              <button
                                 onClick={() => { handleUpdateStatus(selectedLead.id, 'REDISTRIBUTE'); setSelectedLead(null); }}
                                 className="flex-1 px-4 py-2.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                 Decline Lead
                              </button>
                              <button
                                 onClick={() => { handleUpdateStatus(selectedLead.id, 'CLOSED'); setSelectedLead((prev: any) => ({...prev, status: 'CLOSED'})); }}
                                 className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-[#164e33] hover:bg-[#113f29] rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
                              >
                                 <CheckCircle2 size={14} /> Mark as Won
                              </button>
                           </div>
                        )}
                     </div>
                  </motion.div>
               </>
            )}
         </AnimatePresence>

         <style jsx global>{`
           .leads-table-scroll {
             scrollbar-width: thin;
             scrollbar-color: #c1c1c1 #f1f1f1;
           }
           .leads-table-scroll::-webkit-scrollbar {
             height: 6px;
           }
           .leads-table-scroll::-webkit-scrollbar-track {
             background: #f1f1f1;
             border-radius: 8px;
           }
           .leads-table-scroll::-webkit-scrollbar-thumb {
             background: #c1c1c1;
             border-radius: 8px;
           }
           .leads-table-scroll::-webkit-scrollbar-thumb:hover {
             background: #a0a0a0;
           }
         `}</style>
      </div>
   );
}

const VendorLeadStatCard = ({ label, value, sub, icon: Icon, iconColor, iconBg }: any) => (
  <div className="bg-white p-3 sm:p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors">
     <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
           <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
              <Icon size={14} className="sm:w-4 sm:h-4" />
           </div>
           <span className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{label}</span>
        </div>
        <h3 className="text-lg sm:text-2xl font-semibold text-slate-900 leading-none mb-1">{value}</h3>
        <p className="text-[10px] sm:text-xs text-slate-500 truncate">{sub}</p>
     </div>
  </div>
);

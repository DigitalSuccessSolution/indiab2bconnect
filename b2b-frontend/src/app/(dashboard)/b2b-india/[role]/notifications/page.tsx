'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { 
  Bell, 
  CheckCircle2, 
  RefreshCcw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  User,
  Target,
  Package,
  Megaphone,
  Briefcase,
  Box,
  CheckCheck,
  Send,
  Info,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

export default function AdminNotifications() {
  const { hasPermission } = useAuth();
  const canBroadcast = hasPermission('notifications_broadcast');

  const [activeTab, setActiveTab] = useState<'ALERTS' | 'BROADCAST'>('ALERTS');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Broadcast Form
  const [formData, setFormData] = useState({ title: '', message: '', type: 'INFO', target: 'ALL' });
  const [broadcasting, setBroadcasting] = useState(false);

  useEffect(() => {
    if (activeTab === 'ALERTS') fetchNotifications();
  }, [activeTab]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/notifications`);
      const fetchedNotifications = data.data || [];
      setNotifications(fetchedNotifications);
      setTotal(fetchedNotifications.length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await apiFetch('/notifications/mark-all-read', { method: 'PATCH' });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all read:', error);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return;
    
    setBroadcasting(true);
    try {
      await apiFetch('/admin/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      Swal.fire({
        icon: 'success',
        title: 'Sent!',
        text: 'Announcement sent successfully.',
        timer: 1500,
        showConfirmButton: false
      });
      setFormData({ title: '', message: '', type: 'INFO', target: 'ALL' });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: error.message || 'Failed to send announcement.'
      });
    } finally {
      setBroadcasting(false);
    }
  };

  const getCategoryStyle = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('vendor')) return { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: <Briefcase size={20} /> };
    if (t.includes('lead')) return { bg: 'bg-blue-100', text: 'text-blue-600', icon: <Target size={20} /> };
    if (t.includes('product') || t.includes('offering')) return { bg: 'bg-orange-100', text: 'text-orange-600', icon: <Box size={20} /> };
    if (t.includes('user')) return { bg: 'bg-rose-100', text: 'text-rose-600', icon: <User size={20} /> };
    if (t.includes('package')) return { bg: 'bg-purple-100', text: 'text-purple-600', icon: <Package size={20} /> };
    if (t.includes('announcement')) return { bg: 'bg-amber-100', text: 'text-amber-600', icon: <Megaphone size={20} /> };
    return { bg: 'bg-gray-100', text: 'text-gray-600', icon: <Bell size={20} /> };
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
        <div>
           <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">Notification Center</h1>
           <p className="text-gray-500 text-sm mt-1">Manage system alerts and broadcast updates to your platform.</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded">
           <button 
             onClick={() => setActiveTab('ALERTS')}
             className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'ALERTS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
           >
              System Alerts
           </button>
           {canBroadcast && (
             <button 
               onClick={() => setActiveTab('BROADCAST')}
               className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === 'BROADCAST' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
             >
                Broadcast
             </button>
           )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'ALERTS' ? (
          <motion.div 
            key="alerts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            {/* TABS BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
                <div className="flex items-center gap-3">
                    <button onClick={markAllRead} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#164e33] hover:bg-gray-50 transition-colors rounded">
                       <CheckCheck size={16} /> Mark all read
                    </button>
                </div>
            </div>

            {/* LIST */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden divide-y divide-gray-100">
               {loading && notifications.length === 0 ? (
                 [...Array(4)].map((_, i) => (
                   <div key={i} className="px-6 py-4 flex flex-col sm:flex-row sm:items-start gap-4 animate-pulse">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
                      <div className="flex-1 w-full space-y-3 py-1">
                         <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                            <div className="h-3 bg-gray-100 rounded w-24" />
                         </div>
                         <div className="h-3 bg-gray-100 rounded w-3/4" />
                      </div>
                   </div>
                 ))
               ) : notifications.length === 0 ? (
                 <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                       <Bell className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">No notifications yet</h3>
                    <p className="text-sm text-gray-500 max-w-sm">When you get alerts, updates, or broadcasts, they will show up here.</p>
                 </div>
               ) : (
                 notifications.map((n, idx) => {
                   const style = getCategoryStyle(n.title);
                   return (
                     <div key={n.id || idx} className={`group px-6 py-4 flex flex-col sm:flex-row sm:items-start gap-4 transition-colors hover:bg-gray-50 ${n.isRead ? 'bg-white' : 'bg-slate-50/50'}`}>
                        <div className="relative shrink-0">
                           <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.bg} ${style.text}`}>
                              {style.icon}
                           </div>
                           {!n.isRead && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#164e33] rounded-full border-2 border-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-0.5">
                             <h3 className={`text-sm truncate ${n.isRead ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}`}>{n.title}</h3>
                             <div className="flex items-center gap-2 shrink-0">
                               <span className={`text-xs whitespace-nowrap ${n.isRead ? 'text-slate-400' : 'font-medium text-slate-500'}`}>
                                 {format(new Date(n.createdAt || Date.now()), 'MMM dd, yyyy • hh:mm a')}
                               </span>
                             </div>
                           </div>
                           <p className={`text-xs ${n.isRead ? 'text-slate-500' : 'font-medium text-slate-600'}`}>{n.message}</p>
                        </div>
                     </div>
                   );
                 })
               )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="broadcast"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
             <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="mb-6 border-b border-gray-200 pb-4">
                   <h2 className="text-base font-semibold text-gray-900">New Announcement</h2>
                   <p className="text-sm text-gray-500 mt-1">Compose a message to broadcast across the platform.</p>
                </div>

                <form onSubmit={handleBroadcast} className="space-y-5">
                   <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Announcement Title</label>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#164e33] transition-shadow"
                        placeholder="e.g. Scheduled Maintenance Update"
                        required
                      />
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                         <label className="text-sm font-medium text-gray-700">Message Type</label>
                         <select 
                           value={formData.type}
                           onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                           className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#164e33] transition-shadow cursor-pointer"
                         >
                            <option value="INFO">Information</option>
                            <option value="WARNING">Warning / Alert</option>
                            <option value="SUCCESS">Success / Update</option>
                         </select>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-sm font-medium text-gray-700">Target Audience</label>
                         <select 
                           value={formData.target}
                           onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                           className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#164e33] transition-shadow cursor-pointer"
                         >
                            <option value="ALL">All Users</option>
                            <option value="VENDORS">Vendors Only</option>
                            <option value="ADMINS">Admins Only</option>
                         </select>
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Detailed Message</label>
                      <textarea 
                         value={formData.message}
                         onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                         rows={5}
                         className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#164e33] transition-shadow resize-none"
                         placeholder="Write the full details of your announcement here..."
                         required
                      />
                   </div>

                   <div className="pt-2">
                     <button 
                       type="submit"
                       disabled={broadcasting || !formData.title || !formData.message}
                       className="px-6 py-2 bg-[#164e33] text-white rounded-lg text-sm font-medium hover:bg-[#113f29] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                        {broadcasting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {broadcasting ? 'Broadcasting...' : 'Broadcast Announcement'}
                     </button>
                   </div>
                </form>
             </div>

             <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                   <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-5">
                      <Info className="w-5 h-5 text-[#164e33]" /> Guidelines
                   </h3>
                   <div className="space-y-4">
                     <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                        <h4 className="text-sm font-bold text-blue-900 mb-1">Instant Delivery</h4>
                        <p className="text-sm text-blue-800/80 leading-relaxed">
                          Broadcasts are sent instantly to the selected audience's notification center.
                        </p>
                     </div>
                     <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100/50 flex gap-3 items-start">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-amber-900 mb-1">Verify Before Sending</h4>
                          <p className="text-sm text-amber-800/80 leading-relaxed">
                            Once sent, announcements cannot be edited or retracted. Please verify all details carefully.
                          </p>
                        </div>
                     </div>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

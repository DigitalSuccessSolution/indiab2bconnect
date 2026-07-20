'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  RefreshCcw,
  CheckCheck,
  Megaphone,
  Send,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'BROADCAST'>('ALERTS');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Announcement Form
  const [formData, setFormData] = useState({ title: '', message: '', type: 'INFO', target: 'ALL_VENDORS' });
  const [broadcasting, setBroadcasting] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  useEffect(() => {
    if (activeTab === 'ALERTS') fetchNotifications();
  }, [activeTab]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/notifications');
      setNotifications(data.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return;
    
    setBroadcasting(true);
    setStatus({ type: '', text: '' });
    try {
      await apiFetch('/admin/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setStatus({ type: 'success', text: 'Announcement sent successfully to your hub members.' });
      setFormData({ title: '', message: '', type: 'INFO', target: 'ALL_VENDORS' });
      if (activeTab === 'ALERTS') fetchNotifications();
    } catch (error) {
      setStatus({ type: 'error', text: 'Failed to send announcement. Please try again.' });
    } finally {
      setBroadcasting(false);
      setTimeout(() => setStatus({ type: '', text: '' }), 5000);
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

  const deleteNotification = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return (
    <div className="space-y-8 animate-simple-fade pb-20 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900  flex items-center gap-3">
            Team Announcements
            <div className="p-1.5 bg-[#164e33]/5 text-[#164e33] rounded-lg border border-[#164e33]/10">
              <Megaphone className="w-5 h-5" />
            </div>
          </h1>
          <p className="text-slate-700 font-medium mt-1 text-sm">Manage system alerts and broadcast updates to your hub members.</p>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-lg">
           <button 
             onClick={() => setActiveTab('ALERTS')}
             className={`px-5 py-2 rounded-lg text-sm font-semibold uppercase  transition-all ${activeTab === 'ALERTS' ? 'bg-white text-[#164e33] ' : 'text-slate-700 hover:text-slate-800'}`}
           >
              System Alerts
           </button>
           <button 
             onClick={() => setActiveTab('BROADCAST')}
             className={`px-5 py-2 rounded-lg text-sm font-semibold uppercase  transition-all ${activeTab === 'BROADCAST' ? 'bg-white text-[#164e33] ' : 'text-slate-700 hover:text-slate-800'}`}
           >
              Send Broadcast
           </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
         {activeTab === 'ALERTS' ? (
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-sm font-semibold text-slate-900 uppercase  flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#164e33]" /> Recent Activity
                 </h2>
                 <div className="flex items-center gap-3">
                    <button 
                      onClick={markAllRead}
                      className="text-sm font-semibold text-[#164e33] hover:text-[#113f29] transition-colors"
                    >
                      Clear All Notifications
                    </button>
                    <button onClick={fetchNotifications} className="p-2 bg-white border border-gray-200 rounded-lg text-slate-700 hover:bg-gray-50 transition-all ">
                       <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                 </div>
              </div>

              <div className="space-y-4">
                 {loading && notifications.length === 0 ? (
                   [1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-50/50 rounded-lg animate-pulse border border-gray-100"></div>)
                 ) : notifications.length > 0 ? (
                   <AnimatePresence>
                     {notifications.map((n) => (
                       <motion.div 
                         key={n.id}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -10 }}
                         className={`group p-6 bg-white rounded-lg border ${n.isRead ? 'border-gray-50 opacity-75' : 'border-gray-100 '} flex items-start gap-6 hover:border-[#164e33]/20 transition-all`}
                       >
                         <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${n.isRead ? 'bg-gray-50 text-slate-700' : 'bg-[#164e33]/10 text-[#164e33]'}`}>
                           <Bell className="w-5 h-5" />
                         </div>
                         <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                               <h3 className="text-sm font-semibold text-slate-900 ">{n.title}</h3>
                               <p className="text-sm font-semibold text-slate-700 uppercase ">{new Date(n.createdAt).toLocaleDateString()}</p>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed max-w-2xl">{n.message}</p>
                         </div>
                         <button 
                             onClick={() => deleteNotification(n.id)}
                             className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </motion.div>
                     ))}
                   </AnimatePresence>
                 ) : (
                   <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-lg opacity-50 bg-gray-50/30">
                      <Bell className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                      <p className="text-sm font-semibold text-slate-700 uppercase ">No notifications found</p>
                   </div>
                 )}
              </div>
           </div>
         ) : (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 bg-white rounded-lg border border-gray-100 p-8 md:p-10  space-y-8">
                 <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-slate-900 ">Hub Broadcast</h2>
                    <p className="text-sm font-medium text-slate-700">Send a targeted message to vendors in your managed hub.</p>
                 </div>

                 <form onSubmit={handleBroadcast} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-sm font-semibold text-slate-800 ml-1">Announcement Title</label>
                       <input 
                         type="text" 
                         value={formData.title}
                         onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                         className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-[#164e33] focus:bg-white transition-all text-slate-900"
                         placeholder="e.g. Hub Update: New Verification Requirements"
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-800 ml-1">Alert Type</label>
                          <select 
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-slate-800 outline-none appearance-none hover:bg-gray-100 transition-colors"
                          >
                             <option value="INFO">Information</option>
                             <option value="WARNING">Warning</option>
                             <option value="DANGER">Critical Alert</option>
                             <option value="SUCCESS">Success Message</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-800 ml-1">Recipient Group</label>
                          <select 
                            value={formData.target}
                            onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-slate-800 outline-none appearance-none hover:bg-gray-100 transition-colors"
                          >
                             <option value="ALL_VENDORS">My Hub Vendors</option>
                             <option value="ALL_BUYERS">Regional Buyers</option>
                             <option value="ALL">Everyone in Hub</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-semibold text-slate-800 ml-1">Message Body</label>
                       <textarea 
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={6}
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-[#164e33] focus:bg-white transition-all resize-none text-slate-900"
                          placeholder="Type your message here..."
                       />
                    </div>

                    <button 
                      type="submit"
                      disabled={broadcasting || !formData.title || !formData.message}
                      className="w-full py-4 bg-[#164e33] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-3  -[#164e33]/10 hover:bg-[#113f29] transition-all disabled:opacity-50"
                    >
                       {broadcasting ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Megaphone className="w-5 h-5 text-emerald-400" />}
                       {broadcasting ? 'Broadcasting...' : 'Broadcast to Hub'}
                    </button>
                 </form>
              </div>

              <div className="lg:col-span-5 space-y-6">
                 <div className="bg-white rounded-lg border border-gray-100 p-8  space-y-6">
                    <h3 className="text-sm font-semibold text-slate-700 uppercase  flex items-center gap-2">
                       <Info className="w-4 h-4 text-[#164e33]" /> Broadcast Guidelines
                    </h3>
                    <div className="space-y-4">
                       <div className="p-5 bg-amber-50 rounded-lg border border-amber-100 flex gap-4">
                          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                          <p className="text-sm font-medium text-amber-800 leading-relaxed">
                            Hub broadcasts are sent to all verified vendors within your assigned business categories. Verify all details before sending.
                          </p>
                       </div>
                    </div>
                 </div>

                 <AnimatePresence>
                    {status.text && (
                      <motion.div 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0 }}
                         className={`p-6 rounded-lg font-semibold text-sm flex items-center gap-4  ${status.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
                      >
                         {status.type === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <XCircle className="w-6 h-6 shrink-0" />}
                         {status.text}
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}




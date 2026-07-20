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
  CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VendorNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

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
      setSuccessMsg('Notification deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-8 animate-pulse pb-20 p-2 md:p-0">
        {/* Header Skeleton */}
        <div className="pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-6 max-w-7xl mx-auto w-full">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-6 bg-slate-200 rounded w-40"></div>
              <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="h-4 bg-slate-200 rounded w-72 mt-3"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-32 bg-slate-100 rounded-lg"></div>
            <div className="h-10 w-28 bg-slate-200 rounded-lg"></div>
          </div>
        </div>

        {/* List Skeleton */}
        <div className="max-w-7xl mx-auto space-y-2.5 w-full">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-5 h-[104px]">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0"></div>
                <div className="space-y-3 w-full max-w-lg">
                  <div className="h-5 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0 mt-4 md:mt-0">
                <div className="h-4 bg-slate-100 rounded w-24"></div>
                <div className="w-8 h-8 bg-slate-50 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-simple-fade pb-20 p-2 md:p-0">
      <div className="pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-6 max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
             Notifications
            <div className="p-1.5 bg-gray-50 text-slate-600 rounded-lg border border-gray-200 shadow-sm">
              <Bell className="w-4 h-4" />
            </div>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Updates on your products, services, and buyer inquiries.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={markAllRead}
            disabled={!notifications.some(n => !n.isRead)}
            className="h-10 px-5 bg-white border border-gray-200 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
          <button 
            onClick={fetchNotifications}
            className="h-10 px-5 bg-[#062d1d] text-white rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-black transition-all shadow-sm"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="max-w-7xl mx-auto w-full mb-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5" />
            {successMsg}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-2.5 w-full">
        {notifications.length > 0 ? (
          <AnimatePresence>
            {notifications.map((n: any) => {
              const title = n.title || (n.buyerName ? 'New Lead Opportunity' : 'Notification');
              const message = n.message || (n.buyerName ? `New ${n.type || 'INQUIRY'} lead from ${n.buyerName}.` : 'You have a new update.');
              const dateStr = n.createdAt ? new Date(n.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

              return (
              <motion.div 
                key={n.id || Math.random().toString()}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`py-4 px-5 bg-white rounded-lg shadow-sm border ${n.isRead ? 'border-gray-200' : 'border-emerald-200 bg-emerald-50/50'} flex gap-4 items-center group hover:border-emerald-300 transition-all `}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${n.isRead ? 'bg-gray-50 text-slate-500 border-gray-200' : 'bg-white text-emerald-600 border-emerald-200'}`}>
                  {title.includes('Approved') || title.includes('Success') ? <CheckCircle2 className="w-5 h-5 cursor-default" /> : <Bell className="w-4 h-4 cursor-default" />}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-semibold ${n.isRead ? 'text-slate-800' : 'text-slate-900'}`}>{title}</h3>
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 ml-4">
                      <Clock className="w-3.5 h-3.5" />
                      {dateStr}
                    </span>
                  </div>
                  <p className={`text-sm ${n.isRead ? 'text-slate-700' : 'text-slate-800'} leading-relaxed max-w-2xl font-medium`}>{message}</p>
                </div>

                <div className="flex flex-col gap-2">
                   <button 
                    onClick={() => deleteNotification(n.id)}
                    className="p-2 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete permanently"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-700 border border-gray-100 ">
                <Bell className="w-8 h-8" />
            </div>
            <p className="text-slate-700 font-semibold text-sm">No active notifications</p>
            <p className="text-slate-700 font-medium text-sm mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}




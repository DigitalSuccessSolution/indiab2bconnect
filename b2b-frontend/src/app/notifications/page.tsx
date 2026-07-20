"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Bell, BellOff, CheckCircle2, AlertCircle, Info, 
  Trash2, Loader2, ArrowRight, Package, ShieldCheck, 
  Clock, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [fetching, setFetching] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setFetching(true);
      const response = await apiFetch('/notifications');
      // Handle both direct array responses and wrapped data objects
      const data = Array.isArray(response) ? response : (response?.data || []);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      // Fallback for demo if endpoint not ready
      setNotifications([]);
    } finally {
      setFetching(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await apiFetch('/notifications/mark-all-read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'LEAD_ASSIGNED': return <Package className="w-5 h-5 text-emerald-600" />;
      case 'ACCOUNT_VERIFIED': return <ShieldCheck className="w-5 h-5 text-blue-600" />;
      case 'PAYMENT_SUCCESS': return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'ALERT': return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default: return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#164e33] animate-spin" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#f9fafb] pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-[#164e33] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </h1>
            <p className="text-gray-700 text-sm mt-1">Stay updated with your leads, account activity, and alerts.</p>
          </div>
          
          {notifications.length > 0 && unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              disabled={markingAll}
              className="inline-flex items-center gap-2 text-[#164e33] font-semibold text-sm hover:underline disabled:opacity-50"
            >
              {markingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <motion.div 
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${
                  notification.isRead ? 'border-gray-100 opacity-80' : 'border-[#164e33]/20 bg-emerald-50/10'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`p-2.5 rounded-lg shrink-0 ${notification.isRead ? 'bg-gray-100' : 'bg-emerald-50'}`}>
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={`text-sm font-semibold truncate ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-xs text-gray-700 mt-0.5 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                         <span className="text-[10px] font-semibold text-gray-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-[#164e33]" />
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
                      <div className="flex items-center gap-4">
                        {!notification.isRead && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="text-[11px] font-semibold text-[#164e33] hover:underline"
                          >
                            Mark as read
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notification.id)}
                          className="text-[11px] font-semibold text-gray-700 hover:text-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                      <button className="text-[11px] font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-1 group">
                        View details
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <BellOff className="w-10 h-10 text-gray-700" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">All caught up!</h2>
              <p className="text-gray-700 text-sm mt-2 max-w-xs">
                You don't have any notifications at the moment. We'll let you know when something important happens.
              </p>
              <button 
                onClick={() => router.push('/')}
                className="mt-8 bg-[#164e33] text-white px-6 py-2.5 rounded-lg font-semibold text-sm shadow-lg shadow-emerald-900/10 hover:bg-[#0d3120] transition-all"
              >
                Back to Home
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

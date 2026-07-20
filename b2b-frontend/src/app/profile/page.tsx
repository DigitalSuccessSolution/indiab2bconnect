"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  UserCircle, Mail, Phone, Edit3, Check, Loader2, Camera,
  User as UserIcon, AlertCircle, CheckCircle2, BadgeCheck,
  LogOut, Globe
} from 'lucide-react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/api';

export default function ProfilePage() {
  const { user, loading, refreshUser, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      });
    }
  }, [user, isEditing]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiFetch('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });
      await refreshUser();
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Failed to update profile', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout',
      text: "Are you sure you want to logout?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef530f',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
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

      setMessage({ type: 'success', text: 'Profile image updated.' });
      await refreshUser();
    } catch (error: any) {
      console.error('Failed to upload image', error);
      setMessage({ type: 'error', text: 'Failed to upload image.' });
    } finally {
      setUploading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };



  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#164e33] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
            <p className="text-gray-700 text-sm mt-1">Manage your personal profile and contact information.</p>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 bg-[#164e33] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#0d3120] transition-colors shadow-sm"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-600 font-semibold text-sm hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-[#164e33] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#0d3120] transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-lg border mb-6 flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                }`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Sidebar Navigation (Industry Standard Layout) */}
          <div className="lg:col-span-3 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-white border border-[#164e33] text-[#164e33] rounded-lg font-semibold text-sm text-left">
              <UserCircle className="w-5 h-5" /> Profile Info
            </button>

            <div className="pt-4 border-t border-gray-200 mt-4">
              <button 
                onClick={handleLogout}
                className="w-full mt-6 py-2.5 px-4 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-6">

            {/* Profile Information Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-base font-semibold text-gray-900">Profile Details</h3>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row items-start gap-10">

                  {/* Photo Section */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-10 h-10 text-gray-300" />
                        )}
                        {uploading && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-[#164e33] animate-spin" />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full border border-gray-200 shadow-sm text-gray-600 hover:text-[#164e33] transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </div>
                    <p className="text-[11px] text-gray-700 font-semibold capitalize tracking-tight">Profile Photo</p>
                  </div>

                  {/* Fields Section */}
                  <div className="flex-1 w-full space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 capitalize tracking-wider">Full Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:ring-1 focus:ring-[#164e33] focus:border-[#164e33] outline-none transition-all"
                          />
                        ) : (
                          <p className="text-sm font-medium text-gray-900">{user.name || "Not provided"}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 capitalize tracking-wider">Account Role</label>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-[#164e33] text-xs font-semibold border border-emerald-100">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 capitalize tracking-wider">Email Address</label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:ring-1 focus:ring-[#164e33] focus:border-[#164e33] outline-none transition-all"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {user.email && !user.email.includes('placeholder.com') ? user.email : "Not linked"}
                            </p>
                            {user.emailVerified && <BadgeCheck className="w-4 h-4 text-emerald-500" />}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 capitalize tracking-wider">Phone Number</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:ring-1 focus:ring-[#164e33] focus:border-[#164e33] outline-none transition-all"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">{user.phone || "Not linked"}</p>
                            {user.phoneVerified && <BadgeCheck className="w-4 h-4 text-emerald-500" />}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>



          </div>

        </div>
      </div>
    </div>
  );
}

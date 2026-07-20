'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { 
  User, 
  Lock, 
  ShieldCheck, 
  Save, 
  RefreshCcw, 
  Building,
  Settings,
  XCircle,
  CheckCircle,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { useAuth } from '@/context/AuthContext';

export default function VendorSettings() {
  const [vendor, setVendor] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; phone?: string }>({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [toggling2fa, setToggling2fa] = useState(false);

  // Password State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [vendorData, userData] = await Promise.all([
          apiFetch('/vendors/me'),
          apiFetch('/auth/me')
        ]);
        setVendor(vendorData.data);
        setUserProfile(userData.data);
        if (userData.data?.twoFactorEnabled !== undefined) {
          setTwoFactorEnabled(userData.data.twoFactorEnabled);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Error', 'Image size should be less than 5MB', 'error');
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await apiFetch('/auth/upload-avatar', {
        method: 'POST',
        body: formData,
      });
      setUserProfile({ ...userProfile, avatar: response.data.avatar });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Avatar updated successfully',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error: any) {
      Swal.fire('Error', error.message || 'Failed to upload avatar', 'error');
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleToggle2FA = async () => {
    setToggling2fa(true);
    try {
      const data = await apiFetch('/auth/toggle-2fa', {
        method: 'PATCH',
        body: JSON.stringify({ enable: !twoFactorEnabled })
      });
      setTwoFactorEnabled(data.data.twoFactorEnabled);
      Swal.fire({
        icon: 'success',
        title: data.data.twoFactorEnabled ? '2FA Enabled' : '2FA Disabled',
        text: `Two-Factor Authentication is now ${data.data.twoFactorEnabled ? 'enabled' : 'disabled'} for your account.`,
        timer: 3000,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error('Failed to toggle 2FA:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to update 2FA settings: ' + error.message,
      });
    } finally {
      setToggling2fa(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {


      if (userProfile) {
        await apiFetch('/auth/profile', {
          method: 'PATCH',
          body: JSON.stringify({
            name: userProfile.name,
            email: userProfile.email,
            phone: userProfile.phone
          })
        });
      }

      Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Profile updated successfully!',
        timer: 3000,
        showConfirmButton: false
      });
      setFormErrors({});
    } catch (error: any) {
      console.error('Update failed:', error);
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('email already in use')) {
        setFormErrors({ email: error.message });
      } else if (msg.includes('phone already in use')) {
        setFormErrors({ phone: error.message });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Update failed: ' + error.message,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Passwords do not match'
      });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Password must be at least 6 characters long'
      });
      return;
    }

    setPasswordUpdating(true);

    try {
      await apiFetch('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ password: passwordData.newPassword })
      });
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Password updated successfully! Please login again on your next session.'
      });
      setShowPasswordForm(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Password update failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update failed',
        text: error.message || 'Failed to update password'
      });
    } finally {
      setPasswordUpdating(false);
    }
  };

  if (loading) return <div className="p-10 animate-pulse bg-slate-50 rounded-lg h-80 border border-slate-200"></div>;

  return (
    <div className="space-y-6 animate-fade-in pb-10 pt-2 px-2 md:px-6">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Manage your account preferences and security.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Simple Side Nav */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
            {[
                { id: 'profile', label: 'Basic Profile', icon: User },
                { id: 'security', label: 'Security & Access', icon: Lock },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full px-4 py-2.5 rounded-md text-left flex items-center gap-3 transition-colors text-sm font-medium ${
                       activeTab === tab.id 
                       ? 'bg-[#164e33]/10 text-[#164e33]' 
                       : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900' 
                    }`}
                >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[#164e33]' : 'text-slate-400'}`} />
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Action Center Area */}
        <div className="flex-1">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="max-w-4xl"
                >
                    {activeTab === 'profile' && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                        {userProfile?.avatar ? <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-gray-400" />}
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => avatarInputRef.current?.click()}
                                        disabled={uploadingAvatar}
                                        className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 text-slate-600 cursor-pointer disabled:opacity-50"
                                        title="Upload Avatar"
                                    >
                                        {uploadingAvatar ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <User className="w-3 h-3" />}
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={avatarInputRef}
                                        onChange={handleAvatarUpload}
                                        accept="image/*" 
                                        className="hidden" 
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{userProfile?.name || 'Your Profile'}</h3>
                                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mt-1">
                                        Manage your personal information
                                    </div>
                                </div>
                            </div>

                            <form className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Owner Name</label>
                                    <input 
                                        type="text" 
                                        value={userProfile?.name || ''} 
                                        onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:border-[#164e33] focus:ring-1 focus:ring-[#164e33] outline-none text-sm text-slate-900 transition-shadow"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={userProfile?.email || ''} 
                                        onChange={(e) => {
                                            setUserProfile({...userProfile, email: e.target.value});
                                            if (formErrors.email) setFormErrors({...formErrors, email: undefined});
                                        }}
                                        className={`w-full px-3 py-2 bg-white border ${formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#164e33] focus:ring-[#164e33]'} rounded-md shadow-sm focus:ring-1 outline-none text-sm text-slate-900 transition-shadow`}
                                    />
                                    {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                    <input 
                                        type="text" 
                                        value={userProfile?.phone || ''} 
                                        onChange={(e) => {
                                            setUserProfile({...userProfile, phone: e.target.value});
                                            if (formErrors.phone) setFormErrors({...formErrors, phone: undefined});
                                        }}
                                        className={`w-full px-3 py-2 bg-white border ${formErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#164e33] focus:ring-[#164e33]'} rounded-md shadow-sm focus:ring-1 outline-none text-sm text-slate-900 transition-shadow`}
                                    />
                                    {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                                </div>
                                <div className="sm:col-span-2 pt-4 flex justify-end border-t border-gray-100 mt-2">
                                    <button 
                                        onClick={handleUpdate}
                                        disabled={saving}
                                        className="px-5 py-2 bg-[#164e33] text-white rounded-md font-medium shadow-sm hover:bg-[#113f29] disabled:opacity-50 flex items-center gap-2 transition-colors text-sm"
                                    >
                                        {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Profile
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-4">
                           <div className="p-5 bg-white rounded-md border border-gray-200 flex flex-col gap-4">
                               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                   <div>
                                       <h4 className="text-sm font-medium text-slate-900 mb-1">Change Password</h4>
                                       <p className="text-sm text-slate-500">Regularly update your password to maintain account security.</p>
                                   </div>
                                   <button 
                                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                                      className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-slate-700 hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap"
                                   >
                                      {showPasswordForm ? 'Cancel' : 'Update Password'}
                                   </button>
                               </div>

                               <AnimatePresence>
                                  {showPasswordForm && (
                                     <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                     >
                                        <form onSubmit={handlePasswordUpdate} className="pt-4 mt-2 border-t border-gray-100 space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-medium text-slate-700">New Password</label>
                                                    <div className="relative">
                                                        <input 
                                                            type={showPassword ? "text" : "password"} 
                                                            required
                                                            value={passwordData.newPassword} 
                                                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                                            className="w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md shadow-sm focus:border-[#164e33] focus:ring-1 focus:ring-[#164e33] outline-none text-sm text-slate-900"
                                                            placeholder="••••••••"
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                                        >
                                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                                                    <div className="relative">
                                                        <input 
                                                            type={showConfirmPassword ? "text" : "password"} 
                                                            required
                                                            value={passwordData.confirmPassword} 
                                                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                                            className="w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md shadow-sm focus:border-[#164e33] focus:ring-1 focus:ring-[#164e33] outline-none text-sm text-slate-900"
                                                            placeholder="••••••••"
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                                        >
                                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                <button 
                                                    type="submit"
                                                    disabled={passwordUpdating}
                                                    className="px-4 py-2 bg-[#164e33] text-white rounded-md text-sm font-medium hover:bg-[#113f29] disabled:opacity-50 transition-colors shadow-sm"
                                                >
                                                    {passwordUpdating ? 'Updating...' : 'Save New Password'}
                                                </button>
                                            </div>
                                        </form>
                                     </motion.div>
                                  )}
                               </AnimatePresence>
                           </div>

                           <div className="p-5 bg-white rounded-md border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                               <div>
                                   <h4 className="text-sm font-medium text-slate-900 mb-1">Active Devices</h4>
                                   <p className="text-sm text-slate-500">Review devices currently logged into your account.</p>
                               </div>
                               <div className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
                                   <ShieldCheck className="w-4 h-4" /> Secure
                               </div>
                           </div>

                           <div className="p-5 bg-white rounded-md border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                               <div>
                                   <h4 className="text-sm font-medium text-slate-900 mb-1">Two-Factor Authentication (Email OTP)</h4>
                                   <p className="text-sm text-slate-500">Add an extra layer of security to your account by requiring an OTP sent to your email.</p>
                               </div>
                               <button 
                                  onClick={handleToggle2FA}
                                  disabled={toggling2fa}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#164e33] focus:ring-offset-2 ${twoFactorEnabled ? 'bg-[#164e33]' : 'bg-gray-200'}`}
                               >
                                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                               </button>
                           </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

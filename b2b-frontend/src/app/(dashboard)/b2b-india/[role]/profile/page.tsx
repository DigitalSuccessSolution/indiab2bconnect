'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import {
   User,
   Mail,
   Phone,
   Building2,
   Shield,
   Camera,
   Loader2,
   Save,
   Lock,
   Edit3,
   X
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminProfile() {
   const { user, loading: authLoading, refreshUser } = useAuth();
   const fileInputRef = useRef<HTMLInputElement>(null);

   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [uploading, setUploading] = useState(false);
   const [formData, setFormData] = useState({
      name: '',
      phone: '',
      password: ''
   });

   const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
   const [newEmail, setNewEmail] = useState('');
   const [otp, setOtp] = useState('');
   const [otpSent, setOtpSent] = useState(false);
   const [modalLoading, setModalLoading] = useState(false);

   // OTP Timer State
   const [timer, setTimer] = useState(0);
   const [canResend, setCanResend] = useState(false);

   useEffect(() => {
      if (user) {
         setFormData({
            name: user.name || '',
            phone: user.phone || '',
            password: ''
         });
         setLoading(false);
      }
   }, [user]);

   useEffect(() => {
      let interval: NodeJS.Timeout;
      if (otpSent && timer > 0) {
         interval = setInterval(() => {
            setTimer((prev) => prev - 1);
         }, 1000);
      } else if (timer === 0 && otpSent) {
         setCanResend(true);
      }
      return () => clearInterval(interval);
   }, [timer, otpSent]);

   const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
         await apiFetch('/auth/profile', {
            method: 'PATCH',
            body: JSON.stringify({
               name: formData.name,
               phone: formData.phone,
               password: formData.password || undefined
            })
         });
         Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Profile updated successfully.',
            timer: 1500,
            showConfirmButton: false
         });
         setFormData(prev => ({ ...prev, password: '' }));
         await refreshUser();
      } catch (error: any) {
         Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: error.message || 'Failed to update profile.'
         });
      } finally {
         setSaving(false);
      }
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

         Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Profile image updated successfully.',
            timer: 1500,
            showConfirmButton: false
         });
         await refreshUser();
      } catch (error: any) {
         console.error('Failed to upload image', error);
         Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: error.message || 'Failed to update profile image.'
         });
      } finally {
         setUploading(false);
      }
   };

   const handleRequestEmailOTP = async () => {
      if (!newEmail || newEmail === user?.email) {
         Swal.fire({ icon: 'error', title: 'Invalid Email', text: 'Please enter a valid new email address.' });
         return;
      }
      setModalLoading(true);
      try {
         await apiFetch('/auth/request-email-change-otp', {
            method: 'POST',
            body: JSON.stringify({ newEmail })
         });
         setOtpSent(true);
         setTimer(60); // Start 60 second countdown
         setCanResend(false);
         Swal.fire({ icon: 'success', title: 'OTP Sent', text: 'Please check your new email for the OTP.' });
      } catch (error: any) {
         Swal.fire({ icon: 'error', title: 'Failed', text: error.message || 'Failed to send OTP.' });
      } finally {
         setModalLoading(false);
      }
   };

   const handleVerifyEmailOTP = async () => {
      if (!otp) {
         Swal.fire({ icon: 'error', title: 'Invalid OTP', text: 'Please enter the OTP.' });
         return;
      }
      setModalLoading(true);
      try {
         await apiFetch('/auth/verify-email-change', {
            method: 'POST',
            body: JSON.stringify({ otp })
         });
         Swal.fire({ icon: 'success', title: 'Success!', text: 'Email updated successfully.' });
         setIsEmailModalOpen(false);
         setOtp('');
         setNewEmail('');
         setOtpSent(false);
         await refreshUser();
      } catch (error: any) {
         Swal.fire({ icon: 'error', title: 'Failed', text: error.message || 'Invalid OTP.' });
      } finally {
         setModalLoading(false);
      }
   };

   if (authLoading || loading) {
      return (
         <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#164e33]" />
         </div>
      );
   }

   return (
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-simple-fade">

         {/* Page Header */}
         <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">My Profile</h1>
            <p className="text-slate-500 mt-1">Manage your personal information and security settings.</p>
         </div>

         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

            {/* Profile Header (Avatar & Basic Info) */}
            <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row items-center gap-6">
               <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-4 border-gray-50 overflow-hidden bg-gray-100 flex items-center justify-center text-[#164e33] text-3xl font-bold">
                     {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                        user?.name?.charAt(0) || 'U'
                     )}
                  </div>
                  <button
                     onClick={() => fileInputRef.current?.click()}
                     className="absolute bottom-0 right-0 p-2 bg-[#164e33] text-white rounded-full border-2 border-white hover:bg-[#113f29] transition-colors"
                  >
                     {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
               </div>

               <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                     <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-sm font-semibold rounded-full border border-amber-100">
                        <Shield className="w-4 h-4" />
                        {user?.role}
                     </span>
                     <span className="text-slate-500 text-sm">{user?.email}</span>
                  </div>
               </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleUpdate} className="p-8 space-y-6">

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        Full Name
                     </label>
                     <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#164e33] focus:border-[#164e33] outline-none transition-all"
                        placeholder="Enter full name"
                     />
                  </div>

                  {/* Email (Readonly with Edit Button) */}
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        Email Address
                     </label>
                     <div className="relative">
                        <input
                           type="email"
                           readOnly
                           value={user?.email || ''}
                           className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-200 bg-gray-50 text-slate-500 outline-none cursor-not-allowed"
                        />
                        <button
                           type="button"
                           onClick={() => setIsEmailModalOpen(true)}
                           className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#164e33] hover:bg-[#164e33]/10 rounded-md transition-colors"
                           title="Change Email"
                        >
                           <Edit3 className="w-4 h-4" />
                        </button>
                     </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        Phone Number
                     </label>
                     <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#164e33] focus:border-[#164e33] outline-none transition-all"
                        placeholder="Enter phone number"
                     />
                  </div>

               </div>

               <hr className="border-gray-100 my-8" />

               {/* Security Section */}
               <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                     <Lock className="w-5 h-5 text-[#164e33]" />
                     Update Password
                  </h3>
                  <div className="max-w-md space-y-2">
                     <label className="text-sm font-medium text-slate-700">New Password (optional)</label>
                     <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#164e33] focus:border-[#164e33] outline-none transition-all"
                        placeholder="Leave blank to keep current"
                     />
                  </div>
               </div>

               <div className="pt-6 flex justify-end">
                  <button
                     type="submit"
                     disabled={saving}
                     className="flex items-center gap-2 px-6 py-2.5 bg-[#164e33] text-white rounded-lg font-medium hover:bg-[#113f29] transition-colors disabled:opacity-70"
                  >
                     {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                     Save Changes
                  </button>
               </div>

            </form>
         </div>

         {/* Change Email Modal */}
         {isEmailModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-simple-fade">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                     <h3 className="text-lg font-bold text-slate-900">Change Email Address</h3>
                     <button
                        onClick={() => {
                           setIsEmailModalOpen(false);
                           setOtpSent(false);
                           setNewEmail('');
                           setOtp('');
                           setTimer(0);
                           setCanResend(false);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="p-6 space-y-4">
                     {!otpSent ? (
                        <>
                           <p className="text-sm text-slate-500">
                              Enter your new email address. We will send a One-Time Password (OTP) to verify ownership.
                           </p>
                           <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">New Email Address</label>
                              <input
                                 type="email"
                                 value={newEmail}
                                 onChange={(e) => setNewEmail(e.target.value)}
                                 className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#164e33] outline-none transition-all"
                                 placeholder="e.g. newadmin@example.com"
                              />
                           </div>
                           <button
                              type="button"
                              onClick={handleRequestEmailOTP}
                              disabled={modalLoading || !newEmail}
                              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-[#164e33] text-white rounded-lg font-medium hover:bg-[#113f29] transition-colors disabled:opacity-70 mt-4"
                           >
                              {modalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                              Send Verification OTP
                           </button>
                        </>
                     ) : (
                        <>
                           <p className="text-sm text-slate-500">
                              We have sent an OTP to <span className="font-semibold text-slate-900">{newEmail}</span>.
                           </p>
                           <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">Enter OTP</label>
                              <input
                                 type="text"
                                 value={otp}
                                 onChange={(e) => setOtp(e.target.value)}
                                 className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#164e33] outline-none transition-all text-center tracking-widest font-mono text-lg"
                                 placeholder="------"
                                 maxLength={6}
                              />
                           </div>

                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">Didn't receive the code?</span>
                              {canResend ? (
                                 <button
                                    type="button"
                                    onClick={handleRequestEmailOTP}
                                    className="text-[#164e33] font-semibold hover:underline"
                                 >
                                    Resend OTP
                                 </button>
                              ) : (
                                 <span className="text-slate-400 font-medium">
                                    Resend in 00:{timer.toString().padStart(2, '0')}
                                 </span>
                              )}
                           </div>

                           <button
                              type="button"
                              onClick={handleVerifyEmailOTP}
                              disabled={modalLoading || otp.length !== 6}
                              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-[#164e33] text-white rounded-lg font-medium hover:bg-[#113f29] transition-colors disabled:opacity-70 mt-4"
                           >
                              {modalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                              Verify & Update Email
                           </button>
                        </>
                     )}
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

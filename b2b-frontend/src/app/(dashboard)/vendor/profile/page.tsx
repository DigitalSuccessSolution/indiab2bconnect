'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { apiFetch } from '@/lib/api';
import { 
  Building2, 
  MapPin, 
  Tag, 
  Globe, 
  Image as ImageIcon, 
  Save, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Briefcase,
  Activity,
  Award,
  RefreshCcw,
  Box,
  Linkedin,
  Instagram,
  Facebook,
  Upload,
  FileText,
  Mail,
  Phone,
  CreditCard,
  X,
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';

export default function SimpleVendorProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  
  const [vendorData, setVendorData] = useState<any>({
    businessName: '',
    email: '',
    phone: '',
    city: '',
    categoryIds: [],
    description: '',
    address: '',
    gstNumber: '',
    aadhaarNumber: '',
    logoUrl: '',
    socialLinks: {},
    googleBusinessLink: '',
    workingHours: '',
    verified: false
  });
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [initialSync, setInitialSync] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user && !initialSync) {
      setVendorData((prev: any) => ({
        ...prev,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
      setInitialSync(true);
    }
  }, [user, initialSync]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch('/vendors/me');
        if (res.data) {
          setVendorData({
              ...res.data,
              categoryIds: res.data.categories?.map((c: any) => c.id) || []
          });
          if (res.data.id) setIsEditing(false);
        }
      } catch (error: any) {
        setIsEditing(true);
        if (error.status !== 404) console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await apiFetch('/vendors/categories');
        if (res && res.data) {
           setCategories(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    if (user) {
      fetchProfile();
      fetchCategories();
    } else {
      setLoading(false);
    }
  }, [user?.id]);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'DOCUMENT' | 'LOGO' = 'DOCUMENT') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Different size limits based on type
    const MAX_MB = type === 'LOGO' ? 1 : 2;
    if (file.size > MAX_MB * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: 'File Too Large', text: `Please select an image smaller than ${MAX_MB}MB.` });
      e.target.value = '';
      return;
    }

    if (type === 'LOGO') {
      try {
        const img = new window.Image();
        const imgPromise = new Promise<{width: number, height: number}>((resolve, reject) => {
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.onerror = reject;
        });
        img.src = URL.createObjectURL(file);
        const { width, height } = await imgPromise;
        URL.revokeObjectURL(img.src);

        if (width < 100 || height < 100) {
          Swal.fire({ icon: 'error', title: 'Invalid Dimensions', text: 'Logo must be at least 100x100 pixels.' });
          e.target.value = '';
          return;
        }
        // Check if it's too rectangular (optional, but good for logos)
        const ratio = width / height;
        if (ratio < 0.5 || ratio > 2.0) {
          Swal.fire({ icon: 'warning', title: 'Suboptimal Dimensions', text: 'For best display, please upload a square or near-square logo.' });
          // We won't block it, just warn them
        }
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Invalid Image', text: 'Could not read the image file.' });
        e.target.value = '';
        return;
      }
    }
    
    if (type === 'LOGO') setUploadingLogo(true);
    else setUploadingFile(true);

    const formData = new FormData();
    formData.append('image', file); 

    try {
      const res = await apiFetch('/vendors/upload-image', {
        method: 'POST',
        body: formData,
        isMultipart: true 
      });
      
      if (type === 'LOGO') {
        setVendorData((prev: any) => ({ ...prev, logoUrl: res.data.url }));
        if(errors.logoUrl) setErrors({...errors, logoUrl: null});
        Swal.fire({ icon: 'success', title: 'Success', text: 'Business logo uploaded successfully!' });
      } else {
        setVendorData((prev: any) => ({ ...prev, verificationDocument: res.data.url }));
        if(errors.verificationDocument) setErrors({...errors, verificationDocument: null});
        Swal.fire({ icon: 'success', title: 'Success', text: 'Document uploaded successfully!' });
      }
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Upload Failed', text: error.message });
    } finally {
      setUploadingLogo(false);
      setUploadingFile(false);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!vendorData.businessName?.trim()) newErrors.businessName = 'Company Name is required';
    if (!vendorData.email?.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(vendorData.email)) newErrors.email = 'Invalid email address';
    
    if (!vendorData.phone?.trim()) newErrors.phone = 'Phone is required';
    else if (vendorData.phone.length < 10) newErrors.phone = 'Phone number is invalid';
    
    if (!vendorData.city?.trim()) newErrors.city = 'City is required';
    if (!vendorData.aadhaarNumber?.trim()) newErrors.aadhaarNumber = 'Aadhaar / ID is required';
    if (!vendorData.categoryIds || vendorData.categoryIds.length === 0) newErrors.categoryIds = 'Select at least one category';
    if (!vendorData.gstNumber?.trim()) newErrors.gstNumber = 'GST Number is required';
    
    if (!vendorData.verificationDocument) {
      newErrors.verificationDocument = 'Verification document is required';
    }
    if (!vendorData.logoUrl) {
      newErrors.logoUrl = 'Business logo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Please fix the validation errors below.' });
      return;
    }

    setSaving(true);

    try {
      const isNew = !vendorData.id;
      
      if (isNew) {
        const { 
            businessName, email, phone, gstNumber, aadhaarNumber, 
            city, categoryIds, description, address, socialLinks, 
            googleBusinessLink, workingHours, verificationDocument, logoUrl
        } = vendorData;

        const registrationData = {
            businessName, email, phone, gstNumber, aadhaarNumber,
            city, categoryIds, description, address, socialLinks,
            googleBusinessLink, workingHours, verificationDocument,
            logoUrl
        };

        const res = await apiFetch('/vendors/register-vendor', {
          method: 'POST',
          body: JSON.stringify(registrationData),
        });
        setVendorData({
          ...res.data,
          categoryIds: res.data.categories?.map((c: any) => c.id) || []
        });
        Swal.fire({ icon: 'success', title: 'Success', text: 'Profile created! Under review.' });
      } else {
        const { 
          businessName, email, phone, description, address, socialLinks, 
          googleBusinessLink, workingHours, categoryIds,
          gstNumber, aadhaarNumber, verificationDocument, logoUrl
        } = vendorData;
        
        const updateData = { 
          businessName, email, phone, description, address, socialLinks, 
          googleBusinessLink, workingHours, categoryIds,
          gstNumber, aadhaarNumber, verificationDocument, logoUrl
        };

        const res = await apiFetch('/vendors/me', {
          method: 'PUT',
          body: JSON.stringify(updateData),
        });
        setVendorData({
          ...res.data,
          categoryIds: res.data.categories?.map((c: any) => c.id) || []
        });
        Swal.fire({ icon: 'success', title: 'Success', text: 'Profile synced successfully!' });
        setIsEditing(false);
      }
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to sync identity' });
    } finally {
      setSaving(false);
    }
  };

  const getInputClass = (fieldName: string) => `w-full px-4 py-2.5 bg-gray-50 border ${errors[fieldName] ? 'border-red-500 focus:border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-[#164e33] focus:ring-1 focus:ring-[#164e33]'} rounded-lg focus:bg-white outline-none font-medium text-gray-900 text-sm transition-all`;

  if (loading) return (
    <div className="space-y-8 p-6 animate-pulse">
      <div className="flex justify-between items-center pb-6 border-b border-gray-100">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-96 bg-gray-100 rounded-lg"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[400px] bg-white border border-gray-100 rounded-lg"></div>
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-white border border-gray-100 rounded-lg"></div>
          <div className="h-64 bg-white border border-gray-100 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  if (!user && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center mb-4">
           <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-medium text-gray-900">Authentication Required</h2>
        <p className="text-gray-600 mt-2">Please login to access your business profile settings.</p>
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div className="space-y-6 animate-simple-fade pb-20 p-2 lg:p-6">
        {/* Header */}
        <div className="pb-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
              <h1 className="text-xl font-medium text-gray-900">Business Profile</h1>
              <p className="text-sm text-gray-500 mt-1">Your public business details.</p>
          </div>
          <button 
              onClick={() => setIsEditing(true)}
              className="h-10 px-5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium text-xs flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
          >
              Edit Profile
          </button>
        </div>

        {/* View Mode Content - Matches Screenshot Exactly */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Top Section */}
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                <div className="w-24 h-24 rounded-xl border border-gray-200 p-1 shrink-0 overflow-hidden bg-white">
                    {vendorData.logoUrl ? (
                        <img src={vendorData.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-medium">Logo</span>
                        </div>
                    )}
                </div>
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight break-all sm:break-normal">
                            {vendorData.businessName || 'Business Name'}
                        </h2>
                        {vendorData.verified && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                        )}
                        {vendorData.status && (
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                vendorData.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                vendorData.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                vendorData.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-200' :
                                'bg-blue-50 text-blue-600 border-blue-200'
                            }`}>
                                {vendorData.status}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm mb-4">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="lowercase">{vendorData.city || 'city not provided'}</span>
                    </div>
                    
                    {vendorData.categoryIds && vendorData.categoryIds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            {vendorData.categoryIds.map((id: any) => {
                                const cat: any = categories.find((c: any) => c.id === id);
                                if (!cat) return null;
                                return (
                                    <span key={id} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                        {cat.name}
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <hr className="border-t border-gray-100" />

            {/* Middle Section */}
            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Contact Info */}
                <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-6">Contact Info</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                            <span className="text-gray-900 text-sm font-medium break-all sm:break-normal">{vendorData.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                            <span className="text-gray-900 text-sm font-medium">{vendorData.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                            <span className="text-gray-900 text-sm font-medium leading-relaxed max-w-sm">{vendorData.address || 'Address not provided'}</span>
                        </div>
                    </div>
                </div>

                {/* Business Details */}
                <div className="p-6 md:p-8">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-6">Business Details</h3>
                    <div className="space-y-4 md:max-w-md w-full">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                            <span className="text-gray-600 text-sm font-medium">GST Number</span>
                            <span className="text-gray-900 text-sm font-medium break-all sm:break-normal">{vendorData.gstNumber || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                            <span className="text-gray-600 text-sm font-medium">Aadhaar/ID</span>
                            <span className="text-gray-900 text-sm font-medium break-all sm:break-normal">{vendorData.aadhaarNumber || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                            <span className="text-gray-600 text-sm font-medium">Office Hours</span>
                            <span className="text-gray-900 text-sm font-medium">{vendorData.workingHours || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {vendorData.description && (
                <>
                    <hr className="border-t border-gray-100" />
                    <div className="p-6 md:p-8">
                        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-4">About the Business</h3>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap max-w-4xl">
                            {vendorData.description}
                        </p>
                    </div>
                </>
            )}

            {/* Bottom Section */}
            {vendorData.verificationDocument && (
                <>
                    <hr className="border-t border-gray-100" />
                    <div className="p-6 md:p-8">
                        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-5">Verification Docs</h3>
                        <button 
                            onClick={() => setIsPreviewOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm"
                        >
                            <FileText className="w-4 h-4 text-gray-500" />
                            View Uploaded Proof
                        </button>
                    </div>
                </>
            )}
        </div>
        
        {isPreviewOpen && vendorData.verificationDocument && typeof document !== 'undefined' ? createPortal(
            <div 
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setIsPreviewOpen(false)}
            >
              <div 
                className="relative flex flex-col items-center justify-center w-full px-4"
                onClick={e => e.stopPropagation()}
              >
                <div className="relative inline-flex items-center justify-center">
                  <button 
                    onClick={() => setIsPreviewOpen(false)}
                    className="absolute top-2 right-2 md:-top-4 md:-right-4 z-[10000] p-2 bg-black text-white hover:bg-gray-900 rounded-full cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 border-white/20"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  {vendorData.verificationDocument.match(/\.(jpg|jpeg|png|webp)/i) ? (
                    <img src={vendorData.verificationDocument} alt="Verification Proof" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
                  ) : (
                    <iframe src={vendorData.verificationDocument} className="w-full md:w-[80vw] lg:w-[900px] h-[85vh] rounded-lg border-0 bg-white shadow-2xl" title="Verification PDF Proof" />
                  )}
                </div>
              </div>
            </div>,
            document.body
          ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-simple-fade pb-20 p-2 lg:p-6">
      {/* Small Header */}
      <div className="pb-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h1 className="text-xl font-medium text-gray-900">Business Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your public business details.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {vendorData.id && (
                <button 
                    onClick={() => {
                        setIsEditing(false);
                        setErrors({});
                    }}
                    type="button"
                    className="h-10 px-5 bg-gray-100 text-gray-700 rounded-lg font-medium text-xs hover:bg-gray-200 transition-colors w-full sm:w-auto flex items-center justify-center"
                >
                    Cancel
                </button>
            )}
            <button 
                onClick={handleUpdate}
                disabled={saving}
                className="h-10 px-6 bg-[#164e33] text-white rounded-lg font-medium text-xs flex items-center justify-center gap-2 hover:bg-[#113f29] transition-all shadow-sm disabled:opacity-50 w-full sm:w-auto"
            >
                {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Profile
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Section 1: Identity - Spans 2 Columns */}
        <section className="bg-white p-6 md:p-8 rounded-lg border border-gray-200 shadow-sm space-y-6 lg:col-span-2">
            <h3 className="text-sm font-medium text-gray-900 uppercase flex items-center gap-2 border-b border-gray-100 pb-4">
                <Building2 className="w-4 h-4 text-emerald-600" /> Basic Information
            </h3>

            {/* Profile/Logo Upload Section */}
            <div className={`flex flex-col md:flex-row items-center gap-6 pb-6 border-b ${errors.logoUrl ? 'border-red-100' : 'border-gray-50'}`}>
               <div className="relative group">
                  <div className={`w-24 h-24 rounded-lg bg-gray-50 border-2 border-dashed flex items-center justify-center overflow-hidden relative transition-all group-hover:border-blue-300 ${errors.logoUrl ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`}>
                    {vendorData.logoUrl ? (
                      <img src={vendorData.logoUrl} alt="Business Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-gray-500 mx-auto" />
                        <span className="text-sm text-gray-700 font-medium uppercase mt-1 block">Logo</span>
                      </div>
                    )}
                    
                    {uploadingLogo && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <RefreshCcw className="w-5 h-5 text-[#164e33] animate-spin" />
                      </div>
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 bg-white  border border-gray-100 p-2 rounded-lg text-[#164e33] hover:bg-[#164e33]/5"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <input 
                    type="file" 
                    ref={logoInputRef}
                    onChange={(e) => handleFileUpload(e, 'LOGO')}
                    className="hidden" 
                    accept="image/*"
                  />
               </div>
               <div className="text-center md:text-left">
                  <h4 className="text-sm font-medium text-gray-900">Business Logo <span className="text-red-500">*</span></h4>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">Visible on public profile & search. <br/><span className="font-medium text-[#164e33]">(Rec: 500x500px, Max: 1MB)</span></p>
                  {errors.logoUrl && <p className="text-red-500 text-xs font-medium mt-1">{errors.logoUrl}</p>}
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-gray-800 flex items-center gap-1.5 mb-1">
                         <Building2 className="w-3.5 h-3.5 text-[#164e33] opacity-60" /> Company Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        value={vendorData.businessName}
                        disabled={vendorData.status === 'VERIFIED'}
                        onChange={(e) => {
                            setVendorData({...vendorData, businessName: e.target.value});
                            if (errors.businessName) setErrors({...errors, businessName: null});
                        }}
                        className={`${getInputClass('businessName')} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
                    />
                    {errors.businessName && <p className="text-red-500 text-xs font-medium pl-1">{errors.businessName}</p>}
                </div>
                <div className="md:col-span-2 space-y-2.5 relative" ref={dropdownRef}>
                    <label className="text-sm font-medium text-gray-800 flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-[#164e33]" /> Business Categories <span className="text-red-500">*</span>
                    </label>
                    
                    {/* Selected Tags Display */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {vendorData.categoryIds?.map((id: any) => {
                            const cat: any = Array.isArray(categories) ? categories.find((c: any) => c.id === id) : null;
                            if (!cat) return null;
                            return (
                                <span 
                                    key={id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#164e33]/5 text-gray-800 border border-[#164e33]/10 rounded-full text-sm font-medium"
                                >
                                    {cat.name}
                                    {vendorData.status !== 'VERIFIED' && (
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const newCategories = vendorData.categoryIds.filter((cid: any) => cid !== id);
                                                setVendorData({ ...vendorData, categoryIds: newCategories });
                                                if (newCategories.length === 0 && !errors.categoryIds) {
                                                    setErrors({...errors, categoryIds: 'Select at least one category'});
                                                }
                                            }}
                                            className="hover:bg-blue-200 rounded-full p-0.5"
                                        >
                                            <AlertCircle className="w-3 h-3 rotate-45" />
                                        </button>
                                    )}
                                </span>
                            );
                        })}
                    </div>

                    {/* Search Input Toggle */}
                    <div className="relative group">
                        <input 
                            type="text" 
                            disabled={vendorData.status === 'VERIFIED'}
                            placeholder={vendorData.status === 'VERIFIED' ? "Categories are locked after verification" : "Search and select categories..."}
                            value={searchTerm}
                            onClick={() => setIsDropdownOpen(true)}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setIsDropdownOpen(true);
                            }}
                            className={`${getInputClass('categoryIds')} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
                        />
                        <button 
                           type="button"
                           disabled={vendorData.status === 'VERIFIED'}
                           onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Box className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {/* THE DROPDOWN LIST */}
                            {isDropdownOpen && (
                                <div 
                                    className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-lg  z-50 max-h-60 overflow-y-auto p-2 shadow-xl"
                                >
                                    {Array.isArray(categories) && categories
                                        .filter((c: any) => c.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((c: any) => {
                                            const isSelected = vendorData.categoryIds?.includes(c.id);
                                            return (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = vendorData.categoryIds || [];
                                                        const next = isSelected 
                                                            ? current.filter((id: any) => id !== c.id)
                                                            : [...current, c.id];
                                                        setVendorData({...vendorData, categoryIds: next});
                                                        if (next.length > 0 && errors.categoryIds) {
                                                            setErrors({...errors, categoryIds: null});
                                                        }
                                                        setSearchTerm('');
                                                    }}
                                                    className={`w-full px-4 py-2.5 rounded-lg text-left text-sm font-medium transition-all flex items-center justify-between group ${
                                                        isSelected 
                                                        ? 'bg-[#164e33]/5 text-gray-800' 
                                                        : 'hover:bg-gray-50 text-gray-800'
                                                    }`}
                                                >
                                                    {c.name}
                                                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#164e33]" />}
                                                </button>
                                            );
                                        })}
                                </div>
                            )}
                    </div>
                    {errors.categoryIds && <p className="text-red-500 text-xs font-medium pl-1 mt-1">{errors.categoryIds}</p>}
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-800 flex items-center gap-1.5 mb-1">
                        <Mail className="w-3.5 h-3.5 text-[#164e33] opacity-60" /> Business Email <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="email" 
                        value={vendorData.email}
                        disabled={vendorData.status === 'VERIFIED'}
                        onChange={(e) => {
                            setVendorData({...vendorData, email: e.target.value});
                            if (errors.email) setErrors({...errors, email: null});
                        }}
                        className={`${getInputClass('email')} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
                    />
                    {errors.email && <p className="text-red-500 text-xs font-medium pl-1">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-800 flex items-center gap-1.5 mb-1">
                         <Phone className="w-3.5 h-3.5 text-[#164e33] opacity-60" /> Official Mobile <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="tel" 
                        value={vendorData.phone}
                        disabled={vendorData.status === 'VERIFIED'}
                        onChange={(e) => {
                            setVendorData({...vendorData, phone: e.target.value});
                            if (errors.phone) setErrors({...errors, phone: null});
                        }}
                        className={`${getInputClass('phone')} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs font-medium pl-1">{errors.phone}</p>}
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-800 flex items-center gap-1.5 mb-1">
                        <Tag className="w-3.5 h-3.5 text-[#164e33] opacity-60" /> GST Number <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        value={vendorData.gstNumber}
                        disabled={vendorData.status === 'VERIFIED'}
                        onChange={(e) => {
                            setVendorData({...vendorData, gstNumber: e.target.value});
                            if (errors.gstNumber) setErrors({...errors, gstNumber: null});
                        }}
                        className={`${getInputClass('gstNumber')} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
                    />
                    {errors.gstNumber && <p className="text-red-500 text-xs font-medium pl-1">{errors.gstNumber}</p>}
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-800 flex items-center gap-1.5 mb-1">
                        <CreditCard className="w-3.5 h-3.5 text-[#164e33] opacity-60" /> Aadhaar / ID Number <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        value={vendorData.aadhaarNumber}
                        disabled={vendorData.status === 'VERIFIED'}
                        onChange={(e) => {
                            setVendorData({...vendorData, aadhaarNumber: e.target.value});
                            if (errors.aadhaarNumber) setErrors({...errors, aadhaarNumber: null});
                        }}
                        maxLength={12}
                        className={`${getInputClass('aadhaarNumber')} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
                    />
                    {errors.aadhaarNumber && <p className="text-red-500 text-xs font-medium pl-1">{errors.aadhaarNumber}</p>}
                </div>
            </div>
        </section>

        {/* Section 2: Verification Documents - Spans 1 Column */}
        <section className={`bg-white p-6 md:p-8 rounded-lg border shadow-sm space-y-6 ${errors.verificationDocument ? 'border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-gray-200'}`}>
            <h3 className="text-sm font-medium text-gray-900 uppercase flex items-center gap-2 border-b border-gray-100 pb-4">
                <Box className="w-4 h-4 text-emerald-600" /> Verification Docs
            </h3>
            
            <div className="space-y-5">
                <div className="pt-2">
                    <div className="mb-3">
                        <label className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                             <Upload className="w-3.5 h-3.5 text-[#164e33] opacity-60" /> JPG/PNG Proof <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Please upload your GST Certificate, MSME, Trade License, or Aadhaar Card. <strong className="text-gray-600">(Max 2MB)</strong></p>
                    </div>
                    
                    <div className={`p-4 border border-dashed rounded-lg transition-colors ${errors.verificationDocument ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'}`}>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center gap-3 text-center">
                            {!vendorData.verificationDocument ? (
                                <>
                                    <div className="p-2.5 bg-[#164e33]/5 text-[#164e33] rounded-full">
                                        <Upload className="w-4 h-4" />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingFile || vendorData.status === 'VERIFIED'}
                                        className="px-4 py-2 bg-[#164e33] text-white rounded-lg text-sm font-medium uppercase hover:bg-[#113f29] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploadingFile ? "Uploading..." : "Select File"}
                                    </button>
                                </>
                            ) : (
                                <div className="w-full space-y-3">
                                    <div className="flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-lg">
                                        <FileText className="w-3.5 h-3.5 text-[#164e33] shrink-0" />
                                        <p className="text-sm font-medium text-gray-700 truncate ml-2">Verification_Proof</p>
                                        <button 
                                           onClick={() => setVendorData({ ...vendorData, verificationDocument: '' })}
                                           disabled={vendorData.status === 'VERIFIED'}
                                           className="ml-auto p-1 text-gray-700 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-700"
                                        >
                                            <AlertCircle className="w-3.5 h-3.5 rotate-45" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button type="button" onClick={() => setIsPreviewOpen(true)} className="py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium uppercase flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                                            View
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => fileInputRef.current?.click()} 
                                            disabled={vendorData.status === 'VERIFIED'}
                                            className="py-2 bg-[#164e33]/5 text-[#164e33] rounded-lg text-sm font-medium uppercase flex items-center justify-center hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#164e33]/5"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {errors.verificationDocument && <p className="text-red-500 text-xs font-medium mt-2">{errors.verificationDocument}</p>}
                </div>
            </div>
        </section>

        {/* Section 3: Connectivity - Full Width Below or Side? Spans 3 columns */}
        <section className="bg-white p-6 md:p-8 rounded-lg border border-gray-200 shadow-sm space-y-6 lg:col-span-3">
            <h3 className="text-sm font-medium text-gray-900 uppercase flex items-center gap-2 border-b border-gray-100 pb-4">
                <Globe className="w-4 h-4 text-emerald-600" /> Professional Presence & Description
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                        <Linkedin className="w-3.5 h-3.5 text-gray-800" /> LinkedIn
                    </label>
                    <input 
                        type="text" 
                        value={vendorData.socialLinks?.linkedin || ''}
                        onChange={(e) => setVendorData({
                            ...vendorData, socialLinks: { ...vendorData.socialLinks, linkedin: e.target.value }
                        })}
                        placeholder="Profile URL"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-[#164e33] focus:ring-1 focus:ring-[#164e33] outline-none font-medium text-gray-900 text-sm transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                        <Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram
                    </label>
                    <input 
                        type="text" 
                        value={vendorData.socialLinks?.instagram || ''}
                        onChange={(e) => setVendorData({
                            ...vendorData, socialLinks: { ...vendorData.socialLinks, instagram: e.target.value }
                        })}
                        placeholder="Profile URL"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-[#164e33] focus:ring-1 focus:ring-[#164e33] outline-none font-medium text-gray-900 text-sm transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                        <Facebook className="w-3.5 h-3.5 text-[#164e33]" /> Facebook
                    </label>
                    <input 
                        type="text" 
                        value={vendorData.socialLinks?.facebook || ''}
                        onChange={(e) => setVendorData({
                            ...vendorData, socialLinks: { ...vendorData.socialLinks, facebook: e.target.value }
                        })}
                        placeholder="Page URL"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-[#164e33] focus:ring-1 focus:ring-[#164e33] outline-none font-medium text-gray-900 text-sm transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-emerald-600" /> G-Business
                    </label>
                    <input 
                        type="text" 
                        value={vendorData.googleBusinessLink || ''}
                        onChange={(e) => setVendorData({ ...vendorData, googleBusinessLink: e.target.value })}
                        placeholder="Map Link"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-[#164e33] focus:ring-1 focus:ring-[#164e33] outline-none font-medium text-gray-900 text-sm transition-all "
                    />
                </div>
            </div>
            
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-700" /> City <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                value={vendorData.city}
                                disabled={vendorData.status === 'VERIFIED'}
                                onChange={(e) => {
                                    setVendorData({...vendorData, city: e.target.value});
                                    if (errors.city) setErrors({...errors, city: null});
                                }}
                                className={`${getInputClass('city')} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
                                placeholder="e.g. Mumbai"
                            />
                            {errors.city && <p className="text-red-500 text-xs font-medium pl-1">{errors.city}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-700" /> Office Hours
                            </label>
                            <input 
                                type="text" 
                                value={vendorData.workingHours}
                                onChange={(e) => setVendorData({...vendorData, workingHours: e.target.value})}
                                placeholder="e.g. 9:00 AM - 6:00 PM"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-[#164e33] focus:ring-1 focus:ring-[#164e33] outline-none font-medium text-gray-900 text-sm transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-700 opacity-60" /> Full Address
                        </label>
                        <textarea 
                            value={vendorData.address}
                            onChange={(e) => setVendorData({...vendorData, address: e.target.value})}
                            rows={3}
                            placeholder="Enter your full business/office address..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-[#164e33] focus:ring-1 focus:ring-[#164e33] outline-none font-medium text-gray-900 text-sm transition-all resize-none "
                        />
                    </div>
                </div>
                <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-[#164e33]" /> About Your Business
                        </label>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Describe what makes your business unique, your main products or services, and your company mission. This helps buyers understand who you are.
                        </p>
                        <textarea 
                            value={vendorData.description}
                            onChange={(e) => setVendorData({...vendorData, description: e.target.value})}
                            rows={6}
                            placeholder="e.g., We are a leading manufacturer of premium quality industrial parts with over 10 years of experience..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#164e33] focus:ring-1 focus:ring-[#164e33] outline-none font-medium text-gray-900 text-sm transition-all resize-none"
                        />
                    </div>
                </div>
            </div>
        </section>
      </div>

        {isPreviewOpen && vendorData.verificationDocument && typeof document !== 'undefined' ? createPortal(
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setIsPreviewOpen(false)}
          >
            <div 
              className="relative flex flex-col items-center justify-center w-full px-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative inline-flex items-center justify-center">
                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="absolute top-2 right-2 md:-top-4 md:-right-4 z-[10000] p-2 bg-black text-white hover:bg-gray-900 rounded-full cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 border-white/20"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                {vendorData.verificationDocument.match(/\.(jpg|jpeg|png|webp)/i) ? (
                  <img src={vendorData.verificationDocument} alt="Verification Proof" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
                ) : (
                  <iframe src={vendorData.verificationDocument} className="w-full md:w-[80vw] lg:w-[900px] h-[85vh] rounded-lg border-0 bg-white shadow-2xl" title="Verification PDF Proof" />
                )}
              </div>
            </div>
          </div>,
          document.body
        ) : null}

    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Building2, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Clock,
  LayoutDashboard,
  Layers,
  Search,
  Filter,
  History,
  Activity,
  AlertCircle,
  Image as LucideImage,
  Box,
  Hash,
  RefreshCcw,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminApprovals() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const fetchPendingVendors = async () => {
    try {
      const data = await apiFetch('/admin/users?isActive=true');
      const unverified = data.data.users.filter((u: any) => u.vendor && !u.vendor.verified);
      setVendors(unverified);
    } catch (error) {
      console.error('Failed to fetch pending vendors:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleApprove = async (vendorId: string) => {
    try {
      await apiFetch(`/admin/vendors/${vendorId}/approve`, { method: 'PATCH' });
      setVendors(vendors.filter((v: any) => v.vendor.id !== vendorId));
      setSelectedVendor(null);
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleReject = async (vendorId: string) => {
    try {
      await apiFetch(`/admin/vendors/${vendorId}/reject`, { method: 'DELETE' });
      setVendors(vendors.filter((v: any) => v.vendor.id !== vendorId));
      setSelectedVendor(null);
    } catch (error) {
       console.error('Rejection failed:', error);
    }
  };

  if (loading) return <div className="p-10 animate-pulse bg-slate-50 rounded-lg h-80 border border-slate-100"></div>;

  return (
    <div className="space-y-8 animate-simple-fade pb-20 p-2 md:p-0">
      {/* Clean Approvals Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 mb-8 max-w-7xl mx-auto">
        <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight flex items-center gap-3">
              Vendor Approvals
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-lg">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">Pending Review</span>
              </div>
            </h1>
            <p className="text-slate-700 font-medium mt-1 text-sm">Review business credentials and approve new vendors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {/* Verification Queue: Clean Sidebar */}
        <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase  mb-2 ml-2">Queue ({vendors.length})</h3>
            <div className="space-y-2">
                {vendors.length > 0 ? vendors.map((user: any) => (
                    <button
                        key={user.id}
                        onClick={() => setSelectedVendor(user)}
                        className={`w-full text-left p-4 rounded-lg flex items-center gap-4 border transition-colors ${ selectedVendor?.id === user.id ? 'bg-[#164e33]/5 border-blue-200' : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50' }`}
                    >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm border  ${ selectedVendor?.id === user.id ? 'bg-white text-[#164e33] border-[#164e33]/10' : 'bg-gray-50 text-slate-800 border-gray-200' }`}>
                            {user.vendor?.businessName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold text-sm truncate leading-tight mb-0.5 ${selectedVendor?.id === user.id ? 'text-blue-900' : 'text-slate-900'}`}>{user.vendor?.businessName}</h4>
                            <p className={`text-sm font-medium capitalize truncate ${selectedVendor?.id === user.id ? 'text-[#164e33]' : 'text-slate-700'}`}>{user.vendor?.city}</p>
                        </div>
                    </button>
                )) : (
                    <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-slate-700" />
                        <p className="font-semibold text-slate-800 text-sm">No pending approvals</p>
                    </div>
                )}
            </div>
        </div>

        {/* Detailed Audit Node */}
        <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
                {selectedVendor ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        key={selectedVendor.id}
                        className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 space-y-8 "
                    >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-gray-100 pb-8">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-semibold text-slate-900  capitalize leading-none">{selectedVendor.vendor.businessName}</h2>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-slate-800 capitalize">
                                        <MapPin className="w-3.5 h-3.5 text-slate-700" />
                                        {selectedVendor.vendor.city}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-slate-800">
                                        <Layers className="w-3.5 h-3.5 text-slate-700" />
                                        ID: {selectedVendor.vendor.id.slice(0, 8)}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-slate-800">
                                        <Clock className="w-3.5 h-3.5 text-slate-700" />
                                        {new Date(selectedVendor.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => handleApprove(selectedVendor.vendor.id)}
                                    className="px-5 py-2.5 bg-[#164e33] text-white rounded-lg font-semibold text-sm hover:bg-[#113f29] transition-colors  flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Approve Vendor
                                </button>
                                <button 
                                   onClick={() => handleReject(selectedVendor.vendor.id)}
                                   className="p-2.5 bg-white border border-gray-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors " title="Reject Vendor"
                                >
                                   <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-5">
                                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                     <FileText className="w-4 h-4 text-slate-600" />
                                     Contact Information
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                        <span className="text-sm font-medium text-slate-700">Business Email</span>
                                        <span className="font-semibold text-slate-900 text-sm truncate max-w-[180px]">{selectedVendor.vendor.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                        <span className="text-sm font-medium text-slate-700">Status</span>
                                        <span className="font-semibold text-amber-600 text-sm">Pending Approval</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                     <Activity className="w-4 h-4 text-slate-600" />
                                     Summary
                                </h4>
                                <p className="text-sm text-slate-800 font-medium leading-relaxed">
                                     {selectedVendor.vendor.description || `${selectedVendor.vendor.businessName} has applied for vendor status. They operate in ${selectedVendor.vendor.city} and have completed their basic registration details.`}
                                </p>
                            </div>
                        </div>

                        {/* Products and Services Block */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                    <Box className="w-4 h-4 text-slate-600" />
                                    Declared Products
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedVendor.vendor.products?.map((p: any) => (
                                        <span key={p.id} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-slate-800 ">{p.name}</span>
                                    )) || <span className="text-sm text-slate-700 italic">No products declared</span>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-emerald-500" />
                                    Keywords
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedVendor.vendor.keywords?.map((k: any) => (
                                        <span key={k.id} className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-medium text-emerald-700">#{k.name}</span>
                                    )) || <span className="text-sm text-slate-700 italic">No keywords declared</span>}
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3 mt-4">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800 font-medium leading-relaxed">
                                Approving this vendor grants them immediate access to platform features. Please ensure all details comply with platform guidelines before approval.
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 h-full min-h-[500px] flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 mb-2">
                            <ShieldAlert className="w-8 h-8 text-gray-500" />
                        </div>
                        <div className="space-y-1">
                             <h3 className="text-base font-semibold text-slate-900">Review Pending Approvals</h3>
                             <p className="text-sm font-medium text-slate-700">Select a vendor from the queue to view details</p>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}




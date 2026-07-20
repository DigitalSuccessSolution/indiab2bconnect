"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  Search,
  Building2,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Mail,
  Smartphone,
  ShieldCheck,
  Edit2,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Swal from "sweetalert2";

export default function VendorApprovals() {
  const { hasPermission } = useAuth();
  
  const canEdit = hasPermission('vendors_update');
  const canDelete = hasPermission('vendors_delete');
  const canApprove = hasPermission('vendors_approve');
  const canReject = hasPermission('vendors_reject');

  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [city, setCity] = useState("All Cities");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [timeRange, setTimeRange] = useState("ALL");
  
  const [cities, setCities] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalEntries, setTotalEntries] = useState(0);

  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  
  // Manual Boost State
  const [isBoostOpen, setIsBoostOpen] = useState(false);
  const [boostInput, setBoostInput] = useState<number | "">(0);

  useEffect(() => {
    fetchCities();
    fetchCategories();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [timeRange, statusFilter, searchTerm, city, categoryFilter]);

  // Fetch with debounce for search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchVendors();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [timeRange, statusFilter, searchTerm, city, categoryFilter, page]);

  const fetchCategories = async () => {
    try {
      const data = await apiFetch("/categories");
      setCategories(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCities = async () => {
    try {
      const data = await apiFetch("/vendors/cities");
      setCities(data.success ? data.data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("status", statusFilter); 
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (searchTerm) params.append("search", searchTerm);
      if (city !== "All Cities") params.append("city", city);
      if (categoryFilter !== "ALL") params.append("categoryId", categoryFilter);
      if (timeRange !== "ALL") params.append("timeRange", timeRange);

      const data = await apiFetch(`/admin/vendors/pending?${params.toString()}`);
      setVendors(data.data?.vendors || []);
      setTotalEntries(data.data?.total || 0);

      if (selectedVendor) {
        const updated = (data.data?.vendors || []).find((v: any) => v.id === selectedVendor.id);
        if (updated) setSelectedVendor(updated);
      }
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, action: "APPROVE" | "REJECT", predefinedReason?: string) => {
    let reason = predefinedReason || "";

    const actionText = action === "APPROVE" ? "approve" : "reject";
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You want to ${actionText} this vendor application?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: action === "APPROVE" ? '#164e33' : '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${actionText}!`,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          if (action === "APPROVE") {
            await apiFetch(`/admin/vendors/${id}/approve`, { method: "PATCH" });
          } else {
            await apiFetch(`/admin/vendors/${id}/reject`, { 
              method: "DELETE",
              body: JSON.stringify({ reason }) 
            });
          }
          return true;
        } catch (error: any) {
          Swal.showValidationMessage(error.message || 'Failed to update status.');
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed) {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Vendor application ${action === "APPROVE" ? "approved" : "rejected"} successfully.`,
        timer: 1500,
        showConfirmButton: false
      });
      fetchVendors();
      setIsDetailOpen(false);
      setSelectedVendor(null);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          await apiFetch(`/admin/vendors/${id}`, { method: "DELETE" });
          return true;
        } catch (error: any) {
          Swal.showValidationMessage(error.message || 'Failed to delete');
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed) {
      Swal.fire('Deleted!', 'The vendor has been deleted.', 'success');
      setVendors(prev => prev.filter(v => v.id !== id));
      fetchVendors();
    }
  };

  const handleEdit = (vendor: any) => {
    setSelectedVendor(vendor);
    setEditForm({
      businessName: vendor.businessName || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      address: vendor.address || "",
      city: vendor.city || "",
      gstNumber: vendor.gstNumber || "",
      aadhaarNumber: vendor.aadhaarNumber || "",
      googleBusinessLink: vendor.googleBusinessLink || "",
      workingHours: vendor.workingHours || "",
      logoUrl: vendor.logoUrl || "",
      verificationDocument: vendor.verificationDocument || "",
      status: vendor.status || "PENDING",
      categoryIds: vendor.categories?.map((c: any) => c.id) || [],
      description: vendor.description || ""
    });
    setIsEditOpen(true);
  };

  const submitEdit = async () => {
    setProcessingId("EDITING");
    try {
      await apiFetch(`/admin/vendors/${selectedVendor.id}`, {
        method: "PATCH",
        body: JSON.stringify(editForm),
      });
      Swal.fire('Updated!', 'Vendor details have been updated.', 'success');
      setIsEditOpen(false);
      fetchVendors();
    } catch (error: any) {
      Swal.fire('Error', error.message || 'Failed to update vendor', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleBoostSubmit = async () => {
    if (!selectedVendor) return;
    setProcessingId("BOOSTING");
    try {
      await apiFetch(`/admin/vendors/${selectedVendor.id}/boost`, {
        method: "PATCH",
        body: JSON.stringify({ boostScore: Number(boostInput) }),
      });
      Swal.fire('Boost Applied!', `Vendor has been boosted by ${boostInput} points.`, 'success');
      setIsBoostOpen(false);
      fetchVendors();
    } catch (error: any) {
      Swal.fire('Error', error.message || 'Failed to apply boost', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'verificationDocument') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProcessingId(`UPLOADING_${field}`);
      const formData = new FormData();
      formData.append("image", file);

      const res = await apiFetch("/vendors/upload-image", {
        method: "POST",
        body: formData,
      });

      if (res.data?.url) {
        setEditForm((prev: any) => ({
          ...prev,
          [field]: res.data.url
        }));
      }
    } catch (error: any) {
      Swal.fire('Error', error.message || 'File upload failed', 'error');
    } finally {
      setProcessingId(null);
      e.target.value = '';
    }
  };

  const handleBadgeUpdate = async (id: string, badge: string) => {
    setProcessingId(`badge-${id}`);
    try {
      await apiFetch(`/admin/vendors/${id}/badge`, {
        method: "PATCH",
        body: JSON.stringify({ trustBadge: badge }),
      });
      setSelectedVendor({ ...selectedVendor, trustBadge: badge });
      fetchVendors();
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Trust badge updated successfully.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error("Failed to update vendor badge:", error);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: error.message || 'Failed to update trust badge.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const totalPages = Math.ceil(totalEntries / limit) || 1;

  return (
    <div className="w-full h-full pb-20">
      <div className="space-y-4 md:space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">Vendor Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">Review and manage vendor applications and partnerships.</p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col lg:flex-row items-center gap-3 w-full">
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-0 focus:border-gray-300 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 lg:flex lg:flex-nowrap items-center gap-3 w-full overflow-hidden">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full lg:w-40 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-0 focus:border-gray-300 transition-colors cursor-pointer"
            >
              <option value="PENDING">Pending Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
              <option value="ALL">All Applications</option>
            </select>

            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full lg:w-40 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-0 focus:border-gray-300 transition-colors cursor-pointer"
            >
              <option value="All Cities">All Cities</option>
              {cities.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full lg:w-48 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-0 focus:border-gray-300 transition-colors cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full lg:w-40 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-0 focus:border-gray-300 transition-colors cursor-pointer"
            >
              <option value="ALL">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Info</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied On</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-6 bg-gray-50/30"></td>
                    </tr>
                  ))
                ) : vendors.length > 0 ? (
                  vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 text-gray-400 font-bold">
                            {vendor.logo || vendor.logoUrl ? (
                              <img
                                src={vendor.logo || vendor.logoUrl}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            ) : (
                              (vendor.businessName || vendor.user?.name)?.charAt(0) || <Building2 size={16} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                              {vendor.businessName || vendor.user?.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              GST: {vendor.gstNumber || "PENDING"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{vendor.city || "India"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            vendor.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : vendor.status === "VERIFIED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {vendor.status === "VERIFIED" ? "Verified" : vendor.status === "REJECTED" ? "Rejected" : "Pending Review"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(vendor.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setRejectionReasonInput("");
                              setIsDetailOpen(true);
                            }}
                            title="View Details"
                            className="text-gray-400 hover:text-[#164e33] transition-colors"
                          >
                            <Eye size={18} />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => {
                                setSelectedVendor(vendor);
                                setBoostInput(vendor.manualBoost || 0);
                                setIsBoostOpen(true);
                              }}
                              title="Manual Boost"
                              className="text-gray-400 hover:text-yellow-600 transition-colors"
                            >
                              <TrendingUp size={18} />
                            </button>
                          )}
                          {canEdit && (
                            <button
                              onClick={() => handleEdit(vendor)}
                              title="Edit"
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(vendor.id)}
                              title="Delete"
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No vendor applications found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
            <span className="text-sm text-[#344054]">
              Showing {totalEntries === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, totalEntries)} of {totalEntries} results
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-700 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, idx) => {
                  const p = idx + 1;
                  if (totalPages > 5 && p !== 1 && p !== totalPages && Math.abs(page - p) > 1) {
                    if (p === 2 || p === totalPages - 1) return <span key={p} className="px-1 text-gray-400">...</span>;
                    return null;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        page === p
                          ? "bg-[#164e33] text-white border border-[#164e33]"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-700 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Detail Slide-over Panel */}
        {isDetailOpen && selectedVendor && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsDetailOpen(false)} />
            
            <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-slide-in-right">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-[#164e33]" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">Review Vendor Application</h2>
                </div>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Business Info Header */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 text-xl font-bold text-gray-400">
                      {selectedVendor.logoUrl || selectedVendor.logo ? (
                        <img src={selectedVendor.logoUrl || selectedVendor.logo} className="w-full h-full object-cover" alt="" />
                      ) : (
                        (selectedVendor.businessName || selectedVendor.user?.name)?.charAt(0) || "V"
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{selectedVendor.businessName || selectedVendor.user?.name}</h3>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Mail size={14} /> {selectedVendor.user?.email}
                            </span>
                            <span className="flex items-center gap-1.5 text-sm text-gray-600">
                              <MapPin size={14} /> {selectedVendor.city || "India"}
                            </span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedVendor.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : selectedVendor.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {selectedVendor.status === 'VERIFIED' ? 'Verified' : selectedVendor.status === 'REJECTED' ? 'Rejected' : 'Pending Review'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>


                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <Smartphone size={16} className="text-gray-400" />
                      {selectedVendor.phone || "Not provided"}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
                    <p className="font-semibold text-gray-900">
                      {selectedVendor.address || "Location details pending"}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">GSTIN</h3>
                    <p className="font-semibold text-gray-900">
                      {selectedVendor.gstNumber || "VERIFIED"}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Aadhaar</h3>
                    <p className="font-semibold text-gray-900">
                      {selectedVendor.aadhaarNumber || "AUTHENTICATED"}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Working Hours</h3>
                    <p className="font-semibold text-gray-900">
                      {selectedVendor.workingHours || "Not specified"}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Google Business</h3>
                    <p className="font-semibold text-gray-900 truncate">
                      {selectedVendor.googleBusinessLink ? (
                        <a href={selectedVendor.googleBusinessLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Open Link</a>
                      ) : "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Business Description */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Business Description</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-lg border border-gray-200">
                    {selectedVendor.description || "No business description provided."}
                  </p>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Industry Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVendor.categories?.length > 0 ? (
                      selectedVendor.categories.map((c: any) => (
                        <span key={c.id} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                          {c.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500 italic">None selected</span>
                    )}
                  </div>
                </div>

                {/* Verification Document */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Verification Document</h3>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center">
                    {selectedVendor.verificationDocument ? (
                      <a href={selectedVendor.verificationDocument} target="_blank" rel="noreferrer" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                        {selectedVendor.verificationDocument.toLowerCase().endsWith('.pdf') ? (
                          <div className="h-16 w-16 rounded border border-gray-200 bg-gray-100 flex items-center justify-center font-bold text-red-500 text-xs">PDF</div>
                        ) : (
                          <img src={selectedVendor.verificationDocument} alt="Verification Doc" className="h-16 w-16 rounded object-cover border border-gray-200" />
                        )}
                        <span className="text-sm font-medium text-blue-600 hover:underline">Click to View Document</span>
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500 italic">No document uploaded</span>
                    )}
                  </div>
                </div>


                {/* Trust Badge Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Trust Badge (Verification Tier)</h3>
                  <div className="p-4 bg-white border border-gray-200 rounded-lg flex items-center gap-4">
                    <ShieldCheck size={24} className={selectedVendor.trustBadge === 'NONE' || !selectedVendor.trustBadge ? 'text-gray-300' : selectedVendor.trustBadge === 'GOLD_SUPPLIER' ? 'text-yellow-500' : selectedVendor.trustBadge === 'TRUST_SEAL' ? 'text-blue-500' : 'text-[#164e33]'} />
                    <div className="flex-1">
                      <select
                        value={selectedVendor.trustBadge || 'NONE'}
                        onChange={(e) => handleBadgeUpdate(selectedVendor.id, e.target.value)}
                        disabled={processingId === `badge-${selectedVendor.id}`}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 outline-none focus:border-[#164e33] transition-all"
                      >
                        <option value="NONE">No Badge</option>
                        <option value="VERIFIED">Verified Vendor</option>
                        <option value="GOLD_SUPPLIER">Gold Supplier</option>
                        <option value="TRUST_SEAL">TrustSEAL Assured</option>
                      </select>
                      {processingId === `badge-${selectedVendor.id}` && <span className="text-xs text-[#164e33] mt-1 inline-block">Updating...</span>}
                    </div>
                  </div>
                </div>

                {/* Rejection Reason View (Displayed at the end) */}
                {selectedVendor.status === 'REJECTED' && selectedVendor.rejectionReason && (
                   <div className="bg-red-50 p-4 rounded-lg border border-red-200 mt-4 flex gap-3">
                     <div className="mt-0.5 text-red-500"><X size={18} /></div>
                     <div>
                       <h3 className="text-sm font-bold text-red-800 mb-1">Rejection Reason</h3>
                       <p className="text-sm text-red-700">{selectedVendor.rejectionReason}</p>
                     </div>
                   </div>
                )}
              </div>

              {/* Footer Actions */}
              {(canApprove || canReject) && (
                <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
                  {canReject && selectedVendor.status !== "REJECTED" && (
                     <div className="w-full">
                       <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason (if rejecting)</label>
                       <textarea
                         value={rejectionReasonInput}
                         onChange={(e) => setRejectionReasonInput(e.target.value)}
                         placeholder="Type reason here before rejecting..."
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33] text-sm"
                         rows={2}
                       />
                     </div>
                  )}
                  <div className="flex items-center justify-end gap-3">
                    {canReject && selectedVendor.status !== "REJECTED" && (
                      <button
                        onClick={() => handleStatusUpdate(selectedVendor.id, "REJECT", rejectionReasonInput)}
                        disabled={processingId === selectedVendor.id}
                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}
                    {canApprove && selectedVendor.status !== "VERIFIED" && (
                      <button
                        onClick={() => handleStatusUpdate(selectedVendor.id, "APPROVE")}
                        disabled={processingId === selectedVendor.id}
                        className="px-4 py-2 bg-[#164e33] text-white rounded-lg font-medium hover:bg-[#113f29] transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {processingId === selectedVendor.id ? "Processing..." : "Approve"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditOpen && selectedVendor && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsEditOpen(false)} />
            
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden m-4 animate-scale-in">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Edit Vendor</h2>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <input
                      type="text"
                      value={editForm.businessName}
                      onChange={(e) => setEditForm({...editForm, businessName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33]"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <input
                      type="text"
                      value={editForm.gstNumber}
                      onChange={(e) => setEditForm({...editForm, gstNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                    <input
                      type="text"
                      value={editForm.aadhaarNumber}
                      onChange={(e) => setEditForm({...editForm, aadhaarNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Business Link</label>
                    <input
                      type="url"
                      value={editForm.googleBusinessLink}
                      onChange={(e) => setEditForm({...editForm, googleBusinessLink: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
                    <input
                      type="text"
                      placeholder="e.g. 9 AM - 6 PM"
                      value={editForm.workingHours}
                      onChange={(e) => setEditForm({...editForm, workingHours: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33] bg-white"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="VERIFIED">VERIFIED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                    <div className="flex gap-3 items-center">
                      {editForm.logoUrl && (
                        <a href={editForm.logoUrl} target="_blank" rel="noreferrer" title="Click to view full image">
                          <img src={editForm.logoUrl} alt="Logo" className="h-10 w-10 rounded object-cover border border-gray-200 hover:opacity-80 transition-opacity" />
                        </a>
                      )}
                      <label className="relative cursor-pointer px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-200 transition-colors flex-1 text-center">
                        {processingId === "UPLOADING_logoUrl" ? "Uploading..." : "Upload Logo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'logoUrl')}
                          disabled={processingId === "UPLOADING_logoUrl"}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verification Document</label>
                    <div className="flex gap-3 items-center">
                      {editForm.verificationDocument && (
                        <a href={editForm.verificationDocument} target="_blank" rel="noreferrer" title="Click to view full document">
                          {editForm.verificationDocument.toLowerCase().endsWith('.pdf') ? (
                            <div className="h-10 w-10 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-xs font-bold text-red-500 hover:bg-gray-200 transition-colors">PDF</div>
                          ) : (
                            <img src={editForm.verificationDocument} alt="Document" className="h-10 w-10 rounded object-cover border border-gray-200 hover:opacity-80 transition-opacity" />
                          )}
                        </a>
                      )}
                      <label className="relative cursor-pointer px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-200 transition-colors flex-1 text-center">
                        {processingId === "UPLOADING_verificationDocument" ? "Uploading..." : "Upload Document"}
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'verificationDocument')}
                          disabled={processingId === "UPLOADING_verificationDocument"}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                      {categories.map((cat: any) => (
                        <label key={cat.id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={editForm.categoryIds?.includes(cat.id) || false}
                            onChange={(e) => {
                              const newIds = e.target.checked 
                                ? [...(editForm.categoryIds || []), cat.id]
                                : (editForm.categoryIds || []).filter((id: string) => id !== cat.id);
                              setEditForm({...editForm, categoryIds: newIds});
                            }}
                            className="rounded border-gray-300 text-[#164e33] focus:ring-[#164e33]"
                          />
                          {cat.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows={4}
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33]"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsEditOpen(false)}
                  disabled={processingId === "EDITING"}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitEdit}
                  disabled={processingId === "EDITING"}
                  className="px-4 py-2 bg-[#164e33] text-white rounded-lg font-medium hover:bg-[#113f29] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {processingId === "EDITING" ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Boost Modal */}
        {isBoostOpen && selectedVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Manual Boost</h3>
                    <p className="text-sm text-gray-500">Boost ranking score</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBoostOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 mb-6">
                  Applying a manual boost to <strong>{selectedVendor.businessName || selectedVendor.user?.name}</strong> will increase their total score, overriding the algorithm and pushing them higher in search results.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Boost Score
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={boostInput}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setBoostInput('');
                        return;
                      }
                      let val = Number(e.target.value);
                      if (val < 0) val = 0;
                      if (val > 500) val = 500;
                      setBoostInput(val);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e') {
                        e.preventDefault();
                      }
                    }}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all font-medium text-gray-900"
                    placeholder="e.g. 50 (Max: 500)"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Current Score: <strong>{selectedVendor.totalScore || 0}</strong>
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsBoostOpen(false)}
                  disabled={processingId === "BOOSTING"}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBoostSubmit}
                  disabled={processingId === "BOOSTING"}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {processingId === "BOOSTING" ? "Applying..." : "Apply Boost"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

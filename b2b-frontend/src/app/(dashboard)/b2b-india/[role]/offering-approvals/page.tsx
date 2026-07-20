"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  Search,
  Package,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  Plus,
  MinusCircle
} from "lucide-react";
import Swal from "sweetalert2";

export default function OfferingApprovals() {
  const { hasPermission } = useAuth();
  
  const canEdit = hasPermission('products_update');
  const canDelete = hasPermission('products_delete');
  const canApprove = hasPermission('products_approve');
  const canReject = hasPermission('products_reject');

  const [offerings, setOfferings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [timeRange, setTimeRange] = useState("ALL");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  const [selectedOffering, setSelectedOffering] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [specsList, setSpecsList] = useState<{key: string, value: string}[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [timeRange, statusFilter, typeFilter, searchTerm]);

  // Fetch with debounce for search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchOfferings();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [timeRange, statusFilter, typeFilter, searchTerm, page]);

  const fetchOfferings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (timeRange !== "ALL") params.append("timeRange", timeRange);
      
      params.append("page", page.toString());
      params.append("limit", "20");

      const data = await apiFetch(`/admin/offerings?${params.toString()}`);
      const fetchedOfferings = data.data?.offerings || [];
      setOfferings(fetchedOfferings);
      setTotalPages(data.data?.totalPages || 1);
      setTotalEntries(data.data?.total || 0);
      
      if (selectedOffering) {
        const updated = fetchedOfferings.find((o: any) => o.id === selectedOffering.id);
        if (updated) setSelectedOffering(updated);
      }
    } catch (error) {
      console.error("Failed to fetch offerings:", error);
    } finally {
      setLoading(false);
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
          await apiFetch(`/admin/offerings/${id}`, { method: "DELETE" });
          return true;
        } catch (error: any) {
          Swal.showValidationMessage(error.message || 'Failed to delete');
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed) {
      Swal.fire('Deleted!', 'The offering has been deleted.', 'success');
      setOfferings(prev => prev.filter(o => o.id !== id));
      if (selectedOffering?.id === id) setIsDetailOpen(false);
      fetchOfferings();
    }
  };

  const handleEdit = (offer: any) => {
    setSelectedOffering(offer);
    setEditForm({
      name: offer.name || "",
      price: offer.price || 0,
      moq: offer.moq || 1,
      description: offer.description || "",
      type: offer.type || "PRODUCT",
      category: offer.category || "",
      availability: offer.availability ?? true,
      sku: offer.sku || "",
      keywords: offer.keywords ? offer.keywords.join(", ") : "",
      images: offer.images || []
    });
    
    let specs = [];
    try {
      if (offer.specifications) {
        specs = JSON.parse(offer.specifications);
        if (!Array.isArray(specs)) specs = [];
      }
    } catch (e) {
      specs = [];
    }
    setSpecsList(specs);
    setIsEditOpen(true);
  };

  const submitEdit = async () => {
    const finalPrice = Number(editForm.price);
    const finalMoq = Number(editForm.moq);

    if (isNaN(finalPrice) || finalPrice < 0) {
      Swal.fire('Error', 'Price must be a valid number and cannot be negative.', 'error');
      return;
    }
    if (isNaN(finalMoq) || finalMoq < 1) {
      Swal.fire('Error', 'Minimum Order Quantity must be at least 1.', 'error');
      return;
    }

    setProcessingId("EDITING");
    try {
      const payload = {
        ...editForm,
        price: finalPrice,
        moq: finalMoq,
        keywords: editForm.keywords ? editForm.keywords.split(",").map((k: string) => k.trim()).filter(Boolean) : [],
        specifications: JSON.stringify(specsList)
      };
      await apiFetch(`/admin/offerings/${selectedOffering.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      Swal.fire('Updated!', 'Offering updated successfully.', 'success');
      setIsEditOpen(false);
      setOfferings(prev => prev.map(o => o.id === selectedOffering.id ? { ...o, ...payload } : o));
      if (selectedOffering) setSelectedOffering({ ...selectedOffering, ...payload });
      fetchOfferings();
    } catch (error: any) {
      Swal.fire('Error', error.message || 'Failed to update', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProcessingId("UPLOADING_IMAGE");
      const formData = new FormData();
      formData.append("image", file);

      const res = await apiFetch("/vendors/upload-image", {
        method: "POST",
        body: formData,
      });

      if (res.data?.url) {
        setEditForm((prev: any) => ({
          ...prev,
          images: [...(prev.images || []), res.data.url]
        }));
      }
    } catch (error: any) {
      Swal.fire('Error', error.message || 'Image upload failed', 'error');
    } finally {
      setProcessingId(null);
      e.target.value = '';
    }
  };

  const handleStatusUpdate = async (id: string, status: "APPROVED" | "REJECTED", predefinedReason?: string) => {
    const actionText = status === "APPROVED" ? "approve" : "reject";
    let reason = predefinedReason || "";

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You want to ${actionText} this offering?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: status === "APPROVED" ? '#164e33' : '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${actionText}!`,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const endpoint = status === "APPROVED" ? "approve" : "reject";
          await apiFetch(`/admin/offerings/${id}/${endpoint}`, {
            method: "PATCH",
            body: JSON.stringify({ reason }),
          });
          return true;
        } catch (error: any) {
          Swal.showValidationMessage(error.message || `Failed to ${actionText} offering.`);
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed) {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Offering ${actionText}d successfully.`,
        timer: 1500,
        showConfirmButton: false
      });
      
      if (statusFilter !== "ALL") {
        setOfferings(prev => prev.filter(o => o.id !== id));
      } else {
        setOfferings(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      }
      if (selectedOffering?.id === id) setSelectedOffering({ ...selectedOffering, status });

      fetchOfferings();
      setIsDetailOpen(false);
    }
  };

  return (
    <div className="w-full h-full pb-20">
      <div className="space-y-4 md:space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">Offering Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">Review and manage products and services listed by vendors.</p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <div className="relative w-full sm:w-80 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#164e33] transition-shadow cursor-pointer min-w-[120px]"
            >
              <option value="ALL">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Last 30 Days</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#164e33] transition-shadow cursor-pointer min-w-[120px]"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#164e33] transition-shadow cursor-pointer min-w-[120px]"
            >
              <option value="ALL">All Types</option>
              <option value="PRODUCT">Products</option>
              <option value="SERVICE">Services</option>
            </select>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price / MOQ</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Listed On</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-6 bg-gray-50/30"></td>
                    </tr>
                  ))
                ) : offerings.length > 0 ? (
                  offerings.map((offer) => (
                    <tr key={offer.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                            {offer.images?.[0] || offer.imageUrl ? (
                              <img
                                src={offer.images?.[0] || offer.imageUrl}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            ) : (
                              <Package className="text-gray-400" size={16} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{offer.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {offer.type || "PRODUCT"} • {offer.category || "General"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                            {offer.vendor?.logo || offer.vendor?.logoUrl ? (
                              <img
                                src={offer.vendor?.logo || offer.vendor?.logoUrl}
                                className="w-full h-full object-cover rounded-full"
                                alt=""
                              />
                            ) : (
                              offer.vendor?.businessName?.charAt(0) || "V"
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">{offer.vendor?.businessName}</p>
                            <p className="text-xs text-gray-500">{offer.vendor?.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">₹{offer.price?.toLocaleString() || "N/A"}</p>
                        <p className="text-xs text-gray-500 mt-0.5">MOQ: {offer.moq || 1}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            offer.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : offer.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {offer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => {
                              setSelectedOffering(offer);
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
                              onClick={() => handleEdit(offer)}
                              title="Edit"
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(offer.id)}
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
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No offerings found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
            <span className="text-sm text-[#344054]">
              Showing {totalEntries === 0 ? 0 : (page - 1) * 20 + 1} to {Math.min(page * 20, totalEntries)} of {totalEntries} results
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
                {[...Array(totalPages || 1)].map((_, idx) => {
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
        {isDetailOpen && selectedOffering && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsDetailOpen(false)} />
            
            <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl flex flex-col animate-slide-in-right">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Review Offering</h2>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Images */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Images</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                    {selectedOffering.images && selectedOffering.images.length > 0 ? (
                      selectedOffering.images.map((img: string, idx: number) => (
                        <img key={idx} src={img} alt="" className="h-40 w-auto rounded-lg border border-gray-200 object-cover snap-center" />
                      ))
                    ) : selectedOffering.imageUrl ? (
                      <img src={selectedOffering.imageUrl} alt="" className="h-40 w-auto rounded-lg border border-gray-200 object-cover" />
                    ) : (
                      <div className="h-40 w-60 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <Package className="text-gray-400" size={32} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{selectedOffering.type}</span>
                      <h3 className="text-xl font-semibold text-gray-800 mt-1">{selectedOffering.name}</h3>
                      <p className="text-sm text-[#164e33] font-medium mt-1">{selectedOffering.category || "General Category"}</p>
                    </div>
                    <span className={`shrink-0 whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold ${selectedOffering.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {selectedOffering.availability ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Price</p>
                      <p className="text-lg font-semibold text-gray-900">₹{selectedOffering.price?.toLocaleString() || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Minimum Order Quantity (MOQ)</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedOffering.moq || 1} Units</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-lg border border-gray-200">
                    {selectedOffering.description || "No description provided."}
                  </p>
                </div>



                {/* SKU and Keywords View */}
                {(selectedOffering.sku || (selectedOffering.keywords && selectedOffering.keywords.length > 0)) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedOffering.sku && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">SKU</h3>
                        <p className="font-semibold text-gray-900">{selectedOffering.sku}</p>
                      </div>
                    )}
                    {selectedOffering.keywords && selectedOffering.keywords.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedOffering.keywords.map((kw: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}


                {/* Specifications View */}
                {selectedOffering.specifications && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Specifications</h3>
                    {(() => {
                      try {
                        const parsedSpecs = JSON.parse(selectedOffering.specifications);
                        if (Array.isArray(parsedSpecs) && parsedSpecs.length > 0) {
                          return (
                            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                              <table className="min-w-full divide-y divide-gray-200">
                                <tbody className="divide-y divide-gray-200 bg-white">
                                  {parsedSpecs.map((spec: any, idx: number) => (
                                    <tr key={idx}>
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50/50 w-1/3">
                                        {spec.key || spec.name}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600">
                                        {spec.value}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        }
                        return (
                          <p className="text-sm text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {selectedOffering.specifications}
                          </p>
                        );
                      } catch (e) {
                        return (
                          <p className="text-sm text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {selectedOffering.specifications}
                          </p>
                        );
                      }
                    })()}
                  </div>
                )}

                {/* Vendor Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Vendor Details</h3>
                  <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {selectedOffering.vendor?.logo || selectedOffering.vendor?.logoUrl ? (
                        <img src={selectedOffering.vendor?.logo || selectedOffering.vendor?.logoUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="text-blue-700 font-bold">{selectedOffering.vendor?.businessName?.charAt(0) || "V"}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedOffering.vendor?.businessName}</p>
                      <p className="text-sm text-gray-500">{selectedOffering.vendor?.city}</p>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason View (Displayed at the end) */}
                {selectedOffering.status === 'REJECTED' && selectedOffering.rejectionReason && (
                   <div className="bg-red-50 p-4 rounded-lg border border-red-200 mt-4 flex gap-3">
                     <div className="mt-0.5 text-red-500"><X size={18} /></div>
                     <div>
                       <h3 className="text-sm font-bold text-red-800 mb-1">Rejection Reason</h3>
                       <p className="text-sm text-red-700">{selectedOffering.rejectionReason}</p>
                     </div>
                   </div>
                )}
              </div>

              {/* Footer Actions */}
              {(canApprove || canReject) && (
                <div className="flex flex-col gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
                  {canReject && selectedOffering.status !== "REJECTED" && (
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
                    {canReject && selectedOffering.status !== "REJECTED" && (
                      <button
                        onClick={() => handleStatusUpdate(selectedOffering.id, "REJECTED", rejectionReasonInput)}
                        disabled={processingId === selectedOffering.id}
                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}
                    {canApprove && selectedOffering.status !== "APPROVED" && (
                      <button
                        onClick={() => handleStatusUpdate(selectedOffering.id, "APPROVED")}
                        disabled={processingId === selectedOffering.id}
                        className="px-4 py-2 bg-[#164e33] text-white rounded-lg font-medium hover:bg-[#113f29] transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {processingId === selectedOffering.id ? "Processing..." : "Approve"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditOpen && selectedOffering && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsEditOpen(false)} />
            
            <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden m-4 animate-scale-in">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Edit Offering</h2>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product/Service Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33]"
                    >
                      <option value="PRODUCT">Product</option>
                      <option value="SERVICE">Service</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.price}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
                      }}
                      onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Quantity (MOQ)</label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.moq}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
                      }}
                      onChange={(e) => setEditForm({...editForm, moq: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input
                      type="text"
                      value={editForm.sku}
                      onChange={(e) => setEditForm({...editForm, sku: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma separated)</label>
                    <input
                      type="text"
                      value={editForm.keywords}
                      onChange={(e) => setEditForm({...editForm, keywords: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33]"
                    />
                  </div>
                </div>

                {/* Images Edit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-3">
                    {editForm.images?.map((img: string, idx: number) => (
                      <div key={idx} className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden group">
                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          onClick={() => {
                            const newImages = [...editForm.images];
                            newImages.splice(idx, 1);
                            setEditForm({ ...editForm, images: newImages });
                          }}
                          className="absolute inset-0 bg-black/50 items-center justify-center hidden group-hover:flex transition-all"
                        >
                          <Trash2 size={24} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="relative cursor-pointer px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center">
                      {processingId === "UPLOADING_IMAGE" ? "Uploading..." : "Upload Image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={processingId === "UPLOADING_IMAGE"}
                      />
                    </label>
                    <span className="text-sm text-gray-500 italic">Select an image file to upload.</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={4}
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33]"
                  ></textarea>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Availability:</label>
                  <button
                    onClick={() => setEditForm({...editForm, availability: !editForm.availability})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editForm.availability ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editForm.availability ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-sm text-gray-500">{editForm.availability ? 'In Stock' : 'Out of Stock'}</span>
                </div>

                {/* Specifications Builder */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Specifications</label>
                    <button
                      onClick={() => setSpecsList([...specsList, { key: "", value: "" }])}
                      className="flex items-center gap-1 text-sm text-[#164e33] font-medium hover:underline"
                    >
                      <Plus size={16} /> Add Spec
                    </button>
                  </div>
                  <div className="space-y-3">
                    {specsList.length === 0 && <p className="text-xs text-gray-500 italic">No specifications added.</p>}
                    {specsList.map((spec, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Key (e.g. Color)"
                          value={spec.key || (spec as any).name || ""}
                          onChange={(e) => {
                            const newSpecs = [...specsList];
                            newSpecs[idx] = { ...newSpecs[idx], key: e.target.value };
                            setSpecsList(newSpecs);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33] text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. Red)"
                          value={spec.value || ""}
                          onChange={(e) => {
                            const newSpecs = [...specsList];
                            newSpecs[idx] = { ...newSpecs[idx], value: e.target.value };
                            setSpecsList(newSpecs);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#164e33] text-sm"
                        />
                        <button
                          onClick={() => setSpecsList(specsList.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <MinusCircle size={20} />
                        </button>
                      </div>
                    ))}
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
      </div>
    </div>
  );
}

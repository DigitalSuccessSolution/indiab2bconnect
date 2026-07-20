"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  Search,
  MapPin,
  Phone,
  UserCheck,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";
import Swal from "sweetalert2";

export default function SuperAdminLeads() {
  const { hasPermission } = useAuth();
  
  const canUpdate = hasPermission('leads_update');
  const canReassign = hasPermission('leads_reassign');

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [timeRange, setTimeRange] = useState("ALL");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  
  const [assigning, setAssigning] = useState<string | null>(null);
  const [categoryVendors, setCategoryVendors] = useState<any[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [timeRange, statusFilter, searchTerm]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchLeads();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [timeRange, page, statusFilter, searchTerm]);

  useEffect(() => {
    if (selectedLead?.categoryId) {
      fetchVendorsByCategory(selectedLead.categoryId);
    }
  }, [selectedLead]);

  const fetchVendorsByCategory = async (catId: string) => {
    try {
      setVendorsLoading(true);
      const [verifiedData, allCatData, cityData] = await Promise.all([
        apiFetch(`/vendors?categoryId=${catId}&limit=50&verified=true`),
        apiFetch(`/vendors?categoryId=${catId}&limit=50`),
        selectedLead?.city
          ? apiFetch(`/vendors?city=${encodeURIComponent(selectedLead.city)}&limit=50&verified=true`)
          : Promise.resolve({ data: { vendors: [] } }),
      ]);

      const combinedMap = new Map();
      (verifiedData.data?.vendors || []).forEach((v: any) => combinedMap.set(v.id, v));
      (allCatData.data?.vendors || []).forEach((v: any) => {
        if (!combinedMap.has(v.id)) combinedMap.set(v.id, v);
      });
      (cityData.data?.vendors || []).forEach((v: any) => {
        if (!combinedMap.has(v.id)) combinedMap.set(v.id, v);
      });

      const finalVendors = Array.from(combinedMap.values());
      if (finalVendors.length === 0) {
        const fallbackData = await apiFetch(`/vendors?limit=20&verified=true`);
        setCategoryVendors(fallbackData.data?.vendors || []);
      } else {
        setCategoryVendors(finalVendors);
      }
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    } finally {
      setVendorsLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (timeRange !== "ALL") params.append("timeRange", timeRange);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", page.toString());
      params.append("limit", "20");
      const data = await apiFetch("/admin/leads?" + params.toString());
      const fetchedLeads = data.data?.leads || [];
      setLeads(fetchedLeads);
      setTotalPages(data.data?.totalPages || 1);
      setTotalLeads(data.data?.total || 0);
      if (selectedLead) {
        const updated = fetchedLeads.find((l: any) => l.id === selectedLead.id);
        if (updated) setSelectedLead(updated);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (leadId: string, vendorId: string) => {
    setAssigning(vendorId);
    try {
      await apiFetch(`/admin/leads/${leadId}/reassign`, {
        method: "PATCH",
        body: JSON.stringify({ vendorId }),
      });
      Swal.fire({ icon: 'success', title: 'Assigned!', text: 'Lead has been successfully assigned.', timer: 1500, showConfirmButton: false });
      setIsDetailOpen(false);
      setSelectedLead(null);
      await fetchLeads();
    } catch (error) {
      console.error("Failed to assign lead:", error);
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not assign lead.' });
    } finally {
      setAssigning(null);
    }
  };

  const handleUpdateStatus = async (leadId: string, status: string) => {
    try {
      await apiFetch(`/leads/${leadId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      Swal.fire({ icon: 'success', title: 'Success', text: `Lead marked as ${status}.`, timer: 1500, showConfirmButton: false });
      setIsDetailOpen(false);
      setSelectedLead(null);
      await fetchLeads();
    } catch (error) {
      console.error("Failed to update status:", error);
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not update status.' });
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch =
      lead.buyerName?.toLowerCase().includes(searchLow) ||
      lead.phone?.toLowerCase().includes(searchLow) ||
      lead.buyerEmail?.toLowerCase().includes(searchLow) ||
      lead.category?.name?.toLowerCase().includes(searchLow) ||
      lead.city?.toLowerCase().includes(searchLow);

    const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">Leads Management</h1>
          <p className="text-gray-500 text-sm mt-1">Review inquiries, verify contacts, and assign leads to vendors.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none"
            />
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full sm:w-auto bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#164e33] transition-shadow cursor-pointer"
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
            className="w-full sm:w-auto bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#164e33] transition-shadow cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="DISTRIBUTED">Assigned</option>
            <option value="CLOSED">Completed</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Requester</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Vendor</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-normal break-words max-w-xs">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {lead.searchKeyword ? `Looking for: ${lead.searchKeyword}` : lead.buyerName || "Direct Inquiry"}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">{lead.phone || "No phone"}</span>
                        <span className="text-xs text-gray-400 mt-0.5">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-normal break-words max-w-[200px]">
                      <span className="text-sm font-medium text-gray-800">
                        {lead.category?.name || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={14} className="mr-1.5 text-gray-400" />
                        {lead.city || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        lead.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : lead.status === "DISTRIBUTED"
                            ? "bg-blue-100 text-blue-800"
                            : lead.status === "EXPIRED"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                      }`}>
                        {lead.status === "PENDING" ? "Pending" : lead.status === "DISTRIBUTED" ? "Assigned" : lead.status === "EXPIRED" ? "Expired" : "Completed"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {lead.vendor ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{lead.vendor.businessName}</span>
                          {lead.vendor.verified && <span className="text-xs text-green-600 flex items-center gap-1 mt-0.5"><ShieldCheck size={12} /> Verified</span>}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(canUpdate || canReassign) && (
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsDetailOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#164e33] bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <Settings size={14} />
                          Manage
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
          <span className="text-sm text-[#344054]">
          Showing {totalLeads === 0 ? 0 : (page - 1) * 20 + 1} to {Math.min(page * 20, totalLeads)} of {totalLeads} results
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
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
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      </div>

      {/* Detail Slide-over Panel */}
      {isDetailOpen && selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setIsDetailOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col">
            
            {/* Panel Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Lead Details</h2>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              
              {/* Lead Info */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  {selectedLead.searchKeyword ? `Requirement: ${selectedLead.searchKeyword}` : `Inquiry from ${selectedLead.buyerName}`}
                </h3>
                <p className="text-sm text-gray-600 italic">"{selectedLead.message || "No additional message provided."}"</p>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-700">
                    <UserCheck className="w-4 h-4 mr-3 text-gray-400" />
                    {selectedLead.buyerName || "Name N/A"}
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    {selectedLead.phone || "Phone N/A"}
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Vendors Assignment */}
              {canReassign && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assign to Vendor</h4>
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {vendorsLoading ? "..." : `${categoryVendors.length} Available`}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {vendorsLoading ? (
                      <div className="text-sm text-gray-500 py-4 text-center">Loading vendors...</div>
                    ) : categoryVendors.length > 0 ? (
                      categoryVendors.map((vendor) => (
                        <div
                          key={vendor.id}
                          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-[#164e33] transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                              {vendor.businessName}
                              {vendor.verified && <ShieldCheck size={14} className="text-green-600" />}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{vendor.city || "Unknown Location"}</p>
                          </div>
                          <button
                            onClick={() => handleAssign(selectedLead.id, vendor.id)}
                            disabled={assigning === vendor.id || selectedLead.vendor?.id === vendor.id}
                            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                              selectedLead.vendor?.id === vendor.id 
                                ? "bg-green-50 text-green-700 border border-green-200 cursor-default" 
                                : "bg-[#164e33] hover:bg-[#113f29] text-white"
                            }`}
                          >
                            {assigning === vendor.id ? "Assigning..." : selectedLead.vendor?.id === vendor.id ? "Assigned" : "Assign"}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 py-4 text-center bg-gray-50 rounded-lg border border-gray-100">
                        No vendors found for this category.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <hr className="border-gray-100" />

              {/* Manual Actions */}
              {(canUpdate || canReassign) && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Manual Actions</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedLead.id, 'CLOSED')}
                      className="flex-1 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                    >
                      Mark as Completed
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedLead.id, 'EXPIRED')}
                      className="flex-1 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      Force Expire
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

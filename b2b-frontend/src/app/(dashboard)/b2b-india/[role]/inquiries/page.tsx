"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  Headphones,
  Search,
  RefreshCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  X,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

export default function AdminInquiries() {
  const { hasPermission, user } = useAuth();
  const canUpdate = user?.role === 'SUPERADMIN' || hasPermission?.('inquiries_update');
  const canDelete = user?.role === 'SUPERADMIN' || hasPermission?.('inquiries_delete');

  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchInquiries(currentPage);
  }, [statusFilter, currentPage]);

  const fetchInquiries = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20"
      });
      
      if (statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }

      const res = await apiFetch(`/contact?${params.toString()}`);
      if (res.success) {
        setInquiries(res.data);
        setTotalPages(res.pages);
        setTotalCount(res.total);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load inquiries.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      const res = await apiFetch(`/contact/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.success) {
        Swal.fire({
          icon: "success",
          title: "Status Updated",
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false,
        });
        // Update local state
        setInquiries(inquiries.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq)));
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus });
        }
      }
    } catch (err: any) {
      Swal.fire("Error", err.message || "Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const res = await apiFetch(`/contact/${id}`, { method: "DELETE" });
          if (!res.success) throw new Error("Failed to delete");
          return true;
        } catch (err: any) {
          Swal.showValidationMessage(err.message || "Failed to delete inquiry");
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed) {
      Swal.fire("Deleted!", "Inquiry has been deleted.", "success");
      setInquiries(inquiries.filter((inq) => inq.id !== id));
      setTotalCount((prev) => prev - 1);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1 w-max"><Clock size={12}/> Pending</span>;
      case "INPROGRESS":
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1 w-max"><AlertCircle size={12}/> In Progress</span>;
      case "RESOLVED":
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1 w-max"><CheckCircle2 size={12}/> Resolved</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  // Basic client-side filtering for search term
  const filteredInquiries = inquiries.filter(
    (inq) =>
      inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inq.subject && inq.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderPaginationButtons = () => {
    if (totalPages <= 0) return null;
    
    const buttons = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous Button
    buttons.push(
      <button
        key="prev"
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="px-2.5 py-1.5 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="sr-only">Previous</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
    );

    // Page 1
    if (startPage > 1) {
      buttons.push(
        <button key={1} onClick={() => setCurrentPage(1)} className={`px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${currentPage === 1 ? 'bg-[#164e33] text-white border-[#164e33]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>1</button>
      );
      if (startPage > 2) {
        buttons.push(<span key="ellipsis1" className="px-2 py-1.5 text-slate-400">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${currentPage === i ? 'bg-[#164e33] text-white border-[#164e33]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
        >
          {i}
        </button>
      );
    }

    // Last Page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="ellipsis2" className="px-2 py-1.5 text-slate-400">...</span>);
      }
      buttons.push(
        <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={`px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${currentPage === totalPages ? 'bg-[#164e33] text-white border-[#164e33]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>{totalPages}</button>
      );
    }

    // Next Button
    buttons.push(
      <button
        key="next"
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="px-2.5 py-1.5 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="sr-only">Next</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
    );

    return buttons;
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            <Headphones className="text-orange-600" />
            Contact Inquiries
          </h1>
          <p className="text-slate-500 mt-1">
            Manage user support tickets and contact requests. Total: {totalCount}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50/50">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none bg-white"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none px-4 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none bg-white min-w-[150px] cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="INPROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User Info</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject & Message</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse bg-white border-b border-slate-100">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-200 rounded w-20"></div>
                      <div className="h-3 bg-slate-200 rounded w-16 mt-2"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-200 rounded w-32"></div>
                      <div className="h-3 bg-slate-200 rounded w-48 mt-2"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-full"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-slate-200 rounded-full w-24"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-8 bg-slate-200 rounded w-24 inline-block"></div>
                    </td>
                  </tr>
                ))
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No inquiries found.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inq) => (
                  <motion.tr
                    key={inq.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(inq.createdAt).toLocaleDateString()}<br/>
                      <span className="text-xs text-slate-400">{new Date(inq.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{inq.name}</div>
                      <div className="text-sm text-slate-500">{inq.email}</div>
                      {inq.phone && <div className="text-xs text-slate-400">{inq.phone}</div>}
                    </td>
                    <td className="px-6 py-4 min-w-[300px]">
                      <div className="font-medium text-slate-800 mb-1">{inq.subject || "No Subject"}</div>
                      <div className="text-sm text-slate-600 line-clamp-2">{inq.message}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(inq.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">

                        <button
                          onClick={() => {
                            setSelectedInquiry(inq);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                          title="View Inquiry"
                        >
                          <Eye size={16} />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            disabled={updatingId === inq.id}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Delete Inquiry"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-xl">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {renderPaginationButtons()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Inquiry Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedInquiry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Headphones className="text-orange-600" size={20} />
                  Inquiry Details
                </h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</p>
                      {getStatusBadge(selectedInquiry.status)}
                      {updatingId === selectedInquiry.id && (
                        <RefreshCcw className="animate-spin text-orange-500" size={14} />
                      )}
                    </div>
                    {canUpdate ? (
                      <div className="relative">
                        <select
                          value={selectedInquiry.status}
                          onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value)}
                          disabled={updatingId === selectedInquiry.id}
                          className="appearance-none text-sm border border-slate-200 rounded-lg pl-3 pr-10 py-1.5 bg-white focus:outline-none w-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <option value="PENDING">Mark Pending</option>
                          <option value="INPROGRESS">Mark In Progress</option>
                          <option value="RESOLVED">Mark Resolved</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-2">You don't have permission to update status.</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Date Received</p>
                    <p className="text-sm font-medium text-slate-800">
                      {new Date(selectedInquiry.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Full Name</p>
                    <p className="text-sm font-medium text-slate-800">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Email Address</p>
                    <p className="text-sm font-medium text-slate-800">{selectedInquiry.email}</p>
                  </div>
                  {selectedInquiry.phone && (
                    <div className="col-span-2">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Phone Number</p>
                      <p className="text-sm font-medium text-slate-800">{selectedInquiry.phone}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Subject</p>
                  <p className="text-sm font-medium text-slate-800">{selectedInquiry.subject || 'No Subject'}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Message</p>
                  <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-100">
                    {selectedInquiry.message}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

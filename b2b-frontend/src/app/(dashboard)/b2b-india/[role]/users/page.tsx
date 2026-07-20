"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  Trash2,
  XCircle,
  Clock,
  Edit2,
  RefreshCcw,
  Activity,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

export default function AdminUsers() {
  const { hasPermission } = useAuth();

  const canEdit = hasPermission('users_update');
  const canDelete = hasPermission('users_delete');

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [counts, setCounts] = useState({ vendors: 0, admins: 0, newMembers: 0 });
  const pageSize = 50;

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        search: searchTerm,
      });

      if (roleFilter !== "ALL") params.append("role", roleFilter);
      if (statusFilter !== "ALL") {
        params.append("isActive", statusFilter === "ACTIVE" ? "true" : "false");
      }

      const data = await apiFetch(`/admin/users?${params.toString()}`);
      setUsers(data.data?.users || []);
      setTotalPages(data.data?.totalPages || 1);
      setTotalCount(data.data?.total || 0);
      setCurrentPage(Number(data.data?.page) || 1);
      setCounts(data.data?.counts || { vendors: 0, admins: 0, newMembers: 0 });
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setUpdatingId("modal");
      await apiFetch(`/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: selectedUser.name,
          role: selectedUser.role,
          isActive: selectedUser.isActive,
          password: selectedUser.password || undefined,
        }),
      });
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id
            ? { ...u, name: selectedUser.name, role: selectedUser.role, isActive: selectedUser.isActive }
            : u,
        ),
      );
      Swal.fire({ icon: 'success', title: 'Success!', text: 'User updated successfully.', timer: 1500, showConfirmButton: false });
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to update user:", error);
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Failed to update user.' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (user: any) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this! This removes their access.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#164e33',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          await apiFetch(`/admin/users/${user.id}`, { method: "DELETE" });
          return true;
        } catch (error) {
          Swal.showValidationMessage('Failed to delete member account.');
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed) {
      setUsers(users.filter((u) => u.id !== user.id));
      Swal.fire({ icon: 'success', title: 'Deleted!', text: 'User has been removed.', timer: 1500, showConfirmButton: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">Platform Members</h1>
          <p className="text-gray-500 text-sm mt-1">Review activity, manage permissions, and assign administrative roles.</p>
        </div>
      </div>



      <div className="space-y-4">
        {/* Filter Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-9 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 outline-none hover:bg-gray-50 transition-colors shadow-sm appearance-none cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="SUPERADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="SUBADMIN">Sub Admin</option>
                <option value="VENDOR">Vendor</option>
                <option value="BUYER">Standard User</option>
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 outline-none hover:bg-gray-50 transition-colors shadow-sm appearance-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Banned/Suspended</option>
              </select>
              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-10 bg-gray-100 rounded-lg"></div>
                      </td>
                    </tr>
                  ))
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-normal break-words max-w-[250px]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 font-medium text-sm overflow-hidden border border-gray-200">
                            {user.avatar || user.profileImage || user.vendor?.logoUrl ? (
                              <img
                                src={user.avatar || user.profileImage || user.vendor?.logoUrl}
                                className="w-full h-full object-cover"
                                alt=""
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="uppercase">{user.name?.charAt(0) || "U"}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {user.name && isNaN(Number(user.name)) ? user.name : "Guest User"}
                            </p>
                            <div className="text-xs text-gray-500 mt-0.5">ID: {user.id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal break-words max-w-[250px]">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{user.phone || "—"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "SUPERADMIN" ? "bg-indigo-100 text-indigo-800"
                            : user.role === "ADMIN" ? "bg-purple-100 text-purple-800"
                              : user.role === "SUBADMIN" ? "bg-cyan-100 text-cyan-800"
                                : user.role === "VENDOR" ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canEdit && (
                            <button
                              onClick={() => {
                                setSelectedUser({ ...user, password: '' });
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-[#164e33] hover:bg-[#164e33]/10 rounded-md transition-colors"
                              title="Edit User"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Users className="w-10 h-10 text-gray-300 mb-3" />
                        <p className="text-sm font-medium text-gray-900">No members found</p>
                        <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or search term.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => currentPage > 1 && fetchUsers(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="p-1.5 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchUsers(pageNum)}
                        className={`w-8 h-8 rounded-md text-sm font-medium ${currentPage === pageNum
                            ? "bg-[#164e33] text-white border border-[#164e33]"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="px-1 text-gray-500">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => currentPage < totalPages && fetchUsers(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="p-1.5 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-500" />
                  Edit User Role & Status
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Name
                  </label>
                  <input
                    type="text"
                    value={selectedUser.name || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                    placeholder="Enter user name"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform Role
                  </label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none"
                  >
                    <option value="BUYER">Buyer (Standard User)</option>
                    <option value="VENDOR">Vendor</option>
                    <option value="SUBADMIN">Sub Admin</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPERADMIN">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Set New Password (Optional)
                  </label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={selectedUser.password || ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                      placeholder="Leave blank to keep current password"
                      autoComplete="new-password"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 mt-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Account Active Status</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Allow user to log in and use the platform</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser({ ...selectedUser, isActive: !selectedUser.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${selectedUser.isActive ? "bg-[#164e33]" : "bg-gray-300"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${selectedUser.isActive ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingId === "modal"}
                    className="px-4 py-2 bg-[#164e33] text-white text-sm font-medium rounded-lg hover:bg-[#113f29] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {updatingId === "modal" ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { 
  Users, 
  RefreshCcw, 
  Plus, 
  Mail,
  ShieldAlert,
  XCircle,
  Trash2,
  ChevronDown,
  Search,
  Edit
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';

export default function AdminManagement() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { user, hasPermission } = useAuth();

  const canAdd = hasPermission('admins_create');
  const canEdit = hasPermission('admins_update');
  const canDelete = hasPermission('admins_delete');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'GENERAL',
    role: 'ADMIN',
    isActive: true,
    permissions: [] as string[]
  });

  const permissionGroups = [
    {
      module: 'Dashboard',
      permissions: [
        { id: 'dashboard_read', label: 'View Dashboard' },
      ]
    },
    {
      module: 'Analytics',
      permissions: [
        { id: 'analytics_read', label: 'View Analytics' },
      ]
    },
    {
      module: 'Vendors',
      permissions: [
        { id: 'vendors_read', label: 'View Vendors' },
        { id: 'vendors_create', label: 'Add New Vendor' },
        { id: 'vendors_update', label: 'Edit Vendors' },
        { id: 'vendors_approve', label: 'Approve Vendors' },
        { id: 'vendors_reject', label: 'Reject Vendors' },
        { id: 'vendors_delete', label: 'Delete Vendors' }
      ]
    },
    {
      module: 'Products',
      permissions: [
        { id: 'products_read', label: 'View Products' },
        { id: 'products_create', label: 'Add New Product' },
        { id: 'products_update', label: 'Edit Products' },
        { id: 'products_approve', label: 'Approve Products' },
        { id: 'products_reject', label: 'Reject Products' },
        { id: 'products_delete', label: 'Delete Products' }
      ]
    },
    {
      module: 'Users',
      permissions: [
        { id: 'users_read', label: 'View Users' },
        { id: 'users_create', label: 'Add New User' },
        { id: 'users_update', label: 'Edit Users' },
        { id: 'users_delete', label: 'Delete Users' },
      ]
    },
    {
      module: 'Leads',
      permissions: [
        { id: 'leads_read', label: 'View Leads' },
        { id: 'leads_create', label: 'Add New Lead' },
        { id: 'leads_update', label: 'Edit Leads' },
        { id: 'leads_reassign', label: 'Reassign Leads' },
        { id: 'leads_delete', label: 'Delete Leads' }
      ]
    },
    {
      module: 'Inquiries',
      permissions: [
        { id: 'inquiries_read', label: 'View Inquiries' },
        { id: 'inquiries_update', label: 'Update Inquiries Status' },
        { id: 'inquiries_delete', label: 'Delete Inquiries' }
      ]
    },
    {
      module: 'Categories',
      permissions: [
        { id: 'categories_read', label: 'View Categories' },
        { id: 'categories_create', label: 'Add Categories' },
        { id: 'categories_update', label: 'Edit Categories' },
        { id: 'categories_delete', label: 'Delete Categories' },
      ]
    },
    {
      module: 'Admin Staff',
      permissions: [
        { id: 'admins_read', label: 'View Team Members' },
        { id: 'admins_create', label: 'Add Team Member' },
        { id: 'admins_update', label: 'Edit Team Members' },
        { id: 'admins_delete', label: 'Delete Team Members' },
      ]
    },
    {
      module: 'Packages',
      permissions: [
        { id: 'packages_read', label: 'View Packages' },
        { id: 'packages_create', label: 'Add Packages' },
        { id: 'packages_update', label: 'Edit Packages' },
        { id: 'packages_delete', label: 'Delete Packages' }
      ]
    },
    {
      module: 'Transactions',
      permissions: [
        { id: 'transactions_read', label: 'View Transactions' }
      ]
    },
    {
      module: 'Refunds',
      permissions: [
        { id: 'refunds_read', label: 'View Refunds' },
        { id: 'refunds_update', label: 'Edit Refunds' }
      ]
    },
    {
      module: 'System Settings',
      permissions: [
        { id: 'settings_read', label: 'View Settings' },
        { id: 'settings_update', label: 'Edit Settings' },
        { id: 'manage_settings', label: 'Update Global Settings' }
      ]
    },
    {
      module: 'Notifications',
      permissions: [
        { id: 'notifications_read', label: 'View Notifications' },
        { id: 'notifications_broadcast', label: 'Send Broadcasts' }
      ]
    },
    {
      module: 'Activity Logs',
      permissions: [
        { id: 'activity_read', label: 'View Activity Logs' }
      ]
    }
  ];

  const ToggleSwitch = ({ checked, onChange, label }: any) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative flex items-center">
        <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        <div className={`w-10 h-5 rounded-full transition-colors ${checked ? 'bg-[#164e33]' : 'bg-gray-200 group-hover:bg-gray-300'}`}></div>
        <div className={`absolute left-1 w-3.5 h-3.5 bg-white rounded-full transition-transform ${checked ? 'translate-x-[20px]' : 'translate-x-0'} shadow-sm`}></div>
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
    </label>
  );

  const handlePermissionChange = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admins');
      setAdmins(res.data || []);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', department: 'GENERAL', role: 'ADMIN', isActive: true, permissions: [] });
    setError('');
  };

  const handleEdit = (admin: any) => {
    setEditingId(admin.id);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '', 
      department: admin.department,
      role: admin.user?.role || 'ADMIN',
      isActive: admin.user?.isActive ?? true,
      permissions: admin.permissions || []
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      let isUpdate = !!editingId;
      if (editingId) {
        await apiFetch(`/admins/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password || undefined,
            role: formData.role,
            isActive: formData.isActive,
            department: formData.department,
            permissions: formData.permissions
          })
        });
      } else {
        await apiFetch('/admins', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      handleClose();
      fetchAdmins();
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Team member ${isUpdate ? 'updated' : 'added'} successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err: any) {
      setError(err.message || 'Failed to process request');
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message || 'Failed to process request'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this! This removes their access.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#164e33',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          await apiFetch(`/admins/${id}`, { method: 'DELETE' });
          return true;
        } catch (err: any) {
          Swal.showValidationMessage(err.message || 'Failed to delete team member');
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed) {
      fetchAdmins();
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Team member has been removed.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchQuery.toLowerCase()) || admin.email.toLowerCase().includes(searchQuery.toLowerCase());
    let isActive = admin.user?.isActive ?? admin.isActive ?? true;
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? isActive : !isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {!isFormOpen ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 gap-4 border-b border-gray-100">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">Team Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your team members and control what they can access.</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
               <button onClick={fetchAdmins} className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors shadow-sm" title="Refresh">
                  <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
               </button>
               {canAdd && (
                 <button 
                   onClick={() => setIsFormOpen(true)}
                   className="flex-1 md:flex-none px-4 py-2 bg-[#164e33] text-white rounded-md text-sm font-semibold hover:bg-[#113f29] transition-colors flex items-center justify-center gap-2 shadow-sm"
                 >
                    <Plus className="w-4 h-4" /> Add Team Member
                 </button>
               )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search team members by name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#164e33]/20 focus:border-[#164e33] shadow-sm transition-all"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#164e33]/20 focus:border-[#164e33] cursor-pointer shadow-sm min-w-[150px] transition-all"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Members</option>
              <option value="INACTIVE">Suspended</option>
            </select>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap min-w-[800px]">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500 tracking-wider">
                     <tr>
                        <th className="px-6 py-4">Admin Name</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Permissions</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {loading ? (
                        [1,2,3,4,5].map(i => (
                           <tr key={i} className="animate-pulse">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0"></div>
                                  <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded-full w-20"></div></td>
                              <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded w-32"></div></td>
                              <td className="px-6 py-4 text-center"><div className="h-5 bg-gray-200 rounded-full w-20 mx-auto"></div></td>
                              <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded-md w-16 ml-auto"></div></td>
                           </tr>
                        ))
                     ) : filteredAdmins.length > 0 ? (
                        filteredAdmins.map(admin => {
                           const isActive = admin.user?.isActive ?? admin.isActive ?? true;
                           return (
                           <tr key={admin.id} className="hover:bg-gray-50 transition-colors group">
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center font-semibold shrink-0">
                                       {admin.user?.avatar ? (
                                         <img src={admin.user.avatar} alt={admin.name} className="w-full h-full object-cover rounded-full" />
                                       ) : (
                                         admin.name.charAt(0).toUpperCase()
                                       )}
                                    </div>
                                    <div>
                                       <span className="font-semibold text-gray-900 block">{admin.name}</span>
                                       <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3"/> {admin.email}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[10px] font-semibold uppercase rounded-full border border-gray-200">
                                    {admin.user?.role || 'ADMIN'}
                                 </span>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                                    {admin.permissions && admin.permissions.length > 0 ? (
                                       admin.permissions.slice(0, 2).map((p: string) => (
                                         <span key={p} className="px-2.5 py-0.5 bg-gray-50 text-gray-600 text-[10px] font-medium rounded-md border border-gray-200 uppercase">
                                           {p.split('_')[0]}
                                         </span>
                                       ))
                                    ) : (
                                       <span className="text-[11px] text-gray-400 italic">No access</span>
                                    )}
                                    {admin.permissions?.length > 2 && (
                                       <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-md border border-gray-200">
                                         +{admin.permissions.length - 2}
                                       </span>
                                    )}
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                 <span className={`inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-semibold rounded-full border tracking-wide ${isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200/50' : 'bg-red-100 text-red-700 border-red-200/50'}`}>
                                    {isActive ? 'Active' : 'Suspended'}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex justify-end items-center gap-1">
                                    {canEdit && (
                                      <button onClick={() => handleEdit(admin)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all" title="Edit Admin">
                                         <Edit className="w-4 h-4" />
                                      </button>
                                    )}
                                    {canDelete && (
                                      <button onClick={() => handleDelete(admin.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all" title="Revoke Access">
                                         <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        );
                        })
                     ) : (
                        <tr>
                           <td colSpan={5} className="py-24 text-center">
                              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                              <h3 className="text-sm font-semibold text-gray-900">No Team Members Found</h3>
                              <p className="text-sm text-gray-500 mt-1">Click 'Add Team Member' to create a new team account.</p>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
             </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Team Member' : 'Add New Team Member'}</h2>
            </div>
            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
               <XCircle className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {error && (
               <div className="p-4 bg-red-50 border border-red-100 rounded-md text-red-600 text-sm font-medium flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" />
                  {error}
               </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
               <div className="space-y-1.5">
                 <label className="text-sm font-medium text-gray-700">Full Name</label>
                 <input 
                   required
                   type="text"
                   value={formData.name}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#164e33]/20 focus:border-[#164e33] shadow-sm transition-all"
                   placeholder="e.g. Rahul Singh"
                 />
               </div>
               
               <div className="space-y-1.5">
                 <label className="text-sm font-medium text-gray-700">Email Address</label>
                 <input 
                   required
                   type="email"
                   value={formData.email}
                   onChange={(e) => setFormData({...formData, email: e.target.value})}
                   className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#164e33]/20 focus:border-[#164e33] shadow-sm transition-all"
                   placeholder="admin@company.com"
                 />
               </div>

                 <div className="space-y-1.5">
                   <label className="text-sm font-medium text-gray-700">Password {editingId && <span className="text-gray-400 font-normal text-xs ml-1">(Leave blank to keep current)</span>}</label>
                   <input 
                     required={!editingId}
                     type="password"
                     value={formData.password}
                     onChange={(e) => setFormData({...formData, password: e.target.value})}
                     className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#164e33]/20 focus:border-[#164e33] shadow-sm transition-all"
                     placeholder={editingId ? 'Leave blank to keep current' : 'Min. 6 chars'}
                   />
                 </div>
               
               {user?.role === 'SUPERADMIN' && (
                 <div className="space-y-1.5">
                   <label className="text-sm font-medium text-gray-700">Role</label>
                   <div className="relative">
                     <select 
                       required
                       value={formData.role}
                       onChange={(e) => setFormData({...formData, role: e.target.value})}
                       className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#164e33]/20 focus:border-[#164e33] shadow-sm transition-all cursor-pointer appearance-none"
                     >
                        <option value="ADMIN">Full Administrator (ADMIN)</option>
                        <option value="SUBADMIN">Sub-Administrator (SUBADMIN)</option>
                     </select>
                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                   </div>
                 </div>
               )}
            </div>

             <div className="space-y-4 pt-6 border-t border-gray-100">
               <div>
                 <h4 className="text-base font-semibold text-gray-900">Account Status</h4>
                 <p className="text-sm text-gray-500 mt-1">Suspend or activate this team member's access to the platform.</p>
               </div>
               <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                 <div className="flex flex-col">
                   <span className="text-sm font-semibold text-gray-900">Active Account</span>
                   <span className="text-xs text-gray-500">Allow user to log in and use the system</span>
                 </div>
                 <ToggleSwitch 
                   checked={formData.isActive}
                   onChange={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                   label={formData.isActive ? "Active" : "Suspended"}
                 />
               </div>
             </div>

             <div className="space-y-4 pt-6 border-t border-gray-100">
               <div>
                 <h4 className="text-base font-semibold text-gray-900">Permissions & Access</h4>
                 <p className="text-sm text-gray-500 mt-1">Choose what modules this person can access and modify.</p>
               </div>
               
               <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                 <div className="flex flex-col divide-y divide-gray-100">
                   {permissionGroups.map((group, idx) => (
                     <div key={idx} className="flex flex-col md:flex-row hover:bg-gray-50/50 transition-colors">
                        {/* Left Side: Module Name */}
                        <div className="w-full md:w-48 shrink-0 bg-gray-50/80 md:bg-transparent md:border-r border-gray-100 p-4 md:p-6 flex items-start md:items-center">
                           <span className="text-sm font-semibold text-gray-800">{group.module}</span>
                        </div>
                        
                        {/* Right Side: Toggles Grid */}
                        <div className="flex-1 p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-6">
                           {group.permissions.map(perm => {
                              const isChecked = formData.permissions.includes(perm.id) || formData.permissions.includes('all');
                              return (
                                 <ToggleSwitch 
                                    key={perm.id}
                                    checked={isChecked}
                                    onChange={() => handlePermissionChange(perm.id)}
                                    label={perm.label}
                                 />
                              );
                           })}
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
               <button 
                 type="button" 
                 onClick={handleClose}
                 className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded-md transition-colors shadow-sm"
               >
                 Cancel
               </button>
               <button 
                 type="submit" 
                 disabled={submitting}
                 className="px-4 py-2 bg-[#164e33] hover:bg-[#113f29] text-white font-semibold text-sm rounded-md shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                 {submitting ? (
                   <>
                     <RefreshCcw className="w-4 h-4 animate-spin" /> {editingId ? 'Saving...' : 'Adding...'}
                   </>
                 ) : (
                   editingId ? 'Save Changes' : 'Add Member'
                 )}
               </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

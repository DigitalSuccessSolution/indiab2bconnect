'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  ShieldCheck, 
  Settings, 
  Trash2, 
  XCircle, 
  Clock,
  Edit2,
  RefreshCcw,
  Zap,
  Phone,
  Trophy,
  Sparkles,
  TrendingUp,
  Target,
  ChevronDown,
  ChevronRight,
  CheckCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [boostConfig, setBoostConfig] = useState<{vendorId: string, score: string} | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/admin/users');
      setUsers(data.data?.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBoost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boostConfig || isNaN(parseFloat(boostConfig.score))) return;

    try {
      setUpdatingId('boost');
      await apiFetch(`/admin/vendors/${boostConfig.vendorId}/boost`, {
        method: 'PATCH',
        body: JSON.stringify({ boostScore: parseFloat(boostConfig.score) })
      });
      
      setUsers(users.map(u => {
        if (u.role === 'VENDOR' && u.vendor?.id === boostConfig.vendorId) {
          return { ...u, vendor: { ...u.vendor, manualBoost: parseFloat(boostConfig.score) } };
        }
        return u;
      }));

      setIsBoostModalOpen(false);
      setBoostConfig(null);
    } catch (error) {
      console.error('Failed to apply manual boost:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setUpdatingId('modal');
      await apiFetch(`/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          role: selectedUser.role,
          isActive: selectedUser.isActive,
          password: selectedUser.password || undefined
        })
      });
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: selectedUser.role, isActive: selectedUser.isActive } : u));
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setUpdatingId(userToDelete.id);
      await apiFetch(`/admin/users/${userToDelete.id}`, {
        method: 'DELETE'
      });
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Failed to delete member:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    // Admin should not see Super Admins usually, or at least handle it depending on permissions.
    // The previous implementation filtered out SUPERADMIN. 
    // I'll keep it to maintain security if requested, or show if it matches Super Admin view.
    // Super Admin view shows all. Admin view should probably only show users of lower or equal rank except Super Admin.
    return matchesSearch && matchesRole && u.role !== 'SUPERADMIN';
  });

  return (
    <div className="space-y-8 animate-simple-fade pb-20 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 max-w-7xl mx-auto">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Hub Platform Members</h1>
           <p className="text-slate-500 font-medium mt-1 text-sm">Review activity, manage permissions, and oversee hub registrations.</p>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
         {[
           { label: 'Total Members', value: users.length, sub: 'All hub accounts', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { label: 'Vendors', value: users.filter(u => u.role === 'VENDOR').length, sub: 'Business entities', icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
           { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, sub: 'Hub controllers', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
           { label: 'Joined This Month', value: users.filter(u => new Date(u.createdAt).getMonth() === new Date().getMonth()).length, sub: 'New registrations', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
              <div className={`w-12 h-12 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                 <stat.icon size={22} />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                 <h4 className="text-2xl font-bold text-slate-900">{stat.value}</h4>
                 <p className="text-[10px] font-medium text-slate-400 mt-0.5">{stat.sub}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="max-w-7xl mx-auto space-y-4">
        {/* Filter Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
           <div className="relative">
              <select 
                 value={roleFilter}
                 onChange={(e) => setRoleFilter(e.target.value)}
                 className="pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-slate-700 outline-none hover:bg-gray-50 transition-all shadow-sm appearance-none cursor-pointer"
              >
                 <option value="ALL">All Roles</option>
                 <option value="ADMIN">Admin</option>
                 <option value="VENDOR">Vendor</option>
                 <option value="BUYER">Procurement Officer</option>
              </select>
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
           </div>

           <div className="flex items-center gap-2">
              <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600" />
                 <input 
                   type="text" 
                   placeholder="Search members..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all w-64 shadow-sm"
                 />
              </div>
              <button onClick={fetchUsers} className="p-2.5 bg-white border border-gray-200 rounded-lg text-slate-400 hover:text-slate-900 shadow-sm transition-all">
                 <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
           </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User Details</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authentication</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Access Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registered Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8"><div className="h-10 bg-gray-50/50 rounded-lg"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 border-2 border-white shadow-sm flex items-center justify-center shrink-0 font-bold text-sm overflow-hidden relative group/avatar">
                              {(user.avatar || user.profileImage || user.vendor?.logoUrl) ? (
                                <img 
                                  src={user.avatar || user.profileImage || user.vendor?.logoUrl} 
                                  className="w-full h-full object-cover transition-transform group-hover/avatar:scale-110" 
                                  alt="" 
                                />
                              ) : (
                                <span className="uppercase">{user.name?.charAt(0) || 'U'}</span>
                              )}
                           </div>
                           <div>
                              <p className="text-[13px] font-bold text-slate-900 capitalize leading-tight">
                                 {user.name || 'Anonymous User'}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></span>
                                <span className={`text-[10px] font-bold uppercase tracking-tighter ${user.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                   {user.isActive ? 'Access Active' : 'Restricted'}
                                </span>
                              </div>
                           </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[11px] font-bold">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] font-bold">{user.phone || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                           user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                           user.role === 'VENDOR' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                           'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                           {user.role}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-[12px] font-bold text-slate-700">
                          {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border shadow-sm transition-all ${
                          user.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                       }`}>
                          <span className={`w-1 h-1 rounded-full animate-pulse ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {user.isActive ? 'Active' : 'Banned'}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-1">
                          {user.role === 'VENDOR' && user.vendor && (
                            <button onClick={() => { setBoostConfig({vendorId: user.vendor.id, score: (user.vendor.manualBoost || 0).toString()}); setIsBoostModalOpen(true); }} className={`p-2 rounded-lg transition-all ${ (user.vendor.manualBoost || 0) > 0 ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' }`}>
                              <Zap size={14} className={(user.vendor.manualBoost || 0) > 0 ? 'fill-amber-500' : ''} />
                            </button>
                          )}
                          <button onClick={() => { setSelectedUser({...user}); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                             <Edit2 size={14} />
                          </button>
                          <button onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                             <Trash2 size={14} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                       <Users className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">Workspace Isolated</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">No members match criteria</p>
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative bg-white rounded-lg w-full max-w-md overflow-hidden border border-gray-100 shadow-2xl">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-700" />
                  Edit Membership Status
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateUser} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                  <input type="text" disabled value={selectedUser.name || 'Anonymous User'} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Platform Role</label>
                  <select value={selectedUser.role} onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all uppercase appearance-none">
                    <option value="BUYER">Procurement Officer</option>
                    <option value="VENDOR">Vendor Partnership</option>
                    <option value="ADMIN">Strategic Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Reset Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={selectedUser.password || ''}
                      onChange={(e) => setSelectedUser({...selectedUser, password: e.target.value})}
                      placeholder="Enter new secure password..."
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${showPassword ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Access Permissions</h4>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 uppercase tracking-tight">Allow platform login & usage</p>
                  </div>
                  <button type="button" onClick={() => setSelectedUser({...selectedUser, isActive: !selectedUser.isActive})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${selectedUser.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${selectedUser.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-gray-100 rounded-lg transition-colors uppercase tracking-wider">Cancel</button>
                  <button type="submit" disabled={!!updatingId} className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-slate-900/10">
                    {updatingId === 'modal' ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Commit Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBoostModalOpen && boostConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsBoostModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative bg-white/95 backdrop-blur-xl rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-white/50">
              <div className={`px-8 py-7 relative overflow-hidden transition-colors duration-500 ${parseFloat(boostConfig.score) <= 0 ? 'bg-gray-100 text-slate-900' : parseFloat(boostConfig.score) < 10 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : parseFloat(boostConfig.score) < 25 ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white' : 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white'}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-lg border border-white/30">
                      <Zap className="w-6 h-6 fill-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold ">Visibility Matrix</h3>
                      <p className="text-white/70 text-[10px] font-bold uppercase mt-0.5 tracking-widest">Admin Priority Setting</p>
                    </div>
                  </div>
                  <button onClick={() => setIsBoostModalOpen(false)} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleBoost} className="p-8 space-y-8">
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Strategic Intensity</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${parseFloat(boostConfig.score) <= 0 ? 'bg-gray-100 text-slate-700' : parseFloat(boostConfig.score) < 10 ? 'bg-amber-100 text-amber-600' : parseFloat(boostConfig.score) < 25 ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}`}>
                      {parseFloat(boostConfig.score) <= 0 ? 'Organic View' : parseFloat(boostConfig.score) < 10 ? 'Active Boost' : parseFloat(boostConfig.score) < 25 ? 'Strategic Priority' : 'Market Dominance'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input type="range" min="0" max="50" step="0.5" value={boostConfig.score} onChange={(e) => setBoostConfig({...boostConfig, score: e.target.value})} className="flex-1 accent-amber-500 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
                    <div className="relative min-w-[80px]">
                      <input type="number" step="0.1" value={boostConfig.score} onChange={(e) => setBoostConfig({...boostConfig, score: e.target.value})} className="w-full bg-gray-50 border-2 rounded-lg px-2 py-3 text-2xl font-bold text-center border-gray-100" />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className={`w-4 h-4 ${parseFloat(boostConfig.score) > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold text-slate-900">Experience Forecast</span>
                  </div>
                  <p className="text-[12px] leading-relaxed text-slate-600 font-medium">
                    {parseFloat(boostConfig.score) <= 0 ? "Standard positioning based on hub score and lead response performance." : `Boosting by ${boostConfig.score}x will place this vendor ahead of organic listings in high-traffic categories.`}
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-3">
                  <button type="submit" disabled={updatingId === 'boost'} className={`w-full py-4 text-xs font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest ${parseFloat(boostConfig.score) <= 0 ? 'bg-slate-900 text-white ' : parseFloat(boostConfig.score) < 10 ? 'bg-amber-500 text-white' : parseFloat(boostConfig.score) < 25 ? 'bg-orange-500 text-white' : 'bg-purple-600 text-white'}`}>
                    {updatingId === 'boost' ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5" />Authorize Boost Level</>}
                  </button>
                  <button type="button" onClick={() => setIsBoostModalOpen(false)} className="w-full py-3 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-widest font-bold">Dismiss</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => !updatingId && setIsDeleteModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-lg w-full max-w-sm overflow-hidden border border-gray-100 shadow-2xl">
               <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center mx-auto mb-6 border border-rose-100 shadow-xl shadow-rose-100/50">
                    <Trash2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase">Permanently Remove?</h3>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                    Are you sure you want to delete <span className="text-slate-900 font-bold">{userToDelete.name || userToDelete.email}</span>? Their access and registry data will be removed.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button onClick={handleDeleteUser} disabled={updatingId === userToDelete.id} className="w-full py-4 bg-rose-600 text-white text-sm font-bold rounded-lg hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-rose-600/20">
                      {updatingId === userToDelete.id ? <RefreshCcw className="w-4 h-4 animate-spin" /> : null}
                      Yes, Remove Profile
                    </button>
                    <button onClick={() => setIsDeleteModalOpen(false)} disabled={updatingId === userToDelete.id} className="w-full py-4 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-gray-50 rounded-lg transition-all uppercase tracking-widest">Cancel</button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import {
  Plus,
  Trash2,
  Layers,
  ChevronRight,
  Search,
  LayoutGrid,
  Info,
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Edit2,
  Power
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

export default function AdminCategories() {
  const { hasPermission } = useAuth();
  
  const canAdd = hasPermission('categories_create');
  const canEdit = hasPermission('categories_update');
  const canDelete = hasPermission('categories_delete');

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [adding, setAdding] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string, name: string, isActive?: boolean } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/admin/categories');
      setCategories(data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setAdding(true);
    try {
      const data = await apiFetch('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newCatName })
      });
      setCategories([...categories, data.data]);
      setNewCatName('');
      Swal.fire({ icon: 'success', title: 'Success!', text: 'Category added successfully.', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Failed to add category. Please try again.' });
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) return;
    setAdding(true);
    try {
      const data = await apiFetch(`/admin/categories/${editingCategory.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editingCategory.name, isActive: editingCategory.isActive })
      });
      setCategories(categories.map(c => c.id === editingCategory.id ? data.data : c));
      Swal.fire({ icon: 'success', title: 'Updated!', text: 'Category updated successfully.', timer: 1500, showConfirmButton: false });
      setIsEditModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Failed', text: 'Failed to update category.' });
    } finally {
      setAdding(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setCategories(categories.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
      await apiFetch(`/admin/categories/${id}/status`, { method: 'PATCH' });
    } catch (error: any) {
      // Revert on error
      setCategories(categories.map(c => c.id === id ? { ...c, isActive: currentStatus } : c));
      Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to update status' });
    }
  };

  const confirmDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This action will remove the category permanently.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          await apiFetch(`/admin/categories/${id}`, { method: 'DELETE' });
          return true;
        } catch (error: any) {
          Swal.showValidationMessage(error.message || 'Failed to remove category.');
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed) {
      setCategories(categories.filter(c => c.id !== id));
      Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Category removed successfully.', timer: 1500, showConfirmButton: false });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and organize the marketplace categories.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none"
            />
          </div>

          {canAdd && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 bg-[#164e33] hover:bg-[#113f29] text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          )}
        </div>
      </div>

      <div>
        {/* ADD CATEGORY MODAL */}
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => { if (!adding) setIsAddModalOpen(false); }}
                className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Category</h3>
                  <button 
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <Plus className="w-5 h-5 rotate-45" />
                  </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); handleAdd(e).then(() => setIsAddModalOpen(false)); }}>
                  <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Category Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Electronics, Fashion"
                        value={newCatName}
                        required
                        autoFocus
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={adding || !newCatName.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#164e33] hover:bg-[#113f29] rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                    >
                      {adding ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* EDIT CATEGORY MODAL */}
        <AnimatePresence>
          {isEditModalOpen && editingCategory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => { if (!adding) setIsEditModalOpen(false); }}
                className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Category</h3>
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <Plus className="w-5 h-5 rotate-45" />
                  </button>
                </div>
                
                <form onSubmit={handleEdit}>
                  <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Category Name</label>
                      <input
                        type="text"
                        value={editingCategory.name}
                        required
                        autoFocus
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <label className="text-sm font-medium text-gray-700">Category Status</label>
                      <button
                        type="button"
                        onClick={() => setEditingCategory({ ...editingCategory, isActive: !editingCategory.isActive })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          editingCategory.isActive ? 'bg-[#164e33]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            editingCategory.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={adding || !editingCategory.name.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#164e33] hover:bg-[#113f29] rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                    >
                      {adding ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-white border border-gray-200 rounded-lg animate-pulse flex items-center p-4 gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                </div>
              </div>
            ))
          ) : categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
            categories
              .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((cat) => (
                <div
                  key={cat.id}
                  className={`group p-5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    cat.isActive !== false 
                      ? 'bg-white border-gray-200/70 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:border-[#164e33]/30 hover:shadow-md' 
                      : 'bg-gray-50 border-gray-200 opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                      cat.isActive !== false
                        ? 'bg-gradient-to-br from-[#164e33]/10 to-[#164e33]/5 text-[#164e33] border-[#164e33]/10'
                        : 'bg-gray-200 text-gray-500 border-gray-300'
                    }`}>
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1 flex items-center gap-2">
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-semibold text-gray-900 truncate flex items-center gap-2" title={cat.name}>
                          {cat.name}
                        </h3>
                        <p className="text-[11px] font-medium text-gray-500 mt-1 tracking-wider uppercase">
                          REF: {cat.id.slice(-8)}
                        </p>
                      </div>
                      {cat.isActive === false && (
                        <span className="shrink-0 whitespace-nowrap ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-200 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-100 transition-opacity shrink-0">
                    {canEdit && (
                      <button
                        onClick={() => {
                          setEditingCategory({ id: cat.id, name: cat.name, isActive: cat.isActive !== false });
                          setIsEditModalOpen(true);
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-500 hover:text-[#164e33] hover:bg-[#164e33]/10 rounded-lg transition-colors border border-gray-200 hover:border-[#164e33]/20"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => confirmDelete(cat.id)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 hover:border-red-200"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
          ) : (
            <div className="col-span-full py-16 bg-white border border-gray-200 border-dashed rounded-lg flex flex-col items-center justify-center text-center">
              <LayoutGrid className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-sm font-semibold text-gray-900">No categories found</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-xs">
                {searchTerm ? "We couldn't find anything matching your search." : "Get started by adding a new category to your marketplace."}
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}




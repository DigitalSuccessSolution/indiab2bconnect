'use client';

import React, { useState, useEffect } from 'react';
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
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [adding, setAdding] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

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
      setMessage({ type: 'success', text: 'Category added successfully.' });
      setIsAddModalOpen(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add category. Please try again.' });
    } finally {
      setAdding(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/admin/categories/${id}`, { method: 'DELETE' });
      setCategories(categories.filter(c => c.id !== id));
      setMessage({ type: 'success', text: 'Category removed successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove category.' });
    } finally {
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-simple-fade pb-20 p-2 md:p-0">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Marketplace Categories</h1>
          <p className="text-slate-600 font-medium mt-1 text-sm">Manage the industry classifications for your hub's vendors and products.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all shadow-sm"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3.5 bg-[#164e33] hover:bg-[#113f29] text-white rounded-lg font-semibold flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-[#164e33]/20"
          >
            <Plus className="w-5 h-5" />
            Add New Category
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* ADD CATEGORY MODAL */}
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => { if (!adding) setIsAddModalOpen(false); }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-lg p-8 max-w-sm w-full border border-gray-100 shadow-2xl"
              >
                <div className="w-12 h-12 bg-[#164e33]/5 text-[#164e33] rounded-lg flex items-center justify-center mb-5 border border-[#164e33]/10">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Create New Category</h3>
                <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest mb-6">Define an industry sector</p>

                <form onSubmit={handleAdd}>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="e.g. Chemical Manufacturing"
                      value={newCatName}
                      required
                      autoFocus
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-lg text-sm font-semibold focus:bg-white focus:border-emerald-300 transition-all outline-none"
                    />

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="flex-1 py-3.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={adding || !newCatName.trim()}
                        className="flex-1 py-3.5 bg-[#164e33] hover:bg-[#113f29] text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-[#164e33]/20"
                      >
                        {adding ? "Creating..." : "Create"}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-lg border flex items-center gap-3 text-sm font-semibold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-28 bg-gray-50 border border-gray-100 rounded-lg animate-pulse"></div>)
          ) : categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
            categories
              .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((cat) => (
                <motion.div
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group bg-white p-5 rounded-lg border border-gray-100 hover:border-emerald-200 transition-all flex items-center justify-between shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100/50 group-hover:bg-emerald-100 transition-colors">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-[15px] font-bold text-slate-900 capitalize tracking-tight leading-tight">{cat.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID: {cat.id.slice(-6).toUpperCase()}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Active Sector</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setSelectedCatId(cat.id);
                        setIsDeleteConfirmOpen(true);
                      }}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
          ) : (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
              <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-500 uppercase">No categories discovered</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Deletion */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setSelectedCatId(null);
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-lg p-8 max-w-sm w-full border border-gray-100 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-6 border border-red-100">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Deletion</h3>
              <p className="text-sm text-slate-600 font-medium mb-8 leading-relaxed">
                Are you sure? This action will remove the category permanently from the marketplace index.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    if (selectedCatId) handleDelete(selectedCatId);
                    setIsDeleteConfirmOpen(false);
                    setSelectedCatId(null);
                  }}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-red-100"
                >
                  Delete Permanently
                </button>
                <button
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    setSelectedCatId(null);
                  }}
                  className="w-full py-4 bg-white border border-gray-200 text-slate-800 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all"
                >
                  Keep Category
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

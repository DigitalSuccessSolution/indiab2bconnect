'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import {
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  RefreshCcw,
  AlertCircle,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminPackages() {
  const { hasPermission } = useAuth();

  const canAdd = hasPermission('packages_create');
  const canEdit = hasPermission('packages_update');
  const canDelete = hasPermission('packages_delete');

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const data = await apiFetch('/admin/packages');
      setPackages(data.data || []);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to retire this membership tier?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          await apiFetch(`/admin/packages/${id}`, { method: 'DELETE' });
          return true;
        } catch (error) {
          Swal.showValidationMessage('Failed to delete package.');
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed) {
      setPackages(packages.filter((p: any) => p.id !== id));
      Swal.fire({ 
        icon: 'success', 
        title: 'Deleted!', 
        text: 'Membership tier has been removed.', 
        timer: 1500, 
        showConfirmButton: false 
      });
    }
  };

  if (loading) return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-36"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col space-y-6 h-[400px]">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="space-y-3 flex-1 mt-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-full mt-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4 border-b border-gray-100">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">Membership Tiers</h1>
          <p className="text-sm text-gray-500 mt-1">Design and manage subscription plans for platform vendors.</p>
        </div>

        {canAdd && (
          <button
            onClick={() => { setCurrentPackage(null); setIsModalOpen(true); }}
            className="px-4 py-2 bg-[#164e33] text-white rounded-md text-sm font-semibold hover:bg-[#113f29] flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create New Plan
          </button>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg: any, idx) => {
          const isPopular = pkg.isPopular === true;
          const isActive = pkg.isActive !== false;

          return (
            <div
              key={pkg.id}
              className={`bg-white rounded-xl border border-gray-200 p-6 flex flex-col relative hover:border-[#164e33] hover:shadow-md transition-all ${!isActive ? 'opacity-60 grayscale-[50%]' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF4F00] to-[#E64600] text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-md z-10 whitespace-nowrap">
                  Most Popular
                </div>
              )}
              
              {!isActive && (
                <div className="absolute top-5 right-5 flex flex-col gap-1 items-end z-10">
                  <div className="bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
                    Inactive
                  </div>
                </div>
              )}

              <div className="mb-2 pr-12">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {pkg.name}
                  {isPopular && <span className="inline-flex w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_6px_rgba(250,204,21,0.8)]"></span>}
                </h3>
              </div>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">₹{pkg.price?.toLocaleString()}</span>
                <span className="text-sm font-medium text-gray-500">/ mo</span>
              </div>

              <div className="flex-1 space-y-3 mb-8">
                {Array.isArray(pkg.features) && pkg.features.slice(0, 4).map((f: string) => (
                  <div key={f} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#164e33] shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{f}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-auto pt-5 border-t border-gray-100">
                {canEdit && (
                  <button
                    onClick={() => { setCurrentPackage(pkg); setIsModalOpen(true); }}
                    className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 hover:text-gray-900 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="px-4 py-2.5 bg-white border border-rose-200 text-rose-600 rounded-md hover:bg-rose-50 flex items-center justify-center shadow-sm"
                    title="Delete Package"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Static Centered Modal (No Animation) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{currentPackage ? 'Edit Plan' : 'Create New Plan'}</h2>
                <p className="text-sm text-gray-500">Configure pricing and features.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <form id="package-form" onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const featuresRaw = formData.get('features') as string;
                const payload = {
                  name: formData.get('name'),
                  price: parseFloat(formData.get('price') as string),
                  isPopular: formData.get('isPopular') === 'on',
                  isActive: formData.get('isActive') === 'on',
                  priority: parseInt(formData.get('priority') as string) || 1,
                  description: formData.get('description') || '',
                  features: featuresRaw
                    ? featuresRaw.split(',').map((f: string) => f.trim()).filter(Boolean)
                    : [],
                };

                setIsSaving(true);
                try {
                  if (currentPackage) {
                    await apiFetch(`/admin/packages/${currentPackage.id}`, {
                      method: 'PUT',
                      body: JSON.stringify(payload)
                    });
                  } else {
                    await apiFetch('/admin/packages', {
                      method: 'POST',
                      body: JSON.stringify(payload)
                    });
                  }
                  setIsModalOpen(false);
                  fetchPackages();
                  Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: `Plan ${currentPackage ? 'updated' : 'added'} successfully.`,
                    timer: 2000,
                    showConfirmButton: false
                  });
                } catch (err: any) {
                  console.error('Failed to save package:', err);
                  Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: err.message || 'Failed to process request'
                  });
                } finally {
                  setIsSaving(false);
                }
              }} className="space-y-5">

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Plan Name</label>
                  <input
                    name="name"
                    defaultValue={currentPackage?.name}
                    placeholder="e.g. Platinum Plus"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Price (INR)</label>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      defaultValue={currentPackage?.price}
                      placeholder="999"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="isPopular"
                      name="isPopular"
                      defaultChecked={currentPackage ? currentPackage.isPopular : false}
                      className="w-4 h-4 text-[#164e33] border-gray-300 rounded focus:ring-[#164e33]"
                    />
                    <label htmlFor="isPopular" className="text-sm font-medium text-gray-700">Mark as "Most Popular"</label>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      defaultChecked={currentPackage ? currentPackage.isActive : true}
                      className="w-4 h-4 text-[#164e33] border-gray-300 rounded focus:ring-[#164e33]"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active Package</label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Priority Level</label>
                  <input
                    name="priority"
                    type="number"
                    min="1"
                    defaultValue={currentPackage?.priority ?? 1}
                    placeholder="1-10"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                  />
                  <p className="text-xs text-gray-500">Higher priority packages appear as "Pro" and are ranked higher.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Features (Comma separated)</label>
                  <textarea
                    name="features"
                    rows={4}
                    defaultValue={currentPackage?.features?.join(', ')}
                    placeholder="Verified Badge, Analytics, Priority Support"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    defaultValue={currentPackage?.description}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="package-form"
                disabled={isSaving}
                className="px-4 py-2 bg-[#164e33] text-white rounded-md text-sm font-semibold hover:bg-[#113f29] shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  'Save Plan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

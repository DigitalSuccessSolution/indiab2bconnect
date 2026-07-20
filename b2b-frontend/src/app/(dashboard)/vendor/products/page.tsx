'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import {
   Box,
   Plus,
   Trash2,
   Save,
   AlertCircle,
   CheckCircle2,
   Layers,
   X,
   Target,
   ArrowRight,
   ShieldCheck,
   RefreshCcw,
   Tag,
   ImageIcon,
   Upload,
   Info,
   Edit3,
   ChevronDown,
   Lock,
   CreditCard,
   ChevronRight,
   Filter,
   Eye,
   EyeOff,
   MoreVertical,
   ChevronLeft,
   TrendingUp,
   Clock,
   Search,
   Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
/* ── subscription helpers ── */
function isSubscriptionActive(vendor: any): boolean {
   if (!vendor?.packageId) return false;
   if (!vendor?.planExpiry) return false;
   return new Date(vendor.planExpiry) > new Date();
}

/* ── Subscription Gate Screen ── */
function SubscriptionGate({ vendorName }: { vendorName: string }) {
   const router = useRouter();
   return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-10 space-y-8">
         <div className="w-20 h-20 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-9 h-9 text-amber-500" />
         </div>
         <div className="space-y-2 max-w-md">
            <h2 className="text-xl font-bold text-gray-900">Subscription Required</h2>
            <p className="text-sm text-gray-600">
               Hi <span className="font-semibold text-gray-900">{vendorName || 'there'}</span>, you need an active subscription to list and manage your products.
            </p>
         </div>
         <div className="bg-white border border-gray-200 rounded-xl p-6 w-full max-w-md text-left space-y-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">What you get with a subscription:</p>
            <div className="space-y-3">
               {[
                  'List your products & services on the marketplace',
                  'Get verified badge & trust signals',
                  'Receive business leads from buyers',
                  'Appear in search results with ranking boost',
                  'Email & WhatsApp lead notifications',
               ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                     <CheckCircle2 className="w-5 h-5 text-[#164e33] shrink-0" />
                     {f}
                  </div>
               ))}
            </div>
         </div>
         <button
            onClick={() => router.push('/vendor/billing')}
            className="flex items-center gap-2 bg-[#164e33] text-white px-8 py-3.5 rounded-lg text-sm font-medium hover:bg-[#113f29] transition-colors shadow-sm"
         >
            <CreditCard className="w-4 h-4" />
            View Plans & Subscribe
            <ChevronRight className="w-4 h-4" />
         </button>
      </div>
   );
}

export default function VendorProducts() {
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [uploading, setUploading] = useState(false);
   const [message, setMessage] = useState({ type: '', text: '' });
   const [categories, setCategories] = useState<any[]>([]);
   const [hasSubscription, setHasSubscription] = useState(true);

   const [vendorData, setVendorData] = useState<any>({
      products: [],
      keywords: []
   });

   const [newProduct, setNewProduct] = useState({
      name: '',
      description: '',
      price: '',
      category: '',
      images: [] as string[],
      keywords: [] as string[],
      moq: '1',
      availability: true,
      specifications: '',
      type: 'PRODUCT',
      sku: ''
   });

   const [newKeyword, setNewKeyword] = useState('');
   const [productKeywordInput, setProductKeywordInput] = useState('');
   const [showProductForm, setShowProductForm] = useState(false);
   const [editingId, setEditingId] = useState<string | null>(null);
   const [formErrors, setFormErrors] = useState<Record<string, string>>({});
   const searchParams = useSearchParams();
   const initialTab = (searchParams?.get('tab') as 'PRODUCT' | 'SERVICE') || 'PRODUCT';
   const initialPage = Number(searchParams?.get('page')) || 1;
   const initialLimit = Number(searchParams?.get('limit')) || 10;

   const [activeTab, setActiveTab] = useState<'PRODUCT' | 'SERVICE'>(initialTab);
   const [currentPage, setCurrentPage] = useState(initialPage);
   const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
   const [paginatedProducts, setPaginatedProducts] = useState<any[]>([]);
   const [productsMeta, setProductsMeta] = useState({ total: 0, totalPages: 1 });
   const [productsLoading, setProductsLoading] = useState(true);
   const [specs, setSpecs] = useState<{ key: string, value: string }[]>([{ key: '', value: '' }]);
   const fileInputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      const fetchCatalog = async () => {
         try {
            const profileData = await apiFetch('/vendors/me');
            if (profileData && profileData.data) {
               setVendorData({
                  ...profileData.data,
                  products: profileData.data.products || [],
                  keywords: profileData.data.keywords || []
               });
               setHasSubscription(isSubscriptionActive(profileData.data));

               // Trigger categories fetch after getting profile (for filtering)
               fetchCategories(profileData.data);
            }
         } catch (error) {
            console.error('Failed to fetch catalog:', error);
         } finally {
            setLoading(false);
         }
      };

      const fetchCategories = async (pData: any) => {
         try {
            const categoriesData = await apiFetch('/vendors/categories');
            if (categoriesData && categoriesData.data) {
               const registeredCategoryIds = pData?.categories?.map((c: any) => c.id) || [];
               const filtered = categoriesData.data.filter((cat: any) => registeredCategoryIds.includes(cat.id));
               setCategories(filtered);
               if (!newProduct.category && filtered.length > 0) {
                  setNewProduct(prev => ({ ...prev, category: filtered[0].name }));
               }
            }
         } catch (error) {
            console.error('Categories fetch failed:', error);
         }
      };

      fetchCatalog();
   }, []);

   useEffect(() => {
      const fetchProducts = async () => {
         setProductsLoading(true);
         try {
            const res = await apiFetch(`/vendors/products?page=${currentPage}&limit=${itemsPerPage}&type=${activeTab}`);
            if (res && res.data) {
               setPaginatedProducts(res.data.data || []);
               setProductsMeta(res.data.meta || { total: 0, totalPages: 1 });
            }
         } catch (error) {
            console.error('Failed to fetch paginated products:', error);
         } finally {
            setProductsLoading(false);
         }
      };

      const newUrl = `/vendor/products?tab=${activeTab}&page=${currentPage}&limit=${itemsPerPage}`;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);

      fetchProducts();
   }, [currentPage, itemsPerPage, activeTab]);

   const handleUpdate = async () => {
      setSaving(true);
      try {
         const keywords = vendorData.keywords.map((k: any) => typeof k === 'string' ? k : k.name);
         await apiFetch('/vendors/me', {
            method: 'PUT',
            body: JSON.stringify({ keywords }),
         });
         Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'success', title: 'Catalog Synced Successfully' });
      } catch (error: any) {
         Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'error', title: error.message || 'Sync failed' });
      } finally {
         setSaving(false);
      }
   };

   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
         Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'error', title: 'File size must be less than 2MB' });
         return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      try {
         const token = localStorage.getItem('token');
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors/upload-image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
         });
         const data = await response.json();
         if (data.success) {
            setNewProduct({ ...newProduct, images: [...newProduct.images, data.data.url] });
            setFormErrors({ ...formErrors, images: '' });
            Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'success', title: 'Image added' });
         }
      } catch (error) {
         Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'error', title: 'Upload failed' });
      } finally {
         setUploading(false);
      }
   };

   const saveProduct = async () => {
      const errors: Record<string, string> = {};
      if (!newProduct.name.trim()) errors.name = activeTab === 'SERVICE' ? 'Service name is required' : 'Product name is required';
      if (!newProduct.price || parseFloat(newProduct.price) <= 0) errors.price = 'Valid price is required';
      if (!newProduct.category) errors.category = 'Category is required';
      if (!newProduct.description.trim()) errors.description = 'Description is required';
      if (newProduct.images.length === 0) errors.images = 'At least one image is required';
      if (!newProduct.sku.trim()) errors.sku = activeTab === 'SERVICE' ? 'Service area is required' : 'SKU is required';
      if (activeTab === 'PRODUCT' && (!newProduct.moq || parseInt(newProduct.moq) <= 0)) errors.moq = 'Valid MOQ is required';

      const validSpecs = specs.filter(s => s.key.trim() && s.value.trim());

      if (Object.keys(errors).length > 0) {
         setFormErrors(errors);
         const firstError = Object.values(errors)[0];
         Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: firstError,
            confirmButtonColor: '#164e33'
         });
         return;
      }

      setFormErrors({});
      setSaving(true);
      try {
         const validSpecs = specs.filter(s => s.key.trim() && s.value.trim());
         const payload = { ...newProduct, type: activeTab, specifications: validSpecs.length ? JSON.stringify(validSpecs) : '' };
         let response;
         if (editingId) {
            response = await apiFetch(`/vendors/products/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
         } else {
            response = await apiFetch('/vendors/products', { method: 'POST', body: JSON.stringify(payload) });
         }
         if (response && response.data) {
            setVendorData({
               ...vendorData,
               products: editingId
                  ? vendorData.products.map((p: any) => p.id === editingId ? response.data : p)
                  : [response.data, ...vendorData.products]
            });
            if (response.data.type === activeTab) {
               if (editingId) {
                  setPaginatedProducts(paginatedProducts.map((p: any) => p.id === editingId ? response.data : p));
               } else {
                  setPaginatedProducts([response.data, ...paginatedProducts.slice(0, itemsPerPage - 1)]);
                  setProductsMeta({ ...productsMeta, total: productsMeta.total + 1 });
               }
            }
            setShowProductForm(false);
            setEditingId(null);
            setNewProduct({ name: '', description: '', price: '', category: '', images: [], keywords: [], moq: '1', availability: true, specifications: '', type: activeTab, sku: '' });
            setSpecs([{ key: '', value: '' }]);
            setSpecs([{ key: '', value: '' }]);
            Swal.fire({
               icon: 'success',
               title: 'Success!',
               text: editingId ? 'Item updated successfully' : 'Item added successfully',
               confirmButtonColor: '#164e33',
            });
         }
      } catch (error) {
         Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to save item',
            confirmButtonColor: '#164e33',
         });
      } finally {
         setSaving(false);
      }
   };

   const startEdit = (product: any) => {
      setEditingId(product.id);
      setNewProduct({
         name: product.name || '',
         description: product.description || '',
         price: product.price?.toString() || '',
         category: product.category || '',
         images: product.images || [],
         keywords: product.keywords || [],
         moq: product.moq?.toString() || '1',
         availability: product.availability ?? true,
         specifications: product.specifications || '',
         type: product.type || 'PRODUCT',
         sku: product.sku || ''
      });
      let parsedSpecs = [{ key: '', value: '' }];
      if (product.specifications && product.specifications.startsWith('[')) {
         try { parsedSpecs = JSON.parse(product.specifications); } catch (e) { }
      }
      setSpecs(parsedSpecs.length ? parsedSpecs : [{ key: '', value: '' }]);
      setFormErrors({});
      setShowProductForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };
   const handleTabChange = (tab: 'PRODUCT' | 'SERVICE') => {
      setActiveTab(tab);
      setCurrentPage(1);
      setShowProductForm(false);
      setEditingId(null);
      setFormErrors({});
      setNewProduct({ name: '', description: '', price: '', category: '', images: [], keywords: [], moq: '1', availability: true, specifications: '', type: tab, sku: '' });
      setSpecs([{ key: '', value: '' }]);
   };

   const removeProduct = async (id: string) => {
      Swal.fire({
         title: 'Are you sure?',
         text: 'Are you sure you want to remove this item?',
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: '#164e33',
         cancelButtonColor: '#d33',
         confirmButtonText: 'Yes, proceed',
         cancelButtonText: 'Cancel'
      }).then(async (result) => {
         if (result.isConfirmed) {
            try {
               await apiFetch(`/vendors/products/${id}`, { method: 'DELETE' });
               setVendorData({
                  ...vendorData,
                  products: vendorData.products.filter((p: any) => p.id !== id)
               });
               setPaginatedProducts(paginatedProducts.filter((p: any) => p.id !== id));
               setProductsMeta({ ...productsMeta, total: Math.max(0, productsMeta.total - 1) });
               Swal.fire({
                  title: 'Deleted!',
                  text: 'Item removed successfully',
                  icon: 'success',
                  confirmButtonColor: '#164e33',
               });
            } catch (error) {
               Swal.fire({
                  title: 'Error',
                  text: 'Failed to remove item',
                  icon: 'error',
                  confirmButtonColor: '#164e33',
               });
            }
         }
      });
   };

   const toggleAvailability = async (item: any) => {
      Swal.fire({
         title: 'Are you sure?',
         text: `Do you want to mark this item as ${item.availability ? 'Inactive' : 'Active'}?`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: '#164e33',
         cancelButtonColor: '#d33',
         confirmButtonText: 'Yes, change it!',
         cancelButtonText: 'Cancel'
      }).then(async (result) => {
         if (result.isConfirmed) {
            try {
               const payload = { availability: !item.availability };
               const response = await apiFetch(`/vendors/products/${item.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
               if (response && response.data) {
                  setVendorData({
                     ...vendorData,
                     products: vendorData.products.map((p: any) => p.id === item.id ? response.data : p)
                  });
                  setPaginatedProducts(paginatedProducts.map((p: any) => p.id === item.id ? response.data : p));
               }
            } catch (error) {
               console.error('Failed to update availability', error);
            }
         }
      });
   };

   const addKeyword = () => {
      if (!newKeyword.trim()) return;
      setVendorData({
         ...vendorData,
         keywords: [...vendorData.keywords, { id: Math.random().toString(), name: newKeyword.trim() }]
      });
      setNewKeyword('');
   };

   const removeKeyword = (id: string) => {
      setVendorData({
         ...vendorData,
         keywords: vendorData.keywords.filter((k: any) => (typeof k === 'string' ? k : k.id) !== id)
      });
   };



   if (!hasSubscription) return <SubscriptionGate vendorName={vendorData?.businessName || ''} />;

   const currentItems = paginatedProducts;
   const totalPages = Math.max(1, productsMeta.totalPages);
   const isTableLoading = loading || productsLoading;

   // Stats Calculations
   const totalProductsCount = vendorData.products?.length || 0;
   const approvedProductsCount = vendorData.products?.filter((p: any) => p.status === 'APPROVED').length || 0;
   const approvedPercentage = totalProductsCount > 0 ? Math.round((approvedProductsCount / totalProductsCount) * 100) : 0;

   let calculatedVisibility = 0;
   if (totalProductsCount > 0) {
      let score = 0;
      vendorData.products.forEach((p: any) => {
         if (p.images?.length > 0) score += 30;
         if (p.description?.length > 10) score += 20;
         if (p.price && parseFloat(p.price) > 0) score += 20;
         if (p.category) score += 20;
         if (p.sku) score += 10;
      });
      calculatedVisibility = Math.round(score / totalProductsCount);
   }
   const backendScore = parseFloat(vendorData.totalScore);
   const finalVisibilityScore = !isNaN(backendScore)
      ? (backendScore <= 1 ? Math.round(backendScore * 100) : Math.round(backendScore))
      : calculatedVisibility;

   const totalViewsCount = vendorData.views || 0;

   return (
      <div className="space-y-5 sm:space-y-6 md:space-y-8 animate-fade-in pb-16">

         {/* Header Section */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
               <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Products & Services</h1>
               <p className="text-xs sm:text-sm text-gray-500">Manage your catalog items and visibility settings</p>
            </div>
         </div>

         {/* Top Stats Row (Dashboard Style) */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
               { label: 'Total Products', value: totalProductsCount, sub: 'Overall catalog size', icon: Box, color: '#10b981' },
               { label: 'Approved Products', value: approvedProductsCount, sub: `${approvedPercentage}% of total`, icon: CheckCircle2, color: '#f58220' },
               { label: 'Avg. Visibility Score', value: `${finalVisibilityScore}%`, sub: finalVisibilityScore >= 80 ? 'Excellent visibility' : finalVisibilityScore >= 50 ? 'Good visibility' : 'Needs improvement', icon: Eye, color: '#3b82f6' },
            ].map((stat, i) => (
               <div key={i} className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 shrink-0">
                           <stat.icon size={16} />
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{stat.label}</span>
                     </div>
                     <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-none mb-1">{stat.value}</h3>
                     <p className="text-[10px] sm:text-xs text-gray-500 truncate">{stat.sub}</p>
                  </div>
               </div>
            ))}
         </div>

         {/* Main Content Layout */}
         <div className="space-y-8">

            {/* Table Section */}
            <div className="space-y-6">
               <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">

                  {/* Controls Header */}
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
                     <div className="flex items-center gap-6">
                        <button
                           onClick={() => handleTabChange('PRODUCT')}
                           className={`text-sm font-medium pb-4 -mb-4 relative transition-all ${activeTab === 'PRODUCT' ? 'text-[#164e33]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                           Products
                           {activeTab === 'PRODUCT' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#164e33]" />}
                        </button>
                        <button
                           onClick={() => handleTabChange('SERVICE')}
                           className={`text-sm font-medium pb-4 -mb-4 relative transition-all ${activeTab === 'SERVICE' ? 'text-[#164e33]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                           Services
                           {activeTab === 'SERVICE' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#164e33]" />}
                        </button>
                     </div>

                     <div className="flex items-center gap-3">
                        {!showProductForm && (
                           <button
                              onClick={() => {
                                 setNewProduct({ name: '', description: '', price: '', category: '', images: [], keywords: [], moq: '1', availability: true, specifications: '', type: activeTab, sku: '' });
                                 setSpecs([{ key: '', value: '' }]);
                                 setFormErrors({});
                                 setShowProductForm(true);
                              }}
                              className="h-10 px-4 bg-[#164e33] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#113f29] transition-colors shadow-sm"
                           >
                              <Plus size={16} /> Add Item
                           </button>
                        )}
                     </div>
                  </div>

                  {/* Add/Edit Drawer */}
                  <AnimatePresence>
                     {showProductForm && (
                        <motion.div
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           exit={{ opacity: 0, height: 0 }}
                           className="bg-gray-50 border-b border-gray-200"
                        >
                           <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                              <div className="flex items-center justify-between">
                                 <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Item Configuration</h3>
                                 <button onClick={() => { setShowProductForm(false); setEditingId(null); setFormErrors({}); }} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="space-y-4">
                                    <div className="space-y-1.5">
                                       <label className="block text-sm font-medium text-gray-700">{activeTab === 'SERVICE' ? 'Service Name' : 'Product Name'}</label>
                                       <input type="text" placeholder="e.g. Herbal Ayurveda Hub" className={`w-full bg-white border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#164e33] focus:border-transparent transition-shadow`} value={newProduct.name} onChange={e => { setNewProduct({ ...newProduct, name: e.target.value }); setFormErrors({ ...formErrors, name: '' }); }} />
                                       {formErrors.name && <p className="text-[10px] text-red-500 mt-1">{formErrors.name}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                       <label className="block text-sm font-medium text-gray-700">Description</label>
                                       <textarea placeholder="Tell buyers about your item..." className={`w-full bg-white border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#164e33] focus:border-transparent transition-shadow min-h-[100px] resize-none`} value={newProduct.description} onChange={e => { setNewProduct({ ...newProduct, description: e.target.value }); setFormErrors({ ...formErrors, description: '' }); }} />
                                       {formErrors.description && <p className="text-[10px] text-red-500 mt-1">{formErrors.description}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                       <label className="block text-sm font-medium text-gray-700">{activeTab === 'SERVICE' ? 'Service Keywords' : 'Product Keywords'}</label>
                                       <div className="flex gap-2">
                                          <input type="text" placeholder="e.g. Organic, Herbal" className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#164e33] focus:border-transparent transition-shadow" value={productKeywordInput} onChange={e => setProductKeywordInput(e.target.value)} onKeyDown={e => {
                                             if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (productKeywordInput.trim()) {
                                                   setNewProduct({ ...newProduct, keywords: [...newProduct.keywords, productKeywordInput.trim()] });
                                                   setProductKeywordInput('');
                                                }
                                             }
                                          }} />
                                          <button type="button" onClick={() => {
                                             if (productKeywordInput.trim()) {
                                                const currentKeywords = newProduct.keywords || [];
                                                setNewProduct({ ...newProduct, keywords: [...currentKeywords, productKeywordInput.trim()] });
                                                setProductKeywordInput('');
                                             }
                                          }} className="px-4 bg-[#164e33] text-white font-medium text-sm rounded-lg hover:bg-[#113f29] transition-colors">Add</button>
                                       </div>
                                       {newProduct.keywords && newProduct.keywords.length > 0 && (
                                          <div className="flex flex-wrap gap-2 mt-3">
                                             {newProduct.keywords.map((kw, i) => (
                                                <div key={i} className="px-2.5 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-md flex items-center gap-1.5 border border-gray-300">
                                                   #{kw}
                                                   <button type="button" onClick={() => setNewProduct({ ...newProduct, keywords: newProduct.keywords.filter((_, idx) => idx !== i) })} className="text-gray-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                                                </div>
                                             ))}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                                 <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                       <div className="space-y-1.5">
                                          <label className="block text-sm font-medium text-gray-700">{activeTab === 'SERVICE' ? 'Base Price (INR)' : 'Price (INR)'}</label>
                                          <input type="text" placeholder="0.00" className={`w-full bg-white border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#164e33] focus:border-transparent transition-shadow`} value={newProduct.price} onChange={e => { setNewProduct({ ...newProduct, price: e.target.value }); setFormErrors({ ...formErrors, price: '' }); }} />
                                          {formErrors.price && <p className="text-[9px] text-red-500 mt-1">{formErrors.price}</p>}
                                       </div>
                                       {activeTab === 'PRODUCT' ? (
                                          <>
                                             <div className="space-y-1.5">
                                                <label className="block text-sm font-medium text-gray-700">SKU</label>
                                                <input type="text" placeholder="REF-001" className={`w-full bg-white border ${formErrors.sku ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#164e33] focus:border-transparent transition-shadow`} value={newProduct.sku} onChange={e => { setNewProduct({ ...newProduct, sku: e.target.value }); setFormErrors({ ...formErrors, sku: '' }); }} />
                                                {formErrors.sku && <p className="text-[9px] text-red-500 mt-1">{formErrors.sku}</p>}
                                             </div>
                                             <div className="space-y-1.5">
                                                <label className="block text-sm font-medium text-gray-700">MOQ</label>
                                                <input type="number" min="1" placeholder="1" className={`w-full bg-white border ${formErrors.moq ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#164e33] focus:border-transparent transition-shadow`} value={newProduct.moq} onChange={e => { setNewProduct({ ...newProduct, moq: e.target.value }); setFormErrors({ ...formErrors, moq: '' }); }} />
                                                {formErrors.moq && <p className="text-[9px] text-red-500 mt-1">{formErrors.moq}</p>}
                                             </div>
                                          </>
                                       ) : (
                                          <div className="col-span-2 space-y-1.5">
                                             <label className="block text-sm font-medium text-gray-700">Service Area / Delivery Mode</label>
                                             <input type="text" placeholder="e.g. Online, On-site, Delhi NCR" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#164e33] focus:border-transparent transition-shadow" value={newProduct.sku} onChange={e => { setNewProduct({ ...newProduct, sku: e.target.value }) }} />
                                          </div>
                                       )}
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                                       <div>
                                          <p className="text-sm font-medium text-gray-900">Item Availability</p>
                                          <p className="text-xs text-gray-500">Turn off to temporarily hide this item.</p>
                                       </div>
                                       <button
                                          type="button"
                                          onClick={() => setNewProduct({ ...newProduct, availability: !newProduct.availability })}
                                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${newProduct.availability ? "bg-[#164e33]" : "bg-gray-300"}`}
                                       >
                                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newProduct.availability ? "translate-x-6" : "translate-x-1"}`} />
                                       </button>
                                    </div>

                                    <div className="space-y-1.5">
                                       <label className="block text-sm font-medium text-gray-700">Category</label>
                                       <select className={`w-full bg-white border ${formErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#164e33] focus:border-transparent transition-shadow appearance-none`} value={newProduct.category} onChange={e => { setNewProduct({ ...newProduct, category: e.target.value }); setFormErrors({ ...formErrors, category: '' }); }}>
                                          <option value="">Select Category</option>
                                          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                       </select>
                                       {formErrors.category && <p className="text-[10px] text-red-500 mt-1">{formErrors.category}</p>}
                                    </div>
                                    <div className="space-y-2 pt-2">
                                       <label className="block text-sm font-medium text-gray-700">Specifications (Key / Value)</label>
                                       {specs.map((spec, idx) => (
                                          <div key={idx} className="flex flex-col sm:flex-row gap-2">
                                             <input type="text" placeholder="e.g. Color" className={`flex-1 bg-white border ${formErrors.specifications ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#164e33]`} value={spec.key} onChange={e => {
                                                const newSpecs = [...specs];
                                                newSpecs[idx].key = e.target.value;
                                                setSpecs(newSpecs);
                                                setFormErrors({ ...formErrors, specifications: '' });
                                             }} />
                                             <input type="text" placeholder="e.g. Red" className={`flex-1 bg-white border ${formErrors.specifications ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#164e33]`} value={spec.value} onChange={e => {
                                                const newSpecs = [...specs];
                                                newSpecs[idx].value = e.target.value;
                                                setSpecs(newSpecs);
                                                setFormErrors({ ...formErrors, specifications: '' });
                                             }} />
                                             <button type="button" onClick={() => setSpecs(specs.filter((_, i) => i !== idx))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center shrink-0 border border-transparent"><Trash2 size={18} /></button>
                                          </div>
                                       ))}
                                       {formErrors.specifications && <p className="text-[10px] text-red-500 mt-1">{formErrors.specifications}</p>}
                                       <button type="button" onClick={() => { setSpecs([...specs, { key: '', value: '' }]); setFormErrors({ ...formErrors, specifications: '' }); }} className="text-sm font-medium text-[#164e33] flex items-center gap-1.5 hover:text-[#113f29] transition-colors bg-green-50 px-3 py-1.5 rounded-md w-fit border border-green-100"><Plus size={16} /> Add Specification</button>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                          <label className="block text-sm font-medium text-gray-700">Product Images</label>
                                          <span className="text-[10px] text-gray-500">Max 5 Images • 2MB (JPEG, PNG, WebP)</span>
                                       </div>

                                       {newProduct.images.length > 0 && (
                                          <div className="flex flex-wrap gap-2 mb-3">
                                             {newProduct.images.map((img, idx) => (
                                                <div 
                                                   key={idx} 
                                                   draggable
                                                   onDragStart={(e) => e.dataTransfer.setData('index', idx.toString())}
                                                   onDragOver={(e) => e.preventDefault()}
                                                   onDrop={(e) => {
                                                      e.preventDefault();
                                                      const draggedIdx = parseInt(e.dataTransfer.getData('index'));
                                                      if (isNaN(draggedIdx) || draggedIdx === idx) return;
                                                      const newImages = [...newProduct.images];
                                                      const draggedImg = newImages[draggedIdx];
                                                      newImages.splice(draggedIdx, 1);
                                                      newImages.splice(idx, 0, draggedImg);
                                                      setNewProduct({ ...newProduct, images: newImages });
                                                   }}
                                                   className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm group cursor-move"
                                                >
                                                   <img src={img} alt="Product" className="w-full h-full object-cover pointer-events-none" />
                                                   <button
                                                      type="button"
                                                      onClick={(e) => {
                                                         e.stopPropagation();
                                                         const updatedImages = [...newProduct.images];
                                                         updatedImages.splice(idx, 1);
                                                         setNewProduct({ ...newProduct, images: updatedImages });
                                                      }}
                                                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                                   >
                                                      <X size={12} />
                                                   </button>
                                                </div>
                                             ))}
                                          </div>
                                       )}

                                       {newProduct.images.length < 5 && (
                                          <div
                                             className={`w-full p-4 sm:p-6 border-2 border-dashed ${formErrors.images ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'} rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all group/upload`}
                                             onClick={() => fileInputRef.current?.click()}
                                          >
                                             <Upload size={24} className="text-gray-400 group-hover/upload:text-gray-500 transition-colors" />
                                             <div className="text-center space-y-1">
                                                <p className="text-sm font-medium text-gray-700">{uploading ? 'Processing...' : 'Click to Upload Media'}</p>
                                                <p className="text-xs text-gray-500">Recommended: 800x800px</p>
                                             </div>
                                          </div>
                                       )}
                                       {formErrors.images && <p className="text-[10px] text-red-500 mt-1">{formErrors.images}</p>}
                                       <input type="file" accept="image/jpeg, image/png, image/webp" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                                    </div>
                                 </div>
                              </div>
                              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-5 sm:pt-6 border-t border-gray-200">
                                 <button onClick={() => { setShowProductForm(false); setEditingId(null); setFormErrors({}); }} className="px-5 py-2.5 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center">Cancel</button>
                                 <button onClick={saveProduct} disabled={saving} className="px-5 py-2.5 sm:py-2 bg-[#164e33] text-white rounded-lg text-sm font-medium hover:bg-[#113f29] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Saving...' : editingId ? (activeTab === 'PRODUCT' ? 'Update Product' : 'Update Service') : (activeTab === 'PRODUCT' ? 'Add Product' : 'Add Service')}
                                 </button>
                              </div>
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>

                  {/* Product Matrix */}
                  <div className="overflow-x-auto table-scrollbar">
                     <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                           <tr className="border-b border-gray-200 bg-gray-50/50">
                              <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[60px]">Image</th>
                              <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[180px]">Name</th>
                              <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                              <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{activeTab === 'SERVICE' ? 'Service Area' : 'SKU'}</th>
                              {activeTab === 'PRODUCT' && <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">MOQ</th>}
                              <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Price</th>
                              <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                              <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                           {isTableLoading ? (
                              [...Array(5)].map((_, idx) => (
                                 <tr key={idx} className="animate-pulse">
                                    <td className="px-4 sm:px-6 py-4"><div className="w-10 h-10 bg-gray-200 rounded-lg"></div></td>
                                    <td className="px-4 sm:px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div><div className="h-3 bg-gray-100 rounded w-1/2"></div></td>
                                    <td className="px-4 sm:px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                                    <td className="px-4 sm:px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                                    {activeTab === 'PRODUCT' && <td className="px-4 sm:px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>}
                                    <td className="px-4 sm:px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                                    <td className="px-4 sm:px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                                    <td className="px-4 sm:px-6 py-4 text-right"><div className="flex justify-end gap-2"><div className="h-8 w-10 bg-gray-200 rounded-lg"></div><div className="h-8 w-8 bg-gray-200 rounded-lg"></div><div className="h-8 w-8 bg-gray-200 rounded-lg"></div></div></td>
                                 </tr>
                              ))
                           ) : currentItems.length > 0 ? (
                              currentItems.map((item: any, idx: number) => {
                                 return (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                       <td className="px-4 sm:px-6 py-4">
                                          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                             {(item.images?.length > 0 || item.imageUrl) ? (
                                                <img src={item.images?.[0] || item.imageUrl} className="w-full h-full object-cover" />
                                             ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400"><Box size={16} /></div>
                                             )}
                                          </div>
                                       </td>
                                       <td className="px-4 sm:px-6 py-4">
                                          <div className="flex flex-col">
                                             <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]" title={item.name}>{item.name}</p>
                                             {!item.availability && (
                                                <span className="text-xs text-gray-500 font-medium">Inactive</span>
                                             )}
                                          </div>
                                       </td>
                                       <td className="px-4 sm:px-6 py-4">
                                          <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-md border border-green-200 whitespace-nowrap">
                                             {item.category || 'General'}
                                          </span>
                                       </td>
                                       <td className="px-4 sm:px-6 py-4">
                                          <p className="text-sm text-gray-600 font-medium whitespace-nowrap">{item.sku || (activeTab === 'SERVICE' ? 'Online / Remote' : `REF-${idx + 1001}`)}</p>
                                       </td>
                                       {activeTab === 'PRODUCT' && (
                                          <td className="px-4 sm:px-6 py-4">
                                             <p className="text-sm text-gray-600 font-medium">{item.moq || 1}</p>
                                          </td>
                                       )}
                                       <td className="px-4 sm:px-6 py-4">
                                          <p className="text-sm font-medium text-gray-900 whitespace-nowrap">₹{item.price}</p>
                                       </td>
                                       <td className="px-4 sm:px-6 py-4">
                                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${item.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                                             item.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-amber-50 text-amber-700 border-amber-200'
                                             }`}>
                                             {item.status === 'APPROVED' ? 'Verified' :
                                                item.status === 'REJECTED' ? 'Rejected' : 'Review'}
                                          </div>
                                       </td>
                                       <td className="px-4 sm:px-6 py-4 text-right">
                                          <div className="flex items-center justify-end gap-1.5">
                                             <div className="flex items-center" title={item.availability ? "Deactivate Item" : "Activate Item"}>
                                                <button
                                                   type="button"
                                                   onClick={() => toggleAvailability(item)}
                                                   className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${item.availability ? "bg-[#164e33]" : "bg-gray-300"}`}
                                                >
                                                   <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${item.availability ? "translate-x-4" : "translate-x-1"}`} />
                                                </button>
                                             </div>
                                             <button onClick={() => startEdit(item)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-transparent hover:border-blue-100"><Edit3 size={16} /></button>
                                             <button onClick={() => removeProduct(item.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100"><Trash2 size={16} /></button>
                                          </div>
                                       </td>
                                    </tr>
                                 );
                              })
                           ) : (
                              <tr>
                                 <td colSpan={activeTab === 'PRODUCT' ? 8 : 7} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                       <Box className="w-10 h-10 text-gray-300 mb-3" />
                                       <p className="text-sm font-medium text-gray-900">No items found</p>
                                       <p className="text-xs text-gray-500 mt-1">Add products or services to build your catalog.</p>
                                    </div>
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="px-4 sm:px-6 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-gray-50">
                     <p className="text-xs sm:text-sm text-gray-700">
                        Showing <span className="font-medium">{productsMeta.total > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, productsMeta.total)}</span> of <span className="font-medium">{productsMeta.total}</span> items
                     </p>

                     <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
                        <div className="flex items-center gap-1">
                           <button
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1 || isTableLoading}
                              className="p-1.5 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                           >
                              <ChevronLeft className="w-5 h-5" />
                           </button>

                           <div className="flex items-center gap-1">
                              {[...Array(totalPages)].map((_, i) => {
                                 const pageNum = i + 1;
                                 if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                    return (
                                       <button
                                          key={pageNum}
                                          onClick={() => setCurrentPage(pageNum)}
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
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages || totalPages === 0 || isTableLoading}
                              className="p-1.5 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                           >
                              <ChevronRight className="w-5 h-5" />
                           </button>
                        </div>

                        <div className="bg-white border border-gray-300 px-3 py-1.5 rounded-md flex items-center gap-2 hover:bg-gray-50 transition-colors group relative">
                           <select
                              value={itemsPerPage}
                              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                           >
                              <option value={5}>5 / page</option>
                              <option value={10}>10 / page</option>
                              <option value={20}>20 / page</option>
                              <option value={50}>50 / page</option>
                           </select>
                           <span className="text-sm font-medium text-gray-700">{itemsPerPage} / page</span>
                           <ChevronDown size={14} className="text-gray-500 group-hover:text-gray-700 transition-colors" />
                        </div>
                     </div>
                  </div>

               </div>
            </div>



         </div>



         <style jsx global>{`
        .table-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f1f1f1;
        }
        .table-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .table-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 8px;
        }
        .table-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 8px;
        }
        .table-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0a0a0;
        }
      `}</style>
      </div>
   );
}

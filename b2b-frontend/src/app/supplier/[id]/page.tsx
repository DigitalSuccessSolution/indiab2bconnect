'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VendorLoginModal from '@/components/VendorLoginModal';
import CallNowModal from '@/components/CallNowModal';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Layers, 
  Star, 
  ArrowLeft, 
  Send,
  Mail,
  Clock,
  Globe,
  Box,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function VendorPublicProfile() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inquiry, setInquiry] = useState({ message: '' });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Call modal state
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callPhone, setCallPhone] = useState('');
  const [callSending, setCallSending] = useState(false);
  const [callSent, setCallSent] = useState(false);

  useEffect(() => {
    if (user?.phone) setCallPhone(user.phone);
  }, [user]);

  const fetchVendor = async () => {
    // Extract the actual UUID from the URL parameter (last 36 chars)
    // UUID format is 36 chars: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const actualId = typeof id === 'string' && id.length > 36 ? id.slice(-36) : id;
    
    try {
      const res = await apiFetch(`/vendors/${actualId}`);
      setVendor(res.data);
    } catch (error) {
      console.error('Failed to fetch vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendor();
  }, [id, user]);

  // Auto-open login modal if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLoginModalOpen(true);
    }
  }, [authLoading, user]);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        setLoginModalOpen(true);
        return;
    }
    
    setSending(true);
    try {
      await apiFetch('/leads', {
        method: 'POST',
        body: JSON.stringify({
          vendorId: vendor.id,
          buyerName: user.name,
          phone: user.phone || 'Logged-in User', 
          city: vendor.city,
          categoryId: vendor.categories?.[0]?.id,
          searchKeyword: 'Direct Inquiry',
          message: inquiry.message
        })
      });
      setSuccess(true);
      setInquiry({ message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Inquiry failed:', error);
    } finally {
      setSending(false);
    }
  };

  const handleDirectAction = (type: 'CALL' | 'WHATSAPP') => {
    if (!user) {
        setLoginModalOpen(true);
        return;
    }

    if (type === 'CALL') {
      setCallSent(false);
      setCallModalOpen(true);
    } else {
      // Background tracking for WhatsApp
      apiFetch('/leads/direct', {
          method: 'POST',
          body: JSON.stringify({ vendorId: vendor.id, actionType: type })
      }).catch(() => {});
      window.open(`https://wa.me/${vendor.phone.replace(/[^0-9]/g, '')}`, '_blank');
    }
  };

  const handleCallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callPhone || callSending) return;
    setCallSending(true);
    try {
      await apiFetch('/leads/direct', {
        method: 'POST',
        body: JSON.stringify({
          vendorId: vendor.id,
          actionType: 'CALL',
          buyerName: user?.name,
          phone: callPhone,
          city: vendor.city,
          categoryId: vendor.categories?.[0]?.id,
        })
      });
      setCallSent(true);
      setTimeout(() => {
        setCallSent(false);
        setCallModalOpen(false);
        const phone = vendor.phone?.replace(/[^0-9]/g, '');
        if (phone) window.location.href = `tel:${phone}`;
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setCallSending(false);
    }
  };

  const handleModalSuccess = () => {
    // Optionally trigger an action automatically
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f8fafc] animate-pulse">
      {/* Profile Header Skeleton */}
      <div className="bg-[#164e33]/90 pt-24 pb-32">
        <div className="w-full px-4 md:px-12">
          <div className="h-4 w-32 bg-white/20 rounded mb-8"></div>
          <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 w-full max-w-4xl">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-white/20 shrink-0"></div>
              <div className="flex-1 space-y-4 w-full">
                <div className="flex gap-3">
                  <div className="h-6 w-24 bg-white/20 rounded-lg"></div>
                  <div className="h-6 w-32 bg-white/20 rounded-lg"></div>
                </div>
                <div className="h-12 w-3/4 md:w-1/2 bg-white/20 rounded-lg"></div>
                <div className="flex gap-8 pt-6">
                  <div className="h-12 w-32 bg-white/10 rounded-lg"></div>
                  <div className="h-12 w-32 bg-white/10 rounded-lg"></div>
                  <div className="h-12 w-32 bg-white/10 rounded-lg"></div>
                </div>
              </div>
            </div>
            <div className="h-12 w-full lg:w-48 bg-white/20 rounded-xl"></div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="w-full px-4 md:px-12 py-16">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left Area (Products) */}
          <div className="flex-1 space-y-20">
            <div>
              <div className="h-4 w-40 bg-gray-200 rounded mb-12"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-lg overflow-hidden h-[380px] flex flex-col">
                    <div className="h-52 bg-gray-200 w-full"></div>
                    <div className="p-6 flex-1 space-y-4">
                      <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                      <div className="h-4 w-full bg-gray-100 rounded"></div>
                      <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-[380px] shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 h-[500px]">
              <div className="h-20 bg-gray-200 w-full"></div>
              <div className="p-8 space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-11 h-11 bg-gray-100 rounded-xl shrink-0"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-16 bg-gray-100 rounded"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
                <div className="h-12 w-full bg-gray-200 rounded-xl mt-4"></div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );

  if (!vendor) return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center pt-24">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4 uppercase tracking-tighter">Supplier Not Found</h2>
        <p className="text-gray-500 mb-8 font-medium">The requested business profile is currently unavailable.</p>
        <button onClick={() => router.back()} className="px-10 py-4 bg-[#164e33] hover:bg-black rounded-xl text-white font-bold flex items-center gap-3 transition-all ">
            <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
    </div>
  );

  const approvedOfferings = vendor.products ? vendor.products.filter((p: any) => p.status === 'APPROVED') : [];
  
  const avgRating = vendor.reviewsReceived?.length
    ? (vendor.reviewsReceived.reduce((a: number, r: any) => a + r.rating, 0) / vendor.reviewsReceived.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <VendorLoginModal 
        isOpen={loginModalOpen} 
        onClose={() => {
          setLoginModalOpen(false);
          if (!user) router.back(); // can't stay on page without login
        }} 
        vendor={vendor} 
        onSuccess={handleModalSuccess}
      />

      {/* Profile Header */}
      <div className="bg-[#164e33] pt-24 pb-32 relative overflow-hidden">
        <div className="w-full px-4 md:px-12 relative z-10">
            <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-gray-300 hover:text-white transition-colors font-semibold tracking-wider text-xs uppercase w-fit">
                <ArrowLeft className="w-4 h-4" /> Back to Search Results
            </button>

            <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-12">
                <div className="space-y-6 max-w-4xl">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Business Logo */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-[#164e33]/10 border border-[#164e33]/20 flex items-center justify-center shrink-0 overflow-hidden ">
                            {vendor.logoUrl ? (
                                <img src={vendor.logoUrl} alt={vendor.businessName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl md:text-5xl font-bold text-[#164e33]">
                                    {vendor.businessName.charAt(0)}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                                <span className="px-2.5 py-1 bg-white/10 border border-white/10 rounded-md text-emerald-300 text-[10px] font-semibold tracking-wider uppercase">
                                {vendor.category?.name || 'Authorized Partner'}
                                </span>
                                {vendor.verified && (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-md text-[10px] font-semibold tracking-wider uppercase text-emerald-50 shadow-sm">
                                        <ShieldCheck className="w-3 h-3" /> Verified Business
                                    </div>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-5xl lg:text-[50px] font-semibold tracking-tight text-white leading-[1.15] capitalize">
                                {vendor.businessName}
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-8 md:gap-12 pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <MapPin className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-medium text-emerald-100/50 uppercase tracking-widest mb-0.5">Location</p>
                                <p className="text-sm font-medium text-white capitalize">{vendor.city}</p>
                            </div>
                        </div>
                        {user && (
                            <>
                                {vendor.phone && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                            <Phone className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-medium text-emerald-100/50 uppercase tracking-widest mb-0.5">Phone</p>
                                            <p className="text-sm font-medium text-white">{vendor.phone}</p>
                                        </div>
                                    </div>
                                )}
                                {vendor.email && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                            <Mail className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-medium text-emerald-100/50 uppercase tracking-widest mb-0.5">Official Email</p>
                                            <p className="text-sm font-medium text-white">{vendor.email}</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-medium text-emerald-100/50 uppercase tracking-widest mb-0.5">Marketplace Rating</p>
                                <p className="text-sm font-medium text-white">{avgRating} / 5.0</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                    {!user ? (
                        <button 
                            onClick={() => setLoginModalOpen(true)}
                            className="w-full lg:w-auto px-10 py-4 bg-white hover:bg-gray-100 text-[#164e33] rounded-xl font-semibold tracking-wider text-[13px] uppercase transition-all"
                        >
                            Authorize to Connect
                        </button>
                    ) : (
                        <div className="flex gap-4 w-full">
                            <button 
                                onClick={() => handleDirectAction('CALL')}
                                className="flex-1 lg:flex-none px-10 py-4 bg-[#E64600] hover:bg-[#cc3e00] text-white rounded-xl font-semibold tracking-wider text-[13px] uppercase transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#E64600]/20"
                            >
                                <Phone className="w-4 h-4" /> Call Now
                            </button>
                            <button 
                                onClick={() => handleDirectAction('WHATSAPP')}
                                className="flex-1 lg:flex-none px-10 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#25D366]/20"
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg> WhatsApp
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <main className="w-full px-4 md:px-12 py-16">
        <div className="flex flex-col lg:flex-row gap-16">
            
            <div className="flex-1 space-y-20">
                {/* Products & Services Grid */}
                <section>
                    <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-[4px] mb-12 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Industrial Portfolio
                    </h3>
                    
                    {approvedOfferings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {approvedOfferings.map((p: any) => (
                                <Link key={p.id} href={`/product/${p.name ? `${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${p.id}` : p.id}`} className="block group">
                                <motion.div
                                    whileHover={{ 
                                        y: -8, 
                                        boxShadow: '0 20px 40px -10px rgba(22, 78, 51, 0.15)',
                                        borderColor: 'rgba(22, 78, 51, 0.3)'
                                    }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                    className="bg-white border border-gray-100 rounded-lg overflow-hidden flex flex-col cursor-pointer h-full transition-colors duration-300"
                                >
                                    {/* Image Area */}
                                    <div className="relative h-52 bg-gray-50 overflow-hidden">
                                        {((p.images && p.images.length > 0) || p.imageUrl || p.image) ? (
                                            <img
                                                src={(p.images && p.images.length > 0) ? p.images[0] : (p.imageUrl || p.image)}
                                                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                                                alt={p.name}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-50">
                                                {p.type === 'SERVICE'
                                                    ? <Layers className="w-10 h-10 text-gray-200" />
                                                    : <Box className="w-10 h-10 text-gray-200" />}
                                                <span className="text-[10px] text-gray-300 font-medium uppercase ">No Image</span>
                                            </div>
                                        )}
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        {/* Type Badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-2.5 py-1 text-[10px] font-semibold uppercase  rounded-full ${
                                                p.type === 'SERVICE'
                                                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            }`}>
                                                {p.type === 'SERVICE' ? 'Service' : 'Product'}
                                            </span>
                                        </div>
                                        {/* Price Tag - top right */}
                                        {p.price > 0 && (
                                            <div className="absolute top-3 right-3">
                                                <span className="bg-white/95 backdrop-blur-sm text-[#164e33] text-xs font-semibold px-2.5 py-1 rounded-full  border border-gray-100">
                                                    ₹{p.price.toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-[#164e33] transition-colors leading-snug line-clamp-2">
                                                {p.name}
                                            </h4>
                                            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                                                {p.description || 'High-quality offering available for procurement. Contact the supplier for detailed specifications and bulk pricing.'}
                                            </p>
                                        </div>

                                        {/* Footer Meta */}
                                        <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {p.category && (
                                                    <span className="text-[11px] text-gray-500 font-medium">{p.category}</span>
                                                )}
                                            </div>
                                            {p.moq > 0 && (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-100/50">
                                                    <span className="text-[10px] text-emerald-600 font-medium">MOQ</span>
                                                    <span className="text-[11px] font-semibold text-emerald-700">{p.moq} units</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                           <ImageIcon className="w-10 h-10 text-gray-200 mb-3" />
                           <p className="text-sm text-gray-600 font-medium">No offerings available yet</p>
                        </div>
                    )}
                </section>

                {/* About Section */}
                <section>
                    <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-[4px] mb-8 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#164e33]"></div>
                        Company Overview
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed font-normal max-w-5xl border-l-4 border-gray-100 pl-8">
                        {vendor.description || `${vendor.businessName} is a premiere industrial provider in the ${vendor.category?.name || 'Sector'}, delivering high-fidelity business solutions across ${vendor.city} with a commitment to technical excellence and marketplace integrity.`}
                    </p>
                </section>

                {/* Infrastructure Gallery */}
                {vendor.gallery?.length > 0 && (
                    <section>
                        <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-[4px] mb-10 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            Logistics & Infrastructure
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {vendor.gallery.map((img: any) => (
                                <div key={img.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100 group relative border border-gray-100 ">
                                    <img src={img.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Gallery asset" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Ratings & Reviews Section */}
                <section>
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-[10px] font-semibold text-gray-600 uppercase tracking-[4px] flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            Client Feedback
                        </h3>
                        {vendor.reviewsReceived?.length > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-100 rounded-full ">
                                <span className="text-sm font-bold text-gray-900">{avgRating}</span>
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className="text-xs text-gray-600 font-medium">({vendor.reviewsReceived.length} reviews)</span>
                            </div>
                        )}
                    </div>
                    
                    {vendor.reviewsReceived?.length > 0 ? (
                        <div className="space-y-6 divide-y divide-gray-100">
                            {vendor.reviewsReceived.map((rev: any, idx: number) => (
                                <div key={rev.id} className={`pt-6 ${idx === 0 ? 'pt-0' : ''}`}>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-[#164e33]/10 flex items-center justify-center text-[#164e33] font-bold overflow-hidden">
                                                {rev.user?.avatar ? (
                                                    <img src={rev.user.avatar} alt={rev.user.name || 'User'} className="w-full h-full object-cover" />
                                                ) : (
                                                    rev.user?.name?.charAt(0) || 'U'
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{rev.user?.name && !rev.user?.name.includes('_') ? rev.user?.name : 'Verified Buyer'}</h4>
                                                <div className="flex items-center gap-0.5 mt-1">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-600 font-medium bg-gray-50 px-3 py-1 rounded-full">
                                            {new Date(rev.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    <p className="text-gray-600 leading-relaxed mb-6">
                                        {rev.comment}
                                    </p>

                                    {rev.product && (
                                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] uppercase font-bold text-gray-300 tracking-wider">Review for:</span>
                                                <Link href={`/product/${rev.product.name ? `${rev.product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${rev.product.id}` : rev.product.id}`} className="text-xs font-semibold text-[#164e33] hover:underline flex items-center gap-1.5 bg-[#164e33]/5 px-3 py-1 rounded-full">
                                                    <Box className="w-3 h-3" /> {rev.product.name}
                                                </Link>
                                            </div>
                                            <ShieldCheck className="w-4 h-4 text-[#164e33]/30" />
                                        </div>
                                    )}
                                    

                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                            <Star className="w-12 h-12 text-gray-200 mb-4" />
                            <p className="text-sm font-semibold text-gray-500 uppercase ">No Client Testimonials Yet</p>
                            <p className="text-xs text-gray-600 mt-2">Become the first to verify this merchant's performance.</p>
                        </div>
                    )}
                </section>
            </div>

            {/* Contact Details Sidebar */}
            <aside className="lg:w-[380px] shrink-0">
                <div className="bg-white rounded-2xl border border-gray-100 sticky top-28 overflow-hidden">
                    
                    {/* Card Header */}
                    <div className="bg-[#164e33] px-8 py-6">
                        <h3 className="text-lg font-bold text-white mb-1">Contact Details</h3>
                        <p className="text-emerald-300 text-xs font-medium">Reach out directly to this verified partner</p>
                    </div>

                    <div className="p-8 space-y-6">

                        {/* Phone — only if logged in */}
                        {user && vendor.phone && (
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-[#164e33]/8 flex items-center justify-center shrink-0 border border-[#164e33]/10">
                                    <Phone className="w-5 h-5 text-[#164e33]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-0.5">Phone</p>
                                    <p className="text-sm font-semibold text-gray-800">{vendor.phone}</p>
                                </div>
                            </div>
                        )}

                        {/* Location */}
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-[#164e33]/8 flex items-center justify-center shrink-0 border border-[#164e33]/10">
                                <MapPin className="w-5 h-5 text-[#164e33]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-0.5">Location</p>
                                <p className="text-sm font-semibold text-gray-800">{vendor.city || 'India'}</p>
                            </div>
                        </div>

                        {/* Email — only if logged in */}
                        {user && vendor.email && (
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-[#164e33]/8 flex items-center justify-center shrink-0 border border-[#164e33]/10">
                                    <Mail className="w-5 h-5 text-[#164e33]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-0.5">Official Email</p>
                                    <p className="text-sm font-semibold text-gray-800 break-all">{vendor.email}</p>
                                </div>
                            </div>
                        )}

                        {/* Response Time */}
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                                <Clock className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-0.5">Avg. Response Time</p>
                                <p className="text-sm font-semibold text-gray-800">Within 45 Minutes</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100" />

                        {/* Action Buttons */}
                        {!user ? (
                            <button
                                onClick={() => setLoginModalOpen(true)}
                                className="w-full py-4 bg-[#164e33] hover:bg-[#113f29] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                            >
                                Login to View Contact
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <button
                                    onClick={() => handleDirectAction('CALL')}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-[#E64600] hover:bg-[#cc3e00] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] shadow-sm shadow-[#E64600]/20"
                                >
                                    <Phone className="w-4 h-4" /> Call Now
                                </button>
                                <button
                                    onClick={() => handleDirectAction('WHATSAPP')}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm shadow-[#25D366]/20 active:scale-[0.98]"
                                >
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg> WhatsApp
                                </button>
                            </div>
                        )}

                        {/* Trust Badge */}
                        <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                            <ShieldCheck className="w-4 h-4 text-[#164e33] shrink-0" />
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                This is a <span className="font-semibold text-gray-700">verified business</span> on B2B Connect India.
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
      </main>
      <CallNowModal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        vendor={vendor}
        callPhone={callPhone}
        setCallPhone={setCallPhone}
        callSending={callSending}
        callSent={callSent}
        onSubmit={handleCallSubmit}
      />
    </div>
  );
}

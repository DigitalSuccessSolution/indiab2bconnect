'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import BuyerLogin from '@/components/BuyerLogin';
import {
  User,
  Phone,
  Tag,
  FileText,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Globe,
  ArrowLeft,
  Search,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PostRequirementPage() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    buyerName: '',
    phone: '',
    categoryId: '',
    message: '',
    city: '',
    searchKeyword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [matchedVendors, setMatchedVendors] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      setShowLoginModal(true);
    }
  }, [user, authLoading]);

  useEffect(() => {
    const q = searchParams.get('q');
    const city = searchParams.get('city');
    if (q || city) {
      setFormData(prev => ({
        ...prev,
        searchKeyword: q || prev.searchKeyword,
        city: city || prev.city
      }));
    }

    const fetchCategories = async () => {
      try {
        const data = await apiFetch('/vendors/categories');
        setCategories(data.data);
      } catch (err) {
        console.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/leads/match', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setMatchedVendors(res.data?.matchedVendors || []);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to post requirement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const validatedValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: validatedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#E64600]" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center pt-32 pb-12 p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-100 p-12 h-fit">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-semibold text-slate-900 mb-2 text-center">Requirement Posted!</h2>
          <p className="text-slate-600 font-medium text-lg mb-10 text-center leading-relaxed">
            Your requirement has been transmitted. Based on our AI ranking, here are the top verified partners in {formData.city}:
          </p>

          {matchedVendors.length > 0 ? (
            <div className="space-y-4 mb-10">
              {matchedVendors.map((vendor, idx) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-xl text-slate-600 font-semibold shrink-0">
                      {vendor.businessName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{vendor.businessName}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm font-medium text-slate-600 uppercase">
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold"><ShieldCheck className="w-4 h-4" /> Verified</span>
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                        <span>Score: {vendor.totalScore?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/supplier/${vendor.businessName ? `${vendor.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${vendor.id}` : vendor.id}`}
                    className="px-5 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-[#E64600] hover:text-[#E64600] transition-colors"
                  >
                    View Profile
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center mb-10">
              <Globe className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-lg font-medium text-slate-600">Your requirement is active. Verified vendors will contact you shortly.</p>
            </div>
          )}

          <Link href="/" className="w-full py-4 bg-[#E64600] text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-[#d13f00] transition-all">
            Return to Homepage <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex justify-center pt-20 pb-12 px-4 sm:px-8 relative overflow-hidden">
      
      <BuyerLogin 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        isSkipable={true} 
      />

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#E64600]" />
      <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-[#E64600]/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#164e33]/5 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-3xl relative z-10 flex flex-col">
        
        {/* Form Section */}
        <div className="w-full pb-8 sm:pb-12 pt-4 flex flex-col justify-center">
          <div className="mb-8">
            <Link href="/" className="inline-flex mb-6 text-sm font-medium text-slate-600 hover:text-[#E64600] items-center gap-2 transition-colors uppercase tracking-wider">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <div>
              <h3 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-2">Post Requirement</h3>
              <p className="text-slate-600 font-medium">Fill in the details to get direct quotes.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              
              {/* Product Intent */}
              <div className="relative md:col-span-2">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-[13px] font-semibold text-[#E64600] z-10">
                  What are you looking for?
                </label>
                <div className="flex items-center h-[54px] border-2 border-slate-200 rounded-xl px-4 focus-within:border-[#E64600] focus-within:ring-4 focus-within:ring-[#E64600]/10 transition-all bg-white">
                  <Search className="w-5 h-5 text-slate-600 mr-3 shrink-0" />
                  <input
                    type="text"
                    name="searchKeyword"
                    required
                    value={formData.searchKeyword}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-none outline-none text-base font-semibold text-slate-800 placeholder:text-slate-600 placeholder:font-medium"
                    placeholder="e.g. Copper wire, raw silk, solar panels..."
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="relative">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-[13px] font-semibold text-[#E64600] z-10">
                  Full Name
                </label>
                <div className="flex items-center h-[54px] border-2 border-slate-200 rounded-xl px-4 focus-within:border-[#E64600] focus-within:ring-4 focus-within:ring-[#E64600]/10 transition-all bg-white">
                  <User className="w-5 h-5 text-slate-600 mr-3 shrink-0" />
                  <input
                    type="text"
                    name="buyerName"
                    required
                    value={formData.buyerName}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-none outline-none text-base font-semibold text-slate-800 placeholder:text-slate-600 placeholder:font-medium"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="relative">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-[13px] font-semibold text-[#E64600] z-10">
                  Mobile Number
                </label>
                <div className="flex items-center h-[54px] border-2 border-slate-200 rounded-xl px-4 focus-within:border-[#E64600] focus-within:ring-4 focus-within:ring-[#E64600]/10 transition-all bg-white">
                  <Phone className="w-5 h-5 text-slate-600 mr-3 shrink-0" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    minLength={10}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-none outline-none text-base font-semibold text-slate-800 placeholder:text-slate-600 placeholder:font-medium tracking-wide"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>

              {/* City */}
              <div className="relative">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-[13px] font-semibold text-[#E64600] z-10">
                  City / Location
                </label>
                <div className="flex items-center h-[54px] border-2 border-slate-200 rounded-xl px-4 focus-within:border-[#E64600] focus-within:ring-4 focus-within:ring-[#E64600]/10 transition-all bg-white">
                  <Globe className="w-5 h-5 text-slate-600 mr-3 shrink-0" />
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-none outline-none text-base font-semibold text-slate-800 placeholder:text-slate-600 placeholder:font-medium"
                    placeholder="Enter delivery city"
                  />
                </div>
              </div>

              {/* Industry Sector */}
              <div className="relative">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-[13px] font-semibold text-[#E64600] z-10">
                  Industry Sector
                </label>
                <div className="flex items-center h-[54px] border-2 border-slate-200 rounded-xl px-4 focus-within:border-[#E64600] focus-within:ring-4 focus-within:ring-[#E64600]/10 transition-all bg-white">
                  <Tag className="w-5 h-5 text-slate-600 mr-3 shrink-0" />
                  <select
                    name="categoryId"
                    required
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-none outline-none text-base font-semibold text-slate-800 appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Detailed Requirement */}
              <div className="relative md:col-span-2 mt-2">
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-[13px] font-semibold text-[#E64600] z-10">
                  Requirement Details
                </label>
                <div className="flex items-start border-2 border-slate-200 rounded-xl px-4 py-3.5 focus-within:border-[#E64600] focus-within:ring-4 focus-within:ring-[#E64600]/10 transition-all bg-white">
                  <FileText className="w-5 h-5 text-slate-600 mr-3 mt-0.5 shrink-0" />
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="flex-1 bg-transparent border-none outline-none text-base font-semibold text-slate-800 placeholder:text-slate-600 placeholder:font-medium resize-none leading-relaxed"
                    placeholder="Describe your requirement in detail (quantity, specifications, urgency) for better supplier matching..."
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[58px] mt-4 bg-[#E64600] text-white rounded-xl text-lg font-semibold hover:bg-[#d13f00] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#E64600]/20 cursor-pointer active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Submit Requirement Now'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
            <p className="text-center text-xs font-medium text-slate-600 mt-4">By submitting, you agree to our Terms of Service & Privacy Policy.</p>
          </form>
        </div>
      </div>
    </div>
  );
}

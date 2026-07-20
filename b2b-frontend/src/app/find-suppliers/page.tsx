'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, ShieldCheck, Zap, Building2, Package, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import VendorLoginModal from '@/components/VendorLoginModal';

export default function FindSuppliersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedVendorForLogin, setSelectedVendorForLogin] = useState<any>(null);

  const handleSupplierClick = (e: React.MouseEvent, supplier: any) => {
    if (!user) {
      e.preventDefault();
      setSelectedVendorForLogin(supplier);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch Categories
        const catResponse = await apiFetch('/categories');
        if (catResponse.success && catResponse.data) {
          const fetchedCats = catResponse.data.map((cat: any) => ({
            name: cat.name,
            count: cat._count?.vendors ? cat._count.vendors : 0,
            id: cat.id
          }));
          if (fetchedCats.length > 0) setCategories(fetchedCats);
        }

        // Fetch Top Suppliers
        const supResponse = await apiFetch('/vendors?limit=8&verified=true');
        if (supResponse.success && supResponse.data && supResponse.data.vendors) {
          setSuppliers(supResponse.data.vendors);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim() || locationQuery.trim()) {
      let url = '/search?';
      if (searchQuery.trim()) url += `q=${encodeURIComponent(searchQuery)}&`;
      if (locationQuery.trim()) url += `city=${encodeURIComponent(locationQuery)}`;
      router.push(url);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans tracking-tight">
      {/* --- HERO SECTION --- */}
      <section className="pt-24 md:pt-32 pb-16 bg-[#f8fafc] border-b border-gray-200 overflow-hidden relative">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">

            <div className="space-y-8 relative z-20">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
                  Source from India's <br />
                  <span className="text-[#164e33]">Verified Manufacturers</span>
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                  Discover millions of products from thousands of verified manufacturers, distributors, and wholesalers across 500+ cities.
                </p>
              </div>

              <form onSubmit={handleSearch} className="bg-white p-2 rounded-lg border border-gray-300 shadow-md flex flex-col md:flex-row gap-2 max-w-4xl">

                {/* Product Search */}
                <div className="flex-[3] flex items-center gap-3 px-3 py-2 border-b md:border-b-0 md:border-r border-gray-200 focus-within:bg-slate-50 transition-colors">
                  <Search className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products or categories..."
                    className="bg-transparent outline-none w-full text-base text-gray-800 placeholder:text-gray-400"
                  />
                </div>

                {/* Location Search */}
                <div className="flex-[2] flex items-center gap-3 px-3 py-2 focus-within:bg-slate-50 transition-colors">
                  <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Enter city..."
                    className="bg-transparent outline-none w-full text-base text-gray-800 placeholder:text-gray-400"
                  />
                </div>

                <button type="submit" className="px-8 py-3 bg-[#E64600] hover:bg-[#CC3E00] text-white rounded font-medium text-base transition-colors flex items-center justify-center shrink-0">
                  Search
                </button>
              </form>
            </div>

            <div className="relative lg:block hidden">
              <div className="grid grid-cols-2 gap-4 relative z-10">
                {[
                  { icon: ShieldCheck, title: 'Verified Only', color: '#164e33', bg: 'bg-emerald-50' },
                  { icon: Zap, title: 'Instant Quote', color: '#E64600', bg: 'bg-orange-50' },
                  { icon: Package, title: 'Bulk Orders', color: '#164e33', bg: 'bg-emerald-50' },
                  { icon: MapPin, title: 'Near Me', color: '#E64600', bg: 'bg-orange-50' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group cursor-default flex flex-col items-start"
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${item.bg}`}>
                      <item.icon size={22} color={item.color} strokeWidth={1.5} />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-500">Quality Assured</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURED CATEGORIES --- */}
      <section className="py-16 bg-white relative">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Top Categories to Source</h2>
            <p className="text-gray-600 text-base">Explore the most demanded categories in the Indian wholesale market.</p>
          </div>
          {categories.length > 0 && (
            <div className="overflow-hidden w-full relative pb-8">
              {/* Row 1: Scrolling Left */}
              <div className="flex gap-4 lg:gap-6 animate-marquee-left mb-4 w-max">
                {Array(6).fill(categories).flat().map((cat, i) => (
                  <div 
                    key={`row1-${i}`} 
                    className="w-[200px] md:w-[240px] shrink-0 p-5 bg-white border border-gray-200 rounded-lg flex flex-col items-start shadow-sm hover:border-gray-300 transition-colors"
                  >
                    <h4 className="text-base font-semibold text-gray-900 mb-1">{cat.name}</h4>
                    <p className="text-[#E64600] font-medium text-xs">
                      {cat.count} Suppliers
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Row 2: Scrolling Right */}
              <div className="flex gap-4 lg:gap-6 animate-marquee-right w-max">
                {Array(6).fill([...categories].reverse()).flat().map((cat, i) => (
                  <div 
                    key={`row2-${i}`} 
                    className="w-[200px] md:w-[240px] shrink-0 p-5 bg-white border border-gray-200 rounded-lg flex flex-col items-start shadow-sm hover:border-gray-300 transition-colors"
                  >
                    <h4 className="text-base font-semibold text-gray-900 mb-1">{cat.name}</h4>
                    <p className="text-[#E64600] font-medium text-xs">
                      {cat.count} Suppliers
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* --- TOP SUPPLIERS --- */}
      {suppliers.length > 0 && (
        <section className="py-16 bg-[#f8fafc] border-y border-gray-200 relative">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8">
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Top Verified Suppliers</h2>
              <p className="text-gray-600 text-base">Connect directly with India's most trusted manufacturers and distributors.</p>
            </div>

            <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {suppliers.map((supplier: any) => (
                <Link 
                  href={`/supplier/${supplier.id}`} 
                  key={supplier.id} 
                  onClick={(e) => handleSupplierClick(e, supplier)}
                  className="group bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded flex items-center justify-center shrink-0 overflow-hidden">
                      {supplier.logoUrl || supplier.profileImage ? (
                        <img src={supplier.logoUrl || supplier.profileImage} alt={supplier.companyName || supplier.businessName} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-semibold text-gray-900 transition-colors truncate text-base">{supplier.companyName || supplier.businessName || 'Verified Supplier'}</h4>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                        <MapPin size={12} className="text-[#E64600] shrink-0" />
                        <span className="truncate">{supplier.city || 'India'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[#164e33]" />
                      <span className="text-xs font-semibold text-[#164e33]">Verified</span>
                    </div>
                    <span className="text-xs font-medium text-[#E64600] flex items-center gap-1 group-hover:underline">
                      View Profile <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/search" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-gray-700 hover:bg-gray-50 rounded border border-gray-300 font-medium transition-colors text-sm shadow-sm">
                View All Suppliers
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* --- FINAL CTA --- */}
      <section className="py-24 relative overflow-hidden bg-[#164e33] text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Looking for something specific? <br /> Let our experts find it for you.
            </h2>
            <p className="text-lg text-emerald-100/80 mb-10 leading-relaxed">
              Post your requirement and get competitive quotes within 24 hours. Our sourcing team is here to help.
            </p>
            <div className="flex justify-center">
              <Link href="/post-requirement" className="px-8 py-3.5 bg-[#E64600] text-white rounded-lg font-medium hover:bg-[#CC3E00] transition-colors shadow-sm flex items-center justify-center gap-2">
                Post a Requirement <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <VendorLoginModal
        isOpen={!!selectedVendorForLogin}
        onClose={() => setSelectedVendorForLogin(null)}
        vendor={selectedVendorForLogin}
        onSuccess={() => {
          if (selectedVendorForLogin) {
            router.push(`/supplier/${selectedVendorForLogin.id}`);
          }
        }}
      />
    </div>
  );
}



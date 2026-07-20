'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Target, ArrowRight, Wallet, TrendingUp, Users, CheckCircle, Store, Headset, Check, ChevronDown, UserPlus, PackagePlus, MessageCircle } from 'lucide-react';
import VendorRegister from '@/components/VendorRegister';
import VendorLogin from '@/components/VendorLogin';
import PricingCard from '@/components/dashboard/PricingCard';
import { apiFetch } from '@/lib/api';
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

export default function SellWithUsPage() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [packages, setPackages] = useState<any[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  const heroImages = [
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    
    // Fetch packages dynamically from backend
    const fetchPackages = async () => {
      try {
        setLoadingPackages(true);
        const data = await apiFetch('/packages');
        if (data && data.data) {
          setPackages(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch packages:', error);
      } finally {
        setLoadingPackages(false);
      }
    };
    
    fetchPackages();

    return () => clearInterval(timer);
  }, []);

  const valueProps = [
    { title: 'Zero Commission', desc: 'No transaction fees. Keep 100% of your business profits.', icon: Wallet },
    { title: 'Verified Leads', desc: 'Get phone-verified, genuine business inquiries from real buyers.', icon: ShieldCheck },
    { title: 'Digital Catalog', desc: 'Create your online storefront and list unlimited products easily.', icon: Store },
    { title: 'Dedicated Support', desc: 'Our experts help you set up and grow your wholesale business.', icon: Headset },
  ];

  return (
    <div className={`min-h-screen bg-white text-slate-800 ${roboto.className}`}>
      
      {/* --- INDIAMART STYLE HERO --- */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-40 bg-gradient-to-br from-[#FF4F00] to-[#E64600] overflow-hidden">
        {/* Subtle background circles for depth */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            
            {/* Left Content */}
            <div className="w-full lg:w-3/5 text-white text-center lg:text-left">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white font-semibold text-sm uppercase tracking-wider mb-6">
                India's Largest B2B Platform
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white drop-shadow-sm">
                Grow your Vyapar.
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 mb-10 max-w-xl mx-auto lg:mx-0 font-medium">
                Join 5 Lakh+ Indian manufacturers and wholesalers. Create your free digital catalog and start receiving bulk orders today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => setIsRegisterOpen(true)} 
                  className="px-8 py-4 bg-white text-[#E64600] rounded-md font-semibold text-lg hover:bg-slate-50 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  Start Selling for Free <ArrowRight size={20} />
                </button>
                <button 
                  onClick={() => setIsLoginOpen(true)} 
                  className="px-8 py-4 bg-transparent border border-white text-white rounded-md font-semibold text-lg hover:bg-white/10 transition-colors flex items-center justify-center"
                >
                  Login to Account
                </button>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-8 text-white/90 font-medium text-sm">
                 <div className="flex items-center gap-2"><CheckCircle size={18} className="text-yellow-300" /> 100% Free Setup</div>
                 <div className="flex items-center gap-2"><CheckCircle size={18} className="text-yellow-300" /> No Commission</div>
                 <div className="flex items-center gap-2"><CheckCircle size={18} className="text-yellow-300" /> PAN India Reach</div>
              </div>
            </div>

            {/* Right Image Carousel Container */}
            <div className="w-full lg:w-2/5 hidden lg:flex justify-end relative">
               <div className="w-full max-w-md h-[400px] rounded-2xl relative overflow-hidden shadow-2xl">
                 {heroImages.map((src, index) => (
                   <img 
                     key={index}
                     src={src} 
                     alt={`B2B Selling context ${index + 1}`} 
                     className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                   />
                 ))}
                 
                 {/* Carousel Indicators */}
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {heroImages.map((_, idx) => (
                      <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-[#E64600] w-6' : 'bg-white/60'}`} />
                    ))}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- OVERLAPPING STATS STRIP --- */}
      <div className="relative z-20 -mt-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="bg-white rounded-lg shadow-lg border border-slate-100 p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-slate-100 text-center">
               <div className="flex flex-col items-center">
                 <Users size={32} className="text-[#E64600] mb-3" strokeWidth={1.5} />
                 <p className="text-2xl font-bold text-slate-900">4.8M+</p>
                 <p className="text-sm font-medium text-slate-500">Active Buyers</p>
               </div>
               <div className="flex flex-col items-center">
                 <Target size={32} className="text-[#E64600] mb-3" strokeWidth={1.5} />
                 <p className="text-2xl font-bold text-slate-900">25,000+</p>
                 <p className="text-sm font-medium text-slate-500">Categories</p>
               </div>
               <div className="flex flex-col items-center">
                 <ShieldCheck size={32} className="text-[#E64600] mb-3" strokeWidth={1.5} />
                 <p className="text-2xl font-bold text-slate-900">5 Lakh+</p>
                 <p className="text-sm font-medium text-slate-500">Verified Sellers</p>
               </div>
               <div className="flex flex-col items-center">
                 <TrendingUp size={32} className="text-[#E64600] mb-3" strokeWidth={1.5} />
                 <p className="text-2xl font-bold text-slate-900">100%</p>
                 <p className="text-sm font-medium text-slate-500">Secure Payments</p>
               </div>
            </div>
         </div>
      </div>

      {/* --- WHY B2B CONNECT --- */}
      <section className="py-20 bg-white mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why choose B2B Connect India?</h2>
             <div className="w-20 h-1 bg-[#E64600] mx-auto mb-4"></div>
             <p className="text-slate-600 text-lg">The most trusted platform for Indian SMEs to grow their wholesale business.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueProps.map((prop, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                  <prop.icon size={32} className="text-[#E64600]" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{prop.title}</h3>
                <p className="text-slate-600">{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW TO SELL --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-4">Start Selling in 3 Simple Steps</h2>
           <div className="w-20 h-1 bg-[#164e33] mx-auto mb-16"></div>
           
           <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg border border-slate-200 relative group hover:border-[#164e33] hover:shadow-lg transition-all">
                 <div className="w-16 h-16 bg-white border-2 border-slate-100 text-[#E64600] rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:border-[#E64600] group-hover:bg-[#E64600] group-hover:text-white transition-all">
                    <UserPlus size={28} />
                 </div>
                 <h4 className="text-xl font-semibold text-slate-900 mb-4">Create Account</h4>
                 <ul className="space-y-3">
                    <li className="flex items-start gap-2"><Check size={20} className="text-[#164e33] shrink-0" /> <span className="text-slate-700">Add Mobile & Email</span></li>
                    <li className="flex items-start gap-2"><Check size={20} className="text-[#164e33] shrink-0" /> <span className="text-slate-700">Verify OTP</span></li>
                    <li className="flex items-start gap-2"><Check size={20} className="text-[#164e33] shrink-0" /> <span className="text-slate-700">Enter GSTIN (Optional)</span></li>
                 </ul>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-slate-200 relative group hover:border-[#164e33] hover:shadow-lg transition-all">
                 <div className="w-16 h-16 bg-white border-2 border-slate-100 text-[#E64600] rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:border-[#E64600] group-hover:bg-[#E64600] group-hover:text-white transition-all">
                    <PackagePlus size={28} />
                 </div>
                 <h4 className="text-xl font-semibold text-slate-900 mb-4">Add Products</h4>
                 <ul className="space-y-3">
                    <li className="flex items-start gap-2"><Check size={20} className="text-[#164e33] shrink-0" /> <span className="text-slate-700">Upload Product Images</span></li>
                    <li className="flex items-start gap-2"><Check size={20} className="text-[#164e33] shrink-0" /> <span className="text-slate-700">Add Wholesale Prices</span></li>
                    <li className="flex items-start gap-2"><Check size={20} className="text-[#164e33] shrink-0" /> <span className="text-slate-700">Describe your offering</span></li>
                 </ul>
              </div>
              
              <div className="bg-white p-8 rounded-lg border border-slate-200 relative group hover:border-[#164e33] hover:shadow-lg transition-all">
                 <div className="w-16 h-16 bg-white border-2 border-slate-100 text-[#E64600] rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:border-[#E64600] group-hover:bg-[#E64600] group-hover:text-white transition-all">
                    <MessageCircle size={28} />
                 </div>
                 <h4 className="text-xl font-semibold text-slate-900 mb-4">Receive Orders</h4>
                 <ul className="space-y-3">
                    <li className="flex items-start gap-2"><Check size={20} className="text-[#164e33] shrink-0" /> <span className="text-slate-700">Get buyer inquiries via SMS</span></li>
                    <li className="flex items-start gap-2"><Check size={20} className="text-[#164e33] shrink-0" /> <span className="text-slate-700">Chat directly with buyers</span></li>
                    <li className="flex items-start gap-2"><Check size={20} className="text-[#164e33] shrink-0" /> <span className="text-slate-700">Close deals and grow</span></li>
                 </ul>
              </div>
           </div>
           
           <div className="mt-12 text-center">
             <button onClick={() => setIsRegisterOpen(true)} className="px-10 py-4 bg-[#164e33] text-white rounded-md font-semibold text-lg hover:bg-[#0d2a1b] transition-colors shadow-lg">
                Create Free Account
             </button>
           </div>
        </div>
      </section>

      {/* --- PACKAGE SYSTEM / PRICING --- */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Choose Your Growth Plan</h2>
              <div className="w-20 h-1 bg-[#E64600] mx-auto mb-4"></div>
              <p className="text-slate-600 text-lg">Simple and transparent pricing to boost your B2B wholesale business.</p>
           </div>

           <div className="flex flex-col md:flex-row justify-center gap-8 max-w-5xl mx-auto flex-wrap items-stretch">
             
             {loadingPackages ? (
                <div className="w-full text-center py-10 text-slate-500">Loading dynamic packages...</div>
             ) : packages.length === 0 ? (
                <div className="w-full text-center py-10 text-slate-500">No packages configured yet. Please configure packages from the admin panel.</div>
             ) : (
                packages.filter((pkg) => pkg.isActive !== false)
                  .sort((a, b) => (a.price || 0) - (b.price || 0))
                  .map((pkg, idx) => {
                  const isPopular = pkg.isPopular === true;
                  
                  return (
                    <PricingCard 
                      key={pkg.id}
                      pkg={pkg}
                      idx={idx}
                      isPopular={isPopular}
                      className="flex-1 min-w-[300px] max-w-md self-stretch"
                      ctaText={isPopular ? 'Contact Sales' : `Get ${pkg.name}`}
                      onCtaClick={() => setIsRegisterOpen(true)}
                    />
                  );
                })
             )}

           </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Frequently Asked Questions</h2>
           
           <div className="columns-1 md:columns-2 gap-6">
              {[
                { q: 'Is it free to sell on B2B Connect India?', a: 'Yes, listing your business and adding products is 100% free. We also do not charge any commission on your sales.' },
                { q: 'What do I need to register?', a: 'You only need a mobile number and business name to start. Adding a GSTIN makes your profile more trustworthy to buyers.' },
                { q: 'How will I get buyer inquiries?', a: 'When a buyer is interested in your products, they will send an inquiry. You will receive an instant notification via SMS and on your Seller Dashboard.' },
                { q: 'Do you provide shipping and logistics?', a: 'No, B2B Connect is a connection platform. You negotiate the price, payment terms, and shipping directly with the buyer.' },
                { q: 'How do I receive payments?', a: 'You deal directly with the buyers. We do not hold or process your payments. You can negotiate terms like NEFT, RTGS, or Cash on Delivery directly with your buyer.' },
                { q: 'Do I need a GST number to sell?', a: 'While a GST number is highly recommended for building trust and required for inter-state wholesale transactions, you can create a basic profile without it.' },
                { q: 'How can I rank my products higher?', a: 'Adding detailed product descriptions, high-quality images, and responding quickly to buyer inquiries helps improve your catalog visibility.' },
                { q: 'Can buyers buy a single piece?', a: 'Usually no. As a B2B platform, sellers typically set a Minimum Order Quantity (MOQ) for wholesale prices. You decide your own MOQ.' }
              ].map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="bg-white rounded-lg shadow-sm border border-slate-200 break-inside-avoid mb-6">
                     <button 
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full flex items-start justify-between p-6 text-left hover:bg-orange-50/50 transition-colors rounded-lg gap-4"
                     >
                        <span className="font-semibold text-slate-900 text-lg">{faq.q}</span>
                        <ChevronDown className={`text-[#E64600] shrink-0 mt-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={24} />
                     </button>
                     {isOpen && (
                        <div className="px-6 pb-6 text-slate-600 text-base leading-relaxed">
                          {faq.a}
                        </div>
                     )}
                  </div>
                );
              })}
           </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-16 bg-[#164e33] text-white">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Lakhs of buyers are waiting for your products</h2>
            <p className="text-emerald-100/90 text-lg mb-8 max-w-2xl">Join the fastest growing B2B platform in India. Registration is free and takes less than 2 minutes.</p>
            <button onClick={() => setIsRegisterOpen(true)} className="px-10 py-4 bg-[#FF4F00] text-white rounded-md font-semibold text-xl hover:bg-[#E64600] transition-colors shadow-lg shadow-black/20">
              Start Selling Now
            </button>
         </div>
      </section>

      {/* Render VendorRegister Modal */}
      <VendorRegister 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
        onBackToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }} 
      />

      {/* Render VendorLogin Modal */}
      <VendorLogin
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </div>
  );
}

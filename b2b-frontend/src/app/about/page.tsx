'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Shield, Globe, Zap, Target, Award, BarChart3, ArrowRight, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  
  const values = [
    { title: "Direct Sourcing", desc: "Connecting you to the roots of Indian manufacturing without middlemen.", icon: Zap },
    { title: "Quality Assurance", desc: "Multi-step verification process for every registered supplier.", icon: ShieldCheck },
    { title: "Global Standards", desc: "Bringing local Indian businesses to the international trade stage.", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans tracking-tight">
      
      {/* --- PREMIUM ABOUT BANNER --- */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-[#0d2e1f]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-80"
            alt="B2B Logistics Banner"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#164e33]/50 to-[#0d2e1f]/70" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[#E64600] font-semibold uppercase text-base mb-4 block">
              Our Legacy & Future
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              ABOUT INDIA B2B CONNECT
            </h1>
            <div className="w-24 h-1.5 bg-[#E64600] mx-auto rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* --- CORE STORY SECTION --- */}
      <section className="py-24 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-7xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
                Redesigning Indian commerce for the global stage
              </h2>
              <p className="text-medium md:text-lg text-slate-700 leading-relaxed">
                IndiaB2B Connect was founded with a singular vision: to create a trust-based ecosystem. We are more than just a directory; we are the digital infrastructure powering modern trade.
              </p>
              <p className="text-medium md:text-lg text-slate-700 leading-relaxed">
                Our platform empowers MSMEs by providing them with the digital tools, logistics support, and verification they need to compete internationally. We bring the transparency of modern tech to the traditional roots of Indian commerce.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-4 md:space-y-6">
                <div className="h-48 bg-emerald-50/50 rounded-2xl flex flex-col items-center justify-center p-6 border border-emerald-100/50 hover:border-emerald-200 transition-colors">
                  <Target className="text-[#E64600] mb-3" size={32} strokeWidth={1.5} />
                  <span className="font-semibold text-lg text-slate-900">Our Mission</span>
                </div>
                <div className="h-64 rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <img src="https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Manufacturing" />
                </div>
              </div>
              <div className="space-y-4 md:space-y-6 pt-8 md:pt-12">
                <div className="h-64 rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                   <img src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Logistics" />
                </div>
                <div className="h-48 bg-[#164e33] rounded-2xl flex flex-col items-center justify-center p-6 text-white shadow-lg shadow-emerald-900/10 hover:bg-[#113f29] transition-colors">
                  <Award className="text-emerald-300 mb-3" size={32} strokeWidth={1.5} />
                  <span className="font-semibold text-lg">Excellence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- OUR VALUES: UNIFORM GRID --- */}
      <section className="py-20 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">Our guiding principles</h2>
            <p className="text-slate-700 text-lg">Built on trust, driven by technology to deliver the best wholesale experience.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {values.map((value, i) => (
              <div key={i} className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-emerald-200 transition-all duration-500 group">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-50 transition-colors duration-300 border border-slate-100 group-hover:border-emerald-100">
                  <value.icon className="text-slate-700 group-hover:text-[#164e33]" size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-700 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NEW STATS SECTION (4 COLUMNS) --- */}
      <section className="relative py-24 bg-white">
        <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 max-w-6xl mx-auto">
            {[
              { label: "Active Buyers", val: "4.8M+", icon: Users },
              { label: "Categories", val: "25,000+", icon: Target },
              { label: "Verified Sellers", val: "5 Lakh+", icon: ShieldCheck },
              { label: "Secure Payments", val: "100%", icon: TrendingUp }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center text-center group py-8 sm:py-4 lg:py-0 px-4">
                <stat.icon className="w-10 h-10 text-[#E64600] mb-5 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                <h4 className="text-3xl lg:text-4xl font-semibold text-slate-800 mb-2">{stat.val}</h4>
                <p className="text-[15px] font-normal text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-24 relative overflow-hidden bg-[#164e33] text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold mb-6">Be a part of our growth</h2>
            <p className="text-lg text-emerald-100/80 mb-10 leading-relaxed">
              Join thousands of businesses already scaling their reach with IndiaB2B Connect. Let's build the future of trade together.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/sell" className="px-8 py-3.5 bg-[#E64600] text-white rounded-lg font-medium hover:bg-[#CC3E00] transition-colors shadow-sm flex items-center justify-center gap-2">
                Join as a Supplier <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="px-8 py-3.5 border border-emerald-400/30 text-white rounded-lg font-medium hover:bg-emerald-800/30 transition-colors flex items-center justify-center">
                Contact our Team
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

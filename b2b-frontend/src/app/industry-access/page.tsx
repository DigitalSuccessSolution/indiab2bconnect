'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Database, Zap, Lock, Globe, Users } from 'lucide-react';

export default function IndustryAccess() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-24 bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#10b981_0%,transparent_50%)]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl font-bold text-white uppercase  mb-6">
              Industry <span className="text-5xl font-bold text-emerald-500">Access</span> Protocol
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">
              Empowering verified enterprises with high-fidelity market data and direct distribution channels.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-16">
            <div className="space-y-6">
               <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">Access Tiers</h2>
               <p className="text-lg text-slate-600 leading-relaxed">
                 B2B Community provides multi-layered access to our industrial ecosystem. Each tier is designed to meet specific business objectives, from local trade to global supply chain integration.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { title: 'Standard Access', desc: 'Basic directory listing and inquiry management for local vendors.', icon: Users },
                 { title: 'Enterprise Hub', desc: 'Verified status, priority placement, and advanced lead analytics.', icon: ShieldCheck },
                 { title: 'Global Protocol', desc: 'Full API access, cross-border trade tools, and dedicated account management.', icon: Globe },
                 { title: 'Real-time Streams', desc: 'Direct market demand synchronization and automated lead funneling.', icon: Zap }
               ].map((item, i) => (
                 <div key={i} className="p-8 bg-slate-50 rounded-lg border border-slate-100 hover:border-emerald-200 transition-all group">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm mb-6 group-hover:scale-110 transition-transform">
                       <item.icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 uppercase tracking-tight">{item.title}</h3>
                    <p className="text-slate-600 font-medium leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>

            <div className="space-y-6">
               <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">Security & Verification</h2>
               <p className="text-lg text-slate-600 leading-relaxed">
                 All participants in the Industry Access program undergo rigorous KYC and business verification to maintain the integrity of our professional network.
               </p>
            </div>
          </div>

          <div className="space-y-8">
          <div className="p-10 bg-emerald-950 rounded-[2.5rem] text-white sticky top-24 shadow-2xl border border-emerald-900">
  {/* Header Section */}
  <div className="mb-8">
    <h3 className="text-2xl font-semibold uppercase leading-tight text-white">
      Apply for Access
    </h3>
    <p className="text-emerald-400/80 text-xs font-medium mt-2 uppercase">
      Secure Enterprise Verification
    </p>
  </div>

  <form className="space-y-6">
    {/* Email Input */}
    <div className="space-y-2">
      <label className="text-[11px] font-bold uppercase text-emerald-300 ml-1">
        Business Email Address
      </label>
      <input 
        type="email" 
        className="w-full bg-emerald-900/40 border border-emerald-800 rounded-lg px-5 py-4 text-sm text-white placeholder:text-emerald-700 outline-none focus:border-emerald-400 focus:bg-emerald-900/60 transition-all" 
        placeholder="name@company.com" 
      />
    </div>

    {/* Sector Selection */}
    <div className="space-y-2">
      <label className="text-[11px] font-bold uppercase text-emerald-300 ml-1">
        Target Industry Sector
      </label>
      <div className="relative">
        <select className="w-full bg-emerald-900/40 border border-emerald-800 rounded-lg px-5 py-4 text-sm text-white outline-none focus:border-emerald-400 focus:bg-emerald-900/60 transition-all appearance-none cursor-pointer">
          <option className="bg-emerald-950 text-white">Manufacturing</option>
          <option className="bg-emerald-950 text-white">Retail & Distribution</option>
          <option className="bg-emerald-950 text-white">Service Infrastructure</option>
        </select>
        {/* Custom Arrow Icon for Select */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>

    {/* Submit Button */}
    <button className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg uppercase text-sm transition-all shadow-lg shadow-emerald-950/50 active:scale-[0.98] mt-4">
      Request Verification
    </button>

    {/* Small Footer inside card */}
    <div className="pt-4 flex items-center justify-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <p className="text-[10px] font-bold text-emerald-500 uppercase">
        Encrypted Endpoint
      </p>
    </div>
  </form>
</div>
          </div>
        </div>
      </section>
    </div>
  );
}

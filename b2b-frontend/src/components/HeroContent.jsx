"use client";
import React from 'react';
import { Users, Building2 } from "lucide-react";

const HeroContent = ({ onMatch, onExplore }) => {
  return (
    <div className="max-w-2xl mb-4 lg:mb-6 shrink-0">
      <h1 className="text-4xl md:text-[48px] font-semibold text-[#164e33] mb-6 leading-[1.15] tracking-tight">
        Find <span className="text-[#E64600]">trusted partners</span> <br className="hidden sm:block" /> to grow your business.
      </h1>
      <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-xl leading-relaxed">
        India's most reliable B2B marketplace to connect, collaborate & grow with verified businesses.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onMatch}
          className="bg-[#164e33] text-white px-8 py-3.5 rounded-lg font-medium text-base flex items-center justify-center gap-2 shadow-lg hover:bg-[#113f29] transition-all cursor-pointer"
        >
          <Users size={20} /> Match me with vendors
        </button>
        <button
          onClick={onExplore}
          className="bg-white border border-slate-300 px-8 py-3.5 rounded-lg font-medium text-base flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-slate-700 shadow-sm cursor-pointer"
        >
          <Building2 size={20} /> Explore the directory
        </button>
      </div>
    </div>
  );
};

export default HeroContent;

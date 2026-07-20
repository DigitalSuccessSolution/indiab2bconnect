"use client";

import React from "react";
import { Star, ShieldCheck, MessageCircle } from "lucide-react";

const AboutConnect = () => {
  return (
    <div className="lg:flex-3 space-y-8">
      <div className="space-y-4 text-left">
        <h2 className="text-3xl md:text-5xl font-semibold text-[#333333] leading-tight font-outfit">
          We connect <br />
          <span className="text-[#333333]/90">Buyers & Sellers</span>
        </h2>
        <p className="text-slate-900 text-lg font-medium leading-relaxed max-w-xl font-inter">
          B2B Community is India&apos;s largest online B2B marketplace,
          connecting buyers with vendors across the nation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
        <div className="flex flex-row sm:flex-col items-center sm:items-center text-left sm:text-center gap-4 sm:gap-3 group">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-blue-200 flex items-center justify-center bg-blue-50 group-hover:bg-blue-100 transition-transform group-hover:scale-105 shrink-0">
            <Star className="w-6 h-6 md:w-7 md:h-7 text-blue-500" />
          </div>
          <span className="font-semibold text-slate-800 text-[14px] md:text-base leading-tight">
            Trusted Platform
          </span>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-center text-left sm:text-center gap-4 sm:gap-3 group">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-emerald-200 flex items-center justify-center bg-emerald-50 group-hover:bg-emerald-100 transition-transform group-hover:scale-105 shrink-0">
            <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 text-emerald-500" />
          </div>
          <span className="font-semibold text-slate-800 text-[14px] md:text-base leading-tight">
            Safe & Secure
          </span>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-center text-left sm:text-center gap-4 sm:gap-3 group">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-amber-200 flex items-center justify-center bg-amber-50 group-hover:bg-amber-100 transition-transform group-hover:scale-105 shrink-0">
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-amber-500" />
          </div>
          <span className="font-semibold text-slate-800 text-[14px] md:text-base leading-tight">
            Quick Assistance
          </span>
        </div>
      </div>
    </div>
  );
};

export default AboutConnect;

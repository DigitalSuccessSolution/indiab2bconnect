"use client";

import React from "react";
import { Star, ShieldCheck, MessageCircle } from "lucide-react";

const AboutConnect = () => {
  return (
    <div className="lg:flex-3 space-y-8">
      <div className="space-y-3 sm:space-y-4 text-left">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
          We connect <br className="hidden sm:block" />
          <span className="text-slate-800">Buyers & Sellers</span>
        </h2>
        <p className="text-slate-600 text-[15px] sm:text-base md:text-lg font-medium leading-relaxed max-w-xl">
          B2B Community is India&apos;s largest online B2B marketplace,
          connecting buyers with vendors across the nation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 pt-2 sm:pt-4">
        <div className="flex flex-row sm:flex-col items-center sm:items-center text-left sm:text-center gap-3 group">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 border-blue-200 flex items-center justify-center bg-blue-50 group-hover:bg-blue-100 transition-transform group-hover:scale-105 shrink-0">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-500" />
          </div>
          <span className="font-semibold text-slate-800 text-[13px] sm:text-[14px] md:text-base leading-tight">
            Trusted Platform
          </span>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-center text-left sm:text-center gap-3 group">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 border-emerald-200 flex items-center justify-center bg-emerald-50 group-hover:bg-emerald-100 transition-transform group-hover:scale-105 shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-emerald-500" />
          </div>
          <span className="font-semibold text-slate-800 text-[13px] sm:text-[14px] md:text-base leading-tight">
            Safe & Secure
          </span>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-center text-left sm:text-center gap-3 group">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 border-amber-200 flex items-center justify-center bg-amber-50 group-hover:bg-amber-100 transition-transform group-hover:scale-105 shrink-0">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-amber-500" />
          </div>
          <span className="font-semibold text-slate-800 text-[13px] sm:text-[14px] md:text-base leading-tight">
            Quick Assistance
          </span>
        </div>
      </div>
    </div>
  );
};

export default AboutConnect;

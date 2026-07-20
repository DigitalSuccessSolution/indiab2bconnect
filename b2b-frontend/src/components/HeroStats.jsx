"use client";

import React, { useState, useEffect } from "react";
import { Users, Package, Building2, ShieldCheck } from "lucide-react";

const useCountUp = (end, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo function for smooth deceleration
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
};

const HeroStats = () => {
  return (
    <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 w-full pb-4 mt-6 lg:mt-0 shrink-0 mb-3 lg:mb-4">
      <div className="bg-[#E64600] rounded-xl py-3 lg:py-4 px-4 lg:px-8 grid grid-cols-2 lg:flex lg:flex-nowrap items-center justify-between gap-4 lg:gap-6 shadow-2xl shadow-[#E64600]/20 border border-white/10">
        <StatBox icon={<Users size={22} className="text-white" />} targetNum={250000} suffix="+" label="Verified Vendors" />
        <div className="h-10 w-px bg-white/10 hidden lg:block"></div>
        <StatBox icon={<Package size={22} className="text-white" />} targetNum={1000000} suffix="+" label="Products Listed" />
        <div className="h-10 w-px bg-white/10 hidden lg:block"></div>
        <StatBox icon={<Building2 size={22} className="text-white" />} targetNum={50000} suffix="+" label="Cities Covered" />
        <div className="h-10 w-px bg-white/10 hidden lg:block"></div>
        <StatBox icon={<ShieldCheck size={22} className="text-white" />} targetNum={100} suffix="%" label="Trusted Platform" />
      </div>
    </div>
  );
};

const StatBox = ({ icon, targetNum, suffix, label }) => {
  const count = useCountUp(targetNum, 2000); // 2 seconds animation
  
  // Format the number in Indian Numbering System if it's over 1000, else standard
  const formattedCount = targetNum >= 1000 ? count.toLocaleString('en-IN') : count;

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="bg-white/10 p-3 sm:p-3.5 rounded-lg shrink-0 backdrop-blur-sm border border-white/5">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm sm:text-lg lg:text-[22px] font-semibold leading-tight text-orange-50">
          {formattedCount}{suffix}
        </p>
        <p className="text-[10px] sm:text-xs text-orange-100/90 mt-0.5 font-medium tracking-wide uppercase">{label}</p>
      </div>
    </div>
  );
};

export default HeroStats;

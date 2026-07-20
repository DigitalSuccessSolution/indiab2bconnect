"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings, Droplet, Printer, Monitor, Heart, Zap, Shield, Plus } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { generateDiscoveryUrl } from '@/lib/utils';
import { useSelector } from 'react-redux';

const PopularIndustries = () => {
  const [industries, setIndustries] = useState([]);
  const { city } = useSelector((state) => state.filter);

  // Fallback icon map based on index to ensure beautiful UI even with dynamic data
  const iconMap = [
    <Settings size={30} className="text-slate-500" />,
    <Droplet size={30} className="text-slate-500" />,
    <Printer size={30} className="text-slate-500" />,
    <Monitor size={30} className="text-slate-500" />,
    <Heart size={30} className="text-slate-500" />,
    <Zap size={30} className="text-slate-500" />,
    <Shield size={30} className="text-slate-500" />,
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiFetch('/categories');
        if (response.success && response.data) {
          // Take first 7 categories to fit the grid with the "Plus" button
          setIndustries(response.data.slice(0, 7));
        }
      } catch (err) {
        console.error("Failed to fetch industries", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="flex flex-nowrap lg:flex-wrap gap-3 sm:gap-4 mt-4 md:mt-6 overflow-x-auto pt-2 pb-4 px-1 -mx-1 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {industries.map((industry, index) => (
        <Link
          key={index}
          href={generateDiscoveryUrl(industry.name, city, industry.id)}
          className="flex flex-col items-center gap-2 min-w-[85px] sm:min-w-[100px] shrink-0 snap-start group cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all">
            {iconMap[index % iconMap.length]}
          </div>
          <span className="text-[12px] font-semibold text-[#164e33] transition-colors text-center w-full overflow-hidden text-ellipsis whitespace-nowrap group-hover:text-[#FF4F00]">
            {industry.name}
          </span>
        </Link>
      ))}
      {industries.length > 0 && (
        <Link href="/find-suppliers" className="flex flex-col items-center gap-2 min-w-[85px] sm:min-w-[100px] shrink-0 snap-start group cursor-pointer">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 group-hover:-translate-y-1 transition-all">
            <Plus size={30} className="text-[#164e33]" />
          </div>
          <span className="text-[12px] font-semibold text-[#164e33] group-hover:text-[#FF4F00]">
            View All
          </span>
        </Link>
      )}
    </div>
  );
};

export default PopularIndustries;

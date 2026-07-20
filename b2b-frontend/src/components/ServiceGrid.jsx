"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Cpu,
  Box,
  HardHat,
  Stethoscope,
  Pill,
  Monitor,
  Package,
  FlaskConical,
  Layers,
  Sparkles,
  Wrench,
  Laptop,
  Diamond,
  Home,
  Leaf,
  Gamepad2,
  Truck,
  Briefcase,
  Plane,
  BookOpen,
  PenTool,
  Users,
  Ship,
  Brush,
  CircuitBoard,
  Sprout,
  Utensils,
  Shirt,
  Printer,
  Zap,
  LayoutGrid,
  Search,
  CheckCircle2,
  Award,
  Handshake,
  Headphones,
  ArrowRight,
  Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

const defaultIcons = [
  { icon: Settings, color: "text-green-600", bg: "bg-green-50" },
  { icon: Cpu, color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Box, color: "text-orange-400", bg: "bg-orange-50" },
  { icon: HardHat, color: "text-yellow-600", bg: "bg-yellow-50" },
  { icon: Stethoscope, color: "text-pink-500", bg: "bg-pink-50" },
  { icon: Pill, color: "text-teal-500", bg: "bg-teal-50" },
  { icon: Monitor, color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Package, color: "text-purple-500", bg: "bg-purple-50" },
  { icon: FlaskConical, color: "text-indigo-400", bg: "bg-indigo-50" },
  { icon: Layers, color: "text-gray-500", bg: "bg-gray-100" },
  { icon: Sparkles, color: "text-pink-400", bg: "bg-pink-50" },
  { icon: Wrench, color: "text-blue-500", bg: "bg-blue-50" },
  { icon: Laptop, color: "text-sky-500", bg: "bg-sky-50" },
  { icon: Diamond, color: "text-rose-500", bg: "bg-rose-50" },
  { icon: Home, color: "text-amber-600", bg: "bg-amber-50" },
  { icon: Leaf, color: "text-green-500", bg: "bg-green-50" },
  { icon: Gamepad2, color: "text-orange-500", bg: "bg-orange-50" },
  { icon: Truck, color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Briefcase, color: "text-slate-700", bg: "bg-slate-100" },
  { icon: Plane, color: "text-cyan-600", bg: "bg-cyan-50" },
  { icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
  { icon: PenTool, color: "text-orange-400", bg: "bg-orange-50" },
  { icon: Users, color: "text-blue-700", bg: "bg-blue-50" },
  { icon: Ship, color: "text-teal-600", bg: "bg-teal-50" },
  { icon: Brush, color: "text-yellow-500", bg: "bg-yellow-50" },
  { icon: CircuitBoard, color: "text-violet-600", bg: "bg-violet-50" },
  { icon: Sprout, color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: Utensils, color: "text-orange-600", bg: "bg-orange-50" },
  { icon: Shirt, color: "text-pink-600", bg: "bg-pink-50" },
  { icon: Printer, color: "text-green-600", bg: "bg-green-50" },
  { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50" },
];

const ServiceGrid = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiFetch("/categories");
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);


  const handleCategoryClick = (categoryName) => {
    router.push(`/search?q=${encodeURIComponent(categoryName)}`);
  };

  const displayedCategories = showAll ? categories : categories.slice(0, 15);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-2 bg-white font-sans tracking-tight mt-4">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
        <div className="flex-1 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-4xl font-bold text-slate-800 leading-tight">
            Explore Our{" "}
            <span className="text-3xl sm:text-4xl lg:text-4xl font-bold text-[#134e4a]">
              Marketplace
            </span>
          </h1>
          <p className="text-gray-800 mt-4 text-lg sm:text-l font-medium leading-relaxed">
            Discover products and connect with verified vendors across diverse
            industries.
          </p>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 md:gap-5 mb-20">
        {displayedCategories.map((cat, index) => {
          const style = defaultIcons[index % defaultIcons.length];
          const IconComponent = style.icon;
          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className="group border border-gray-100 rounded-lg p-3 sm:p-5 flex flex-col items-center justify-center text-center hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-8px_rgba(16,185,129,0.15)] hover:border-emerald-200 cursor-pointer bg-white min-h-[120px] sm:min-h-[160px] relative overflow-hidden"
              style={{ transition: "all 400ms cubic-bezier(0.25, 1, 0.5, 1)" }}
            >
              {/* Bigger Icons */}
              <div
                className={`p-3 sm:p-4 rounded-lg ${style.bg} mb-3 sm:mb-4 group-hover:scale-110 group-hover:shadow-sm relative z-10`}
                style={{ transition: "all 400ms cubic-bezier(0.25, 1, 0.5, 1)" }}
              >
                <IconComponent
                  className={`w-6 h-6 sm:w-8 sm:h-8 ${style.color}`}
                  strokeWidth={1.8}
                />
              </div>
              <h3 
                className="text-[12px] sm:text-[14px] font-medium text-slate-800 leading-snug group-hover:text-emerald-900 relative z-10"
                style={{ transition: "all 300ms ease" }}
              >
                {cat.name}
              </h3>
              
              {/* Subtle background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-50/0 group-hover:from-emerald-50/40 group-hover:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          );
        })}

        {/* Special 'View All' Card - Only show when NOT showing all */}
        {!showAll && categories.length > 15 && (
          <div
            onClick={() => setShowAll(true)}
            className="bg-[#134e4a] rounded-lg p-3 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#0d3633] hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-8px_rgba(19,78,74,0.4)] relative overflow-hidden group shadow-md min-h-[120px] sm:min-h-[160px]"
            style={{ transition: "all 400ms cubic-bezier(0.25, 1, 0.5, 1)" }}
          >
            <div 
              className="p-3 sm:p-4 rounded-lg bg-white/10 mb-3 sm:mb-4 group-hover:scale-110 relative z-10"
              style={{ transition: "all 400ms cubic-bezier(0.25, 1, 0.5, 1)" }}
            >
              <LayoutGrid className="text-white w-6 h-6 sm:w-8 sm:h-8" strokeWidth={1.8} />
            </div>
            <h3 
              className="text-[12px] sm:text-[14px] font-medium text-white leading-snug relative z-10"
              style={{ transition: "all 300ms ease" }}
            >
              View All
            </h3>
            <p 
              className="text-[10px] sm:text-[12px] text-white/70 mt-1 relative z-10"
              style={{ transition: "all 300ms ease" }}
            >
              {categories.length > 0
                ? `${categories.length}+ Categories`
                : "Explore All"}
            </p>
            
            {/* Subtle glow on hover for the dark card */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceGrid;

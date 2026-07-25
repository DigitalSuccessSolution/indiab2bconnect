"use client";

import React from "react";
import ServiceGrid from "@/components/ServiceGrid";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mb-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-slate-500 mb-4">
          <Link href="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-800 font-medium">Categories</span>
        </nav>
      </div>

      <div className="max-w-[1600px] mx-auto">
        <ServiceGrid defaultShowAll={true} />
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { ChevronRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { toggleDrawer } from "@/redux/slices/filterSlice";

interface SearchFiltersProps {
  categoryName: string;
  q: string;
  city: string;
  listingsCount: number;
  onReset: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  categoryName,
  q,
  city,
  listingsCount,
  onReset,
}) => {
  const dispatch = useDispatch();
  const title = categoryName || q || "Search Results";

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-[1800px] mx-auto px-4 lg:px-12 py-1.5">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[11px] text-slate-500 mb-1 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={10} className="shrink-0 opacity-40" />
          {city && (
            <>
              <Link
                href={`/india/${slugify(city)}`}
                className="hover:text-emerald-600 transition-colors capitalize"
              >
                {city}
              </Link>
              <ChevronRight size={10} className="shrink-0 opacity-40" />
            </>
          )}
          <span className="text-slate-900 font-medium truncate">{title}</span>
          <ChevronRight size={10} className="shrink-0 opacity-40" />
          <span className="text-orange-600 font-medium">
            {listingsCount}+ Listings
          </span>
        </nav>

        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-1">
          <h1 className="text-xl lg:text-2xl font-normal text-slate-900 tracking-tight">
            Top {title} {city ? `in ${city}` : ""}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(toggleDrawer(true))}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 text-sm font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="rotate-90" size={16} />
              Filter
            </button>
            <button
              onClick={onReset}
              className="text-sm font-semibold text-slate-500 hover:text-slate-700 hover:underline flex items-center gap-1.5 transition-all"
            >
              Reset all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;

import React from "react";

const ProductSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col h-full animate-pulse shadow-sm">
    {/* Image Skeleton */}
    <div className="h-56 w-full bg-slate-200 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 skeleton-shimmer" />
    </div>
    
    {/* Content Skeleton */}
    <div className="p-4 flex-1 flex flex-col gap-3">
      {/* Title & Price */}
      <div className="h-5 bg-slate-200 rounded w-4/5" />
      <div className="h-6 bg-slate-200 rounded w-1/3" />
      
      {/* Features/Tags */}
      <div className="flex gap-2 mt-1">
        <div className="h-5 w-16 bg-slate-100 rounded-full" />
        <div className="h-5 w-20 bg-slate-100 rounded-full" />
      </div>
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Footer (Vendor Info) */}
      <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
        <div className="flex flex-col gap-2 w-full">
          <div className="h-4 bg-slate-100 rounded w-2/3" />
          <div className="h-3 bg-slate-50 rounded w-1/2" />
        </div>
      </div>
    </div>
  </div>
);

export default ProductSkeleton;

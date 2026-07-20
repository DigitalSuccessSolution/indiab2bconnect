"use client";

import Link from 'next/link';
import { ArrowLeft, Home, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-[#f8fafc] relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#164e33]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#164e33]/[0.02] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#E64600]/[0.02] rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
      
      <div className="relative z-10 text-center max-w-lg mx-auto bg-white p-10 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        {/* Error Code & Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-[#E64600]">
            <SearchX className="w-10 h-10" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-sm font-medium text-slate-600 mb-8">
          The page you are looking for doesn't exist or has been moved. Please check the URL or navigate back to safety.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#164e33] text-white rounded-xl font-semibold hover:bg-[#113a26] transition-colors w-full sm:w-auto"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 text-slate-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
        
        {/* Help Links */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
          <Link href="/search" className="text-[#164e33] hover:underline">Search Products</Link>
          <span className="text-slate-300">•</span>
          <Link href="/contact" className="text-[#164e33] hover:underline">Support</Link>
        </div>
      </div>
    </div>
  );
}

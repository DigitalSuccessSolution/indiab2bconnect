"use client";

import React, { Suspense } from "react";
import { SearchPageContent } from "@/app/search/page";
import { Loader2 } from "lucide-react";

export default function DynamicSearchPageNoId({ params }) {
  // Unwrap params for Next.js 15 compatibility
  const resolvedParams = React.use(params);
  const { city, service } = resolvedParams;

  const decodedCity = decodeURIComponent(city).replace(/-/g, ' ');
  const decodedService = decodeURIComponent(service).replace(/-/g, ' ');
  const q = decodedService.split(' in ')[0]; 

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="animate-spin text-[#164e33]" size={48} />
        </div>
      }
    >
      <SearchPageContent 
        initialQ={q}
        initialCity={decodedCity}
      />
    </Suspense>
  );
}

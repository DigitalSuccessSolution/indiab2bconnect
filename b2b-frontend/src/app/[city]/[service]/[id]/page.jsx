"use client";

import React, { Suspense } from "react";
import { SearchPageContent } from "@/app/search/page";
import { Loader2 } from "lucide-react";

export default function DynamicSearchPage({ params }) {
  // Unwrap params if they are a promise (Next.js 15+ behavior)
  const resolvedParams = React.use(params);
  const { city, service, id } = resolvedParams;

  // Cleanup slugs for display and API
  const decodedCity = decodeURIComponent(city).replace(/-/g, ' ');
  const decodedService = decodeURIComponent(service).replace(/-/g, ' ');
  
  // Logic to separate Query and Area if "-in-" is present in the service slug
  // Pattern used in generateDiscoveryUrl: query-in-area
  const q = decodedService.split(' in ')[0]; 

  // The id is expected as nct-ID
  const categoryId = id && id.startsWith('nct-') ? id.replace('nct-', '') : null;

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
        initialCategoryId={categoryId}
      />
    </Suspense>
  );
}

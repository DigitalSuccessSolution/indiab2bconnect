import React, { Suspense } from "react";
import { SearchPageContent } from "@/app/search/page";
import { Loader2 } from "lucide-react";
import { Metadata } from "next";

type Props = {
  params: Promise<{ city: string; service: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedCity = decodeURIComponent(resolvedParams.city).replace(/-/g, ' ');
  const decodedService = decodeURIComponent(resolvedParams.service).replace(/-/g, ' ');
  const q = decodedService.split(' in ')[0]; 

  const titleCaseCity = decodedCity.replace(/\b\w/g, l => l.toUpperCase());
  const titleCaseService = q.replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `Top ${titleCaseService} in ${titleCaseCity} - B2B Connect India`,
    description: `Find the best and verified ${titleCaseService} in ${titleCaseCity}. Get quotes, compare prices, and connect with top suppliers on B2B Connect India.`,
  };
}

export default async function DynamicSearchPageNoId({ params }: Props) {
  const resolvedParams = await params;
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

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Hero from "@/components/Hero";
import ServiceGrid from "@/components/ServiceGrid";
import FeaturedServices from "@/components/FeaturedServices";
import AboutSection from "@/components/AboutSection";
import CitySuppliers from "@/components/CitySuppliers";
import QuoteForm from "@/components/QuoteForm";
import AdBanner from "@/components/AdBanner";

export default function Home() {
  const { user, loading } = useAuth();
  // Note: Server-side middleware.ts already redirects Admins and Vendors away from this page.
  // We don't need a loading skeleton here, which fixes SEO and Scroll Restoration issues.


  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main>
        <Hero />
        <ServiceGrid />
        <FeaturedServices />
        <CitySuppliers />
        <QuoteForm />
        <AboutSection />
      </main>
    </div>
  );
}

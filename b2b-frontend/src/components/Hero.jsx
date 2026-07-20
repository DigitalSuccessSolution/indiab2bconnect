"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import HeroContent from "./HeroContent";
import HeroSearchBar from "./HeroSearchBar";
import PopularIndustries from "./PopularIndustries";
import HeroStats from "./HeroStats";
import { generateDiscoveryUrl } from "@/lib/utils";
import { useSelector } from "react-redux";
const Hero = () => {
  const router = useRouter();
  const { city: reduxCity } = useSelector((state) => state.filter);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  
  // Sync locationQuery with auto-detected Redux city on load
  React.useEffect(() => {
    if (reduxCity && !locationQuery) {
      setLocationQuery(reduxCity);
    }
  }, [reduxCity]);

  const handleSearch = (type = "browse", specificQuery = null) => {
    const query =
      specificQuery !== null ? specificQuery.trim() : searchQuery.trim();
    // If the location box is empty, use the detected city or leave empty
    let city = locationQuery.trim();
    if (!city && reduxCity) {
      city = reduxCity;
    }
    
    if (type === "match") {
      router.push(
        `/post-requirement?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`,
      );
    } else {
      // Always use standard query params for free text searches from the Hero bar
      router.push(`/search?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`);
    }
  };

  return (
    <div className="bg-white font-sans text-[#1a1a1a]">
      <section className="relative h-auto flex flex-col bg-[#f4f7f6] overflow-hidden pt-24 lg:pt-28 pb-12 lg:pb-16">
        {/* --- Background Images --- */}
        <div className="absolute inset-0 z-0 overflow-hidden lg:block hidden">
          <div className="absolute top-0 right-0 w-[60%] h-full">
            <img
              src="/Banner.png"
              alt="B2B Hero Background"
              className="w-full h-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f4f7f6] via-[#f4f7f6]/80 to-transparent"></div>
          </div>
        </div>

        <div className="lg:hidden absolute inset-0 z-0 overflow-hidden">
          <img
            src="/Banner.png"
            alt="B2B Hero Background Mobile"
            className="w-full h-full object-cover object-right opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f4f7f6]/95 via-[#f4f7f6]/70 to-[#f4f7f6]/95"></div>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 w-full flex-1 flex flex-col justify-center py-6 lg:py-0">
          <div className="flex flex-col justify-center lg:flex-1">
            <HeroContent
              onMatch={() => handleSearch("match")}
              onExplore={() => handleSearch("browse")}
            />

            <HeroSearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              locationQuery={locationQuery}
              setLocationQuery={setLocationQuery}
              onSearch={() => handleSearch("match")}
            />

            {/* Floating Verified Badge (Desktop Only) */}
            <div className="absolute right-6 top-6 lg:right-12 lg:top-20 xl:top-24 bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-sm border border-slate-200 max-w-[180px] hidden lg:block">
              <div className="flex items-start gap-2.5">
                <div className="bg-[#164e33] p-2 rounded-lg text-white shadow-sm shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="font-bold text-[13px] leading-tight text-[#164e33]">
                    Verified & Trusted
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5 font-semibold leading-normal">
                    Quality you can rely on.
                  </p>
                </div>
              </div>
            </div>

            <PopularIndustries
              onSelect={(name) => {
                setSearchQuery(name);
                handleSearch("browse", name);
              }}
            />
          </div>
        </div>

        <HeroStats />
      </section>
    </div>
  );
};

export default Hero;

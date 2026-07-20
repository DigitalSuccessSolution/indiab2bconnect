"use client";
import React, { useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";

const AdBanner = ({ 
  dataAdSlot = "1234567890", // Default placeholder slot
  dataAdFormat = "auto", 
  dataFullWidthResponsive = true 
}) => {
  const { user } = useAuth();

  useEffect(() => {
    // Only initialize ads if we are going to render them
    if (user?.role === 'VENDOR' || user?.role === 'ADMIN') return;
    
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense Error: ", error);
    }
  }, [user]);

  // Don't show ads to vendors or admins
  if (user?.role === 'VENDOR' || user?.role === 'ADMIN') {
    return null;
  }

  return (
    <div className="w-full bg-[#F1F3F4] py-4 relative group border-y border-gray-200 overflow-hidden flex justify-center items-center min-h-[100px]">
      {/* Real Google AdSense Tag */}
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", textAlign: "center" }}
        data-ad-client="ca-pub-XXXXXXXXXX" /* Will be auto-filled by GoogleAdsProvider */
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive.toString()}
      />
      
      {/* Fallback Label if Ad is blocked by AdBlocker */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center text-gray-400 text-sm font-medium tracking-wide">
        Advertisement
      </div>
    </div>
  );
};

export default AdBanner;

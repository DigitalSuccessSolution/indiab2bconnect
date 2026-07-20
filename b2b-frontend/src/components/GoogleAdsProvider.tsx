"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { apiFetch } from "@/lib/api";

export default function GoogleAdsProvider() {
  const [adSenseId, setAdSenseId] = useState("");

  useEffect(() => {
    // Fetch global settings to get Google AdSense ID
    apiFetch("/settings")
      .then((data) => {
        if (data && data.googleAdSenseId) {
          setAdSenseId(data.googleAdSenseId);
        }
      })
      .catch((err) => console.error("Failed to load Google AdSense ID", err));
  }, []);

  if (!adSenseId) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

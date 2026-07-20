"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BuyerLogin from "./BuyerLogin";
import { useAuth } from "@/context/AuthContext";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isAutoPopupOpen, setIsAutoPopupOpen] = React.useState(false);

  React.useEffect(() => {
    const hasSkipped = sessionStorage.getItem("login_popup_skipped");
    if (!user && !hasSkipped) {
      const timer = setTimeout(() => {
        setIsAutoPopupOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleCloseAutoPopup = () => {
    sessionStorage.setItem("login_popup_skipped", "true");
    setIsAutoPopupOpen(false);
  };

  // Define routes that should NOT have the global Navbar and Footer
  // Dashboards, Login, Register, admin etc. usually have their own
  const noLayoutRoutes = [
    "/b2b-india",
    "/vendor",
    "/secure-login",
    "/login",
    "/register",
  ];

  // We check if current path starts with any of the excluded routes
  const hideLayout =
    noLayoutRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.includes("/dashboard");

  if (hideLayout) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hide global Navbar only on search pages to allow for the specialized filter bar */}
      <React.Suspense
        fallback={<div className="h-16 bg-white shadow-sm animate-pulse" />}
      >
        <Navbar />
      </React.Suspense>
      <main className="flex-1">
        <React.Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="w-8 h-8 border-4 border-[#164e33]/20 border-t-[#164e33] rounded-full animate-spin" />
            </div>
          }
        >
          {children}
        </React.Suspense>
      </main>
      <Footer />
      <BuyerLogin 
        isOpen={isAutoPopupOpen} 
        onClose={handleCloseAutoPopup} 
        isSkipable={true}
      />
    </div>
  );
}

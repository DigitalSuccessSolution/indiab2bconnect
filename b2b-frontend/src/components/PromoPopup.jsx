"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PromoPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasClosed, setHasClosed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only trigger if we are on the homepage
    if (pathname === "/") {
      // Check if user already closed it in this session
      const closed = sessionStorage.getItem("promoClosed");
      if (closed) {
        setHasClosed(true);
        return;
      }

      // Reset state in case of client-side navigation back to home
      setHasClosed(false);
      setIsVisible(false);
      
      // Show after a delay of 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleClose = () => {
    setIsVisible(false);
    setHasClosed(true);
    sessionStorage.setItem("promoClosed", "true");
  };

  // Only render on the homepage ("/")
  if (pathname !== "/") return null;
  if (!isVisible || hasClosed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[999] max-w-[360px] w-[calc(100%-2rem)] md:max-w-[420px] animate-in slide-in-from-bottom-10 fade-in duration-500">
      
      {/* Floating Close Button */}
      <button 
        onClick={handleClose}
        className="absolute -top-3 -right-3 w-8 h-8 bg-white text-slate-800 hover:text-black rounded-full shadow-md flex items-center justify-center z-50 transition-transform hover:scale-110"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="bg-[#2a5bf0] rounded-xl shadow-2xl overflow-hidden relative border border-[#4d79f6]">
        
        {/* Background decorative arrows */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M 320 180 L 400 50 L 380 40 M 400 50 L 370 65" stroke="white" strokeWidth="6" fill="none" />
            <path d="M 50 180 L 120 80 L 105 75 M 120 80 L 95 95" stroke="white" strokeWidth="4" fill="none" />
          </svg>
        </div>
        
        <div className="p-4 sm:p-5 md:p-6 relative z-10 flex gap-2 sm:gap-4 min-h-[140px] md:min-h-[170px]">
          <div className="flex-1 z-10">
            <h3 className="text-[17px] sm:text-[20px] md:text-[22px] font-bold text-white leading-[1.25] mb-2 sm:mb-3">
              Connect with <br /> 18.4 Crore+ Buyers
            </h3>
            <p className="text-blue-50 text-[13px] sm:text-[14px] md:text-[15px] font-medium leading-[1.3] mb-3 sm:mb-5">
              Grow Your Business in <br className="hidden sm:block" /> 3 Easy Steps
            </p>

            <Link 
              href="/sell"
              className="inline-block bg-[#F8C15A] hover:bg-[#F2B03D] text-black font-bold text-[12px] sm:text-[13px] md:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded shadow transition-transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              List your Business for FREE
            </Link>
          </div>
          
          {/* Placeholder for the person image */}
          <div className="w-[70px] sm:w-[100px] md:w-[120px] shrink-0 relative flex flex-col justify-center items-center">
             <img 
               src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300&h=300" 
               alt="Business Growth" 
               className="w-full h-auto aspect-square object-cover rounded-full shadow-lg border-2 border-white/20"
               onError={(e) => {
                 e.target.style.display = 'none';
               }}
             />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoPopup;

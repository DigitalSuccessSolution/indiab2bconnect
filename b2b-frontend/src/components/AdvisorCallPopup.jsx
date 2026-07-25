"use client";

import React, { useState, useEffect } from "react";
import { X, Phone, UserRound } from "lucide-react";

const AdvisorCallPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasClosed, setHasClosed] = useState(false);

  useEffect(() => {
    // Check if user already closed it in this session
    const closed = sessionStorage.getItem("advisorPopupClosed");
    if (closed) {
      setHasClosed(true);
      return;
    }

    // Show popup shortly after landing on the sell page
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setHasClosed(true);
    sessionStorage.setItem("advisorPopupClosed", "true");
  };

  if (!isVisible || hasClosed) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-[440px] w-full relative overflow-visible flex flex-col animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Blue Section */}
        <div className="bg-[#e9f2fb] h-24 rounded-t-2xl relative w-full border-b border-blue-50">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Profile Image (overlapping) */}
        <div className="relative flex justify-center -mt-12 z-10 pointer-events-none">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-sm bg-[#90c6f5] flex items-center justify-center">
             <img 
               src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" 
               alt="Advisor" 
               className="w-full h-full object-cover"
               onError={(e) => {
                 e.target.style.display = 'none';
                 e.target.nextSibling.style.display = 'flex';
               }}
             />
             <div className="hidden w-full h-full items-center justify-center text-white bg-[#90c6f5]">
               <UserRound className="w-10 h-10" />
             </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6 pt-4 sm:pt-5 text-center">
          <p className="text-slate-800 text-[15px] sm:text-[17px] leading-relaxed mb-5 sm:mb-6 font-medium">
            Ms. Pooja will assist you on an instant call <strong className="font-bold text-black">to<br/> Create a FREE Business Listing</strong>
          </p>
          
          {/* Input Group */}
          <div className="flex items-center border border-slate-300 rounded-lg p-1 mb-5 sm:mb-7 focus-within:border-[#34A853] focus-within:ring-1 focus-within:ring-[#34A853] transition-all bg-white hover:border-slate-400">
            <div className="flex items-center px-2 sm:px-3 border-r border-slate-200 shrink-0 select-none">
               <span className="text-lg sm:text-xl leading-none mr-1 sm:mr-2">🇮🇳</span>
               <span className="font-semibold text-slate-800 text-[14px] sm:text-[15px]">+91</span>
            </div>
            <input 
              type="tel" 
              placeholder="Mobile No." 
              className="flex-1 outline-none px-2 sm:px-3 w-full text-[14px] sm:text-[15px] placeholder-slate-400 min-w-0 text-slate-700 font-medium"
            />
            <button className="bg-[#34A853] hover:bg-[#2c8d46] text-white font-semibold px-3 sm:px-5 py-2 sm:py-2.5 rounded-md flex items-center justify-center gap-1.5 sm:gap-2 text-[13px] sm:text-[15px] shrink-0 transition-colors shadow-sm">
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current hidden sm:block" />
              <span className="whitespace-nowrap">Call Now</span>
            </button>
          </div>
          
          <hr className="border-slate-100 mb-4 sm:mb-5 w-[90%] mx-auto" />
          
          <p className="text-slate-500 text-[12px] sm:text-[13.5px] leading-relaxed px-1 sm:px-2 pb-1 sm:pb-2 font-medium">
            Get on a voice call with our Advisor now! Let us answer your questions instantly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvisorCallPopup;

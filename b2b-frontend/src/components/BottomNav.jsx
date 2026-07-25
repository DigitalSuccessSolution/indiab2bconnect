import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, LayoutGrid, Menu, Search } from "lucide-react";

const BottomNav = ({ setIsMobileMenuOpen }) => {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide if scrolling down and we've scrolled past the top 50px
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } 
      // Show if scrolling up
      else {
        setIsVisible(true);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-[90] lg:hidden pb-safe pt-2 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-32"
      }`}
    >
      <div className="flex justify-between items-center h-16 px-3 max-w-md mx-auto">
        <Link href="/" className={`flex flex-col items-center justify-center gap-1.5 w-[18%] transition-colors ${pathname === '/' ? 'text-[#FF4F00]' : 'text-slate-500 hover:text-[#FF4F00]'}`}>
          <Home className={`w-5 h-5 ${pathname === '/' ? 'fill-[#FF4F00]/10' : ''}`} />
          <span className="text-[11px] font-semibold tracking-wide">Home</span>
        </Link>
        
        <Link href="/categories" className={`flex flex-col items-center justify-center gap-1.5 w-[18%] transition-colors ${pathname === '/categories' ? 'text-[#FF4F00]' : 'text-slate-500 hover:text-[#FF4F00]'}`}>
          <LayoutGrid className={`w-5 h-5 ${pathname === '/categories' ? 'fill-[#FF4F00]/10' : ''}`} />
          <span className="text-[11px] font-semibold tracking-wide">Category</span>
        </Link>

        {/* Floating Search Button */}
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('openMobileSearch'))}
          className="flex flex-col items-center justify-center w-[20%] relative group"
        >
          <div className="absolute -top-7 flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-[#FF4F00] to-[#FF6B00] rounded-full shadow-lg shadow-orange-500/40 transition-transform active:scale-95">
            <Search className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-bold tracking-wide text-[#FF4F00] mt-7">Search</span>
        </button>

        <Link href="/post-requirement" className={`flex flex-col items-center justify-center gap-1.5 w-[18%] transition-colors ${pathname === '/post-requirement' ? 'text-[#FF4F00]' : 'text-slate-500 hover:text-[#FF4F00]'}`}>
          <ClipboardList className={`w-5 h-5 ${pathname === '/post-requirement' ? 'fill-[#FF4F00]/10' : ''}`} />
          <span className="text-[11px] font-semibold tracking-wide text-center leading-none">Post Enquiry</span>
        </Link>

        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-1.5 w-[18%] text-slate-500 hover:text-[#FF4F00] transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[11px] font-semibold tracking-wide">Menu</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;

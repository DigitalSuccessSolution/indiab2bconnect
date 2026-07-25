"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, MapPin, ChevronDown, Bell, Search, TrendingUp, LocateFixed } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

const MobileSearchDrawer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("India");
  const [trendingSearches, setTrendingSearches] = useState<{name: string, type: string}[]>([]);
  const [trendingLocations, setTrendingLocations] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [activeView, setActiveView] = useState<'search' | 'location'>('search');
  const [locationInput, setLocationInput] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

  // Dynamic Search States
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Dynamic Location States
  const [dynamicLocations, setDynamicLocations] = useState<string[]>([]);
  const [isSearchingLocations, setIsSearchingLocations] = useState(false);
  const [debouncedLocation, setDebouncedLocation] = useState("");
  const [recentLocations, setRecentLocations] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentLocations");
    if (saved) setRecentLocations(JSON.parse(saved));
  }, []);

  const saveRecentLocation = (loc: string) => {
    const updated = [loc, ...recentLocations.filter((r) => r !== loc)].slice(0, 5);
    setRecentLocations(updated);
    localStorage.setItem("recentLocations", JSON.stringify(updated));
  };

  const clearRecentLocations = () => {
    setRecentLocations([]);
    localStorage.removeItem("recentLocations");
  };

  // Debounce inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedLocation(locationInput);
    }, 400);
    return () => clearTimeout(handler);
  }, [locationInput]);

  // Fetch dynamic suggestions (Products, Vendors) on typing
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await apiFetch(`/vendors/search?search=${encodeURIComponent(debouncedQuery.trim())}&limit=5`);
        if (res.success && res.data?.vendors) {
          const results = new Set<string>();
          const query = debouncedQuery.trim().toLowerCase();

          categories.forEach((cat) => {
            if (cat?.name?.toLowerCase().includes(query)) {
              results.add(cat.name);
            }
          });

          res.data.vendors.forEach((v: any) => {
            if (v?.businessName?.toLowerCase().includes(query)) {
              results.add(v.businessName);
            }
            v?.products?.forEach((p: any) => {
              if (p?.name?.toLowerCase().includes(query)) {
                results.add(p.name);
              }
            });
          });

          setSuggestions(Array.from(results).slice(0, 10));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, categories]);

  // Dynamic location search as user types
  useEffect(() => {
    if (debouncedLocation.length < 3 || isDetecting) {
      setDynamicLocations([]);
      return;
    }

    const fetchLocations = async () => {
      setIsSearchingLocations(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedLocation)}&countrycodes=in&limit=8&accept-language=en&addressdetails=1`,
        );
        const data = await response.json();

        const formatted = data.map((item: any) => {
          const addr = item.address;
          const city =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.city_district ||
            addr.state_district ||
            addr.state ||
            item.name;

          return city || "";
        });

        const NEARBY_CITIES: Record<string, string[]> = {
          indore: ["Ujjain", "Dewas", "Pithampur", "Mhow", "Dhar", "Khandwa"],
          mumbai: ["Thane", "Navi Mumbai", "Kalyan", "Pune", "Nashik"],
          delhi: ["Noida", "Gurugram", "Ghaziabad", "Faridabad", "Meerut"],
          bhopal: ["Sehore", "Vidisha", "Raisen", "Hoshangabad", "Itarsi"],
          bangalore: ["Mysuru", "Tumakuru", "Kolar", "Mandya", "Hosur"],
          pune: ["Pimpri-Chinchwad", "Lonavala", "Satara", "Ahmednagar"],
          ahmedabad: ["Gandhinagar", "Sanand", "Mehsana", "Nadiad", "Anand"],
          chennai: ["Kanchipuram", "Tiruvallur", "Chengalpattu", "Vellore"],
          hyderabad: ["Secunderabad", "Warangal", "Nizamabad", "Karimnagar"],
          kolkata: ["Howrah", "Hooghly", "North 24 Parganas", "South 24 Parganas"],
          jaipur: ["Ajmer", "Sikar", "Tonk", "Alwar", "Dausa"],
          surat: ["Navsari", "Bharuch", "Ankleshwar", "Vapi", "Valsad"],
          lucknow: ["Kanpur", "Barabanki", "Unnao", "Raebareli", "Sitapur"],
          kanpur: ["Lucknow", "Unnao", "Fatehpur", "Etawah", "Kannauj"],
          nagpur: ["Wardha", "Amravati", "Bhandara", "Chandrapur"]
        };

        const queryLower = debouncedLocation.toLowerCase().trim();
        const nearbyMatches: string[] = [];
        Object.keys(NEARBY_CITIES).forEach(key => {
          if (key.includes(queryLower) || queryLower.includes(key)) {
            nearbyMatches.push(...NEARBY_CITIES[key]);
          }
        });

        // Filter valid strings and remove duplicates
        const uniqueLocations = Array.from(new Set<string>([...formatted, ...nearbyMatches].filter(Boolean)));
        setDynamicLocations(uniqueLocations);
      } catch (error) {
        console.error("Error auto-fetching cities:", error);
      } finally {
        setIsSearchingLocations(false);
      }
    };

    fetchLocations();
  }, [debouncedLocation, isDetecting]);

  // Listen to global event
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setSearchQuery(searchParams.get("q") || "");
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 300);
    };
    window.addEventListener("openMobileSearch", handleOpen);
    return () => window.removeEventListener("openMobileSearch", handleOpen);
  }, [searchParams]);

  // Fetch trending data
  useEffect(() => {
    if (isOpen && trendingSearches.length === 0) {
      const fetchData = async () => {
        try {
          const [catRes, trendRes] = await Promise.allSettled([
            apiFetch("/categories"),
            apiFetch("/trending"),
          ]);

          let tempTrending = [];

          if (trendRes.status === "fulfilled" && trendRes.value.success && trendRes.value.data?.searches) {
            tempTrending = trendRes.value.data.searches.map((s: string) => ({ name: s, type: "Trending Search" }));
          }

          if (catRes.status === "fulfilled" && catRes.value.success) {
            setCategories(catRes.value.data);
            if (tempTrending.length === 0) {
              tempTrending = catRes.value.data.slice(0, 5).map((c: any) => ({ name: c.name, type: "Category" }));
            }
          }
          
          setTrendingSearches(tempTrending);

          if (trendRes.status === "fulfilled" && trendRes.value.success && trendRes.value.data?.locations) {
            setTrendingLocations(trendRes.value.data.locations);
          } else {
            setTrendingLocations([
              "Mumbai",
              "Indore",
              "Delhi",
              "Thane",
              "Ahmedabad",
            ]);
          }
        } catch (error) {
          console.error("Error fetching trending data:", error);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleDetectLocation = () => {
    setIsDetecting(true);
    if (!navigator.geolocation) {
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=en`,
          );
          const data = await response.json();
          const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.city_district ||
            data.address.state_district;

          if (city) {
            setLocation(city);
            setActiveView('search');
          }
        } catch (error) {
          console.error("Error auto-fetching location:", error);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error("Auto Geolocation error:", error);
        setIsDetecting(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&city=${encodeURIComponent(location === "India" ? "" : location)}`);
  };

  const handleTrendingClick = (term: string) => {
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}&city=${encodeURIComponent(location === "India" ? "" : location)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[100] bg-white flex flex-col h-[100dvh]"
        >
          {activeView === 'search' ? (
            <>
              {/* Top Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 -ml-1 hover:bg-slate-100 rounded-full"
                >
                  <ChevronLeft size={24} className="text-slate-700" />
                </button>
                
                <div 
                  className="flex items-center gap-1.5 cursor-pointer max-w-[180px] px-1 py-1.5 focus-within:text-orange-500 transition-colors"
                  onClick={() => setActiveView('location')}
                >
                  <MapPin size={16} className="text-slate-700 shrink-0" />
                  <span className="text-[14px] font-semibold text-slate-900 truncate">
                    {location || "India"}
                  </span>
                  <ChevronDown size={16} className="text-slate-500 shrink-0" />
                </div>

                <div className="w-8"></div>
              </div>

          {/* Search Input Area */}
          <div className="px-4 py-3 bg-white">
            <form onSubmit={handleSearchSubmit} className="flex items-center h-[50px] border border-slate-300 rounded-[14px] bg-white pr-1.5 focus-within:border-slate-400 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, categories..."
                className="flex-grow h-full px-4 text-[15px] bg-transparent outline-none placeholder:text-slate-500 text-slate-800 font-medium"
              />
              <button 
                type="submit" 
                className="h-[40px] w-[46px] bg-[#FF4F00] hover:bg-[#E64600] rounded-[10px] flex items-center justify-center shrink-0 transition-colors"
              >
                <Search size={20} className="text-white" />
              </button>
            </form>
          </div>

          {/* Suggestions or Trending Searches */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50">
            {debouncedQuery.length > 0 ? (
              <div className="px-4 py-3">
                <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-3">Suggestions</h3>
                {isSearching ? (
                  <div className="flex justify-center py-8">
                    <div className="w-5 h-5 border-2 border-[#FF4F00] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="flex flex-col">
                    {suggestions.map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleTrendingClick(item)}
                        className="flex items-center gap-4 py-3 border-b border-slate-200/60 active:bg-slate-100 cursor-pointer"
                      >
                        <Search size={18} className="text-slate-400 shrink-0" />
                        <span className="text-[14px] font-medium text-slate-800 leading-tight">{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-[14px] text-slate-500">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 py-3">
                <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-3">Trending Searches</h3>
                <div className="flex flex-col">
                  {trendingSearches.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleTrendingClick(item.name)}
                      className="flex items-center gap-4 py-3 border-b border-slate-200/60 active:bg-slate-100 cursor-pointer"
                    >
                      <div className="w-[38px] h-[38px] bg-slate-200 rounded-sm flex items-center justify-center shrink-0">
                        <TrendingUp size={18} className="text-slate-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-medium text-slate-800 leading-tight mb-0.5">{item.name}</span>
                        <span className="text-[12px] text-slate-400">{item.type}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {categories.length > 0 && (
                  <div className="mt-6 pb-6">
                    <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-3">All Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleTrendingClick(cat.name)}
                          className="px-4 py-2 bg-white border border-slate-200 rounded-full text-[13px] font-medium text-slate-700 hover:border-[#FF4F00] hover:text-[#FF4F00] transition-colors"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
            </>
          ) : (
            <>
              {/* Location View Header */}
              <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-slate-100 shrink-0">
                <button onClick={() => setActiveView('search')} className="p-1 -ml-1">
                  <ChevronLeft size={24} className="text-slate-800" />
                </button>
                <h2 className="text-base font-bold text-slate-900">Your Location</h2>
                <div className="w-8"></div>
              </div>

              {/* Location Search Input */}
              <div className="px-4 py-3 bg-white border-b border-slate-100 shrink-0">
                <div className="flex items-center h-[42px] border border-slate-300 rounded-lg px-3 focus-within:border-slate-500 bg-white">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="Start typing your location..."
                    className="flex-grow h-full text-[14px] font-medium bg-transparent outline-none placeholder:text-slate-500 text-slate-900"
                  />
                  <Search size={18} className="text-slate-500 shrink-0 ml-2" />
                </div>
              </div>

              {/* Scrollable Location Content */}
              <div className="flex-1 overflow-y-auto bg-white">
                {/* Detect Location */}
                <button 
                  onClick={handleDetectLocation}
                  className="w-full flex items-center gap-4 px-6 py-4 text-[#E64600] hover:bg-orange-50/50 transition-colors border-b border-slate-100 disabled:opacity-50"
                  disabled={isDetecting}
                >
                  <LocateFixed size={20} className={isDetecting ? "animate-spin" : ""} />
                  <span className="text-[15px] font-bold">{isDetecting ? "Detecting..." : "Detect Location"}</span>
                </button>

                {/* Dynamic Locations from API or Fallbacks */}
                <div className="py-4">
                  <div className="px-6 flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.1em]">
                      {isSearchingLocations 
                        ? "Searching..." 
                        : debouncedLocation.length >= 3 
                          ? "Suggestions" 
                          : "Your Areas"}
                    </span>
                    {!isSearchingLocations && debouncedLocation.length < 3 && recentLocations.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearRecentLocations();
                        }}
                        className="text-[#FF4F00] hover:text-orange-700 capitalize font-semibold text-[11px]"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col">
                    {isSearchingLocations ? (
                      <div className="flex justify-center py-6">
                         <div className="w-6 h-6 border-2 border-[#E64600] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : dynamicLocations.length > 0 ? (
                      dynamicLocations.map((loc, idx) => (
                        <button 
                          key={idx}
                          onClick={() => { setLocation(loc); saveRecentLocation(loc); setActiveView('search'); }}
                          className="w-full flex items-center px-6 py-3.5 hover:bg-slate-50 transition-colors"
                        >
                          <span className="text-[15px] font-medium text-slate-700 hover:text-[#FF4F00] text-left line-clamp-1">{loc}</span>
                        </button>
                      ))
                    ) : debouncedLocation.length >= 3 ? (
                      <div className="py-4 px-6 text-slate-400 text-sm font-medium">
                        No results found for "{debouncedLocation}"
                      </div>
                    ) : (
                      <>
                        {recentLocations.length > 0 && (
                          <div className="mb-6">
                            <span className="text-[11px] font-semibold text-slate-400 mb-2 block px-6">
                              Recent Locations
                            </span>
                            {recentLocations.map((loc, i) => (
                              <button
                                key={`recent-${i}`}
                                onClick={() => { setLocation(loc); setActiveView('search'); }}
                                className="w-full flex items-center px-6 py-3.5 hover:bg-slate-50 transition-colors gap-3"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                <span className="text-[15px] font-medium text-slate-700 hover:text-[#FF4F00] text-left">{loc}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <div>
                          <span className="text-[11px] font-semibold text-slate-400 mb-2 block px-6">
                            Trending Areas
                          </span>
                          {trendingLocations.map((loc, i) => (
                            <button
                              key={`trending-${i}`}
                              onClick={() => { setLocation(loc); saveRecentLocation(loc); setActiveView('search'); }}
                              className="w-full flex items-center px-6 py-3.5 hover:bg-slate-50 transition-colors"
                            >
                              <span className="text-[15px] font-medium text-slate-700 hover:text-[#FF4F00] text-left">{loc}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileSearchDrawer;

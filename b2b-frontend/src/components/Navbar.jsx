"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Menu,
  X,
  MapPin,
  LocateFixed,
  User,
  LogOut,
  ShoppingBag,
  ChevronDown,
  Building2,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  setSearchQuery as setReduxQuery,
  setCity as setReduxCity,
  setCategory as setReduxCategory,
} from "@/redux/slices/filterSlice";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { slugify, generateDiscoveryUrl } from "@/lib/utils";
import BuyerLogin from "./BuyerLogin";
import VendorLogin from "./VendorLogin";

const Navbar = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState(""); // Empty initially so we don't flash India
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [dynamicLocations, setDynamicLocations] = useState([]);
  const [isSearchingLocations, setIsSearchingLocations] = useState(false);
  const [recentLocations, setRecentLocations] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [trendingLocations, setTrendingLocations] = useState([]);
  const [isBuyerDrawerOpen, setIsBuyerDrawerOpen] = useState(false);
  const [isVendorDrawerOpen, setIsVendorDrawerOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400); // 400ms delay
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const dispatch = useDispatch();
  const {
    query: reduxQuery,
    city: reduxCity,
    category: reduxCategory,
  } = useSelector((state) => state.filter);

  useEffect(() => {
    const fetchDiscoveryData = async () => {
      try {
        const [catRes, trendRes] = await Promise.allSettled([
          apiFetch("/categories"),
          apiFetch("/trending"),
        ]);

        if (catRes.status === "fulfilled" && catRes.value.success) {
          const categories = catRes.value.data;
          setAllCategories(categories);
          setPopularCategories(categories.slice(0, 20)); // Show more in "Popular" if needed, or just use allCategories

          // Use surplus categories as trending searches if analytics API missing
          if (!trendingSearches.length) {
            setTrendingSearches(categories.slice(20, 25).map((c) => c.name));
          }
        }

        if (trendRes.status === "fulfilled" && trendRes.value.success) {
          if (trendRes.value.data.searches)
            setTrendingSearches(trendRes.value.data.searches);
          if (trendRes.value.data.locations)
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
      } catch (err) {
        console.error("Discovery data sync failed:", err);
      }
    };

    fetchDiscoveryData();
  }, []);

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
          const results = new Set();
          const query = debouncedQuery.trim().toLowerCase();

          // 1. Add matching categories
          allCategories.forEach((cat) => {
            if (cat?.name?.toLowerCase().includes(query)) {
              results.add(cat.name);
            }
          });

          // 2. Add matching products and vendors
          res.data.vendors.forEach((v) => {
            if (v?.businessName?.toLowerCase().includes(query)) {
              results.add(v.businessName);
            }
            v?.products?.forEach((p) => {
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
  }, [debouncedQuery, allCategories]);

  // Load recent locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentLocations");
    if (saved) setRecentLocations(JSON.parse(saved));
  }, []);

  const saveRecentLocation = (loc) => {
    const updated = [loc, ...recentLocations.filter((r) => r !== loc)].slice(
      0,
      5,
    );
    setRecentLocations(updated);
    localStorage.setItem("recentLocations", JSON.stringify(updated));
  };

  const clearRecentLocations = () => {
    setRecentLocations([]);
    localStorage.removeItem("recentLocations");
  };

  const NEARBY_CITIES = {
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

  // Dynamic location search as user types
  useEffect(() => {
    if (location.length < 3 || isDetecting) {
      setDynamicLocations([]);
      return;
    }

    const fetchLocations = async () => {
      setIsSearchingLocations(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&countrycodes=in&limit=8&accept-language=en&addressdetails=1`,
        );
        const data = await response.json();

        const formatted = data.map((item) => {
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

        // Add nearby cities if we matched a major city
        const queryLower = location.toLowerCase().trim();
        const nearbyMatches = [];
        Object.keys(NEARBY_CITIES).forEach(key => {
          if (key.includes(queryLower) || queryLower.includes(key)) {
            nearbyMatches.push(...NEARBY_CITIES[key]);
          }
        });

        // Filter out duplicates and empty strings, combine with nearby
        const uniqueFormatted = [...new Set([...formatted, ...nearbyMatches])].filter(Boolean);
        setDynamicLocations(uniqueFormatted);
      } catch (error) {
        console.error("Error searching locations:", error);
      } finally {
        setIsSearchingLocations(false);
      }
    };

    const timeoutId = setTimeout(fetchLocations, 500);
    return () => clearTimeout(timeoutId);
  }, [location, isDetecting]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    setLocation("Detecting...");

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
            data.address.state_district ||
            "Indore";
          setLocation(city);
        } catch (error) {
          console.error("Error fetching location:", error);
          setLocation("Indore, MP");
        } finally {
          setIsDetecting(false);
          setIsLocationDropdownOpen(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocation("India");
        setIsDetecting(false);
        setIsLocationDropdownOpen(false);
        alert("Please enable location access to use this feature.");
      },
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const params = useParams();
  const searchParams = useSearchParams();

  // Sync state with URL
  useEffect(() => {
    // 1. Handle Search Query
    let q = "";
    if (params?.service) {
      const decodedService = decodeURIComponent(params.service).replace(
        /-/g,
        " ",
      );
      q = decodedService.split(" in ")[0];
    } else {
      q = searchParams.get("q") || "";
    }
    if (q) {
      setSearchQuery(q);
      dispatch(setReduxQuery(q));
    }

    // 2. Handle Location
    let loc = "";
    if (params?.city) {
      const city = decodeURIComponent(params.city).replace(/-/g, " ");
      let area = "";
      if (params.service && params.service.includes("-in-")) {
        area = decodeURIComponent(params.service.split("-in-")[1]).replace(
          /-/g,
          " ",
        );
      }
      loc = area ? `${area}, ${city}` : city;
      
      // If the location is just 'india' or 'all india', keep the input clean
      const normalizedLoc = loc.toLowerCase().trim();
      if (normalizedLoc === "india" || normalizedLoc === "all india") {
        loc = "";
      }
      
      setLocation(loc);
      dispatch(setReduxCity(loc));
    } else {
      const urlCity = searchParams.get("city");
      if (urlCity) {
        let cleanUrlCity = urlCity;
        const normalizedUrlCity = urlCity.toLowerCase().trim();
        if (normalizedUrlCity === "india" || normalizedUrlCity === "all india") {
          cleanUrlCity = "";
        }
        setLocation(cleanUrlCity);
        dispatch(setReduxCity(cleanUrlCity));
      } else {
        // If no city in URL, we don't force "India" immediately here 
        // to avoid overwriting the IP fetch logic below.
      }
    }
  }, [params, searchParams, dispatch]);

  // Auto-detect city by IP on mount if no city specified or if it's just 'india'
  useEffect(() => {
    const pCity = params?.city ? decodeURIComponent(params.city).toLowerCase() : "";
    const sCity = searchParams.get("city") ? searchParams.get("city").toLowerCase() : "";
    
    const isDefaultLocation = !pCity && !sCity || pCity === "india" || pCity === "all india" || sCity === "india" || sCity === "all india";

    if (isDefaultLocation) {
      const fetchCityAutomatically = () => {
        if (!navigator.geolocation) {
          return; // Silent fail if not supported
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
                dispatch(setReduxCity(city));
              }
            } catch (error) {
              console.error("Error auto-fetching location:", error);
            }
          },
          (error) => {
            console.error("Auto Geolocation error:", error);
            // Silent fail, don't alert the user on page load
          },
          { timeout: 10000 }
        );
      };
      fetchCityAutomatically();
    }
  }, []);

  // Sync with Redux Query for search bar persistence
  useEffect(() => {
    if (reduxQuery && reduxQuery !== searchQuery) {
      setSearchQuery(reduxQuery);
    }
  }, [reduxQuery]);

  // Sync Redux Category if not set
  useEffect(() => {
    if (
      !reduxCategory.name &&
      params?.service &&
      popularCategories.length > 0
    ) {
      const decodedService = decodeURIComponent(params.service).replace(
        /-/g,
        " ",
      );
      const q = decodedService.split(" in ")[0];
      const foundCat = popularCategories.find(
        (c) => slugify(c.name) === slugify(q),
      );
      if (foundCat) {
        dispatch(setReduxCategory({ id: foundCat.id, name: foundCat.name }));
      }
    }
  }, [params, popularCategories, reduxCategory, dispatch]);

  const handleSearch = (
    e,
    customQuery = null,
    catId = null,
    catName = null,
  ) => {
    if (e) e.preventDefault();
    const query = customQuery || searchQuery;
    const finalCatId = catId || reduxCategory.id;
    const finalCatName = catName || (catId ? customQuery : reduxCategory.name);

    if (query.trim() || location) {
      setSearchQuery(query.trim());
      dispatch(setReduxQuery(query.trim()));
      if (finalCatName) {
        dispatch(setReduxCategory({ id: finalCatId, name: finalCatName }));
      }

      // If location input is empty, fallback to the auto-detected reduxCity
      const searchLocation = location || reduxCity;
      
      let targetUrl;
      // Use SEO-friendly URL ONLY if it's an explicit category selection
      if (catId) {
        targetUrl = generateDiscoveryUrl(
          finalCatName || query.trim(),
          searchLocation,
          finalCatId,
        );
      } else {
        // For product/vendor names and free text, use standard search params
        targetUrl = `/search?q=${encodeURIComponent(query.trim())}&city=${encodeURIComponent(searchLocation)}`;
      }
      
      router.push(targetUrl);
      setIsSearchDropdownOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm py-2"
          : "bg-white py-4"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Image
            src="/logo.png"
            alt="MarketHub Logo"
            width={150}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* Search Bar - Main Layout */}
        <div className="hidden md:flex flex-grow max-w-3xl mx-4">
          <form
            onSubmit={handleSearch}
            className="w-full flex items-center gap-3"
          >
            {/* Location Container */}
            <div className="relative group input_location_box">
              <div className="flex items-center h-[46px] bg-white border border-slate-200 rounded-lg w-[220px] hover:border-slate-300 transition-all cursor-text overflow-hidden relative z-20">
                <div className="h-full flex items-center justify-center pl-3">
                  <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                </div>
                <input
                  type="text"
                  id="city-auto-sug"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={isLocationDropdownOpen}
                  aria-haspopup="listbox"
                  aria-controls="locbox"
                  aria-label="Select Location"
                  autoComplete="off"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (!isLocationDropdownOpen)
                      setIsLocationDropdownOpen(true);
                  }}
                  placeholder="Select Location"
                  className="input_location bg-transparent flex-grow h-full px-3 text-[14px] font-normal text-[#111] leading-normal outline-none placeholder:text-slate-400 cursor-text font-sans"
                  onFocus={() => {
                    setIsLocationDropdownOpen(true);
                    setIsSearchDropdownOpen(false);
                  }}
                />
              </div>

              {/* Location Dropdown */}
              <AnimatePresence>
                {isLocationDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsLocationDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-2 w-[320px] bg-white border border-slate-300 rounded-xl shadow-2xl z-20 overflow-y-auto max-h-[450px] scrollbar-hide py-2"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      <button
                        type="button"
                        disabled={isDetecting}
                        className="w-full flex items-center gap-3 px-6 py-4 text-[#FF4F00] hover:bg-orange-50 transition-colors border-b border-slate-200 disabled:opacity-50"
                        onClick={handleDetectLocation}
                      >
                        <LocateFixed
                          className={`w-5 h-5 ${isDetecting ? "animate-spin" : ""}`}
                        />
                        <span className="font-semibold text-[15px]">
                          {isDetecting ? "Detecting..." : "Detect Location"}
                        </span>
                      </button>

                      <div className="px-6 py-4">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                          {isSearchingLocations
                            ? "Searching..."
                            : location.length >= 3
                              ? "Suggestions"
                              : "Your Areas"}
                          {!isSearchingLocations &&
                            location.length < 3 &&
                            recentLocations.length > 0 && (
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
                        </span>

                        <div className="mt-4 space-y-1">
                          {isSearchingLocations ? (
                            <div className="py-4 space-y-3">
                              <div className="h-4 bg-slate-100 rounded-full animate-pulse w-3/4"></div>
                              <div className="h-4 bg-slate-100 rounded-full animate-pulse w-1/2"></div>
                            </div>
                          ) : dynamicLocations.length > 0 ? (
                            dynamicLocations.map((loc, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setLocation(loc);
                                  saveRecentLocation(loc);
                                  setIsLocationDropdownOpen(false);
                                }}
                                className="w-full text-left px-0 py-2.5 text-slate-700 hover:text-[#FF4F00] font-medium text-[15px] transition-colors line-clamp-1"
                              >
                                {loc}
                              </button>
                            ))
                          ) : location.length >= 3 ? (
                            <div className="py-4 text-slate-400 text-sm font-medium">
                              No results found for "{location}"
                            </div>
                          ) : (
                            <>
                              {/* Recent Locations Section */}
                              {recentLocations.length > 0 && (
                                <div className="mb-6">
                                  <span className="text-[11px] font-semibold text-slate-400 mb-2 block">
                                    Recent Locations
                                  </span>
                                  {recentLocations.map((loc, i) => (
                                    <button
                                      key={`recent-${i}`}
                                      type="button"
                                      onClick={() => {
                                        setLocation(loc);
                                        setIsLocationDropdownOpen(false);
                                      }}
                                      className="w-full text-left px-0 py-2.5 text-slate-700 hover:text-[#FF4F00] font-medium text-[15px] transition-colors flex items-center gap-3"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                      {loc}
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Trending Areas Section */}
                              <div>
                                <span className="text-[11px] font-semibold text-slate-400 mb-2 block">
                                  Trending Areas
                                </span>
                                {trendingLocations.map((loc, i) => (
                                  <button
                                    key={`trending-${i}`}
                                    type="button"
                                    onClick={() => {
                                      setLocation(loc);
                                      saveRecentLocation(loc);
                                      setIsLocationDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-0 py-2.5 text-slate-700 hover:text-[#FF4F00] font-medium text-[15px] transition-colors"
                                  >
                                    {loc}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Search Input Container */}
            <div className="flex-grow relative">
              <div className="relative z-20 flex w-full items-center bg-white border border-slate-200 rounded-lg h-[46px] hover:border-slate-300 transition-all focus-within:border-orange-500/50 pr-1.5">
                <input
                  type="text"
                  placeholder="Search products, services or suppliers..."
                  className="flex-grow h-full bg-transparent px-4 text-[14px] font-normal text-[#111] leading-normal outline-none placeholder:text-slate-400 font-sans"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!isSearchDropdownOpen) setIsSearchDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setIsSearchDropdownOpen(true);
                    setIsLocationDropdownOpen(false);
                  }}
                />
                <button
                  type="submit"
                  className="bg-[#FF4F00] hover:bg-[#E64600] text-white w-[34px] h-[34px] rounded-md transition-all flex items-center justify-center flex-shrink-0 active:scale-95"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              <AnimatePresence>
                {isSearchDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsSearchDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-full min-w-[320px] bg-white border border-slate-300 rounded-xl shadow-2xl z-20 overflow-y-auto max-h-[450px] scrollbar-hide py-2"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      <div className="px-6 py-4 space-y-6">
                        {/* Trending Searches - Only show if search is empty */}
                        {!searchQuery.trim() && (
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest block mb-3">
                              Trending Searches
                            </span>
                          <div className="flex flex-wrap gap-2">
                            {trendingSearches.map((item, i) => (
                              <button
                                key={`trend-${i}`}
                                type="button"
                                onClick={() => handleSearch(null, item)}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[13px] text-slate-600 hover:border-[#FF4F00] hover:text-[#FF4F00] transition-all"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                        )}

                        {/* Categories / Autocomplete Section */}
                        <div>
                          {!searchQuery.trim() && (
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest block">
                                All Categories
                              </span>
                              <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                                {allCategories.length} Categories
                              </span>
                            </div>
                          )}
                          <div className={searchQuery.trim() ? "flex flex-col" : "grid grid-cols-1 gap-1"}>
                            {isSearching && suggestions.length === 0 ? (
                              <div className="px-4 py-8 text-center flex flex-col items-center">
                                <Search className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
                                <p className="text-[14px] text-slate-500">Searching...</p>
                              </div>
                            ) : searchQuery.trim() && suggestions.length > 0 ? (
                              suggestions.map((itemName, i) => {
                                const matchIndex = itemName.toLowerCase().indexOf(searchQuery.trim().toLowerCase());
                                return (
                                <button
                                  key={`sugg-${i}`}
                                  type="button"
                                  onClick={() => handleSearch(null, itemName, null)}
                                  className="w-full text-left transition-all flex items-center group px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 gap-3"
                                >
                                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                                  {matchIndex !== -1 ? (
                                    <span className="text-[14px] text-slate-700 truncate">
                                      {itemName.substring(0, matchIndex)}
                                      <span className="text-[#1a1a1a] font-semibold">
                                        {itemName.substring(matchIndex, matchIndex + searchQuery.trim().length)}
                                      </span>
                                      {itemName.substring(matchIndex + searchQuery.trim().length)}
                                    </span>
                                  ) : (
                                    <span className="truncate">{itemName}</span>
                                  )}
                                </button>
                                )
                              })
                            ) : !searchQuery.trim() ? (
                              allCategories.slice(0, 10).map((cat, i) => (
                                <button
                                  key={`cat-${i}`}
                                  type="button"
                                  onClick={() => handleSearch(null, cat.name, cat.id)}
                                  className="w-full text-left transition-all flex items-center group px-3 py-2.5 rounded-lg text-slate-700 hover:bg-orange-50 hover:text-[#FF4F00] font-medium text-[14px] gap-3"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#FF4F00] transition-colors shrink-0"></div>
                                  <span className="truncate">{cat?.name || ""}</span>
                                </button>
                              ))
                            ) : (
                                <div className="px-4 py-8 text-center flex flex-col items-center">
                                  <Search className="w-8 h-8 text-slate-300 mb-2" />
                                  <p className="text-[14px] text-slate-600">No results found for "<span className="font-semibold text-slate-800">{searchQuery}</span>"</p>
                                </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href="/sell"
            className="hidden lg:flex items-center gap-2 text-sm font-semibold text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all border border-slate-200"
          >
            <Building2 className="w-4 h-4 text-[#FF4F00]" />
            Become a Supplier
          </Link>

          {!user ? (
            <>
               <button
                onClick={() => setIsBuyerDrawerOpen(true)}
                className="hidden sm:block text-sm font-semibold text-white bg-[#164e33] px-6 py-2.5 rounded-xl hover:bg-[#113a26] transition-all"
              >
                Login
              </button>
            </>
          ) : (
            <div className="relative group">
              <button className="flex items-center gap-2 bg-slate-100 p-1.5 pr-3 rounded-full hover:bg-slate-200 transition-all">
                <div className="w-8 h-8 bg-[#164e33] rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-inner overflow-hidden">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name || "User"} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerText = user.name ? user.name.charAt(0) : "G";
                      }}
                    />
                  ) : (
                    user.name && user.name !== user.phone ? user.name.charAt(0) : "G"
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-700 hidden lg:block">
                  {user.name && user.name !== user.phone ? user.name : "Guest User"}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-hover:rotate-180" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200 z-[1000]">
                <div className="px-4 py-3 border-b border-slate-50">
                  <p className="text-xs text-slate-500 font-semibold">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {user.phone}
                  </p>
                </div>
                
                <div className="py-1">
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#164e33] transition-colors">
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                  <Link href="/notifications" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#164e33] transition-colors">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </Link>
                </div>

                <div className="border-t border-slate-50 pt-1">
                  <button 
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            className="lg:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 overflow-y-auto max-h-[85vh] scrollbar-none"
          >
            <div className="p-4 space-y-4">
              {/* Mobile Search & Location Stack */}
              <form
                onSubmit={handleSearch}
                className="space-y-3"
              >
                {/* Location Selection on Mobile */}
                <div className="relative">
                  <div className="flex items-center h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 focus-within:border-[#FF4F00] focus-within:bg-white transition-all cursor-pointer">
                    <MapPin className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Select Location"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        if (!isLocationDropdownOpen) setIsLocationDropdownOpen(true);
                      }}
                      onFocus={() => {
                        setIsLocationDropdownOpen(true);
                        setIsSearchDropdownOpen(false);
                      }}
                      className="bg-transparent flex-grow h-full text-sm font-normal text-[#111] outline-none placeholder:text-slate-400"
                    />
                    {location && location !== "India" && (
                      <button
                        type="button"
                        onClick={() => setLocation("India")}
                        className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    )}
                  </div>

                  {/* Mobile Location Suggestions dropdown */}
                  <AnimatePresence>
                    {isLocationDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setIsLocationDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-40 overflow-y-auto max-h-[250px] py-1"
                        >
                          <button
                            type="button"
                            disabled={isDetecting}
                            className="w-full flex items-center gap-2.5 px-4 py-3 text-[#FF4F00] hover:bg-orange-50 transition-colors border-b border-slate-100 disabled:opacity-50 text-left font-semibold text-sm"
                            onClick={handleDetectLocation}
                          >
                            <LocateFixed className={`w-4 h-4 ${isDetecting ? "animate-spin" : ""}`} />
                            <span>{isDetecting ? "Detecting..." : "Detect Location"}</span>
                          </button>

                          <div className="px-4 py-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              {isSearchingLocations
                                ? "Searching..."
                                : location.length >= 3
                                  ? "Suggestions"
                                  : "Your Areas"}
                            </span>

                            <div className="space-y-0.5">
                              {isSearchingLocations ? (
                                <div className="py-2 space-y-2">
                                  <div className="h-3 bg-slate-100 rounded-full animate-pulse w-3/4"></div>
                                  <div className="h-3 bg-slate-100 rounded-full animate-pulse w-1/2"></div>
                                </div>
                              ) : dynamicLocations.length > 0 ? (
                                dynamicLocations.map((loc, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                      setLocation(loc);
                                      saveRecentLocation(loc);
                                      setIsLocationDropdownOpen(false);
                                    }}
                                    className="w-full text-left py-2 text-slate-700 hover:text-[#FF4F00] font-medium text-sm transition-colors block truncate"
                                  >
                                    {loc}
                                  </button>
                                ))
                              ) : location.length >= 3 ? (
                                <div className="py-2 text-slate-400 text-xs font-medium">
                                  No results found
                                </div>
                              ) : (
                                <>
                                  {recentLocations.length > 0 && (
                                    <div className="mb-2">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                        Recent
                                      </span>
                                      {recentLocations.map((loc, i) => (
                                        <button
                                          key={`recent-${i}`}
                                          type="button"
                                          onClick={() => {
                                            setLocation(loc);
                                            setIsLocationDropdownOpen(false);
                                          }}
                                          className="w-full text-left py-1.5 text-slate-700 hover:text-[#FF4F00] font-medium text-xs transition-colors flex items-center gap-2 truncate"
                                        >
                                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                          {loc}
                                        </button>
                                      ))}
                                    </div>
                                  )}

                                  <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                      Trending
                                    </span>
                                    {trendingLocations.map((loc, i) => (
                                      <button
                                        key={`trending-${i}`}
                                        type="button"
                                        onClick={() => {
                                          setLocation(loc);
                                          saveRecentLocation(loc);
                                          setIsLocationDropdownOpen(false);
                                        }}
                                        className="w-full text-left py-1.5 text-slate-700 hover:text-[#FF4F00] font-medium text-xs transition-colors block truncate"
                                      >
                                        {loc}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Search Input on Mobile */}
                <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl h-11 px-3 focus-within:border-[#FF4F00] focus-within:bg-white transition-all pr-1">
                  <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search products, services or suppliers..."
                    className="flex-grow h-full bg-transparent text-sm font-normal text-[#111] outline-none placeholder:text-slate-400"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (!isSearchDropdownOpen) setIsSearchDropdownOpen(true);
                    }}
                    onFocus={() => {
                      setIsSearchDropdownOpen(true);
                      setIsLocationDropdownOpen(false);
                    }}
                  />
                  <button
                    type="submit"
                    className="bg-[#FF4F00] hover:bg-[#E64600] text-white px-3 h-9 rounded-lg transition-all text-xs font-semibold shadow-sm active:scale-95"
                  >
                    Go
                  </button>

                  {/* Mobile Search Suggestions Dropdown */}
                  <AnimatePresence>
                    {isSearchDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setIsSearchDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-40 overflow-y-auto max-h-[250px] py-1"
                        >
                          <div className="px-4 py-2 space-y-4">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Trending Searches
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {trendingSearches.map((item, i) => (
                                  <button
                                    key={`trend-${i}`}
                                    type="button"
                                    onClick={() => handleSearch(null, item)}
                                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 hover:border-[#FF4F00] hover:text-[#FF4F00] transition-all"
                                  >
                                    {item}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Categories
                              </span>
                              <div className="space-y-0.5">
                                {allCategories.slice(0, 8).map((cat, i) => (
                                  <button
                                    key={`cat-${i}`}
                                    type="button"
                                    onClick={() => handleSearch(null, cat.name, cat.id)}
                                    className="w-full text-left py-1.5 text-slate-700 hover:text-[#FF4F00] font-medium text-xs transition-colors block truncate"
                                  >
                                    {cat.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </form>

              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-12 h-12 bg-[#164e33] rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-inner overflow-hidden shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name || "User"} className="w-full h-full object-cover" />
                      ) : (
                        user.name ? user.name.charAt(0) : "G"
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{user.name || "Guest User"}</p>
                      <p className="text-xs text-slate-500 truncate">{user.phone}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link 
                      href="/profile" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-5 h-5 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700">Profile</span>
                    </Link>
                    <Link 
                      href="/notifications" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <Bell className="w-5 h-5 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700">Alerts</span>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                      href="/sell"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-slate-700 text-sm hover:bg-slate-100 transition-colors w-full"
                    >
                      <ShoppingBag className="w-5 h-5 text-[#FF4F00] flex-shrink-0" /> Become a Supplier
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-3 p-3.5 bg-red-50 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100/50 transition-colors w-full"
                    >
                      <LogOut className="w-5 h-5 flex-shrink-0" /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    href="/sell"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-slate-700 text-sm hover:bg-slate-100 transition-colors w-full"
                  >
                    <ShoppingBag className="w-5 h-5 text-[#FF4F00] flex-shrink-0" /> Become a Supplier
                  </Link>
                  <button
                    onClick={() => {
                      setIsBuyerDrawerOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-3 p-3.5 bg-[#164e33] hover:bg-[#113a26] text-white rounded-xl font-semibold text-sm transition-colors w-full shadow-md shadow-emerald-100/50"
                  >
                    <User className="w-5 h-5 flex-shrink-0" /> Login
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BuyerLogin 
        isOpen={isBuyerDrawerOpen} 
        onClose={() => setIsBuyerDrawerOpen(false)} 
      />
      
      <VendorLogin 
        isOpen={isVendorDrawerOpen} 
        onClose={() => setIsVendorDrawerOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;

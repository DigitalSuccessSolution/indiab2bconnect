"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";

const HeroSearchBar = ({
  searchQuery,
  setSearchQuery,
  locationQuery,
  setLocationQuery,
  onSearch,
}) => {
  const [categories, setCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const dropdownRef = useRef(null);

  // Debounce the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400); // 400ms delay
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch all categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await apiFetch("/categories");
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCats();
  }, []);

  // Fetch dynamic suggestions (Products, Vendors) on typing
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await apiFetch(`/vendors/search?search=${encodeURIComponent(debouncedQuery.trim())}&limit=5`);
        if (res.success && res.data?.vendors) {
          const results = new Set();
          const query = debouncedQuery.trim().toLowerCase();

          // 1. Add matching categories
          categories.forEach((cat) => {
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

          setSuggestions(Array.from(results).slice(0, 8));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, categories]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (catName) => {
    setSearchQuery(catName);
    setIsDropdownOpen(false);
    // Optionally trigger search immediately or let user click 'Get Matched'
  };

  return (
    <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-1 lg:max-w-2xl shrink-0 relative" ref={dropdownRef}>
      <div className="flex-[1.5] flex items-center px-4 gap-2 bg-white rounded-lg border-b md:border-b-0 border-slate-100 pb-1 md:pb-0 relative">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isDropdownOpen) setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder="Search products or services..."
          className="w-full bg-transparent py-2.5 md:py-3 focus:outline-none text-[13px] font-medium text-slate-800 placeholder:text-slate-500"
        />
        
        {/* Autocomplete Dropdown */}
        {isDropdownOpen && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto flex flex-col">
            {isLoading && suggestions.length === 0 ? (
              <div className="px-4 py-4 text-center text-[13px] text-slate-500 flex items-center justify-center gap-2">
                <Sparkles size={14} className="animate-pulse" /> Searching...
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((itemName, i) => {
                const matchIndex = itemName.toLowerCase().indexOf(searchQuery.trim().toLowerCase());
                return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestionClick(itemName)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center gap-3 transition-colors"
                >
                  <Search size={14} className="text-slate-400 shrink-0" />
                  {matchIndex !== -1 ? (
                    <span className="text-[13px] text-slate-700 font-medium truncate">
                      {itemName.substring(0, matchIndex)}
                      <span className="text-[#1a1a1a] font-bold">
                        {itemName.substring(matchIndex, matchIndex + searchQuery.trim().length)}
                      </span>
                      {itemName.substring(matchIndex + searchQuery.trim().length)}
                    </span>
                  ) : (
                    <span className="text-[13px] text-slate-700 font-medium truncate">{itemName}</span>
                  )}
                </button>
              )
            })
            ) : (
              <div className="px-4 py-4 text-center text-[13px] text-slate-500">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      <div className="hidden md:block w-px h-6 bg-slate-100 self-center"></div>

      <div className="flex-1 flex items-center px-4 gap-2 bg-white rounded-lg">
        <MapPin size={16} className="text-slate-400" />
        <input
          type="text"
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          placeholder="Your City..."
          className="w-full bg-transparent py-2.5 md:py-3 focus:outline-none text-[13px] font-medium text-slate-800 placeholder:text-slate-500"
        />
      </div>

      <button
        onClick={() => onSearch()}
        className="bg-[#E64600] text-white px-6 py-2.5 rounded-lg md:rounded-[7px] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#CC3E00] transition-all cursor-pointer shadow-sm"
      >
        <Sparkles size={16} /> Get Matched
      </button>
    </div>
  );
};

export default HeroSearchBar;

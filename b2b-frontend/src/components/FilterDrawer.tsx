"use client";

import React from "react";
import {
  X,
  RotateCcw,
  ChevronRight,
  Star,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import {
  toggleDrawer,
  setPriceRange,
  setSort,
  toggleRating,
  toggleVerification,
  resetFilters,
} from "@/redux/slices/filterSlice";
import { useRouter } from "next/navigation";

const FilterDrawer: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const {
    isDrawerOpen: isOpen,
    priceRange,
    sort,
    ratings,
    verification,
    query: reduxQuery
  } = useSelector((state: RootState) => state.filter);

  const onClose = () => dispatch(toggleDrawer(false));

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), priceRange.max - 1000);
    dispatch(setPriceRange({ ...priceRange, min: value }));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), priceRange.min + 1000);
    dispatch(setPriceRange({ ...priceRange, max: value }));
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-[450px] bg-white shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Sort By */}
              <div className="mb-8">
                <h3 className="text-[12px] font-semibold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <RotateCcw size={14} className="rotate-90" />
                  Sort By
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {["Popularity", "Price: Low to High", "Price: High to Low", "Newest"].map(
                    (option) => (
                      <button
                        key={option}
                        onClick={() => dispatch(setSort(option))}
                        className={`px-3 py-2 text-[12px] sm:text-[13px] border rounded-xl transition-all text-left leading-tight ${
                          sort === option
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold shadow-sm shadow-emerald-100"
                            : "bg-white border-gray-200 text-slate-700 hover:border-emerald-500"
                        }`}
                      >
                        {option}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="text-[12px] font-semibold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span>₹</span>
                  Price Range
                </h3>
                <div className="space-y-6">
                  <div className="relative h-12 flex items-center px-2">
                    {/* Slider Track */}
                    <div className="absolute h-1.5 w-full bg-gray-100 rounded-full">
                      <div
                        className="absolute h-full bg-emerald-500 rounded-full"
                        style={{
                          left: `${(priceRange.min / 100000) * 100}%`,
                          right: `${100 - (priceRange.max / 100000) * 100}%`,
                        }}
                      />
                    </div>

                    {/* Range Inputs (Native styled thumbs) */}
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="1000"
                      value={priceRange.min}
                      onChange={handleMinChange}
                      className={`absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer pointer-events-none 
                        [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none 
                        [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white 
                        [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-500 
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md
                        [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none 
                        [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white 
                        [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-emerald-500 
                        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md
                        ${priceRange.min > 100000 - 5000 ? 'z-30' : 'z-20'}`}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="1000"
                      value={priceRange.max}
                      onChange={handleMaxChange}
                      className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer pointer-events-none 
                        [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none 
                        [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white 
                        [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-500 
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md
                        [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none 
                        [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white 
                        [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-emerald-500 
                        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md z-20"
                    />
                  </div>

                  <div className="flex justify-between items-center text-[13px] font-semibold text-slate-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">
                        Min Price
                      </span>
                      <span>₹{priceRange.min.toLocaleString()}</span>
                    </div>
                    <div className="h-4 w-[1px] bg-gray-300 mx-2" />
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">
                        Max Price
                      </span>
                      <span>₹{priceRange.max.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Budget", range: { min: 0, max: 5000 } },
                      { label: "Mid Range", range: { min: 5000, max: 20000 } },
                      { label: "Premium", range: { min: 20000, max: 100000 } },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => dispatch(setPriceRange(p.range))}
                        className={`px-4 py-2 text-xs rounded-full transition-all border ${
                          priceRange.min === p.range.min &&
                          priceRange.max === p.range.max
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100"
                            : "bg-white border-gray-200 text-slate-700 hover:border-emerald-500"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ratings */}
              <div className="mb-8">
                <h3 className="text-[12px] font-semibold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  Customer Ratings
                </h3>
                <div className="space-y-2">
                  {[4, 3, 2].map((rating) => (
                    <label
                      key={rating}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={ratings.includes(rating)}
                        onChange={() => dispatch(toggleRating(rating))}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${i < rating ? "text-amber-400" : "text-gray-200"}`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="text-sm text-slate-700 ml-1">
                          & Up
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Verification */}
              <div className="mb-8">
                <h3 className="text-[12px] font-semibold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShieldCheck size={14} />
                  Trust & Verification
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Verified Supplier", color: "text-emerald-600" },
                    { label: "TrustSEAL Verified", color: "text-amber-600" },
                    { label: "GST Registered", color: "text-blue-600" },
                  ].map((v) => (
                    <label
                      key={v.label}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer"
                    >
                      <span className={`text-sm font-medium ${v.color}`}>
                        {v.label}
                      </span>
                      <input
                        type="checkbox"
                        checked={
                          verification[
                            v.label.toLowerCase().includes("verified")
                              ? v.label.toLowerCase().includes("trustseal")
                                ? "trustSeal"
                                : "verified"
                              : ("gst" as keyof typeof verification)
                          ]
                        }
                        onChange={() => {
                          const key = v.label.toLowerCase().includes("verified")
                            ? v.label.toLowerCase().includes("trustseal")
                              ? "trustSeal"
                              : "verified"
                            : "gst";
                          dispatch(toggleVerification(key as any));
                        }}
                        className="w-5 h-5 rounded-full border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3">
              <button
                onClick={() => {
                  const params = new URLSearchParams(window.location.search);
                  
                  // Sync Redux state to URL
                  if (priceRange.min > 0 || priceRange.max < 100000) {
                    params.set("priceRange", `${priceRange.min}-${priceRange.max}`);
                  } else {
                    params.delete("priceRange");
                  }
                  
                  if (sort && sort !== "Popularity") {
                    params.set("sort", sort);
                  } else {
                    params.delete("sort");
                  }

                  if (ratings.length > 0) {
                    params.set("ratings", ratings.join(","));
                  } else {
                    params.delete("ratings");
                  }

                  // Verification
                  if (verification.verified) params.set("verified", "true"); else params.delete("verified");
                  if (verification.trustSeal) params.set("trustSeal", "true"); else params.delete("trustSeal");
                  if (verification.gst) params.set("gst", "true"); else params.delete("gst");

                  // Ensure current search query is preserved
                  if (reduxQuery) params.set("q", reduxQuery);
                  else params.delete("q");

                  router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
                  onClose();
                }}
                className="w-full py-3 bg-[#164e33] hover:bg-[#006972] text-white rounded-xl text-sm font-semibold transition-all shadow-lg active:scale-95"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  dispatch(resetFilters());
                  // Clear URL parameters
                  const params = new URLSearchParams(window.location.search);
                  params.delete("priceRange");
                  params.delete("ratings");
                  params.delete("verified");
                  params.delete("trustSeal");
                  params.delete("gst");
                  params.delete("sort");
                  router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
                  onClose();
                }}
                className="w-full py-3 bg-white border border-gray-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                Reset all filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterDrawer;

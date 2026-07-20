"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  BadgeCheck,
  Building2,
  ChevronDown,
  X,
  Package,
  ArrowRight,
  Users,
  Phone,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Send,
  Loader2,
  Tag,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import VendorLoginModal from "@/components/VendorLoginModal";
import { motion } from "framer-motion";
import { useIdleLead } from "@/hooks/useIdleLead";
import IdleLeadPopup from "@/components/IdleLeadPopup";

const popularCities = [
  "Indore", "Bhopal", "Vadodara", "Bengaluru", "Delhi",
  "Chennai", "Pune", "Ahmedabad", "Coimbatore", "Hyderabad", "Mumbai",
];

/* ─── Enquiry Modal (IndiaMart style) ─── */
function EnquiryModal({ isOpen, onClose, product, vendor, onCallNow }) {
  const { user } = useAuth();
  const [city, setCity] = useState("");
  const [qty, setQty] = useState("");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen || !vendor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await apiFetch("/leads", {
        method: "POST",
        body: JSON.stringify({
          vendorId: vendor.id,
          buyerName: user?.name || "Guest",
          phone: user?.phone || city,
          city: city || vendor.city,
          categoryId: vendor.categories?.[0]?.id,
          searchKeyword: product?.name || vendor.businessName,
          message: msg || `Interested in ${product?.name || vendor.businessName}. Quantity: ${qty}`,
        }),
      });
      setSent(true);
      setTimeout(() => { setSent(false); onClose(); }, 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const avgRating = vendor.reviews?.length
    ? (vendor.reviews.reduce((s, r) => s + r.rating, 0) / vendor.reviews.length).toFixed(1)
    : "4.5";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh" }}
      >
        {/* Left: Product + Supplier Info */}
        <div className="md:w-[280px] shrink-0 bg-gray-50 border-r border-gray-100 flex flex-col overflow-y-auto">
          {/* Product Image */}
          {product && (
            <div className="w-full h-44 bg-white border-b border-gray-100 flex items-center justify-center overflow-hidden">
              {product.images?.[0] || product.imageUrl ? (
                <img
                  src={product.images?.[0] || product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-12 h-12 text-gray-200" />
              )}
            </div>
          )}

          <div className="p-5 space-y-4">
            {/* Product Info */}
            {product && (
              <div>
                <h3 className="font-semibold text-slate-900 text-base leading-tight mb-1">{product.name}</h3>
                {product.price > 0 && (
                  <p className="text-lg font-semibold text-[#1b5e20]">
                    ₹ {product.price.toLocaleString()}
                    <span className="text-base font-medium text-slate-700">/{product.moq > 1 ? `${product.moq} units` : "Piece"}</span>
                  </p>
                )}
              </div>
            )}

            {/* Supplier Info */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-[#164e33]" />
                <Link href={`/supplier/${vendor.id}`} className="text-base font-semibold text-[#164e33] hover:underline leading-tight" onClick={onClose}>
                  {vendor.businessName}
                </Link>
              </div>
              {vendor.phone && vendor.phone !== "**********" && (
                <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Phone className="w-3.5 h-3.5 text-[#164e33]" />
                  {vendor.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-base text-slate-700">
                <MapPin className="w-3.5 h-3.5" />
                {vendor.city}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {vendor.verified && (
                  <span className="flex items-center gap-1 text-base font-semibold text-[#1b5e20] bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                    <BadgeCheck className="w-3 h-3" /> GST
                  </span>
                )}
                <span className="flex items-center gap-1 text-base font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 fill-amber-400" /> TrustSEAL
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#1b5e20] text-white rounded px-2 py-0.5 text-base font-semibold">
                  {avgRating} <Star className="w-3 h-3 fill-white ml-0.5" />
                </div>
                <span className="text-base text-slate-500">({vendor.reviews?.length || 0})</span>
              </div>
              {/* Call Now Button */}
              <button
                onClick={() => onCallNow(vendor)}
                className="w-full py-2.5 bg-[#e65100] hover:bg-[#c74600] text-white rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-colors mt-2"
              >
                <Phone className="w-4 h-4" /> Call Now
              </button>
            </div>
          </div>
        </div>

        {/* Right: Enquiry Form */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-slate-900">Provide details to talk to the supplier</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          {sent ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#1b5e20]" />
              </div>
              <p className="text-lg font-semibold text-slate-900">Enquiry Sent!</p>
              <p className="text-base text-slate-700 text-center">The supplier will contact you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4">
              <div>
                <label className="text-base font-semibold text-slate-800 uppercase tracking-wide mb-1.5 block">
                  City or Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City or Pincode*"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base font-medium text-slate-900 outline-none focus:border-[#164e33] focus:ring-2 focus:ring-[#164e33]/10 transition-all"
                />
                <div className="flex items-center justify-between mt-1.5 text-base">
                  <span className="text-slate-500">
                    Suggestions:{" "}
                    {popularCities.slice(0, 3).map((c, i) => (
                      <button key={c} type="button" onClick={() => setCity(c)} className="text-[#164e33] hover:underline font-semibold mr-1">
                        {c}
                      </button>
                    ))}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(async (pos) => {
                          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10`);
                          const data = await res.json();
                          setCity(data.address.city || data.address.town || "");
                        });
                      }
                    }}
                    className="text-[#164e33] hover:underline font-semibold"
                  >
                    Detect My City
                  </button>
                </div>
              </div>

              <div>
                <label className="text-base font-semibold text-slate-800 uppercase tracking-wide mb-1.5 block">Quantity Required</label>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="e.g. 100 pieces"
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base font-medium text-slate-900 outline-none focus:border-[#164e33] focus:ring-2 focus:ring-[#164e33]/10 transition-all"
                />
              </div>

              <div>
                <label className="text-base font-semibold text-slate-800 uppercase tracking-wide mb-1.5 block">Your Message (Optional)</label>
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  rows={3}
                  placeholder="Describe your requirements..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base font-medium text-slate-900 outline-none focus:border-[#164e33] focus:ring-2 focus:ring-[#164e33]/10 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending || !city}
                className="w-full py-3.5 bg-[#164e33] hover:bg-[#113f29] disabled:opacity-60 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? "Sending..." : "Submit"}
              </button>

              <p className="text-center text-base text-slate-500">
                By submitting, you agree to our Terms & Privacy Policy.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Supplier Card (big, IndiaMart inspired) ─── */
function SupplierCard({ vendor, onEnquire, onCallNow }) {
  const approvedProducts = vendor.products?.filter((p) => p.status === "APPROVED") || [];
  const avgRating = vendor.reviews?.length
    ? (vendor.reviews.reduce((s, r) => s + r.rating, 0) / vendor.reviews.length).toFixed(1)
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-[#164e33]/20 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Supplier Header */}
      <div className="flex items-start gap-4 p-5 border-b border-gray-50">
        {/* Logo */}
        <div className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
          {vendor.logoUrl ? (
            <img src={vendor.logoUrl} alt={vendor.businessName} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-6 h-6 text-gray-300" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Link
              href={`/supplier/${vendor.id}`}
              className="font-semibold text-slate-900 text-base hover:text-[#164e33] transition-colors leading-snug"
            >
              {vendor.businessName}
            </Link>
            {vendor.verified && <BadgeCheck className="w-4 h-4 text-[#164e33] shrink-0" />}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-base text-slate-700">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {vendor.city || "India"}
            </span>
            {avgRating && (
              <span className="flex items-center gap-1">
                <div className="flex items-center bg-[#1b5e20] text-white rounded px-1.5 py-0.5 text-base font-semibold">
                  {avgRating} <Star className="w-2.5 h-2.5 ml-0.5 fill-white" />
                </div>
                <span>({vendor.reviews.length})</span>
              </span>
            )}
            {vendor.categories?.slice(0, 2).map((cat) => (
              <span key={cat.id} className="px-2 py-0.5 bg-[#164e33]/8 text-[#164e33] rounded-full text-base font-semibold">
                {cat.name}
              </span>
            ))}
          </div>
          {vendor.description && (
            <p className="text-slate-500 text-base mt-1.5 line-clamp-1">{vendor.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={() => onEnquire(null, vendor)}
            className="px-4 py-2 bg-white border-2 border-[#164e33] text-[#164e33] hover:bg-[#164e33] hover:text-white rounded-xl text-base font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" /> Contact Supplier
          </button>
          <button
            onClick={() => onCallNow(vendor)}
            className="px-4 py-2 bg-[#e65100] hover:bg-[#c74600] text-white rounded-xl text-base font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5" /> Call Now
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {approvedProducts.length > 0 && (
        <div className="p-4">
          <p className="text-base font-semibold text-slate-500 uppercase  mb-3">Products & Services</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {approvedProducts.slice(0, 5).map((product) => (
              <div
                key={product.id}
                onClick={() => onEnquire(product, vendor)}
                className="group cursor-pointer border border-gray-100 rounded-xl overflow-hidden hover:border-[#164e33]/30 hover:shadow-md transition-all"
              >
                {/* Product Image */}
                <div className="w-full h-24 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {product.images?.[0] || product.imageUrl ? (
                    <img
                      src={product.images?.[0] || product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-gray-200" />
                  )}
                </div>
                <div className="p-2">
                  <p className="text-base font-semibold text-slate-900 line-clamp-2 leading-tight group-hover:text-[#164e33] transition-colors">
                    {product.name}
                  </p>
                  {product.price > 0 && (
                    <p className="text-base font-semibold text-[#1b5e20] mt-0.5">₹{product.price.toLocaleString()}</p>
                  )}
                </div>
              </div>
            ))}
            {/* View More */}
            {approvedProducts.length > 5 && (
              <Link
                href={`/supplier/${vendor.id}`}
                className="border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center h-full min-h-[120px] hover:border-[#164e33] hover:bg-[#164e33]/5 transition-all group"
              >
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#164e33] mb-1" />
                <span className="text-base font-semibold text-slate-500 group-hover:text-[#164e33] text-center">
                  +{approvedProducts.length - 5} more
                </span>
              </Link>
            )}
          </div>
        </div>
      )}

      {approvedProducts.length === 0 && (
        <div className="p-4 flex items-center justify-between">
          <p className="text-base text-slate-500 italic">No products listed yet.</p>
          <Link
            href={`/supplier/${vendor.id}`}
            className="text-base font-semibold text-[#164e33] hover:underline flex items-center gap-1"
          >
            View Profile <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function SuppliersPage() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalVendors, setTotalVendors] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  
  // Track Idle Lead
  const { showIdlePopup, setShowIdlePopup, submitIdlePopup } = useIdleLead({
    buyerName: user?.name,
    phone: user?.phone,
    city: selectedCity,
    categoryId: selectedCategory,
    searchKeyword: searchQuery,
  });

  // Enquiry modal
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryProduct, setEnquiryProduct] = useState(null);
  const [enquiryVendor, setEnquiryVendor] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingCall, setPendingCall] = useState(null);

  // Call Now modal
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callTargetVendor, setCallTargetVendor] = useState(null);
  const [callPhone, setCallPhone] = useState("");
  const [callSending, setCallSending] = useState(false);
  const [callSent, setCallSent] = useState(false);

  useEffect(() => {
    if (user?.phone) setCallPhone(user.phone);
  }, [user]);

  const handleCallSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setLoginModalOpen(true);
      return;
    }
    setCallSending(true);
    try {
      await apiFetch("/leads/direct", {
        method: "POST",
        body: JSON.stringify({
          vendorId: callTargetVendor.id,
          actionType: "CALL",
          buyerName: user.name,
          phone: callPhone,
          city: user.city || callTargetVendor.city || "India",
          categoryId: callTargetVendor.categories?.[0]?.id,
          message: `CALL REQUEST (Suppliers Page): User wants to call ${callTargetVendor.businessName}. Preferred Phone: ${callPhone}`,
        }),
      });
      setCallSent(true);

      setTimeout(() => {
        setCallSent(false);
        setCallModalOpen(false);
        const phone = callTargetVendor.phone?.replace(/[^0-9]/g, "");
        if (phone && phone !== "**********") {
          window.location.href = `tel:${phone}`;
        }
      }, 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setCallSending(false);
    }
  };

  const fetchVendors = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCity) params.append("city", selectedCity);
      if (selectedCategory) params.append("categoryId", selectedCategory);
      if (verifiedOnly) params.append("verified", "true");
      params.append("page", page);
      params.append("limit", "100");

      const data = await apiFetch(`/vendor?${params.toString()}`);
      setVendors(data.data?.vendors || []);
      setTotalVendors(data.data?.total || 0);
      setTotalPages(data.data?.totalPages || 1);
      setCurrentPage(data.data?.page || 1);
    } catch (err) {
      console.error("Failed to fetch vendors:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCity, selectedCategory, verifiedOnly]);

  useEffect(() => {
    apiFetch("/vendor/categories").then((data) => {
      setCategories(data.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchVendors(1);
  }, [fetchVendors]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVendors(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setSelectedCategory("");
    setVerifiedOnly(false);
  };

  const openEnquiry = (product, vendor) => {
    if (!user) {
      setEnquiryVendor(vendor);
      setEnquiryProduct(product);
      setLoginModalOpen(true);
      return;
    }
    setEnquiryProduct(product);
    setEnquiryVendor(vendor);
    setEnquiryOpen(true);
  };

  const handleCallNow = (vendor) => {
    if (!user) {
      setPendingCall(vendor);
      setLoginModalOpen(true);
      return;
    }
    setCallTargetVendor(vendor);
    setCallModalOpen(true);
  };

  const hasActiveFilters = searchQuery || selectedCity || selectedCategory || verifiedOnly;

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        product={enquiryProduct}
        vendor={enquiryVendor}
        onCallNow={(v) => { setEnquiryOpen(false); handleCallNow(v); }}
      />

      {/* Login Modal (for unauthenticated) */}
      <VendorLoginModal
        isOpen={loginModalOpen}
        onClose={() => { setLoginModalOpen(false); setPendingCall(null); }}
        vendor={enquiryVendor ? { id: enquiryVendor.id, businessName: enquiryVendor.businessName, city: enquiryVendor.city, verified: enquiryVendor.verified } : null}
        onSuccess={() => {
          setLoginModalOpen(false);
          if (pendingCall) {
            handleCallNow(pendingCall);
            setPendingCall(null);
          } else if (enquiryVendor) {
            setEnquiryOpen(true);
          }
        }}
      />

      {/* ── Call Now Modal (Consistent with other pages) ── */}
      {callModalOpen && callTargetVendor && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setCallModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row"
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Supplier Info */}
            <div className="md:w-[260px] shrink-0 bg-gray-50 border-r border-gray-100 flex flex-col overflow-y-auto">
              <div className="w-full h-44 bg-white border-b border-gray-100 flex items-center justify-center overflow-hidden relative">
                {callTargetVendor.logoUrl ? (
                  <img
                    src={callTargetVendor.logoUrl}
                    alt={callTargetVendor.businessName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-12 h-12 text-gray-200" />
                )}
                <div className="absolute top-2 left-2">
                  <span className="bg-[#1b5e20] text-white text-base font-semibold px-2 py-0.5 rounded">
                    Calling Supplier
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 text-base leading-tight mb-1">{callTargetVendor.businessName}</h3>
                </div>
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-base text-slate-700">
                    <MapPin className="w-3.5 h-3.5" /> {callTargetVendor.city}
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {callTargetVendor.verified && (
                      <span className="flex items-center gap-1 text-base font-semibold text-[#1b5e20] bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                        <BadgeCheck className="w-3 h-3" /> GST
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-base font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 fill-amber-400" /> TrustSEAL
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Call Form */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-slate-900">Confirm your number to call</h2>
                <button onClick={() => setCallModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5 text-slate-700" />
                </button>
              </div>

              {callSent ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 bg-white">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center border-2 border-green-500/20"
                  >
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <p className="text-xl font-semibold text-slate-900">Enquiry Sent Successfully!</p>
                    <p className="text-base text-slate-700 mt-2">Connecting you to the supplier now...</p>
                  </motion.div>
                </div>
              ) : (
                <form onSubmit={handleCallSubmit} className="flex-1 p-6 flex flex-col justify-center space-y-6">
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-slate-800 uppercase tracking-wide block">
                      Your Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-gray-200 pr-3">
                        <img src="https://flagcdn.com/w20/in.png" alt="India" className="w-5 h-auto rounded-lg" />
                        <span className="text-base font-semibold text-slate-700">+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={callPhone}
                        onChange={(e) => setCallPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                        placeholder="10 digit mobile number"
                        className="w-full border border-gray-300 rounded-xl pl-24 pr-4 py-4 text-lg font-semibold text-slate-900 outline-none focus:border-[#164e33] focus:ring-4 focus:ring-[#164e33]/10 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={callSending || callPhone.length !== 10}
                    className="w-full py-4 bg-[#e65100] hover:bg-[#c74600] disabled:opacity-60 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                  >
                    {callSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Phone className="w-5 h-5 fill-white" />}
                    {callSending ? "Processing..." : "Call Now"}
                  </button>
                  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-base text-slate-700 leading-relaxed text-center">
                      Our platform connects you with verified suppliers instantly.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div
        style={{ background: "linear-gradient(135deg, #113f29 0%, #164e33 50%, #0d3a26 100%)" }}
        className="relative py-14 px-4 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-base font-semibold px-4 py-1.5 rounded-full mb-5 backdrop-blur-sm">
            <Users className="w-3.5 h-3.5" />
            Verified B2B Suppliers Network
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold text-white mb-4 leading-tight">
            Find Trusted <span className="text-[#4ecdc4]">Suppliers</span>
          </h1>
          <p className="text-white/70 text-base md:text-lg mb-10 max-w-2xl mx-auto">
            Connect with thousands of verified B2B vendors across India. Browse their products and get quotes instantly.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search suppliers, products, services..."
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-slate-900 font-medium text-base outline-none shadow-lg placeholder:text-slate-500 focus:ring-2 focus:ring-[#4ecdc4]"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#e43737] pointer-events-none z-10" />
              <input
                type="text"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                onFocus={() => setIsCityDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsCityDropdownOpen(false), 200)}
                placeholder="City"
                className="w-full sm:w-44 pl-11 pr-4 py-4 rounded-xl bg-white text-slate-900 font-medium text-base outline-none shadow-lg placeholder:text-slate-500 focus:ring-2 focus:ring-[#4ecdc4]"
              />
              {isCityDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-2xl py-1 z-50 max-h-48 overflow-y-auto">
                  {popularCities
                    .filter((c) => c.toLowerCase().includes(selectedCity.toLowerCase()))
                    .map((city) => (
                      <button
                        key={city}
                        type="button"
                        onMouseDown={() => setSelectedCity(city)}
                        className="w-full text-left px-4 py-2 text-base text-slate-800 hover:bg-[#164e33]/10 hover:text-[#164e33] flex items-center gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 opacity-40" />
                        {city}
                      </button>
                    ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-[#4ecdc4] hover:bg-[#3ab5ad] text-[#113f29] font-semibold rounded-xl transition-all shadow-lg active:scale-95"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-base font-medium text-slate-800 outline-none appearance-none cursor-pointer hover:border-[#164e33] transition-colors"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:border-[#164e33] transition-colors">
            <div className={`w-9 h-5 rounded-full relative transition-colors ${verifiedOnly ? "bg-[#164e33]" : "bg-gray-300"}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${verifiedOnly ? "left-4" : "left-0.5"}`} />
            </div>
            <BadgeCheck className={`w-4 h-4 ${verifiedOnly ? "text-[#164e33]" : "text-slate-500"}`} />
            <span className="text-base font-semibold text-slate-800">Verified Only</span>
            <input type="checkbox" className="sr-only" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
          </label>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-red-50 text-red-500 text-base font-semibold hover:bg-red-100 transition-colors"
            >
              <X className="w-4 h-4" /> Clear
            </button>
          )}

          <div className="ml-auto text-base font-semibold text-slate-700">
            {loading ? "Loading..." : `${totalVendors} supplier${totalVendors !== 1 ? "s" : ""} found`}
          </div>
        </div>

        {/* Vendor List */}
        {loading ? (
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="h-24 bg-gray-100 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-9 h-9 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Suppliers Found</h3>
            <p className="text-slate-700 text-base mb-6">Try adjusting your search or filter criteria.</p>
            <button onClick={clearFilters} className="px-6 py-2.5 bg-[#164e33] text-white rounded-lg font-semibold text-base hover:bg-[#113f29] transition-colors">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {vendors.map((vendor) => (
              <SupplierCard
                key={vendor.id}
                vendor={vendor}
                onEnquire={openEnquiry}
                onCallNow={handleCallNow}
              />
            ))}
          </div>
        )}


      </div>
      <IdleLeadPopup 
        isOpen={showIdlePopup} 
        onClose={() => setShowIdlePopup(false)} 
        onSubmit={submitIdlePopup}
        searchKeyword={searchQuery}
      />
    </div>
  );
}


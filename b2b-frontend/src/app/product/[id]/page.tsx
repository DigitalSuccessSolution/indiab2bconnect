"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import VendorLoginModal from "@/components/VendorLoginModal";
import CallNowModal from "@/components/CallNowModal";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  ShieldCheck,
  Box,
  Layers,
  Star,
  Package,
  Tag,
  Phone,
  Mail,
  MessageCircle,
  Send,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  UserCircle,
  X,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

const DetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 pt-28 animate-pulse">
    {/* Breadcrumbs Skeleton */}
    <div className="flex items-center gap-2 mb-6">
      <div className="h-4 bg-gray-200 rounded w-24" />
      <div className="h-4 bg-gray-200 rounded w-4" />
      <div className="h-4 bg-gray-200 rounded w-32" />
      <div className="h-4 bg-gray-200 rounded w-4" />
      <div className="h-4 bg-gray-200 rounded w-40" />
    </div>

    <div className="flex flex-col lg:flex-row gap-10">
      {/* Left Column Skeleton */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* Thumbnails */}
          <div className="hidden md:flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-20 bg-gray-200 rounded-xl" />
            ))}
          </div>
          {/* Main Image */}
          <div className="flex-1 w-full aspect-[4/3] md:h-[400px] bg-gray-200 rounded-xl" />
        </div>

        {/* Title and Meta Skeleton */}
        <div className="bg-white p-6 space-y-4 rounded-xl border-b border-slate-100 ">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="flex gap-4">
            <div className="h-6 bg-gray-200 rounded w-32" />
            <div className="h-6 bg-gray-200 rounded w-20" />
          </div>
          <div className="py-6 border-y border-slate-100 flex gap-10">
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-16" />
              <div className="h-6 bg-gray-200 rounded w-24" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-16" />
              <div className="h-6 bg-gray-200 rounded w-24" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-16" />
              <div className="h-6 bg-gray-200 rounded w-24" />
            </div>
          </div>
          <div className="space-y-4 pt-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>

      {/* Sidebar Skeleton */}
      <aside className="lg:w-[380px] space-y-6">
        <div className="bg-white p-6 rounded-xl border-b border-slate-100  space-y-4">
          <div className="flex gap-4 items-center">
            <div className="w-14 h-14 bg-gray-200 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div className="py-4 border-y border-slate-100 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-16" />
              <div className="h-5 bg-gray-200 rounded w-20" />
            </div>
            <div className="space-y-2 text-right">
              <div className="h-3 bg-gray-200 rounded w-16 ml-auto" />
              <div className="h-5 bg-gray-200 rounded w-20 ml-auto" />
            </div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-full" />
        </div>
        <div className="bg-white p-6 rounded-xl border-b border-slate-100  space-y-4">
          <div className="h-14 bg-gray-200 rounded-xl w-full" />
          <div className="h-14 bg-gray-200 rounded-xl w-full" />
        </div>
      </aside>
    </div>
  </div>
);

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Review state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSending, setReviewSending] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Zoom States
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  // Enquiry modal
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryCity, setEnquiryCity] = useState("");
  const [enquiryQty, setEnquiryQty] = useState("");
  const [enquiryMsg, setEnquiryMsg] = useState("");
  const [enquirySending, setEnquirySending] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);

  // Call Now modal
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callPhone, setCallPhone] = useState("");
  const [callSending, setCallSending] = useState(false);
  const [callSent, setCallSent] = useState(false);

  // Modal Login States
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    if (user?.phone) setCallPhone(user.phone);
  }, [user]);

  // Auto-open login modal if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLoginModalOpen(true);
    }
  }, [authLoading, user]);

  const handleCallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setPendingAction("CALL");
      setLoginModalOpen(true);
      return;
    }
    setCallSending(true);
    try {
      await apiFetch("/leads/direct", {
        method: "POST",
        body: JSON.stringify({
          vendorId: product.vendor.id,
          actionType: "CALL",
          buyerName: user.name,
          phone: callPhone,
          city: user.city || product.vendor.city || "India",
          categoryId: product.vendor.categories?.[0]?.id,
          message: `CALL REQUEST: User wants to call ${product.vendor.businessName} regarding ${product.name}. Preferred Phone: ${callPhone}`,
        }),
      });
      setCallSent(true);

      setTimeout(() => {
        setCallSent(false);
        setCallModalOpen(false);
        const phone = product.vendor.phone?.replace(/[^0-9]/g, "");
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

  const popularCitySuggestions = [
    "Indore",
    "Bhopal",
    "Delhi",
    "Bengaluru",
    "Mumbai",
  ];

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setPendingAction("inquiry");
      setLoginModalOpen(true);
      return;
    }
    setEnquirySending(true);
    try {
      await apiFetch("/leads", {
        method: "POST",
        body: JSON.stringify({
          vendorId: product.vendor.id,
          buyerName: user.name,
          phone: user.phone || enquiryCity,
          city: enquiryCity || product.vendor.city,
          categoryId: product.vendor.categories?.[0]?.id,
          searchKeyword: product.name,
          message:
            enquiryMsg || `Enquiry for ${product.name}. Qty: ${enquiryQty}`,
        }),
      });
      setEnquirySent(true);
      setTimeout(() => {
        setEnquirySent(false);
        setEnquiryOpen(false);
      }, 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setEnquirySending(false);
    }
  };

  const handleZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  useEffect(() => {
    // Extract the actual UUID from the URL parameter (last 36 chars)
    // UUID format is 36 chars: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const actualId = typeof id === 'string' && id.length > 36 ? id.slice(-36) : id;

    const fetch = async () => {
      try {
        const res = await apiFetch(`/vendors/products/${actualId}`);
        setProduct(res.data);
        setReviews(res.data?.reviews || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setPendingAction("inquiry");
      setLoginModalOpen(true);
      return;
    }
    setSending(true);
    try {
      await apiFetch("/leads", {
        method: "POST",
        body: JSON.stringify({
          vendorId: product.vendor.id,
          buyerName: user.name,
          phone: user.phone || "Logged-in User",
          city: product.vendor.city,
          categoryId: product.vendor.categories?.[0]?.id,
          searchKeyword: product.name,
          message,
        }),
      });
      setSent(true);
      setMessage("");
      setTimeout(() => setSent(false), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleDirectAction = (type: "CALL" | "WHATSAPP") => {
    if (!user) {
      setPendingAction(type);
      setLoginModalOpen(true);
      return;
    }
    apiFetch("/leads/direct", {
      method: "POST",
      body: JSON.stringify({ vendorId: product.vendor.id, actionType: type }),
    }).catch(() => { });
    const phone = product.vendor.phone?.replace(/[^0-9]/g, "");
    if (type === "CALL") window.location.href = `tel:${phone}`;
    else window.open(`https://wa.me/${phone}`, "_blank");
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setPendingAction("review");
      setLoginModalOpen(true);
      return;
    }
    if (!reviewRating) {
      setReviewError("Please select a star rating.");
      return;
    }
    setReviewError("");
    setReviewSending(true);
    try {
      const res = await apiFetch("/vendors/feedback", {
        method: "POST",
        body: JSON.stringify({
          vendorId: product.vendor.id,
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      setReviews((prev) => [
        {
          id: res.data?.id || Date.now().toString(),
          rating: reviewRating,
          comment: reviewComment,
          user: { name: user.name },
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setReviewSent(true);
      setReviewRating(0);
      setReviewComment("");
      setTimeout(() => setReviewSent(false), 4000);
    } catch (e: any) {
      setReviewError(e?.message || "Failed to submit review.");
    } finally {
      setReviewSending(false);
    }
  };

  if (loading) return <DetailSkeleton />;

  if (!product)
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-4 pt-24">
        <h2 className="text-2xl font-semibold text-gray-800">
          Product not found
        </h2>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#164e33] font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );

  const vendor = product.vendor;
  const avgRating = reviews.length
    ? (
      reviews.reduce((a: number, r: any) => a + r.rating, 0) / reviews.length
    ).toFixed(1)
    : undefined;

  // Retry pending action after login
  const handleModalSuccess = () => {
    if (pendingAction === "CALL") {
      setCallModalOpen(true);
    } else if (pendingAction === "WHATSAPP") {
      setTimeout(() => handleDirectAction("WHATSAPP"), 300);
    }
    setPendingAction(null);
  };

  const vendorForModal = vendor
    ? {
      id: vendor.id,
      businessName: vendor.businessName,
      city: vendor.city,
      verified: vendor.verified,
      category: vendor.categories?.[0]
        ? { name: vendor.categories[0].name }
        : undefined,
    }
    : null;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ── IndiaMart-style Enquiry Modal ── */}
      {enquiryOpen && product && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setEnquiryOpen(false)}
        >
          <div
            className="bg-white rounded-xl  w-full max-w-2xl overflow-hidden flex flex-col md:flex-row"
            style={{ maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Product + Supplier */}
            <div className="md:w-[260px] shrink-0 bg-gray-50 border-r border-slate-100 flex flex-col overflow-y-auto">
              <div className="w-full h-44 bg-white border-b border-slate-100 flex items-center justify-center overflow-hidden">
                {(product.images && product.images.length > 0) ||
                  product.imageUrl ? (
                  <img
                    src={
                      product.images && product.images.length > 0
                        ? product.images[activeImageIndex]
                        : product.imageUrl
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-12 h-12 text-gray-200" />
                )}
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1">
                    {product.name}
                  </h3>
                  {product.price > 0 && (
                    <p className="text-lg font-semibold text-[#E64600]">
                      ₹ {product.price.toLocaleString()}
                      <span className="text-xs font-medium text-gray-500">
                        /{product.moq > 1 ? `${product.moq} units` : "Piece"}
                      </span>
                    </p>
                  )}
                </div>
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-[#0076a8]" />
                    <span className="text-sm font-medium text-[#0076a8]">
                      {vendor.businessName}
                    </span>
                  </div>
                  {vendor.phone && vendor.phone !== "**********" && (
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <Phone className="w-3.5 h-3.5 text-[#164e33]" />{" "}
                      {vendor.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5" /> {vendor.city}
                  </div>
                  <div className="flex flex-wrap gap-1.5 uppercase">
                    <span className="flex items-center gap-1 text-[10px] font-medium text-[#E64600] bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> GST
                    </span>
                    {vendor.trustBadge && vendor.trustBadge !== 'NONE' && (
                      <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded ${
                        vendor.trustBadge === 'GOLD_SUPPLIER' 
                          ? 'text-yellow-700 bg-yellow-50 border border-yellow-200' 
                          : vendor.trustBadge === 'TRUST_SEAL' 
                            ? 'text-blue-700 bg-blue-50 border border-blue-200' 
                            : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                      }`}>
                        <CheckCircle2 className={`w-3 h-3 ${vendor.trustBadge === 'GOLD_SUPPLIER' ? 'text-yellow-500' : vendor.trustBadge === 'TRUST_SEAL' ? 'text-blue-500' : 'text-emerald-500'}`} />{" "}
                        {vendor.trustBadge.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-[#E64600] text-white rounded px-2 py-0.5 text-xs font-medium">
                      {avgRating || "4.5"}{" "}
                      <Star className="w-3 h-3 fill-white ml-0.5" />
                    </div>
                    <span className="text-xs text-gray-400">
                      ({reviews.length})
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setEnquiryOpen(false);
                      setCallModalOpen(true);
                    }}
                    className="w-full py-2.5 bg-[#e65100] hover:bg-[#c74600] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors mt-2"
                  >
                    <Phone className="w-4 h-4" /> Call Now
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Enquiry Form */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-medium text-gray-900">
                  Provide details to talk to the supplier
                </h2>
                <button
                  onClick={() => setEnquiryOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {enquirySent ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-[#E64600]" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    Enquiry Sent!
                  </p>
                  <p className="text-sm text-gray-500 text-center">
                    The supplier will contact you shortly.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleEnquirySubmit}
                  className="flex-1 p-6 space-y-4"
                >
                  <div>
                    <label className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5 block">
                      City or Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={enquiryCity}
                      onChange={(e) => setEnquiryCity(e.target.value)}
                      placeholder="City or Pincode*"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-[#164e33] focus:ring-2 focus:ring-[#164e33]/10 transition-all"
                    />
                    <div className="flex items-center justify-between mt-1.5 text-xs">
                      <span className="text-gray-400">
                        Suggestions:{" "}
                        {popularCitySuggestions.slice(0, 3).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setEnquiryCity(c)}
                            className="text-[#0076a8] hover:underline font-semibold mr-1"
                          >
                            {c}
                          </button>
                        ))}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              async (pos) => {
                                const res = await fetch(
                                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10`,
                                );
                                const data = await res.json();
                                setEnquiryCity(
                                  data.address.city || data.address.town || "",
                                );
                              },
                            );
                          }
                        }}
                        className="text-[#0076a8] hover:underline font-semibold"
                      >
                        Detect My City
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1.5 block">
                      Quantity Required
                    </label>
                    <input
                      type="number"
                      value={enquiryQty}
                      onChange={(e) => setEnquiryQty(e.target.value)}
                      placeholder="e.g. 100 pieces"
                      min="1"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-[#164e33] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 tracking-wide mb-1.5 block">
                      Your Message (Optional)
                    </label>
                    <textarea
                      value={enquiryMsg}
                      onChange={(e) => setEnquiryMsg(e.target.value)}
                      rows={3}
                      placeholder="Describe your requirements..."
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-[#164e33] transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={enquirySending || !enquiryCity}
                    className="w-full py-3.5 bg-[#164e33] hover:bg-[#113f29] disabled:opacity-60 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors "
                  >
                    {enquirySending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {enquirySending ? "Sending..." : "Submit"}
                  </button>
                  <p className="text-center text-xs text-gray-400">
                    By submitting, you agree to our Terms & Privacy Policy.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}


      <CallNowModal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        product={product}
        vendor={vendor}
        avgRating={avgRating}
        callPhone={callPhone}
        setCallPhone={setCallPhone}
        callSending={callSending}
        callSent={callSent}
        onSubmit={handleCallSubmit}
      />


      <VendorLoginModal
        isOpen={loginModalOpen}
        onClose={() => {
          setLoginModalOpen(false);
          if (!user) router.back(); // can't stay without login
        }}
        vendor={vendorForModal}
        onSuccess={handleModalSuccess}
      />
      <main className="max-w-7xl mx-auto px-4 md:px-10 py-6 pt-28">
        {/* Breadcrumb row */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <button
            onClick={() => router.back()}
            className="hover:text-[#164e33] transition-colors flex items-center gap-1 font-medium text-gray-500"
          >
            <ArrowLeft className="w-4 h-4" /> Search Results
          </button>
          <ChevronRight className="w-4 h-4" />
          <Link
            href={`/supplier/${vendor.businessName ? `${vendor.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${vendor.id}` : vendor.id}`}
            className="hover:text-[#E64600] transition-colors font-medium text-gray-500 text-[11px]"
          >
            {vendor.businessName}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-400 font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left: Image + Details */}
          <div className="flex-1 space-y-6 order-2 lg:order-1">
            {/* Image Gallery */}
            <div className="flex flex-col md:flex-row gap-5 items-start">
              {/* Thumbnails - Vertical on Desktop, Horizontal on Mobile */}
              {product.images && product.images.length > 1 && (
                <div className="flex md:flex-col gap-4 order-2 md:order-1 overflow-x-auto md:overflow-y-auto md:max-h-[500px] no-scrollbar p-2 w-full md:w-auto">
                  {product.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 md:w-20 md:h-20 shrink-0 overflow-hidden border-[3px] rounded-xl transition-all duration-300 ${activeImageIndex === idx ? "border-[#E64600]  scale-110" : "border-white hover:border-[#E64600]/30 opacity-80 hover:opacity-100"}`}
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image Display - Taller Vertical Aspect */}
              <div className="flex-1 w-full bg-white order-1 md:order-2 relative group border-b border-slate-100 rounded-xl">
                {(product.images && product.images.length > 0) ||
                  product.imageUrl ||
                  product.image ? (
                  <div
                    className="relative w-full h-[280px] md:h-[400px] bg-gray-50 flex items-center justify-center overflow-hidden cursor-crosshair rounded-xl"
                    onMouseMove={handleZoom}
                    onMouseEnter={() => setIsZooming(true)}
                    onMouseLeave={() => setIsZooming(false)}
                  >
                    <img
                      src={
                        product.images && product.images.length > 0
                          ? product.images[activeImageIndex]
                          : product.imageUrl || product.image
                      }
                      alt={product.name}
                      className="w-full h-full object-cover pointer-events-none"
                      decoding="async"
                    />

                    {/* Lens Effect (Amazon-style) */}
                    {isZooming && (
                      <div
                        className="absolute border border-gray-300 bg-white/30 pointer-events-none hidden md:block"
                        style={{
                          width: "150px",
                          height: "150px",
                          left: `${zoomPos.x}%`,
                          top: `${zoomPos.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    )}

                    {/* Type Badge overlay */}
                    <div className="absolute top-4 left-4 z-10 pointer-events-none">
                      <span
                        className={`px-4 py-2 text-[10px] font-semibold rounded-xl  border border-white/20 backdrop-blur-md ${product.type === "SERVICE"
                          ? "bg-blue-600/80 text-white"
                          : "bg-[#E64600]/80 text-white"
                          }`}
                      >
                        {product.type === "SERVICE"
                          ? "Service Available"
                          : "Product Catalogue"}
                      </span>
                    </div>

                    {/* Navigation Arrows */}
                    {product.images && product.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-20"
                        >
                          <ArrowLeft size={20} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-20"
                        >
                          <ArrowRight size={20} />
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-80 flex flex-col items-center justify-center gap-3 bg-gray-50">
                    {product.type === "SERVICE" ? (
                      <Layers className="w-14 h-14 text-gray-200" />
                    ) : (
                      <Box className="w-14 h-14 text-gray-200" />
                    )}
                    <span className="text-sm text-gray-300 font-medium tracking-wide">
                      No image available
                    </span>
                  </div>
                )}

                {/* Zoom Window (Amazon-style) - MOVED OUTSIDE OVERFLOW-HIDDEN */}
                {isZooming && (
                  <div
                    className="absolute left-[calc(100%+20px)] top-0 w-[450px] h-[450px] bg-white border border-gray-200  z-[999] overflow-hidden hidden md:block rounded-xl pointer-events-none"
                    style={{
                      backgroundImage: `url("${product.images && product.images.length > 0 ? product.images[activeImageIndex] : product.imageUrl || product.image}")`,
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                      backgroundSize: "1200px 1200px",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                )}
              </div>
            </div>

            {/* Premium Title & Meta Data Structure */}
            <div className="bg-white p-4 md:p-6 space-y-4 border-b border-slate-100 rounded-xl  mb-6">
              <div>
                <h1 className="text-xl md:text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
                  {product.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  {product.category && (
                    <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-[15px] font-medium text-[#E64600] bg-slate-50 px-2.5 py-1.5 rounded-md border-b border-slate-100/50">
                      <Tag className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span>{product.category}</span>
                    </div>
                  )}
                  {avgRating && (
                    <div className="flex items-center gap-1 md:gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1.5 rounded-xl text-xs md:text-[15px] font-medium border border-amber-200/50">
                      {avgRating} <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
                    </div>
                  )}
                </div>
              </div>

              {/* Premium Price & MOQ Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-100">
                {product.price > 0 && (
                  <div>
                    <p className="text-[10px] md:text-[11px] font-medium text-slate-600 tracking-wider mb-1">
                      Unit Price
                    </p>
                    <p className="text-xl md:text-2xl font-semibold text-[#E64600]">
                      ₹{product.price.toLocaleString()}
                    </p>
                  </div>
                )}

                {product.moq > 0 && (
                  <div className="hidden sm:block h-8 w-px bg-gray-100" />
                )}

                {product.moq > 0 && (
                  <div>
                    <p className="text-[10px] md:text-[11px] font-medium text-slate-600 tracking-wider mb-1">
                      Min. Order Qty
                    </p>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Package className="w-4 h-4 text-amber-600" />
                      <p className="text-lg md:text-xl font-semibold text-gray-900">
                        {product.moq} Units
                      </p>
                    </div>
                  </div>
                )}

                {product.availability !== undefined && (
                  <>
                    <div className="hidden sm:block h-8 w-px bg-gray-100" />
                    <div>
                      <p className="text-[10px] md:text-[11px] font-medium text-slate-600 tracking-wider mb-1">
                        Availability
                      </p>
                      <span
                        className={`text-lg md:text-xl font-semibold flex items-center gap-1.5 md:gap-2 ${product.availability ? "text-[#E64600]" : "text-red-500"}`}
                      >
                        {product.availability ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" /> In Stock
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5" /> Out of Stock
                          </>
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Enhanced Specs & Description with Light Green Shaded Boxes */}
              <div className="space-y-6 pt-1">
                {product.specifications && (
                  <div>
                    <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
                      <Box className="w-5 h-5 text-[#E64600]" /> Specifications
                    </h3>
                    <div className="text-[15px] font-medium text-gray-700">
                      {(() => {
                        try {
                          const parsed =
                            typeof product.specifications === "string" &&
                              product.specifications.startsWith("[")
                              ? JSON.parse(product.specifications)
                              : null;
                          if (
                            Array.isArray(parsed) &&
                            parsed.length > 0 &&
                            parsed[0].key
                          ) {
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                {parsed.map((spec: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex flex-col border-b border-slate-100/60 pb-2"
                                  >
                                    <span className="text-[11px] font-medium text-gray-600 tracking-wider">
                                      {spec.key}
                                    </span>
                                    <span className="text-[15px] font-semibold text-gray-900 mt-0.5">
                                      {spec.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return (
                            <div className="leading-loose whitespace-pre-line">
                              {product.specifications}
                            </div>
                          );
                        } catch (e) {
                          return (
                            <div className="leading-loose whitespace-pre-line">
                              {product.specifications}
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}

                {product.description && (
                  <div>
                    <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-[#E64600]" /> Description
                    </h3>
                    <div className="text-[15px] font-medium text-gray-700 leading-loose">
                      {product.description}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Premium Reviews Section ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white p-4 md:p-6 space-y-6 rounded-xl"
            >
              {/* Header */}
              <div className="flex flex-row items-center justify-between gap-2 md:gap-4 pb-4 border-b border-slate-100 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                    <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-[#E64600]" />
                  </div>
                  <h3 className="text-[15px] md:text-xl font-semibold text-gray-900 leading-tight whitespace-nowrap">
                    Ratings & Reviews
                  </h3>
                  {reviews.length > 0 && (
                    <span className="text-[10px] md:text-sm font-medium text-[#E64600] bg-slate-50 px-2 md:px-2.5 py-1 rounded-full border border-slate-100 shrink-0 whitespace-nowrap">
                      {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                    </span>
                  )}
                </div>
                {avgRating && (
                  <div className="flex items-center gap-1 md:gap-1.5 bg-amber-50 px-2.5 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl border border-amber-100 shrink-0">
                    <span className="text-base md:text-2xl font-semibold text-amber-600">
                      {avgRating}
                    </span>
                    <Star className="w-4 h-4 md:w-6 md:h-6 fill-amber-400 text-amber-400" />
                  </div>
                )}
              </div>

              {/* Write a Review Form */}
              {user ? (
                <form
                  onSubmit={handleReview}
                  className="bg-slate-50/40 rounded-xl p-5 space-y-4 border-b border-slate-100/60 "
                >
                  <h4 className="text-base font-medium text-gray-800 flex items-center gap-2">
                    Write a Review
                  </h4>

                  {/* Star Picker */}
                  <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-xl border-b border-slate-100/50 w-max ">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${star <= (hoverRating || reviewRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                            }`}
                        />
                      </button>
                    ))}
                    {reviewRating > 0 && (
                      <span className="ml-4 text-[15px] font-medium text-[#164e33]">
                        {
                          [
                            "",
                            "Poor",
                            "Fair",
                            "Good",
                            "Very Good",
                            "Excellent",
                          ][reviewRating]
                        }
                      </span>
                    )}
                  </div>

                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    placeholder="Share your experience with this product or service..."
                    className="w-full p-5 bg-white border border-slate-200 rounded-xl text-[15px] font-medium text-gray-700 outline-none focus:border-[#164e33] focus:ring-2 focus:ring-[#164e33]/10 transition-all resize-none"
                  />

                  {reviewError && (
                    <p className="text-[15px] font-medium text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                      {reviewError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={reviewSending || reviewSent}
                    className={`px-8 py-3.5 rounded-xl text-[15px] font-medium flex items-center gap-3 transition-all ${reviewSent
                      ? "bg-[#164e33] text-white"
                      : "bg-[#164e33] hover:bg-[#113f29] text-white hover:-translate-y-0.5"
                      }`}
                  >
                    {reviewSent ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" /> Review Submitted!
                      </>
                    ) : reviewSending ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="w-5 h-5" /> Submit Review
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 text-center border-b border-slate-100">
                  <p className="text-sm text-gray-500">
                    <button
                      onClick={() => {
                        setPendingAction("review");
                        setLoginModalOpen(true);
                      }}
                      className="text-[#164e33] font-medium hover:underline"
                    >
                      Login
                    </button>{" "}
                    to leave a review
                  </p>
                </div>
              )}

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-4 divide-y divide-gray-100">
                    {(showAllReviews ? reviews : reviews.slice(0, 5)).map(
                      (review: any, idx: number) => (
                        <div
                          key={review.id || idx}
                          className={`flex gap-3 ${idx > 0 ? "pt-3" : ""}`}
                        >
                          <div className="w-10 h-10 rounded-full bg-[#E64600]/10 flex items-center justify-center shrink-0 overflow-hidden">
                            {review.user?.avatar ? (
                              <img src={review.user.avatar} alt={review.user.name || 'User'} className="w-full h-full object-cover" />
                            ) : (
                              <UserCircle className="w-6 h-6 text-[#E64600]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-800 truncate">
                                {review.user?.name &&
                                  isNaN(Number(review.user.name))
                                  ? review.user.name
                                  : "Guest Reviewer"}
                              </span>
                              <span className="text-xs text-gray-400 shrink-0">
                                {new Date(review.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                            {/* Stars */}
                            <div className="flex items-center gap-0.5 mb-2">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${s <= review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-200"
                                    }`}
                                />
                              ))}
                            </div>
                            {review.comment && (
                              <p className="text-sm font-medium text-gray-600 leading-relaxed pt-1.5">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  {reviews.length > 5 && (
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="w-full py-3 border border-gray-200 rounded-xl text-sm font-semibold text-[#E64600] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {showAllReviews ? (
                        <>
                          Show Less{" "}
                          <ChevronRight className="w-4 h-4 rotate-90" />
                        </>
                      ) : (
                        <>
                          View All {reviews.length} Reviews{" "}
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    No reviews yet. Be the first to review!
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          <aside className="w-full lg:w-[380px] shrink-0 order-1 lg:order-2">
            <div className="sticky top-28 space-y-6">
              {/* Supplier Info Card (Premium Sync) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white p-4 border-b border-slate-100 rounded-xl"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-[#E64600]/10 flex items-center justify-center text-[#E64600] text-xl font-semibold shrink-0 overflow-hidden border border-[#E64600]/10">
                      {vendor.logoUrl ? (
                        <img
                          src={vendor.logoUrl}
                          alt={vendor.businessName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        vendor.businessName.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-gray-800 leading-tight truncate">
                        {vendor.businessName}
                      </h2>
                      <div className="flex items-center gap-1 mt-0.5 uppercase">
                        {vendor.verified && (
                          <div className="flex items-center gap-0.5 bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[9px] font-medium border border-blue-100">
                            <ShieldCheck className="w-2.5 h-2.5" /> Verified
                          </div>
                        )}
                        {vendor.trustBadge && vendor.trustBadge !== 'NONE' && (
                          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium border ${
                            vendor.trustBadge === 'GOLD_SUPPLIER' 
                              ? 'bg-yellow-50 text-yellow-600 border-yellow-200' 
                              : vendor.trustBadge === 'TRUST_SEAL' 
                                ? 'bg-[#F1C82E]/10 text-[#C92500] border-[#F1C82E]' 
                                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          }`}>
                            <CheckCircle2 className={`w-2.5 h-2.5 ${vendor.trustBadge === 'GOLD_SUPPLIER' ? 'text-yellow-500' : vendor.trustBadge === 'TRUST_SEAL' ? 'fill-[#F1C82E]' : 'text-emerald-500'}`} />{" "}
                            {vendor.trustBadge.replace('_', ' ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-3 border-y border-gray-50">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-0.5">
                        Reputation
                      </p>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center bg-[#E64600] text-white px-1.5 py-0.5 rounded text-[10px] font-medium">
                          {avgRating || "4.5"}{" "}
                          <Star className="w-2.5 h-2.5 ml-0.5 fill-current" />
                        </div>
                        <span className="text-sm font-semibold text-gray-800">
                          ({reviews.length})
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800 mb-0.5">
                        Location
                      </p>
                      <div className="flex items-center justify-end gap-1 text-sm font-semibold text-gray-800">
                        <MapPin className="w-3 h-3 text-[#E64600]" />{" "}
                        {vendor.city}
                      </div>
                    </div>
                  </div>

                  {/* Years Active Analysis */}
                  {(() => {
                    const startYear = vendor.createdAt
                      ? new Date(vendor.createdAt).getFullYear()
                      : new Date().getFullYear() - 1;
                    const years = new Date().getFullYear() - startYear;
                    return (
                      <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
                        <Package className="w-3.5 h-3.5 text-gray-400" />
                        Proudly serving for{" "}
                        <span className="text-gray-800 text-base font-semibold">
                          {years > 0 ? `${years}+ years` : "under 1 year"}
                        </span>
                      </div>
                    );
                  })()}

                  <Link
                    href={`/supplier/${vendor.businessName ? `${vendor.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${vendor.id}` : vendor.id}`}
                    className="w-full py-2.5 bg-gray-50 hover:bg-[#E64600] hover:text-white text-[#E64600] rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 border-b border-slate-100"
                  >
                    View Supplier Store <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>

              {/* Direct Contact CTA */}
              <div className="bg-white p-6 border-b border-slate-100 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-slate-100/50 transition-all"></div>

                <h3 className="text-sm font-semibold text-gray-800 mb-6 flex items-center gap-2 relative z-10">
                  <Send className="w-5 h-5 text-[#E64600]" /> Contact Details
                </h3>

                <div className="flex flex-col gap-4 relative z-10">
                  <button
                    onClick={() => {
                      if (!user) {
                        setPendingAction("CALL");
                        setLoginModalOpen(true);
                        return;
                      }
                      setCallModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-[#E64600] hover:bg-[#cc3e00] text-white text-[15px] font-medium rounded-xl transition-all active:scale-[0.98] shadow-sm shadow-[#E64600]/20"
                  >
                    <Phone className="w-5 h-5" /> Call Supplier Now
                  </button>
                  <button
                    onClick={() => handleDirectAction("WHATSAPP")}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-[15px] font-medium transition-all shadow-sm shadow-[#25D366]/20 active:scale-[0.98]"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg> Message on WhatsApp
                  </button>
                </div>
              </div>

            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

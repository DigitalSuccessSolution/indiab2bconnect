"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  X,
  ShieldCheck,
  MapPin,
  Star,
  Shield,
  Lock,
  ArrowRight,
  Zap,
  Loader2,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Vendor {
  id: string;
  businessName: string;
  category?: { name: string };
  city: string;
  verified?: boolean;
  logoUrl?: string;
  rating?: number;
  reviews?: number;
  establishedYear?: number;
  gstNumber?: string;
  companyName?: string;
}

interface VendorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
  onSuccess?: () => void;
}

export default function VendorLoginModal({
  isOpen,
  onClose,
  vendor,
  onSuccess,
}: VendorLoginModalProps) {
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && vendor) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, vendor]);

  if (!isOpen || !vendor) return null;

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError("Please enter a valid mobile number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiFetch("/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to request OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/auth/verify-otp-login", {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
      });

      login(data.data.token, data.data.user, true);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="max-w-md md:max-w-4xl w-full max-h-[92vh] md:max-h-[90vh] overflow-y-auto md:overflow-hidden bg-white rounded-lg shadow-2xl flex flex-col md:flex-row border border-gray-100 relative scrollbar-none"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 md:right-6 md:top-6 text-gray-400 hover:text-gray-600 transition-colors z-50 p-2 hover:bg-gray-50 rounded-full"
        >
          <X size={20} className="md:w-6 md:h-6" />
        </button>

        {/* Left Side: Business Info (Hidden on Mobile) */}
        <div className="hidden md:block md:w-5/12 p-8 bg-white relative border-r border-gray-50">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-1 bg-[#006d3c] text-white px-3 py-1 rounded-lg text-sm font-semibold mb-6">
            <ShieldCheck size={16} />
            <span>Supplier</span>
          </div>

          {/* Business Logo Placeholder */}
          <div className="w-24 h-24 bg-white border border-gray-100 rounded-lg flex items-center justify-center mb-6 overflow-hidden shadow-sm p-1">
            {vendor.logoUrl ? (
              <img
                src={vendor.logoUrl}
                alt={vendor.businessName}
                className="w-full h-full object-contain mix-blend-multiply"
              />
            ) : (
              <div className="text-[#89b39d] opacity-50">
                <Building2 size={48} strokeWidth={1.5} />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-[#006d3c] font-semibold text-xs uppercase tracking-wider">
              {vendor.category?.name || "Business Service"}
            </p>
            <h1 className="text-2xl font-semibold text-slate-900 leading-tight">
              {vendor.businessName || vendor.companyName || "Verified Supplier"}
            </h1>

            <div className="flex items-center gap-1 text-gray-600">
              <MapPin size={18} className="text-gray-400" />
              <span className="text-sm font-medium">{vendor.city}, India</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {vendor.gstNumber && (
                <span className="flex items-center gap-1 bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] px-3 py-1 rounded-md text-xs font-semibold">
                  <Shield size={14} /> GST Registered
                </span>
              )}
              {vendor.verified !== false && (
                <span className="flex items-center gap-1 bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] px-3 py-1 rounded-md text-xs font-semibold">
                  <ShieldCheck
                    size={14}
                    fill="currentColor"
                    className="text-[#166534]"
                  />{" "}
                  VERIFIED
                </span>
              )}
            </div>

            <div className="inline-block bg-[#eff6ff] text-[#1e40af] border border-[#dbeafe] px-3 py-1 rounded-md text-xs font-semibold">
              <span className="mr-1">🕒</span> {vendor.establishedYear ? new Date().getFullYear() - vendor.establishedYear : 5}+ Years in Business
            </div>

            <div className="flex items-center gap-8 py-4">
              <div className="flex items-center gap-2">
                <Star size={24} fill="#fbbf24" className="text-[#fbbf24]" />
                <div>
                  <div className="text-xl font-semibold">{vendor.rating || 4.5}</div>
                  <div className="text-[10px] text-gray-500">({vendor.reviews || 0} reviews)</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={24} className="text-[#006d3c]" />
                <div>
                  <div className="text-[10px] font-semibold text-[#006d3c] uppercase tracking-tighter">
                    Trustseal
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium">
                    Verified Business
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm">
                <ShieldCheck size={20} className="text-gray-700" />
              </div>
              <p className="text-[11px] text-gray-600 leading-tight">
                Your information is secure
                <br />
                <span className="font-semibold">and encrypted</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-7/12 p-5 sm:p-8 md:p-10 bg-white flex flex-col justify-center max-h-[92vh] md:max-h-[90vh] overflow-y-auto scrollbar-none">
          <div className="mt-2 md:mt-0">
            <h2 className="text-2xl sm:text-[32px] md:text-[36px] font-semibold text-slate-900 leading-[1.1] mb-2 tracking-tight">
              Connect with this
              <br />
              Supplier
            </h2>
            <div className="w-12 h-1 bg-[#006d3c] mb-4 mt-2"></div>

            <p className="text-slate-500 text-sm sm:text-[15px] mb-6 leading-relaxed">
              {otpSent
                ? `Enter the 6-digit code sent to +91 ${phone}`
                : "We just need to verify your mobile number to get started."}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-semibold border border-red-100 rounded-lg flex items-center gap-2 animate-shake">
                <X size={16} /> {error}
              </div>
            )}

            <form onSubmit={otpSent ? handleVerifyOTP : handleRequestOTP}>
              {!otpSent ? (
                <>
                  <div className="flex items-stretch border border-slate-300 rounded-lg overflow-hidden focus-within:border-[#006d3c] focus-within:ring-1 focus-within:ring-[#006d3c] transition-all mb-4 bg-white shadow-sm">
                    <div className="flex items-center justify-center px-4 py-2 bg-slate-50 border-r border-slate-300 shrink-0">
                      <span className="font-medium text-gray-700 text-sm whitespace-nowrap">+91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        if (val.length <= 10) setPhone(val);
                      }}
                      placeholder="Enter your mobile number"
                      className="w-full px-3 py-2 text-base focus:outline-none placeholder:text-gray-400 font-medium text-gray-800"
                    />
                  </div>

                  <div className="flex items-start gap-3 mb-5">
                    <div className="mt-0.5 bg-[#f0fdf4] p-1.5 rounded-full flex-shrink-0">
                      <Zap
                        size={16}
                        className="text-[#22c55e]"
                        fill="#22c55e"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-[#111827] text-xs sm:text-sm">
                        Verified suppliers get your requirement instantly.
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed font-medium">
                        Your number will only be used for verification and will
                        not be shared.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mb-5">
                  <div className="relative group">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/[^0-9]/g, ""))
                      }
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#006d3c] focus:ring-4 focus:ring-[#006d3c]/10 text-center text-2xl font-semibold text-slate-800 transition-all tracking-[0.75em]"
                      placeholder="••••••"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="mt-2 text-[#006d3c] text-xs sm:text-sm font-semibold hover:underline"
                  >
                    Change Phone Number
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  (!otpSent && phone.length !== 10) ||
                  (otpSent && otp.length !== 6)
                }
                className="w-full bg-[#0d824d] hover:bg-[#0a6b3f] text-white py-3 rounded-lg font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-green-100 transition-all active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:shadow-none disabled:active:scale-100 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {otpSent ? <CheckCircle2 size={18} /> : <Lock size={18} />}
                    {otpSent ? "Verify & Connect" : "Continue"}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-[10px] text-gray-500 font-medium">
              By logging in, you agree to our <br />
              <a href="#" className="text-[#0d824d] font-semibold underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-[#0d824d] font-semibold underline">
                Privacy Policy.
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

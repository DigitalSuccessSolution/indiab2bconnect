"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

interface VendorRegisterProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export default function VendorRegister({
  isOpen,
  onClose,
  onBackToLogin,
}: VendorRegisterProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock scroll when modal is open
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

  if (!mounted) return null;

  const handleSendOTP = async () => {
    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }
    setOtpLoading(true);
    setError("");
    try {
      await apiFetch("/auth/request-email-otp", {
        method: "POST",
        body: JSON.stringify({ email: formData.email }),
      });
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send verification code");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter your name");
      setLoading(false);
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Phone number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!otpSent) {
      setError("Please verify your email address first");
      setLoading(false);
      return;
    }

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          role: "VENDOR",
        }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto scrollbar-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full sm:max-w-[560px] bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden mt-auto sm:my-auto max-h-[95vh] sm:max-h-[92vh] flex flex-col"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-20"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </button>

            <div className="p-6 pb-12 sm:p-10 overflow-y-auto scrollbar-none flex-1 max-h-[95vh] sm:max-h-[92vh]">
              <div className="mb-6 sm:mb-8">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">
                    Join as Supplier
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-[15px]">
                    Create your business profile
                  </p>
                </div>
              </div>

              {success ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Registration Successful
                  </h3>
                  <p className="text-gray-500 mb-8">
                    Your account has been created. <br />
                    Please login to access your dashboard.
                  </p>
                  <button
                    onClick={onBackToLogin}
                    className="w-full h-[44px] sm:h-[48px] bg-[#E64600] text-white rounded-xl text-lg sm:text-xl font-semibold hover:bg-[#e64600] transition-all"
                  >
                    Login Now
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100 text-center">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="absolute -top-2 left-4 bg-white px-2 text-[10px] sm:text-[11px] font-semibold text-[#E64600] z-10">
                        Name
                      </label>
                      <div className="flex items-center h-[44px] sm:h-[48px] border-2 border-gray-300 rounded-xl px-4 focus-within:border-[#E64600] transition-all">
                        <User className="w-4 h-4 text-gray-400 mr-2.5 sm:mr-3 flex-shrink-0" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm sm:text-[15px] font-medium text-gray-900"
                          placeholder="Your Name"
                          required
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="absolute -top-2 left-4 bg-white px-2 text-[10px] sm:text-[11px] font-semibold text-[#E64600] z-10">
                        Phone
                      </label>
                      <div className="flex items-center h-[44px] sm:h-[48px] border-2 border-gray-300 rounded-xl pl-3 pr-4 focus-within:border-[#E64600] transition-all">
                        <div className="flex items-center border-r-2 border-gray-200 pr-2 mr-2">
                          <span className="text-gray-600 font-medium text-sm sm:text-[15px]">+91</span>
                        </div>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setFormData({ ...formData, phone: val });
                          }}
                          maxLength={10}
                          className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm sm:text-[15px] font-medium text-gray-900"
                          placeholder="10-digit number"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="absolute -top-2 left-4 bg-white px-2 text-[10px] sm:text-[11px] font-semibold text-[#E64600] z-10">
                      Email
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center h-[44px] sm:h-[48px] flex-1 border-2 border-gray-300 rounded-xl px-4 focus-within:border-[#E64600] transition-all">
                        <Mail className="w-4 h-4 text-gray-400 mr-2.5 sm:mr-3 flex-shrink-0" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm sm:text-[15px] font-medium text-gray-900"
                          placeholder="business@example.com"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={otpLoading || otpSent}
                        className="px-3 sm:px-4 h-[44px] sm:h-[48px] bg-[#E64600] hover:bg-[#e64600] cursor-pointer text-white rounded-xl text-xs sm:text-sm font-semibold disabled:bg-emerald-500 transition-all flex items-center justify-center whitespace-nowrap shrink-0 min-w-[70px] sm:min-w-[80px]"
                      >
                        {otpLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : otpSent ? (
                          "Sent"
                        ) : (
                          "Verify"
                        )}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {otpSent && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="relative"
                      >
                        <label className="absolute -top-2 left-4 bg-white px-2 text-[10px] sm:text-[11px] font-semibold text-emerald-600 z-10">
                          OTP Code
                        </label>
                        <div className="flex items-center h-[44px] sm:h-[48px] border-2 border-emerald-100 bg-emerald-50/10 rounded-xl px-4 focus-within:border-emerald-500 transition-all">
                          <KeyRound className="w-4 h-4 text-emerald-500 mr-2.5 sm:mr-3 flex-shrink-0" />
                          <input
                            type="text"
                            value={formData.otp}
                            onChange={(e) =>
                                setFormData({ ...formData, otp: e.target.value })
                            }
                            className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg font-semibold text-gray-900 text-center tracking-[0.5em]"
                            placeholder="000000"
                            maxLength={6}
                            required
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="absolute -top-2 left-4 bg-white px-2 text-[10px] sm:text-[11px] font-semibold text-[#E64600] z-10">
                        Password
                      </label>
                      <div className="flex items-center h-[44px] sm:h-[48px] border-2 border-gray-300 rounded-xl px-4 focus-within:border-[#E64600] transition-all">
                        <Lock className="w-4 h-4 text-gray-400 mr-2.5 sm:mr-3 flex-shrink-0" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm sm:text-[15px] font-medium text-gray-900"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 sm:p-1.5 hover:bg-gray-50 rounded-lg transition-colors ml-1"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <label className="absolute -top-2 left-4 bg-white px-2 text-[10px] sm:text-[11px] font-semibold text-[#E64600] z-10">
                        Confirm
                      </label>
                      <div className="flex items-center h-[44px] sm:h-[48px] border-2 border-gray-300 rounded-xl px-4 focus-within:border-[#E64600] transition-all">
                        <Lock className="w-4 h-4 text-gray-400 mr-2.5 sm:mr-3 flex-shrink-0" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm sm:text-[15px] font-medium text-gray-900"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 sm:p-1.5 hover:bg-gray-50 rounded-lg transition-colors ml-1"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[44px] sm:h-[48px] bg-[#E64600] text-white rounded-xl text-lg sm:text-xl font-semibold hover:bg-[#e64600] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                    ) : (
                      "Create Account"
                    )}
                    {!loading && <ArrowRight className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}
                  </button>

                  <div className="text-center pt-3 sm:pt-4 border-t border-gray-100">
                    <p className="text-gray-500 text-sm">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={onBackToLogin}
                        className="text-[#E64600] font-semibold hover:underline"
                      >
                        Login here
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

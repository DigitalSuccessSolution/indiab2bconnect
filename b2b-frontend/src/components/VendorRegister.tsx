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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOTPVerification && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showOTPVerification, timer]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "contain";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const validateForm = () => {
    if (!formData.name.trim()) return "Please enter your name";
    if (!/^\d{10}$/.test(formData.phone)) return "Phone number must be exactly 10 digits";
    if (!formData.email.trim()) return "Please enter your email address";
    if (formData.password.length < 6) return "Password must be at least 6 characters long";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await apiFetch("/auth/request-email-otp", {
        method: "POST",
        body: JSON.stringify({ email: formData.email, phone: formData.phone }),
      });
      setOtpSent(true);
      setTimer(60); // Start timer
      setShowOTPVerification(true); // Switch to OTP screen
    } catch (err: any) {
      setError(err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpLoading(true);
    setError("");
    try {
      await apiFetch("/auth/request-email-otp", {
        method: "POST",
        body: JSON.stringify({ email: formData.email, phone: formData.phone }),
      });
      setTimer(60); // Reset timer on resend
    } catch (err: any) {
      setError(err.message || "Failed to resend verification code");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length < 4) {
      setError("Please enter a valid verification code");
      return;
    }

    setLoading(true);
    setError("");

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
      setError(err.message || "Registration failed or Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm touch-none"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full sm:max-w-[560px] bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden mt-auto sm:my-auto max-h-[100dvh] sm:max-h-[calc(100dvh-2rem)] flex flex-col"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-20"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </button>

            <div className="p-6 pb-12 sm:p-10 overflow-y-auto overscroll-contain scrollbar-none flex-1">
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
              ) : showOTPVerification ? (
                <form onSubmit={handleFinalSubmit} className="space-y-4 sm:space-y-5">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-[#E64600]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Verify your email</h3>
                    <p className="text-sm text-gray-500">
                      We've sent a code to <span className="font-semibold text-gray-700">{formData.email}</span>
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100 text-center">
                      {error}
                    </div>
                  )}

                  <div className="relative">
                    <label className="absolute -top-2 left-4 bg-white px-2 text-[10px] sm:text-[11px] font-semibold text-[#E64600] z-10">
                      Verification Code
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center h-[44px] sm:h-[48px] flex-1 border-2 border-gray-300 rounded-xl px-3 sm:px-4 focus-within:border-[#E64600] transition-all">
                        <input
                          type="text"
                          value={formData.otp}
                          onChange={(e) =>
                            setFormData({ ...formData, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })
                          }
                          className="flex-1 w-full min-w-0 bg-transparent border-none outline-none text-base sm:text-lg font-medium text-center text-gray-900 tracking-[0.5em]"
                          placeholder="000000"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-[44px] sm:h-[48px] bg-[#E64600] text-white rounded-xl text-base sm:text-[17px] font-semibold hover:bg-[#e64600] disabled:bg-gray-400 transition-all flex items-center justify-center group shadow-md shadow-orange-500/20"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Verify & Register
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                    
                    <div className="flex items-center justify-between mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowOTPVerification(false);
                          setFormData((prev) => ({ ...prev, otp: "" }));
                        }}
                        className="text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Change Email
                      </button>
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={otpLoading || timer > 0}
                        className={`text-xs sm:text-sm font-semibold flex items-center transition-colors ${
                          timer > 0 ? "text-gray-400 cursor-not-allowed" : "text-[#E64600] hover:text-[#c43b00]"
                        }`}
                      >
                        {otpLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                        {timer > 0 ? `Resend Code in 00:${timer.toString().padStart(2, '0')}` : "Resend Code"}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleInitialSubmit} className="space-y-4 sm:space-y-5">
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
                          className="flex-1 w-full min-w-0 bg-transparent border-none outline-none text-sm sm:text-[15px] font-medium text-gray-900"
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
                          className="flex-1 w-full min-w-0 bg-transparent border-none outline-none text-sm sm:text-[15px] font-medium text-gray-900"
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
                    <div className="flex items-center h-[44px] sm:h-[48px] border-2 border-gray-300 rounded-xl px-4 focus-within:border-[#E64600] transition-all">
                      <Mail className="w-4 h-4 text-gray-400 mr-2.5 sm:mr-3 flex-shrink-0" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="flex-1 w-full min-w-0 bg-transparent border-none outline-none text-sm sm:text-[15px] font-medium text-gray-900"
                        placeholder="business@example.com"
                        required
                      />
                    </div>
                  </div>

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
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="flex-1 w-full min-w-0 bg-transparent border-none outline-none text-sm sm:text-[15px] font-medium text-gray-900"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
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
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="flex-1 w-full min-w-0 bg-transparent border-none outline-none text-sm sm:text-[15px] font-medium text-gray-900"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[44px] sm:h-[48px] bg-[#E64600] text-white rounded-xl text-base sm:text-[17px] font-semibold hover:bg-[#e64600] disabled:bg-gray-400 transition-all flex items-center justify-center mt-2 group shadow-md shadow-orange-500/20"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
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

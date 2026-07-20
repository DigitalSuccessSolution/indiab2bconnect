"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  Mail,
  Lock,
  User,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Phone,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VendorRegister() {
  const { login } = useAuth();
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
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          role: "VENDOR",
        }),
      });

      // Auto login after registration
      // Success - show success message and link to login
      setSuccess(true);
      console.log(
        "[AUTH-DEBUG] Registration successful, manual login required.",
      );
    } catch (err: any) {
      console.error("[AUTH-DEBUG] Registration error:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-lg p-10 text-center shadow-lg border border-slate-100"
        >
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Vendor Registered
          </h2>
          <p className="text-slate-500 mb-8">
            Successfully registered as a vendor. Please login to continue.
          </p>
            <Link
              href="/login"
              className="w-full inline-block py-4 bg-[#164e33] text-white rounded-lg font-semibold hover:bg-[#113f29] transition-colors shadow-sm"
            >
              Login Now
            </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-8">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-20 lg:h-24 w-auto object-contain"
            />
          </Link>
          <h2 className="text-3xl font-semibold text-slate-900 mb-2">
            Join as a Vendor
          </h2>
          <p className="text-slate-500 text-base">
            Create your business profile to start receiving leads.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 text-red-600 text-base font-medium border border-red-100 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-base font-semibold text-slate-400 uppercase  ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white text-base text-slate-700 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-base font-semibold text-slate-400 uppercase  ml-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white text-base text-slate-700 transition-all"
                    placeholder="+91..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-base font-semibold text-slate-400 uppercase  ml-1">
                Business Email
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white text-base text-slate-700 transition-all"
                    placeholder="name@business.com"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={otpLoading || otpSent}
                  className={`px-5 text-base font-semibold rounded-lg transition-all ${otpSent ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-900 text-white"}`}
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
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-1.5"
                >
                  <label className="text-base font-semibold text-emerald-600 uppercase  ml-1">
                    Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <input
                      type="text"
                      required
                      value={formData.otp}
                      onChange={(e) =>
                        setFormData({ ...formData, otp: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3.5 bg-emerald-50/10 border border-emerald-200 rounded-lg outline-none focus:border-emerald-500 text-lg font-semibold  text-center text-slate-700 transition-all"
                      placeholder="••••••"
                      maxLength={6}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-base font-semibold text-slate-400 uppercase  ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white text-base text-slate-700 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-base font-semibold text-slate-400 uppercase  ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white text-base text-slate-700 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 p-1"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#164e33] text-white rounded-lg font-semibold hover:bg-[#113f29] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Register as Vendor"
                )}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-center pt-8 border-t border-slate-50">
              <p className="text-base text-slate-400 mb-1">
                Already have an account?
              </p>
              <Link
                href="/login"
                className="text-base font-semibold text-[#164e33] hover:underline"
              >
                Login here
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center mt-10">
          <p className="text-base text-slate-400">
            Joining as a Buyer? Use our{" "}
            <Link
              href="/login"
              className="text-[#164e33] font-semibold hover:underline"
            >
              Phone Login
            </Link>{" "}
            for instant access.
          </p>
        </div>
      </div>
    </div>
  );
}

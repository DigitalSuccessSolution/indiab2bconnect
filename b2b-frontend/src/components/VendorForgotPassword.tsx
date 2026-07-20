"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

interface VendorForgotPasswordProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export default function VendorForgotPassword({
  isOpen,
  onClose,
  onBackToLogin,
}: VendorForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.08, ease: "easeOut" }}
            className="relative w-full max-w-[480px] bg-white rounded-[32px] shadow-2xl overflow-hidden my-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-20"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            <div className="p-10">
              <div className="mb-10">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 leading-tight">
                    Recover Access
                  </h2>
                  <p className="text-gray-700 text-[15px]">
                    Reset your password
                  </p>
                </div>
              </div>

              {success ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-gray-700 mb-8">
                    We've sent a password reset link to <br />
                    <span className="font-semibold text-gray-900">{email}</span>
                  </p>
                  <button
                    onClick={onBackToLogin}
                    className="text-[#E64600] font-semibold hover:underline flex items-center justify-center gap-2 mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100 text-center">
                      {error}
                    </div>
                  )}

                  <div className="relative">
                    <label className="absolute -top-2.5 left-4 bg-white px-2 text-[13px] font-semibold text-[#E64600] z-10">
                      Registered Email
                    </label>
                    <div className="flex items-center h-[44px] sm:h-[48px] border-2 border-gray-300 rounded-xl px-5 focus-within:border-[#E64600] transition-all">
                      <Mail className="w-5 h-5 text-gray-700 mr-4" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 min-w-0 bg-transparent border-none outline-none text-lg font-medium text-gray-900"
                        placeholder="e.g. business@example.com"
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[44px] sm:h-[48px] bg-[#E64600] hover:bg-[#e64600] text-white rounded-xl text-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>

                  <div className="text-center pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={onBackToLogin}
                      className="text-gray-700 text-sm font-semibold hover:text-gray-900 flex items-center justify-center gap-2 mx-auto transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Login
                    </button>
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

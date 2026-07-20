import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

interface BuyerAuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isSkipable?: boolean;
}

export default function BuyerLogin({
  isOpen,
  onClose,
  isSkipable = false,
}: BuyerAuthDrawerProps) {
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [timer, setTimer] = useState(0);
  const [resending, setResending] = useState(false);
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

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  if (!mounted) return null;

  const handleRequestOTP = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError("Please enter a valid mobile number");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms and Conditions");
      return;
    }
    
    const isResend = otpSent;
    if (isResend) setResending(true);
    else setLoading(true);
    
    setError("");
    try {
      const data = await apiFetch("/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });

      // Log OTP to console in development
      if (data?.data?.otp) {
        console.warn("📱 YOUR OTP IS: " + data.data.otp);
        // Temporary alert for extreme visibility
        alert("OTP : " + data.data.otp);
      }

      setOtpSent(true);
      setTimer(30);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      if (isResend) setResending(false);
      else setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/auth/verify-otp-login", {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
      });
      if (data?.data?.token) {
        login(data.data.token, data.data.user, true);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          key="buyer-login-modal"
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-y-auto scrollbar-none"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[440px] md:max-w-[480px] bg-white rounded-2xl sm:rounded-[32px] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-20"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </button>

            <div className="p-6 sm:p-10 overflow-y-auto scrollbar-none flex-1 max-h-[92vh]">
              {/* Header Section */}
              <div className="mb-6 sm:mb-10">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight">
                    Welcome
                  </h2>
                  <p className="text-gray-900 text-[13px] sm:text-[15px] mt-1.5 font-medium">
                    Login for a seamless experience
                  </p>
                </div>
              </div>

              {/* Form Section */}
              <form
                onSubmit={otpSent ? handleVerifyOTP : handleRequestOTP}
                className="space-y-6 sm:space-y-8"
              >
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100 text-center">
                    {error}
                  </div>
                )}

                {!otpSent ? (
                  <div className="space-y-6">
                    {/* Floating Label Input */}
                    <div className="relative">
                      <label className="absolute -top-2.5 left-4 bg-white px-2 text-xs font-medium text-gray-600 z-10">
                        Enter Mobile Number
                      </label>
                      <div className="flex items-center h-[44px] sm:h-[48px] border-2 border-[#164e33] rounded-xl px-4 sm:px-5 transition-all">
                        <div className="flex items-center justify-center pr-3 sm:pr-4 border-r border-gray-100 shrink-0">
                          <span className="text-base sm:text-lg font-medium text-gray-900 whitespace-nowrap">
                            +91
                          </span>
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) =>
                            setPhone(
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                          className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg font-medium text-gray-900 pl-3 sm:pl-4 tracking-wider"
                          placeholder=""
                          maxLength={10}
                          autoFocus
                          required
                        />
                      </div>
                    </div>

                    {/* Checkbox Section */}
                    <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 pt-1">
                      <label htmlFor="agree-terms" className="relative pt-0.5 sm:pt-0 shrink-0 cursor-pointer group">
                        <input
                          id="agree-terms"
                          type="checkbox"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 border-2 border-gray-300 rounded-[6px] bg-white peer-checked:bg-[#164e33] peer-checked:border-[#164e33] transition-all flex items-center justify-center">
                          {agreed && (
                            <Check
                              className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white animate-in zoom-in duration-200"
                              strokeWidth={4}
                            />
                          )}
                        </div>
                      </label>
                      <span className="text-gray-600 font-medium text-xs sm:text-sm leading-snug">
                        <label htmlFor="agree-terms" className="cursor-pointer">I agree to the</label> <button type="button" className="text-[#164e33] hover:underline">Terms & Conditions</button> and <button type="button" className="text-[#164e33] hover:underline">Privacy Policy</button>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="relative">
                      <label className="absolute -top-2.5 left-4 bg-white px-2 text-xs font-medium text-gray-600 z-10">
                        Enter OTP
                      </label>
                      <div className="flex items-center h-[44px] sm:h-[48px] border-2 border-[#164e33] rounded-xl px-4 sm:px-5">
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) =>
                            setOtp(
                              e.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          className="w-full bg-transparent border-none outline-none text-lg sm:text-xl text-center font-semibold text-gray-900 tracking-[0.5em]"
                          placeholder="000000"
                          maxLength={6}
                          autoFocus
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-1 sm:px-2">
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[#164e33] text-xs sm:text-sm font-semibold hover:underline"
                      >
                        Change Number
                      </button>
                      
                      {timer > 0 ? (
                        <p className="text-xs sm:text-sm font-medium text-slate-500">
                          Resend in <span className="text-[#164e33]">{timer}s</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleRequestOTP}
                          disabled={loading || resending}
                          className="text-[#164e33] text-xs sm:text-sm font-semibold hover:underline disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {resending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Main Action Button */}
                <button
                  type="submit"
                  disabled={loading || resending}
                  className="w-full h-[44px] sm:h-[48px] bg-[#164e33] hover:bg-[#123d28] text-white rounded-xl text-base font-medium transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                  ) : otpSent ? (
                    "Verify OTP"
                  ) : (
                    "Login with OTP"
                  )}
                </button>

                {/* Footer Skip Button */}
                {isSkipable && (
                  <div className="pt-1 sm:pt-2 text-center">
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-gray-400 font-semibold text-base sm:text-lg hover:text-gray-900 transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  Loader2,
  ArrowRight,
  Check,
  ShieldCheck,
  PackageSearch,
  Lock,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [timer, setTimer] = useState(0);
  const [resending, setResending] = useState(false);
  
  const { user, login } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user) {
      if (user.role === 'SUPERADMIN') router.push("/b2b-india/super-admin/dashboard");
      else if (user.role === 'ADMIN' || user.role === 'SUBADMIN') router.push(`/b2b-india/${user.role.toLowerCase()}/dashboard`);
      else if (user.role === 'VENDOR') router.push('/vendor/dashboard');
      else router.push("/");
    }
  }, [user, router]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleRequestOTP = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
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

      if (data?.data?.otp) {
        console.warn("📱 YOUR OTP IS: " + data.data.otp);
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
        login(data.data.token, data.data.user, false);
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-white flex flex-col lg:flex-row">
      {/* Left Side - Image & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-slate-900 h-full">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1200&auto=format&fit=crop" 
            alt="Warehouse Background" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 p-12 xl:p-16 flex flex-col justify-between w-full h-full text-white">
          <Link href="/">
            <img src="/logo.png" alt="India B2B Connect" className="h-10 w-auto" style={{ width: 'auto', height: '40px' }} />
          </Link>
          
          <div className="mt-12 mb-auto space-y-5">
            <h1 className="text-[36px] xl:text-[48px] font-semibold leading-[1.1] tracking-tight">
              Connect with<br/>
              India's<br/>
              <span className="text-[#00d084] relative inline-block mt-2">
                Top Suppliers
                <svg className="absolute w-[110%] h-4 -bottom-3 -left-[5%] text-[#00d084]" viewBox="0 0 200 20" preserveAspectRatio="none">
                  <path d="M0,10 Q100,20 200,0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="text-lg text-slate-300 max-w-md leading-relaxed mt-8">
              Join thousands of buyers finding the right manufacturers and wholesalers for their business needs.
            </p>
            
            <div className="grid grid-cols-2 gap-4 xl:gap-6 pt-8">
              <div className="flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl backdrop-blur-md">
                <div className="p-2.5 rounded-xl border border-[#00d084]/40 text-[#00d084] bg-[#00d084]/10">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-base">Verified</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Trusted Partners</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl backdrop-blur-md">
                <div className="p-2.5 rounded-xl border border-[#00d084]/40 text-[#00d084] bg-[#00d084]/10">
                  <PackageSearch className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-base">Vast Source</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Millions of Products</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-[13px] text-slate-400 space-y-2 mt-8">
            <p>© {new Date().getFullYear()} India B2B Connect. All rights reserved.</p>
            <p className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> Secure & Reliable Platform</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 xl:p-16 relative bg-white lg:overflow-y-auto h-full">
        <div className="w-full max-w-[460px]">
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="inline-block">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-12 w-auto object-contain mx-auto"
                style={{ width: 'auto', height: '48px' }}
              />
            </Link>
          </div>

          <div className="w-full">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-[32px] font-semibold text-[#0f172a] tracking-tight">Buyer Login</h2>
              <p className="text-slate-500 mt-2 text-base">Enter your mobile number to get started</p>
            </div>

            <form onSubmit={otpSent ? handleVerifyOTP : handleRequestOTP} className="space-y-6">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="p-4 bg-red-50 text-red-600 text-sm font-medium border border-red-100 rounded-xl"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {!otpSent ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#334155]">Mobile Number</label>
                    <div className="relative flex items-center h-[52px] border border-slate-300 rounded-lg px-3 transition-all focus-within:border-[#164e33] focus-within:ring-1 focus-within:ring-[#164e33] bg-white group overflow-hidden">
                      <div className="flex items-center justify-center gap-2 pr-3 border-r border-slate-300 shrink-0 h-full pl-3">
                        <span className="text-sm font-medium text-slate-700">
                          +91
                        </span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="flex-1 bg-transparent border-none outline-none text-base font-medium text-slate-900 pl-4 tracking-wider placeholder:text-slate-400"
                        placeholder="Enter 10 digit number"
                        maxLength={10}
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label htmlFor="agree-terms" className="relative shrink-0 cursor-pointer group flex items-center">
                      <input
                        id="agree-terms"
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 border-2 border-[#164e33] rounded bg-white peer-checked:bg-[#164e33] transition-all flex items-center justify-center">
                        {agreed && (
                          <Check
                            className="w-3.5 h-3.5 text-white animate-in zoom-in duration-200"
                            strokeWidth={4}
                          />
                        )}
                      </div>
                    </label>
                    <span className="text-slate-700 text-sm font-medium">
                      <label htmlFor="agree-terms" className="cursor-pointer select-none">I agree to the</label> <button type="button" className="text-[#164e33] font-medium hover:underline">Terms & Conditions</button> and <button type="button" className="text-[#164e33] font-medium hover:underline">Privacy Policy</button>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#334155]">Verification Code</label>
                    <div className="relative flex items-center h-[52px] border border-slate-300 rounded-lg px-4 transition-all focus-within:border-[#164e33] focus-within:ring-1 focus-within:ring-[#164e33] bg-white">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="w-full bg-transparent border-none outline-none text-2xl text-center font-semibold text-slate-900 tracking-[0.5em]"
                        placeholder="000000"
                        maxLength={6}
                        autoFocus
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[#164e33] text-sm font-medium hover:underline"
                    >
                      Change Number
                    </button>
                    
                    {timer > 0 ? (
                      <p className="text-sm font-medium text-slate-500">
                        Resend in <span className="text-[#164e33]">{timer}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestOTP}
                        disabled={loading || resending}
                        className="text-[#164e33] text-sm font-semibold hover:underline disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {resending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || resending}
                className="w-full h-[52px] mt-2 bg-[#164e33] text-white rounded-lg font-medium text-[15px] hover:bg-[#113f29] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : otpSent ? (
                  "Verify & Login"
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-[18px] h-[18px]" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 p-4 bg-[#f0fdf4] rounded-xl flex items-start gap-3 border border-[#dcfce7]">
              <Lock className="w-5 h-5 text-[#164e33] shrink-0 mt-0.5" />
              <p className="text-sm text-[#334155] leading-relaxed">
                We will send you a verification code on this number to authenticate your account.
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

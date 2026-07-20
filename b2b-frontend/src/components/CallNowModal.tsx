'use client';
import React from 'react';
import {
  X, Phone, ShieldCheck, CheckCircle2, Star, MapPin, ExternalLink, Package, Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CallNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: {
    name: string;
    price?: number;
    images?: string[];
    imageUrl?: string;
    image?: string;
  } | null;
  vendor?: {
    id: string;
    businessName: string;
    city?: string;
    phone?: string;
  } | null;
  avgRating?: string;
  callPhone: string;
  setCallPhone: (val: string) => void;
  callSending: boolean;
  callSent: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CallNowModal({
  isOpen,
  onClose,
  product,
  vendor,
  avgRating,
  callPhone,
  setCallPhone,
  callSending,
  callSent,
  onSubmit,
}: CallNowModalProps) {
  if (!isOpen) return null;

  const image =
    product?.images && product.images.length > 0
      ? product.images[0]
      : product?.imageUrl || product?.image || null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl sm:rounded-xl overflow-hidden flex flex-col md:flex-row rounded-t-2xl"
        style={{ maxHeight: '95vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Product + Supplier Info — hidden on mobile */}
        <div className="hidden md:flex md:w-[240px] shrink-0 bg-gray-50 border-r border-slate-100 flex-col overflow-y-auto">
          <div className="w-full h-40 bg-white border-b border-slate-100 flex items-center justify-center overflow-hidden relative">
            {image ? (
              <img src={image} alt={product?.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-12 h-12 text-gray-200" />
            )}
            <div className="absolute top-2 left-2">
              <span className="bg-[#164e33] text-white text-[10px] font-medium px-2 py-0.5 rounded">
                Calling Supplier
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm leading-tight mb-1">
                {product?.name}
              </h3>
              {product?.price && product.price > 0 && (
                <p className="text-base font-semibold text-[#164e33]">
                  &#8377; {product.price.toLocaleString()}
                </p>
              )}
            </div>
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-[#0076a8] shrink-0" />
                <span className="text-xs font-medium text-[#0076a8] truncate">
                  {vendor?.businessName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="w-3.5 h-3.5 shrink-0" /> {vendor?.city}
              </div>
              {avgRating && (
                <div className="flex items-center gap-1.5 bg-[#164e33] text-white rounded-xl px-2.5 py-1 w-fit text-[11px] font-medium">
                  <Star className="w-3 h-3 fill-white" /> {avgRating}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Call Form */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Confirm your number to call</h2>
              {vendor && (
                <p className="text-xs text-gray-500 mt-0.5 md:hidden">
                  {vendor.businessName}{vendor.city ? ` · ${vendor.city}` : ''}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors ml-2 shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {callSent ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 bg-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center border-2 border-green-500/20"
              >
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="text-lg font-semibold text-gray-900">Enquiry Sent Successfully!</p>
                <p className="text-sm text-gray-500 mt-2">Connecting you to the supplier now...</p>
              </motion.div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex-1 p-5 flex flex-col justify-center space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block">
                  Your Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center border-r border-slate-300 pr-3">
                    <span className="text-sm font-medium text-gray-500">+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={callPhone}
                    onChange={(e) =>
                      setCallPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))
                    }
                    placeholder="10 digit mobile number"
                    className="w-full border border-slate-300 rounded-xl pl-16 pr-4 py-3.5 text-base font-medium text-gray-900 outline-none focus:border-[#164e33] focus:ring-2 focus:ring-[#164e33]/10 transition-all shadow-sm"
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  Supplier will call you back on this number if busy.
                </p>
              </div>

              <button
                type="submit"
                disabled={callSending || callPhone.length !== 10}
                className="w-full py-4 bg-[#164e33] hover:bg-[#113f29] disabled:opacity-50 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {callSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Phone className="w-5 h-5 fill-white" />
                )}
                {callSending ? 'Processing...' : 'Call Now'}
              </button>

              <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                <ShieldCheck className="w-4 h-4 text-[#164e33] shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Your privacy is our priority. Your number is only shared with this verified
                  supplier to facilitate your business inquiry.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

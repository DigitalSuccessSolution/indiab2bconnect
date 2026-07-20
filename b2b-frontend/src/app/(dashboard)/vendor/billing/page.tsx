'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  CheckCircle2, RefreshCw, Clock,
  AlertTriangle, Lock, Gem, Package2,
  Star, Zap, Crown, ChevronRight, CreditCard
} from 'lucide-react';
import Script from 'next/script';
import PricingCard from '@/components/dashboard/PricingCard';

/* ─── helpers ─── */
function daysLeft(expiry: string | null): number {
  if (!expiry) return 0;
  return Math.max(0, Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000));
}
function cycleUsed(expiry: string | null): number {
  if (!expiry) return 0;
  const left = daysLeft(expiry);
  const usedDays = Math.max(0, 30 - left);
  return Math.min(100, Math.round((usedDays / 30) * 100));
}

export default function VendorBilling() {
  const [vendor, setVendor] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, pkgs] = await Promise.all([
          apiFetch('/vendors/me'),
          apiFetch('/vendors/packages'),
        ]);
        setVendor(p.data);
        // Show ALL plans from admin, sorted by price
        const sorted = (pkgs.data || []).sort((a: any, b: any) => a.price - b.price);
        setPackages(sorted);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const currentPkg = vendor?.package;
  const days = daysLeft(vendor?.planExpiry);
  const used = cycleUsed(vendor?.planExpiry);
  const isExpired = vendor?.planExpiry && days === 0;
  const isSoon = days > 0 && days <= 7;

  const handleSubscribe = async (pkg: any) => {
    try {
      setUpgrading(pkg.id);
      const res = await apiFetch('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({
          packageId: pkg.id,
          callbackUrl: `${window.location.origin}/vendor/billing/success`
        }),
      });
      if (res.data?.redirectUrl && res.data?.merchantTransactionId) {
        localStorage.setItem('pendingTxnId', res.data.merchantTransactionId);
        window.location.href = res.data.redirectUrl;
      } else {
        throw new Error("Failed to get payment URL");
      }
    } catch (err: any) {
      alert(err.message || 'Failed to initiate payment. Please try again.');
      setUpgrading(null);
    }
  };

  /* ── skeleton ── */
  if (loading) return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-52 bg-gray-200/70 rounded-lg" />
      <div className="h-36 bg-gray-200/70 rounded-lg" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-80 bg-gray-200/70 rounded-lg" />
        <div className="h-80 bg-gray-200/70 rounded-lg" />
        <div className="h-80 bg-gray-200/70 rounded-lg" />
      </div>
    </div>
  );

  /* ── success ── */
  if (success) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900">Payment Successful!</h2>
      <p className="text-gray-600 text-sm">Your subscription is now active. Reloading...</p>
    </div>
  );

  return (
    <>
      <div className="space-y-10 pb-20 max-w-6xl mx-auto">

        {/* ── page title ── */}
        <div className="pb-4 border-b border-gray-100">
          <h1 className="text-xl font-medium text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#164e33]" />
            Billing & Subscriptions
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your active plan and discover new premium features.</p>
        </div>

        {/* ── expiry alert ── */}
        {(isExpired || isSoon) && (
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border text-sm font-medium shadow-sm ${isExpired
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {isExpired
              ? 'Your subscription has expired. Choose a plan below to renew and reactivate your listing.'
              : `Your plan expires in ${days} day${days > 1 ? 's' : ''}. Renew soon to maintain your priority ranking and leads.`}
          </div>
        )}

        {/* ── current plan card (ultra-simple, clean SaaS standard) ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            
            {/* Left side: Plan Info */}
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Current Subscription
              </h2>
              {currentPkg ? (
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-3xl font-semibold text-gray-900">{currentPkg.name} Plan</h3>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                      isExpired ? 'bg-red-50 text-red-700 border-red-200' 
                      : isSoon ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {isExpired ? 'Expired' : 'Active'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-lg">
                    ₹{currentPkg.price?.toLocaleString()} <span className="text-sm">/ month</span>
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-1">No Active Plan</h3>
                  <p className="text-gray-500">Subscribe to a plan below to get started.</p>
                </div>
              )}
            </div>

            {/* Right side: Next Billing / Usage */}
            {currentPkg && (
              <div className="w-full md:w-80 bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm font-medium text-gray-700">Billing Cycle</p>
                  <p className={`text-sm font-semibold ${isExpired ? 'text-red-600' : isSoon ? 'text-amber-600' : 'text-gray-900'}`}>
                    {isExpired ? 'Expired' : `${days} days left`}
                  </p>
                </div>
                
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${used}%`, 
                      background: isExpired ? '#ef4444' : isSoon ? '#f59e0b' : '#164e33' 
                    }}
                  />
                </div>
                
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {isExpired ? 'Expired on ' : 'Renews on '} 
                  <span className="font-semibold text-gray-700">
                    {vendor?.planExpiry ? new Date(vendor.planExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </p>
              </div>
            )}
            
          </div>
        </div>


        {/* ── available plans ── */}
        <div className="pt-4">
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-gray-900">Available Plans</h2>
            <p className="text-sm text-gray-500 mt-1">Choose the plan that best fits your business goals.</p>
          </div>

          {packages.length === 0 ? (
            <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-xl text-gray-500 text-sm">
              No plans available at the moment. Please contact support.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages
                .slice()
                .sort((a: any, b: any) => (a.price || 0) - (b.price || 0))
                .map((pkg: any, idx: number) => {
                const isCurrent = vendor?.packageId === pkg.id;
                const isPopular = pkg.isPopular === true;
                return (
                  <PricingCard
                    key={pkg.id}
                    pkg={pkg}
                    idx={idx}
                    isCurrent={isCurrent}
                    isPopular={isPopular}
                    upgrading={upgrading}
                    onCtaClick={handleSubscribe}
                  />
                );
              })}
            </div>
          )}
        </div>


        {/* ── how it works ── */}
        <div className="bg-white border border-gray-300 shadow-md rounded-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Secure & Instant Activation</h3>
              <p className="text-sm text-gray-600 mt-1 max-w-md">Upgrade your plan safely and get instant access to your new benefits.</p>
              <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-sm font-medium px-3 py-1.5 rounded-lg border border-emerald-200">
                <Lock className="w-4 h-4" />
                100% Secured by PhonePe
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 md:justify-end">
              {[
                { label: 'Select Plan', icon: <Package2 className="w-4 h-4 text-white" />, bg: 'bg-[#164e33]' },
                { label: 'Secure Checkout', icon: <CreditCard className="w-4 h-4 text-white" />, bg: 'bg-[#164e33]' },
                { label: 'Instant Benefits', icon: <Zap className="w-4 h-4 text-white" />, bg: 'bg-[#164e33]' },
              ].map((s, i) => (
                <div key={s.label} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                  <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
                    <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                      {s.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── billing faqs ── */}
        <div className="pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-2">What happens when my plan expires?</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Your profile will revert to the default Free tier. You will lose priority search ranking and premium monthly leads until you renew.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-2">Is the payment process secure?</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Yes, all payments are securely processed via PhonePe. We do not store your credit card or bank details on our servers.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-2">Do unused leads carry over?</h4>
              <p className="text-sm text-gray-600 leading-relaxed">No, monthly leads reset at the start of your billing cycle. Unused leads do not roll over to the next month.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-2">Can I upgrade my plan mid-cycle?</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Yes! You can upgrade anytime. The new features and leads will be activated immediately upon successful payment.</p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}




import React from 'react';
import { CheckCircle2, RefreshCw, Package2, Gem, Crown, Star, Zap } from 'lucide-react';

/* ─── per-plan visual config ─── */
const PALETTE = [
  { accent: '#164e33', bg: '#f0fdf4', border: '#bbf7d0' },  // Brand Green
  { accent: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd' },  // Sky Blue
  { accent: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },  // Violet
  { accent: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },  // Amber/Gold
  { accent: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },  // Slate
];

function getPlanStyle(pkg: any, idx: number = 0) {
  const n = (pkg?.name || '').toLowerCase();
  let color = PALETTE[idx % PALETTE.length];
  if (n.includes('diamond')) color = PALETTE[1];
  if (n.includes('platinum')) color = PALETTE[2];
  if (n.includes('gold')) color = PALETTE[3];
  if (n.includes('basic') || n.includes('starter') || n.includes('free')) color = PALETTE[0];
  if (n.includes('premium') || n.includes('pro')) color = PALETTE[4];

  let icon = <Package2 className="w-5 h-5" />;
  if (n.includes('diamond')) icon = <Gem className="w-5 h-5" />;
  if (n.includes('platinum') || n.includes('premium')) icon = <Crown className="w-5 h-5" />;
  if (n.includes('gold') || n.includes('star')) icon = <Star className="w-5 h-5" />;
  if (n.includes('zap') || n.includes('pro')) icon = <Zap className="w-5 h-5" />;

  let features: string[] = [];
  if (Array.isArray(pkg?.features) && pkg.features.length > 0) {
    features = pkg.features;
  } else if (pkg?.description) {
    features = pkg.description
      .split(/[,\n]/)
      .map((f: string) => f.trim())
      .filter(Boolean);
  }
  if (features.length === 0) {
    if (n.includes('diamond') || n.includes('premium'))
      features = ['Trusted Badge', 'Higher Ranking Priority', 'Advanced Visibility', 'Diamond Leads', 'Premium Exposure'];
    else if (n.includes('platinum'))
      features = ['Priority Listing', 'Verified Badge', 'Dedicated Leads', 'Priority Support'];
    else if (n.includes('gold'))
      features = ['Directory Listing', 'Verified Badge', 'Shared Leads', 'Email Support'];
    else
      features = ['Directory Listing', 'Verified Badge', 'Shared Leads', 'Standard Support'];
  }

  return {
    accentColor: color.accent,
    lightBg: color.bg,
    borderColor: color.border,
    icon,
    features,
    tagline: pkg?.description
      ? ''
      : n.includes('basic') || n.includes('starter')
        ? 'Get started on the marketplace'
        : 'Enhanced visibility for your business',
  };
}

interface PricingCardProps {
  pkg: any;
  idx?: number;
  isCurrent?: boolean;
  isPopular?: boolean;
  upgrading?: string | null;
  ctaText?: string;
  className?: string;
  onCtaClick?: (pkg: any) => void;
}

export default function PricingCard({
  pkg,
  idx = 0,
  isCurrent = false,
  isPopular = false,
  upgrading = null,
  ctaText = 'Upgrade Plan',
  className = '',
  onCtaClick,
}: PricingCardProps) {
  const style = getPlanStyle(pkg, idx);
  
  return (
    <div
      className={`relative bg-white rounded-2xl flex flex-col p-6 sm:p-8 mt-4 border transition-all duration-300 hover:shadow-xl hover:border-emerald-200 ${
        isCurrent
          ? 'border-[#164e33] shadow-md'
          : isPopular
          ? 'border-orange-200 shadow-lg ring-1 ring-orange-100'
          : 'border-gray-200 shadow-sm'
      } ${className}`}
    >
      {/* Top Ribbon for Popular */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#ef530f] text-white px-5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase shadow-md whitespace-nowrap z-10">
          Most Popular
        </div>
      )}

      {/* Header: Name and Icon */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: style.lightBg, color: style.accentColor }}>
          {style.icon}
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 capitalize">{pkg.name}</h3>
      </div>

      {/* Price */}
      <div className="flex items-end gap-1.5 mb-2 mt-2 flex-wrap">
        <span className="text-xl sm:text-2xl font-semibold text-slate-500 mb-1 leading-none">₹</span>
        <span className="text-3xl sm:text-4xl xl:text-[2.75rem] leading-none font-bold text-slate-900 tracking-tight">
          {pkg.price?.toLocaleString()}
        </span>
        <span className="text-slate-500 font-medium text-sm mb-1.5 ml-0.5 leading-none whitespace-nowrap">/ month</span>
      </div>

      {/* Tagline / Subtitle */}
      <p className="text-slate-600 text-sm pb-6 border-b border-gray-100 mb-6 min-h-[3rem]">
        {style.tagline || pkg.description || 'Elite tier with maximum visibility.'}
      </p>

      {/* Features List */}
      <div className="flex-1 mb-6">
        <ul className="space-y-3.5">
          {Array.isArray(style.features) &&
            style.features.slice(0, 5).map((f: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 font-medium text-sm leading-snug">{f}</span>
              </li>
            ))}
        </ul>
      </div>

      {/* Button at the bottom */}
      <button
        disabled={isCurrent || upgrading !== null}
        onClick={() => onCtaClick && onCtaClick(pkg)}
        className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] ${
          isCurrent
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
            : upgrading === pkg.id
            ? 'bg-[#164e33] text-white opacity-80 cursor-not-allowed shadow-md'
            : isPopular
            ? 'bg-[#ef530f] hover:bg-[#d84a0d] text-white shadow-md'
            : 'bg-[#164e33] hover:bg-[#113f29] text-white shadow-md'
        }`}
      >
        {upgrading === pkg.id ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : isCurrent ? (
          'Currently Active'
        ) : (
          ctaText
        )}
      </button>
    </div>
  );
}

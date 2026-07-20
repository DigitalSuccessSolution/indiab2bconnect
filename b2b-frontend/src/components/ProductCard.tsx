import React, { useState } from "react";
import {
  Star,
  ShieldCheck,
  MapPin,
  Navigation,
  CheckCircle2,
  PhoneCall,
  ArrowLeft,
  ArrowRight,
  Box,
} from "lucide-react";

interface ProductCardProps {
  item: any;
  handleViewClick: (e: any, type: string, id: any, vendor: any, item?: any) => void;
  isPriority?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  handleViewClick,
  isPriority = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images =
    item.images && item.images.length > 0
      ? item.images
      : item.imageUrl || item.image
        ? [item.imageUrl || item.image]
        : [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group">
      {/* Image Section */}
      <div className="h-56 w-full relative bg-gray-50 border-b border-gray-100">
        {images.length > 0 ? (
          <img
            src={images[currentImageIndex] || images[0]}
            alt={item.name}
            className="w-full h-full object-cover"
            loading={isPriority ? "eager" : "lazy"}
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <Box size={40} className="opacity-20" />
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute bottom-2 right-2 flex gap-1.5">
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-semibold text-[#164e33] flex items-center gap-1 shadow-sm border border-gray-100 uppercase tracking-wider">
            <Box size={12} className="text-[#164e33]" />{" "}
            {item.category?.name ||
              item.category ||
              (item.vendor?.categories && item.vendor.categories[0]?.name) ||
              "General"}
          </div>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ArrowLeft size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ArrowRight size={14} />
            </button>
          </>
        )}
      </div>

      <div className="py-2 px-2 flex flex-col flex-1">
        {/* Pagination Dots */}
        {images.length > 1 && (
          <div className="flex justify-center gap-1.5 mb-1.5">
            {images.map((_: any, idx: number) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? 'bg-teal-600' : 'bg-gray-200'}`}
              ></div>
            ))}
          </div>
        )}

        {/* Title & Price */}
        <div className="mb-1.5">
          <h3
            onClick={(e) => handleViewClick(e, "PRODUCT", item.id, item.vendor, item)}
            className="text-[15px] font-semibold text-[#1a237e] hover:underline cursor-pointer leading-tight mb-2 min-h-[40px]"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.name}
          </h3>
          <p className="text-[18px] font-semibold text-slate-900">
            {item.price ? `₹ ${item.price.toLocaleString()}` : "Ask Price"}
          </p>
        </div>

        {/* Main Action Button */}
        <button
          onClick={(e) => handleViewClick(e, "PRODUCT", item.id, item.vendor, item)}
          className="w-full py-2 bg-[#164e33] hover:bg-[#113f29] text-white rounded text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors mb-1.5 cursor-pointer"
        >
          Contact Supplier
        </button>

        {/* Specifications Table */}
        {(() => {
          if (!item.specifications) return null;
          try {
            const parsed = typeof item.specifications === "string" && item.specifications.startsWith("[")
              ? JSON.parse(item.specifications)
              : null;
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].key) {
              return (
                <div className="mb-1">
                  {parsed.slice(0, 4).map((spec: any, idx: number) => (
                    <div key={idx} className={`flex justify-between items-center py-0.5 leading-tight ${idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}>
                      <span style={{ fontSize: '10px' }} className="text-slate-600 truncate w-1/2 capitalize">{spec.key}</span>
                      <span style={{ fontSize: '10px' }} className="text-slate-700 font-medium truncate ml-2 max-w-[50%] text-right capitalize">{spec.value}</span>
                    </div>
                  ))}
                  {parsed.length > 4 && (
                    <div className="flex justify-end mt-0.5 pr-1">
                      <span 
                        onClick={(e) => handleViewClick(e, "PRODUCT", item.id, item.vendor, item)}
                        className="text-[8px] text-[#164e33] font-semibold hover:text-[#113f29] hover:underline cursor-pointer uppercase tracking-wider"
                      >
                        +{parsed.length - 4} MORE
                      </span>
                    </div>
                  )}
                </div>
              );
            }
            const textSpec = typeof item.specifications === "string" ? item.specifications.replace(/\n/g, ' ') : "";
            if (textSpec.trim().length > 0) {
               return <div style={{ fontSize: '10px' }} className="mb-1 text-gray-600 line-clamp-3 leading-tight px-1 capitalize">{textSpec}</div>;
            }
          } catch (e) {
            return null;
          }
          return null;
        })()}

        {/* Bottom Section (pushed down to align buttons) */}
        <div className="mt-auto flex flex-col gap-1.5">
          {/* Vendor Info */}
          <div>
            <div className="flex items-start gap-1 mb-0.5">
              <MapPin size={12} className="text-gray-600 mt-0.5 shrink-0" />
              <span style={{ fontSize: '12px' }} className="font-semibold text-gray-800 line-clamp-1 capitalize">
                {item.vendor?.city || "India"}
                {item.vendor?.area ? `, ${item.vendor.area}` : ""}
              </span>
            </div>
            <p style={{ fontSize: '10px' }} className="font-medium text-gray-600 truncate cursor-pointer hover:underline capitalize">
              {item.vendor?.businessName || "Verified Supplier"}
            </p>
          </div>

          {/* Ratings & TrustSeal row */}
          <div className="flex items-center justify-between flex-nowrap text-[10px]">
            <div className="flex items-center gap-1 whitespace-nowrap">
              {item.vendor?.trustBadge && item.vendor.trustBadge !== 'NONE' ? (
                <div className="flex items-center gap-0.5 text-[#e6a100] font-semibold uppercase shrink-0">
                  <ShieldCheck size={10} className={item.vendor.trustBadge === 'TRUST_SEAL' ? 'text-blue-500' : 'text-[#e6a100]'} />
                  <span style={{ fontSize: '9px' }} className={item.vendor.trustBadge === 'TRUST_SEAL' ? 'text-blue-500' : ''}>
                    {item.vendor.trustBadge.replace('_', '')}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5 text-slate-600">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="#0d9488"/>
                      <path d="M7 13l3 3 7-7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontSize: '9px' }}>Mobile</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-slate-600">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="#0d9488"/>
                      <path d="M7 13l3 3 7-7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontSize: '9px' }}>Email</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-0.5 text-gray-500 whitespace-nowrap shrink-0">
              <CheckCircle2 size={10} />
              <span style={{ fontSize: '9px' }}>
                {item.vendor?.createdAt 
                  ? Math.max(1, new Date().getFullYear() - new Date(item.vendor.createdAt).getFullYear()) 
                  : 1} yrs
              </span>
            </div>

            {(() => {
              const reviews = item.vendor?.reviewsReceived || [];
              const reviewCount = reviews.length;
              if (reviewCount === 0) return <div className="w-16" />; // spacer

              const avgRating = (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewCount).toFixed(1);
              const roundedRating = Math.round(Number(avgRating));

              return (
                <div className="flex items-center gap-0.5 whitespace-nowrap shrink-0">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={9}
                        className={i <= roundedRating ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '9px' }} className="font-medium text-gray-700">
                    {avgRating} <span style={{ fontSize: '9px' }} className="text-gray-500">({reviewCount})</span>
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Secondary Action */}
          <button
            onClick={(e) => handleViewClick(e, "CALL", item.id, item.vendor, item)}
            className="w-full mt-1 py-1.5 border border-[#164e33] text-[#164e33] hover:bg-emerald-50 rounded text-[13px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PhoneCall size={14} /> Call Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

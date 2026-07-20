"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Heart,
  Sparkles,
  Wrench,
  ShoppingBag,
  CheckCircle,
  Award,
  Zap,
  Headphones,
  ShieldCheck,
  Building2,
  Diamond,
  Utensils,
  Flower2,
  Waves,
  Scissors,
  AirVent,
  Car,
  Bike,
  Film,
  ShoppingCart,
  Lightbulb,
  Handshake,
} from "lucide-react";

const transitionStyle = { transition: "all 350ms cubic-bezier(0.25, 1, 0.5, 1)" };

const ServiceSection = ({
  title,
  subtitle,
  icon: TitleIcon,
  iconBg,
  items,
  router,
}) => (
  <div className="flex flex-col h-full py-4">
    <div className="flex justify-between items-start gap-4 mb-5">
      <div className="flex items-center gap-3 md:gap-4">
        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-slate-500 text-[12px] sm:text-[13px] md:text-sm mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
      <button
        onClick={() => router.push("/search")}
        className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-slate-200 text-[11px] sm:text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-all hover:border-slate-300 active:scale-95 shrink-0"
      >
        View all <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
      </button>
    </div>

    <div className="flex sm:grid sm:grid-cols-3 gap-3 md:gap-4 mt-auto overflow-x-auto pb-4 sm:pb-0 snap-x hide-scrollbar px-1 -mx-1 sm:px-0 sm:mx-0">
      {items.map((item, idx) => (
        <div
          key={idx}
          onClick={() =>
            router.push(`/search?q=${encodeURIComponent(item.label)}`)
          }
          className="group cursor-pointer hover:-translate-y-1 w-[130px] sm:w-auto sm:min-w-0 shrink-0 snap-start"
          style={transitionStyle}
        >
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-2 sm:mb-3 border border-slate-100 bg-slate-50">
            <img
              src={item.image}
              alt={item.label}
              className="w-full h-full object-cover group-hover:scale-105"
              style={transitionStyle}
            />
            <div
              className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 md:bottom-3 md:left-3 bg-white/95 backdrop-blur-sm p-1.5 sm:p-2 rounded-lg shadow-sm border border-slate-200 group-hover:scale-110 group-hover:bg-slate-50"
              style={transitionStyle}
            >
              <item.icon
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 group-hover:text-emerald-700"
                style={transitionStyle}
                strokeWidth={1.8}
              />
            </div>
          </div>
          <p
            className="text-center font-medium text-slate-700 text-[12px] sm:text-[13px] md:text-sm group-hover:text-emerald-800 leading-tight"
            style={transitionStyle}
          >
            {item.label}
          </p>
        </div>
      ))}
    </div>
  </div>
);

const FeaturesBar = () => {
  return (
    <div className="mt-8 md:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {[
        {
          icon: ShieldCheck,
          title: "Verified & Trusted",
          desc: "Quality checked",
          color: "text-emerald-700",
          bg: "bg-emerald-50",
        },
        {
          icon: Award,
          title: "Wide Range",
          desc: "100+ categories",
          color: "text-emerald-700",
          bg: "bg-emerald-50",
        },
        {
          icon: Handshake,
          title: "Easy & Reliable",
          desc: "Quick bookings",
          color: "text-emerald-700",
          bg: "bg-emerald-50",
        },
        {
          icon: Headphones,
          title: "24/7 Support",
          desc: "We're here for you",
          color: "text-emerald-700",
          bg: "bg-emerald-50",
        },
      ].map((f, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4 bg-white border border-slate-100 rounded-xl p-4 sm:p-5 shadow-sm group hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-8px_rgba(16,185,129,0.15)] hover:border-emerald-200 cursor-pointer relative overflow-hidden"
            style={{ transition: "all 400ms cubic-bezier(0.25, 1, 0.5, 1)" }}
          >
            <div
              className={`p-3 rounded-xl ${f.bg} shrink-0 group-hover:scale-110 group-hover:bg-emerald-100 relative z-10`}
              style={{ transition: "all 400ms cubic-bezier(0.25, 1, 0.5, 1)" }}
            >
              <f.icon
                className={`w-5 h-5 md:w-6 md:h-6 ${f.color}`}
                strokeWidth={1.8}
              />
            </div>
            <div className="min-w-0 flex-1 relative z-10">
              <h4 
                className="font-semibold text-slate-800 text-[13px] md:text-[15px] leading-tight group-hover:text-emerald-900"
                style={{ transition: "all 300ms ease" }}
              >
                {f.title}
              </h4>
              <p 
                className="text-slate-500 text-[11px] md:text-xs mt-1 md:mt-1.5 leading-snug group-hover:text-slate-700"
                style={{ transition: "all 300ms ease" }}
              >
                {f.desc}
              </p>
            </div>
            
            {/* Very subtle background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-50/0 group-hover:from-emerald-50/50 group-hover:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        ))}
      </div>
    );
  };

const FeaturedServices = () => {
  const router = useRouter();

  const sections = [
    {
      title: "Wedding Requisites",
      subtitle: "Everything you need for celebration.",
      icon: Heart,
      iconBg: "bg-orange-50",
      items: [
        {
          label: "Tent & Decor Material",
          icon: Building2,
          image:
            "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=400&auto=format&fit=crop",
        },
        {
          label: "Catering Equipment",
          icon: Utensils,
          image:
            "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=400&auto=format&fit=crop",
        },
        {
          label: "Bulk Return Gifts",
          icon: Diamond,
          image:
            "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop",
        },
      ],
    },
    {
      title: "Beauty & Spa",
      subtitle: "Relax, rejuvenate & look best.",
      icon: Flower2,
      iconBg: "bg-green-50",
      items: [
        {
          label: "Beauty Parlours",
          icon: Flower2,
          image:
            "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=400&auto=format&fit=crop",
        },
        {
          label: "Spa & Massages",
          icon: Waves,
          image:
            "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c3BhJTIwYW5kbWFzc2FnZXxlbnwwfHwwfHx8MA%3D%3D",
        },
        {
          label: "Salons",
          icon: Scissors,
          image:
            "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=400&auto=format&fit=crop",
        },
      ],
    },
    {
      title: "Repairs & Services",
      subtitle: "Expert help for home and vehicles.",
      icon: Wrench,
      iconBg: "bg-blue-50",
      items: [
        {
          label: "AC Service",
          icon: AirVent,
          image:
            "https://plus.unsplash.com/premium_photo-1682126012378-859ca7a9f4cf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8QUMlMjBSZXBhaXJ8ZW58MHx8MHx8fDA%3D",
        },
        {
          label: "Car Service",
          icon: Car,
          image:
            "https://media.istockphoto.com/id/470928420/photo/mechanic-working-on-a-car-in-a-garage.jpg?s=612x612&w=0&k=20&c=XlTTIdEau0WSPeT8GU3ZBz4DtTNkZrc4wEu5YpKaL18=",
        },
        {
          label: "Bike Service",
          icon: Bike,
          image:
            "https://images.unsplash.com/photo-1623220988124-bcd1bad9a408?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fEJpa2UlMjBtb3RvciUyMFJlcGFpcnxlbnwwfHwwfHx8MA%3D%3D",
        },
      ],
    },
    {
      title: "Daily Needs",
      subtitle: "Everyday essentials in one place.",
      icon: ShoppingBag,
      iconBg: "bg-purple-50",
      items: [
        {
          label: "Movies",
          icon: Film,
          image:
            "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=400&auto=format&fit=crop",
        },
        {
          label: "Grocery",
          icon: ShoppingCart,
          image:
            "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop",
        },
        {
          label: "Electricians",
          icon: Lightbulb,
          image:
            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-2 font-sans tracking-tight">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex flex-col gap-10 md:gap-14">
          {sections.map((section, index) => (
            <ServiceSection key={index} {...section} router={router} />
          ))}
        </div>
        <FeaturesBar />
      </div>
    </div>
  );
};

export default FeaturedServices;

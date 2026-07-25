"use client";

import React from "react";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Youtube,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const Footer = () => {
  const [settings, setSettings] = React.useState({
    websiteName: "India B2B Connect",
    contactEmail: "support@indiab2bconnect.com",
    contactPhone: "+91 1800 123 4567",
    address: "Sector 62, Noida, Uttar Pradesh, India",
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
  });

  React.useEffect(() => {
    apiFetch("/settings")
      .then((res) => {
        if (res && res.data) {
          setSettings((prev) => ({
            ...prev,
            ...res.data,
          }));
        }
      })
      .catch((err) => console.error("Error fetching settings:", err));
  }, []);

  return (
    <>
      <div className="w-full h-40 sm:h-60 md:h-80 lg:h-[400px] xl:h-[480px] relative select-none pointer-events-none -mb-8 sm:-mb-12 md:-mb-20 z-10">
        <img
          src="/footer.png"
          alt="Landscape"
          className="w-full h-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d3a26] to-[95%]" />
      </div>

      <footer className="bg-[#0d3a26] text-white relative overflow-hidden pt-10 md:pt-20">
        {/* Decorative Landscape Illustration */}

        <div className="container mx-auto px-5 sm:px-6 md:px-12 lg:px-20 pt-8 md:pt-12 pb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-8 mb-10">
            {/* Brand & Description */}
            <div className="col-span-2 lg:col-span-1 space-y-4 text-center md:text-left">
              <Link href="/" className="inline-block bg-white p-2 md:p-2.5 rounded-lg">
                <img
                  src="/logo.png"
                  alt={settings.websiteName}
                  className="h-12 md:h-16 w-auto object-contain"
                />
              </Link>
              <p className="text-[13px] sm:text-sm font-normal text-white/60 leading-relaxed max-w-xs mx-auto md:mx-0">
                Connect with leading business services and experts worldwide.
                India&apos;s largest B2B marketplace for trusted discovery.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                {[
                  { icon: Facebook, url: settings.facebookUrl },
                  { icon: Twitter, url: settings.twitterUrl },
                  { icon: Linkedin, url: settings.linkedinUrl },
                  { icon: Instagram, url: settings.instagramUrl },
                  { icon: Youtube, url: settings.youtubeUrl },
                ].map((social, idx) =>
                  social.url || idx < 3 ? (
                    <Link
                      key={idx}
                      href={social.url || "#"}
                      target="_blank"
                      className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg border border-white/10 transition-all duration-300 group hover:scale-110 hover:bg-[#FF4F00] hover:border-[#FF4F00] hover:shadow-lg hover:shadow-[#FF4F00]/20"
                    >
                      <social.icon className="w-5 h-5 text-white/80 transition-colors group-hover:text-white" />
                    </Link>
                  ) : null,
                )}
              </div>
            </div>

            {/* Service Categories */}
            <div className="col-span-1 space-y-3 md:space-y-4">
              <h4 className="text-sm font-semibold text-white/90 uppercase tracking-wider relative pb-2 inline-block">
                Top Industries
                <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-[#FF4F00] rounded-full" />
              </h4>
              <ul className="space-y-2">
                {[
                  {
                    label: "Industrial Machines",
                    query: "Industrial Machines",
                  },
                  { label: "Drugs & Pharma", query: "Drugs & Pharma" },
                  { label: "Metals", query: "Metals" },
                  { label: "Chemicals", query: "Chemicals" },
                  { label: "IT & Computers", query: "IT & Computers" },
                  { label: "Business Services", query: "Business Services" },
                ].map((service) => (
                  <li key={service.label}>
                    <Link
                      href={`/search?q=${encodeURIComponent(service.query)}`}
                      className="text-[13px] sm:text-sm font-normal text-white/90 hover:text-[#FF4F00] transition-all duration-300 inline-block relative py-0.5 group/link"
                    >
                      {service.label}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#FF4F00] transition-all duration-300 group-hover/link:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="col-span-1 space-y-3 md:space-y-4">
              <h4 className="text-sm font-semibold text-white/90 uppercase tracking-wider relative pb-2 inline-block">
                Company
                <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-[#FF4F00] rounded-full" />
              </h4>
              <ul className="space-y-2">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Contact Us", href: "/contact" },
                  { label: "Find Suppliers", href: "/find-suppliers" },
                  { label: "Sell with us", href: "/sell" },
                  { label: "Post a Requirement", href: "/post-requirement" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-[13px] sm:text-sm font-normal text-white/90 hover:text-[#FF4F00] transition-all duration-300 inline-block relative py-0.5 group/link"
                    >
                      {item.label}
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#FF4F00] transition-all duration-300 group-hover/link:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Support */}
            <div className="col-span-2 lg:col-span-1 space-y-4 md:space-y-6">
              <h4 className="text-sm font-semibold text-white/90 uppercase tracking-wider relative pb-2 inline-block">
                Contact
                <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-[#FF4F00] rounded-full" />
              </h4>
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-start gap-3 sm:gap-4 text-white/90 text-sm group cursor-default">
                  <div className="flex items-center justify-center pt-0.5 shrink-0 transition-all">
                    <MapPin className="w-5 h-5 text-white/70 group-hover:text-[#FF4F00] transition-colors" />
                  </div>
                  <span className="text-sm font-normal text-white/70 group-hover:text-[#FF4F00] transition-colors">
                    {settings.address ||
                      "Sector 62, Noida, Uttar Pradesh, India"}
                  </span>
                </li>
                <li className="flex items-center gap-3 sm:gap-4 text-white/90 text-sm group cursor-pointer hover:text-[#FF4F00] transition-colors">
                  <div className="flex items-center justify-center shrink-0 transition-all">
                    <Phone className="w-5 h-5 text-white/70 group-hover:text-[#FF4F00] transition-colors" />
                  </div>
                  <span className="text-sm font-normal text-white/70 group-hover:text-[#FF4F00] transition-colors">
                    {settings.contactPhone || "+91 1800 123 4567"}
                  </span>
                </li>
                <li className="flex items-center gap-3 sm:gap-4 text-white/90 text-sm group cursor-pointer hover:text-[#FF4F00] transition-colors">
                  <div className="flex items-center justify-center shrink-0 transition-all">
                    <Mail className="w-5 h-5 text-white/70 group-hover:text-[#FF4F00] transition-colors" />
                  </div>
                  <span className="truncate text-sm font-normal text-white/70 group-hover:text-[#FF4F00] transition-colors">
                    {settings.contactEmail || "support@indiab2bconnect.com"}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 text-center md:text-left">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] sm:text-xs font-normal text-white/60">
                © {new Date().getFullYear()} {settings.websiteName}. All rights
                reserved.
              </p>
              <p className="text-[10px] sm:text-[11px] font-normal text-white/50">
                Designed and developed by <a href="https://digitalsuccesssolutions.in/" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#FF4F00] transition-colors underline underline-offset-2">Digital Success Solutions</a>
              </p>
            </div>
            <div className="flex items-center justify-center flex-wrap gap-4 md:gap-8 pt-2 md:pt-0">

              <Link
                href="/privacy-policy"
                className="text-xs font-normal text-white/80 hover:text-[#FF4F00] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-xs font-normal text-white/80 hover:text-[#FF4F00] transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Settings,
  Globe,
  CreditCard,
  BarChart3,
  ChevronRight,
  Bell,
  Menu,
  Package,
  Headphones,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function VendorSidebar({
  isCollapsed,
  onToggle,
  mobileOpen,
  setMobileOpen,
}) {
  const { user } = useAuth();
  const pathname = usePathname();

  // --------------------------------------------------------
  // VENDOR CONFIGURATION
  // --------------------------------------------------------
  const vendorSections = [
    {
      section: "Overview",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, href: "/vendor/dashboard" },
        { label: "Notifications", icon: Bell, href: "/vendor/notifications" },
        { label: "Performance", icon: BarChart3, href: "/vendor/ranking" },
      ],
    },
    {
      section: "Inventory & Sales",
      items: [
        { label: "Products", icon: Package, href: "/vendor/products" },
        { label: "Leads", icon: Target, href: "/vendor/leads" },
      ],
    },
    {
      section: "Account",
      items: [
        { label: "Profile", icon: Globe, href: "/vendor/profile" },
        { label: "Billing", icon: CreditCard, href: "/vendor/billing" },
        { label: "Settings", icon: Settings, href: "/vendor/settings" },
      ],
    },
  ];

  // --------------------------------------------------------
  // UI COMPONENTS
  // --------------------------------------------------------
  return (
    <>
      {/* Main Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-[#062d1d] border-r border-[#062d1d] flex flex-col transition-all duration-300 z-40 ${
          mobileOpen ? "translate-x-0 w-64 " : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-[72px]" : "lg:w-64"}`}
      >
        {/* Brand Header & Toggle */}
        <div
          className={`relative flex items-center justify-between border-b border-[#ffffff]/10 shrink-0 ${
            isCollapsed ? "h-20 flex-col py-4" : "h-[80px] px-4"
          }`}
        >
          <Link
            href="/"
            className={`flex items-center gap-3 group ${isCollapsed ? "justify-center" : ""}`}
            title="Dashboard"
          >
            {isCollapsed ? (
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                VP
              </div>
            ) : (
              <span className="text-white font-semibold text-base uppercase truncate pl-2 tracking-wide">
                VENDOR PANEL
              </span>
            )}
          </Link>

          {/* Desktop Toggle Button */}
          <button
            onClick={onToggle}
            className={`hidden lg:flex items-center justify-center p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 ${
              isCollapsed ? "mt-2" : ""
            }`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation Core */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {vendorSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              {/* Section Header (Hidden when collapsed) */}
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-medium uppercase tracking-wider text-white/40 mb-3">
                  {section.section}
                </p>
              )}

              {/* Section Items */}
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={isCollapsed ? item.label : ""}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                      isActive
                        ? "bg-[#124131] text-white"
                        : "text-white/70 hover:text-white hover:bg-white/5 font-normal"
                    }`}
                  >
                    <div
                      className={`transition-all ${
                        isActive ? "text-white" : "text-white/60 group-hover:text-white"
                      }`}
                    >
                      <item.icon className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[15px] font-normal">{item.label}</span>
                        {item.badge && (
                          <span className="bg-[#BA2B1E] text-white text-xs font-medium px-2 py-0.5 rounded-lg">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>


      </aside>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}

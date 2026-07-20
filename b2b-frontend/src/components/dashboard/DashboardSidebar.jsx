"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Users,
  Settings,
  Globe,
  Briefcase,
  CreditCard,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Bell,
  Menu,
  Package,
  Layers,
  Building2,
  Lock,
  History,
  Headphones,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function DashboardSidebar({
  isCollapsed,
  onToggle,
  mobileOpen,
  setMobileOpen,
}) {
  const { user, hasPermission } = useAuth();
  const pathname = usePathname();
  const userRole = user?.role || "USER";

  const rolePrefix = userRole === "SUPERADMIN" ? "/b2b-india/super-admin" : `/b2b-india/${userRole.toLowerCase()}`;

  // --------------------------------------------------------
  // HOW TO ADD OR REMOVE MENU ITEMS:
  // --------------------------------------------------------
  // 1. Find the section where you want to add the menu (e.g. "Operations")
  // 2. Add a new object to the 'items' array:
  //    { label: "Menu Name", icon: IconName, href: `${rolePrefix}/your-url`, permission: "your_permission" }
  // 3. If you want everyone to see it, set permission: null
  // --------------------------------------------------------
  const adminSections = [
    {
      section: "Dashboard",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, href: `${rolePrefix}/dashboard`, permission: "dashboard_read" },
        { label: "Analytics", icon: BarChart3, href: `${rolePrefix}/analytics`, permission: "analytics_read" },
        { label: "Activity Logs", icon: History, href: `${rolePrefix}/activity`, permission: "activity_read" },
        { label: "Notifications", icon: Bell, href: `${rolePrefix}/notifications`, permission: null }, // Null means anyone can see if section isn't empty
      ]
    },
    {
      section: "Operations",
      items: [
        { label: "Vendors", icon: Building2, href: `${rolePrefix}/vendor-approvals`, permission: "vendors_read" },
        { label: "Products", icon: Package, href: `${rolePrefix}/offering-approvals`, permission: "products_read" },
        { label: "Leads", icon: Target, href: `${rolePrefix}/leads`, permission: "leads_read" },
        { label: "Users", icon: Users, href: `${rolePrefix}/users`, permission: "users_read" },
        { label: "Inquiries", icon: Headphones, href: `${rolePrefix}/inquiries`, permission: "inquiries_read" },
      ]
    },
    {
      section: "Ecosystem",
      items: [
        { label: "Categories", icon: Layers, href: `${rolePrefix}/categories`, permission: "categories_read" },
        { label: "Packages", icon: Briefcase, href: `${rolePrefix}/packages`, permission: "packages_read" },
      ]
    },
    {
      section: "Administration",
      items: [
        { label: "Team & Roles", icon: ShieldCheck, href: `${rolePrefix}/admins`, permission: "admins_read" },
        { label: "Transactions", icon: CreditCard, href: `${rolePrefix}/transactions`, permission: "transactions_read" },
        { label: "Profile", icon: Globe, href: `${rolePrefix}/profile`, permission: null },
        { label: "Global Settings", icon: Settings, href: `${rolePrefix}/settings`, permission: "settings_read" },
      ]
    }
  ];

  // --------------------------------------------------------
  // RENDER LOGIC
  // --------------------------------------------------------
  let currentNav = [];

  if (["SUPERADMIN", "ADMIN", "SUBADMIN"].includes(userRole)) {
    // Filter sections and items based on permissions
    currentNav = adminSections.map((section) => {
      const filteredItems = section.items.filter((item) => {
        if (userRole === "SUPERADMIN") return true; // Superadmin bypasses restrictions
        if (!item.permission) return true; // Unprotected routes available to all admins
        return hasPermission?.(item.permission); // Strictly check permission
      });
      return { ...section, items: filteredItems };
    }).filter((section) => section.items.length > 0); // Hide completely empty sections
  }

  // --------------------------------------------------------
  // UI COMPONENTS
  // --------------------------------------------------------
  return (
    <>
      {/* Main Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-[#062d1d] flex flex-col transition-all duration-300 z-40 shadow-xl ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
          } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Brand Header & Toggle */}
        <div
          className={`relative flex items-center justify-between border-b border-[#ffffff]/10 shrink-0 h-16 ${isCollapsed ? "justify-center" : "px-5"
            }`}
        >
          <Link
            href="/"
            className={`flex items-center gap-3 group ${isCollapsed ? "justify-center" : ""}`}
            title="Dashboard"
          >
            {isCollapsed ? (
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                {userRole === "SUPERADMIN" ? "SA" : userRole === "SUBADMIN" ? "S-A" : "AD"}
              </div>
            ) : (
              <span className="text-white font-semibold text-sm tracking-wider uppercase">
                {userRole === "SUPERADMIN" ? "SUPER ADMIN" : userRole === "SUBADMIN" ? "SUB ADMIN" : "ADMIN PANEL"}
              </span>
            )}
          </Link>

          {/* Desktop Toggle Button */}
          <button
            onClick={onToggle}
            className={`hidden lg:flex absolute -right-3 top-5 items-center justify-center w-6 h-6 rounded-full bg-[#124131] border border-[#ffffff]/20 text-white/70 hover:text-white transition-all shadow-md z-50`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3 ml-0.5" />
            ) : (
              <ChevronLeft className="w-3 h-3 mr-0.5" />
            )}
          </button>
        </div>

        {/* Navigation Core */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {currentNav.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              {/* Section Header removed as requested */}

              {/* Section Items */}
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={isCollapsed ? item.label : ""}
                    className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"} py-2.5 rounded-lg transition-all group relative ${isActive
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/5 font-normal"
                      }`}
                  >
                    <div
                      className={`flex items-center justify-center transition-all ${isActive ? "text-white" : "text-white/60 group-hover:text-white"
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

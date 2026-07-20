"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import VendorSidebar from "@/components/dashboard/VendorSidebar";
import NotificationDropdown from "@/components/dashboard/NotificationDropdown";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  Settings,
  HelpCircle,
  ChevronDown,
  UserCircle,
  LogOut,
  Menu,
  X,
  Headset,
} from "lucide-react";
import io from 'socket.io-client';
import Swal from 'sweetalert2';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [globalToast, setGlobalToast] = React.useState<string | null>(null);
  const profileRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (pathname === "/super-admin" || pathname === "/admin") return;

    if (!loading) {
      const path = pathname;

      if (!user) {
        // Fix for infinite redirect loop: clear the middleware cookie if local state has no user
        document.cookie = "userRole=loggedout; path=/;";
        
        if (pathname.startsWith("/b2b-india")) {
          router.push("/secure-login");
        } else {
          router.push("/login");
        }
        return;
      }

      // 1. Kick out Buyers
      if (user.role === "BUYER") {
        router.push("/");
        return;
      }

      // 2. Dashboard Protection Logic
      const rolePathMap: Record<string, string> = {
        SUPERADMIN: "super-admin",
        ADMIN: "admin",
        SUBADMIN: "subadmin",
        VENDOR: "vendor", // Vendor remains unchanged
      };

      const expectedPrefix = user.role === 'VENDOR' ? '/vendor' : `/b2b-india/${rolePathMap[user.role] || ""}`;

      // If path is under /b2b-india, pathPrefix is e.g. /b2b-india/admin
      // Wait, let's just check if it matches the expected prefix.
      const isB2bIndiaPath = path.startsWith("/b2b-india");
      const isVendorPath = path.startsWith("/vendor");

      if (isB2bIndiaPath || isVendorPath) {
        if (!path.startsWith(expectedPrefix)) {
          router.push(`${expectedPrefix}/dashboard`);
          return;
        }
      }

      if (isVendorPath && user.role === 'VENDOR') {
        if (!user.vendor?.id && path !== '/vendor/profile') {
            router.push('/vendor/profile');
            return;
        }
      }

      // PBAC: Dynamic Route Protection for ADMIN/SUBADMIN
      const isAdminOrSub = ["ADMIN", "SUBADMIN"].includes(user.role);
      if (isB2bIndiaPath && isAdminOrSub && user.role !== "SUPERADMIN") {
        const prefix = `/b2b-india/${rolePathMap[user.role]}`;
        if (path.startsWith(`${prefix}/leads`) && !hasPermission("leads_read")) router.push(`${prefix}/dashboard`);
        if (path.startsWith(`${prefix}/vendors`) && !hasPermission("vendors_read")) router.push(`${prefix}/dashboard`);
        if (path.startsWith(`${prefix}/products`) && !hasPermission("products_read")) router.push(`${prefix}/dashboard`);
        if (path.startsWith(`${prefix}/users`) && !hasPermission("users_read")) router.push(`${prefix}/dashboard`);
        if (path.startsWith(`${prefix}/categories`) && !hasPermission("categories_read")) router.push(`${prefix}/dashboard`);
        if (path.startsWith(`${prefix}/admins`) && !hasPermission("admins_read")) router.push(`${prefix}/dashboard`);
      }
    }
  }, [user, loading, router, pathname]);

  const getProfileLink = () => {
    if (!user) return "#";
    if (user.role === "SUPERADMIN") return "/b2b-india/super-admin/profile";
    if (user.role === "ADMIN") return "/b2b-india/admin/profile";
    if (user.role === "SUBADMIN") return "/b2b-india/subadmin/profile";
    return "/vendor/profile";
  };

  // GLOBAL SOCKET CONNECTION
  useEffect(() => {
    if (!user || user.role !== 'VENDOR' || !user.vendor?.id) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socketUrl = apiUrl.replace(/\/api(\/v1)?\/?$/, '');

    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      console.log('[GLOBAL SOCKET] Connected to server!', socket.id);
      socket.emit('join_vendor_room', user.vendor.id);
    });

    socket.on('new_lead', (newLead) => {
      // Play modern notification sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Browser blocked autoplay:', e));
      } catch (e) { console.log(e); }

      // Show global toast
      setGlobalToast(`New lead received from ${newLead.buyerName || 'a buyer'} in ${newLead.city || 'your area'}!`);
      setTimeout(() => setGlobalToast(null), 5000);

      // Dispatch custom event to notify specific pages (like Leads page)
      window.dispatchEvent(new CustomEvent('new_lead', { detail: newLead }));
    });

    return () => { socket.disconnect(); };
  }, [user]);

  const baseRoles = ["/b2b-india/super-admin", "/b2b-india/admin", "/b2b-india/subadmin"];
  if (baseRoles.includes(pathname)) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#164e33]/20 border-t-[#164e33] rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 flex font-sans antialiased">
      {globalToast && (
        <div className="fixed top-24 right-6 bg-[#164e33] text-white px-6 py-4 rounded-xl shadow-2xl z-[100] animate-bounce-in flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-xl">🔔</span>
          </div>
          <div>
            <h4 className="font-bold text-sm">Notification</h4>
            <p className="text-sm opacity-90">{globalToast}</p>
          </div>
        </div>
      )}
      {user.role === "VENDOR" ? (
        <VendorSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
        />
      ) : (
        <DashboardSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
        />
      )}
      <div
        className={`flex-1 min-w-0 min-h-screen flex flex-col relative transition-all duration-300 ml-0 ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}`}
      >
        {/* Top Header */}
        <header
          id="main-dashboard-header"
          className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30"
        >
          <div className="flex items-center gap-5">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <div className="shrink-0 flex items-center">
              <span className="text-xl font-semibold text-gray-900 tracking-tight">
                INDIA B2B CONNECT
              </span>
            </div>
          </div>

          {/* Header Spacer (Search removed) */}
          <div className="flex-1" />

          <div className="flex items-center gap-4 lg:gap-6">
            {user?.role === 'VENDOR' && (
              <button
                onClick={() => router.push('/vendor/help')}
                className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                title="Help & Support"
              >
                <Headset className="w-5 h-5" />
              </button>
            )}
            <NotificationDropdown />

            <div ref={profileRef} className="relative">
              <div
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 overflow-hidden transition-all group-hover:border-emerald-200 shadow-sm">
                  {user.avatar || user.profileImage || user.vendor?.logoUrl ? (
                    <img
                      src={
                        user.avatar || user.profileImage || user.vendor?.logoUrl
                      }
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
                      {user.name ? user.name[0].toUpperCase() : "M"}
                    </div>
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">
                    {user.name && isNaN(Number(user.name)) ? user.name : "User"}
                  </p>
                  <p className="text-[11px] font-medium text-gray-500 leading-tight capitalize">
                    {user.role === "SUPERADMIN" ? "Super Admin" : user.role === "SUBADMIN" ? "Sub Admin" : user.role === "ADMIN" ? "Admin" : user.role.toLowerCase()}
                  </p>
                </div>
              </div>

              {/* Profile Dropdown Overlay */}
              <div
                className={`fixed sm:absolute inset-x-4 sm:inset-x-auto sm:right-0 mt-3 sm:w-56 bg-white border border-gray-100 rounded-lg  transition-all z-50 p-2 transform origin-top-right ${isProfileOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"}`}
              >
                <div className="px-3 py-2.5 border-b border-gray-100 mb-1 sm:hidden">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">
                    {user.name && isNaN(Number(user.name)) ? user.name : "User"}
                  </p>
                  <p className="text-[11px] font-medium text-gray-500 leading-tight mt-0.5 capitalize">
                    {user.role === "SUPERADMIN" ? "Super Admin" : user.role === "SUBADMIN" ? "Sub Admin" : user.role === "ADMIN" ? "Admin" : user.role.toLowerCase()}
                  </p>
                </div>

                <button
                  onClick={() => {
                    router.push(getProfileLink());
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all"
                >
                  <UserCircle className="w-4 h-4 text-gray-500" />
                  View Profile
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    Swal.fire({
                      title: 'Logout',
                      text: "Are you sure you want to logout?",
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#ef530f',
                      cancelButtonColor: '#94a3b8',
                      confirmButtonText: 'Yes, logout!'
                    }).then((result) => {
                      if (result.isConfirmed) {
                        logout();
                      }
                    });
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-all mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 animate-fade-in dashboard-content overflow-y-auto bg-[#f8fafc]">
          {children}
        </main>
      </div>
    </div>
  );
}

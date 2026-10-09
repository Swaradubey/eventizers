"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import SparkleEffect from "../../components/SparkleEffect";
import ForbiddenAccess from "../../components/ForbiddenAccess";
import {
  Menu,
  X,
  Sparkles,
  Calendar,
  Users,
  UserCheck,
  Mail,
  Ticket,
  MessageSquare,
  Settings,
  LogOut,
  PartyPopper,
  Loader2,
  BarChart3,
  QrCode,
  LayoutDashboard,
  ImageIcon,
  MapPin,
  KeyRound,
  LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isOpen, setIsOpen } = useSidebar();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const isGuestUser = user?.role === "GUEST";
  const isStaffCoHost =
    user?.role === "STAFF_COHOST" || user?.role === "COHOST" || user?.role === "STAFF";

  // Allowed operational routes for Staff / Co-Host
  const staffAllowedPrefixes = [
    "/dashboard/check-in",
    "/dashboard/gps-checkin",
    "/dashboard/guests",
    "/dashboard/messages",
    "/dashboard/reports",
  ];

  const isStaffAllowedRoute = staffAllowedPrefixes.some(
    (prefix) =>
      pathname === prefix ||
      pathname?.startsWith(prefix + "/") ||
      pathname?.startsWith(prefix + "?")
  );

  // Clean redirect from root /dashboard
  useEffect(() => {
    if (!authLoading) {
      if (pathname === "/dashboard" || pathname === "/dashboard/") {
        if (isStaffCoHost) {
          router.replace("/dashboard/check-in");
        } else if (user?.role === "GUEST") {
          router.replace("/dashboard/guest");
        } else {
          router.replace("/dashboard/events");
        }
      }
    }
  }, [authLoading, isStaffCoHost, user, pathname, router]);

  const handleOpenMobileNav = () => {
    setIsMobileNavOpen(true);
    setIsOpen(true);
  };

  const handleCloseMobileNav = () => {
    setIsMobileNavOpen(false);
    setIsOpen(false);
  };

  const handleToggleMobileNav = () => {
    setIsMobileNavOpen((prev) => {
      const next = !prev;
      setIsOpen(next);
      return next;
    });
  };

  // Sync if any child component triggers setIsOpen via useSidebar
  useEffect(() => {
    if (isOpen !== isMobileNavOpen) {
      setIsMobileNavOpen(isOpen);
    }
  }, [isOpen]);

  // Auto-close drawer on route navigation
  useEffect(() => {
    setIsMobileNavOpen(false);
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  // Auto-close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseMobileNav();
      }
    };
    if (isMobileNavOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileNavOpen]);

  // Prevent background body scrolling when mobile drawer is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isMobileNavOpen]);

  const handleLogout = async () => {
    handleCloseMobileNav();
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Primary mobile navigation items
  const defaultNavItems: MobileNavItem[] = [
    {
      label: "My Events",
      href: "/dashboard/events",
      icon: Calendar,
    },
    {
      label: "Guests",
      href: "/dashboard/guests",
      icon: Users,
    },
    {
      label: "Check In",
      href: "/dashboard/check-in",
      icon: UserCheck,
    },
    {
      label: "Canvas",
      href: "/dashboard/invitations",
      icon: Mail,
    },
    {
      label: "Ticketing",
      href: "/dashboard/ticketing",
      icon: Ticket,
    },
    {
      label: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const staffNavItems: MobileNavItem[] = [
    {
      label: "Check In",
      href: "/dashboard/check-in",
      icon: QrCode,
    },
    {
      label: "Guests",
      href: "/dashboard/guests",
      icon: Users,
    },
    {
      label: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
    },
    {
      label: "Reports",
      href: "/dashboard/reports",
      icon: BarChart3,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const guestNavItems: MobileNavItem[] = [
    {
      label: "Guest Portal",
      href: "/dashboard/guest",
      icon: LayoutDashboard,
    },
    {
      label: "My Invitation",
      href: "/dashboard/guest?tab=invitation",
      icon: Mail,
    },
    {
      label: "RSVP Status",
      href: "/dashboard/guest?tab=rsvp",
      icon: UserCheck,
    },
    {
      label: "QR Ticket & Badge",
      href: "/dashboard/guest?tab=ticket",
      icon: Ticket,
    },
    {
      label: "Event Gallery",
      href: "/dashboard/guest?tab=gallery",
      icon: ImageIcon,
    },
    {
      label: "Venue Check-In",
      href: "/dashboard/guest?tab=checkin",
      icon: MapPin,
    },
    {
      label: "Access Recovery",
      href: "/dashboard/guest?tab=recovery",
      icon: KeyRound,
    },
  ];

  const navItems = isGuestUser
    ? guestNavItems
    : isStaffCoHost
    ? staffNavItems
    : defaultNavItems;

  const isItemActive = (href: string) => {
    if (href.includes("?")) {
      const [path, query] = href.split("?");
      if (pathname !== path) return false;
      if (typeof window !== "undefined") {
        const tabParam = new URLSearchParams(query).get("tab");
        const currentTab = new URLSearchParams(window.location.search).get("tab");
        return tabParam === currentTab;
      }
      return false;
    }
    if (href === "/dashboard" || href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname === href || pathname?.startsWith(href + "/");
  };

  const activeNavItem = navItems.find((item) => isItemActive(item.href));
  const activeLabel = activeNavItem?.label || "Dashboard";

  const isStaffRootRedirecting =
    !authLoading && isStaffCoHost && (pathname === "/dashboard" || pathname === "/dashboard/");

  const isAccessForbiddenForStaff =
    !authLoading && isStaffCoHost && !isStaffAllowedRoute && !isStaffRootRedirecting;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-page h1,
        .dashboard-page h2,
        .dashboard-page h3,
        .dashboard-page h4,
        .dashboard-page-title,
        .force-georgia {
          font-family: Georgia, 'Times New Roman', Times, serif !important;
          font-weight: 400 !important;
        }
      `}} />
      <div className="eventizers-root min-h-screen flex flex-col dashboard-page relative" style={{ background: '#080d11', color: '#f5f5f2' }}>
        {/* Ambient floating orbs — Pro dashboard dark theme */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl floating-orb" style={{ background: 'rgba(254,186,8,0.06)' }} />
          <div className="absolute top-40 right-20 w-80 h-80 rounded-full blur-3xl floating-orb" style={{ background: 'rgba(254,186,8,0.04)', animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full blur-3xl pulse-orb" style={{ background: 'rgba(255,58,93,0.05)' }} />
        </div>

        {/* 1. Mobile Top Navigation Bar (visible only on small screens: block md:hidden) */}
        <header className="block md:hidden sticky top-0 z-40 w-full backdrop-blur-md" style={{ background: 'rgba(8,13,17,0.95)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center justify-between px-4 h-16 max-w-full">
            {/* App Logo & Title */}
            <Link
              href="/dashboard/events"
              className="flex items-center gap-2 group focus:outline-hidden"
              onClick={handleCloseMobileNav}
            >
              <div className="w-8 h-8 rounded-[10px] bg-[#feba08] text-[#080d11] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
                <Sparkles className="w-4 h-4 text-[#080d11]" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span
                  className="font-display text-lg font-extrabold tracking-tight leading-none"
                  style={{ fontFamily: "'Red Rose', Georgia, serif", color: '#f5f5f2' }}
                >
                  eventizers
                </span>
                <span className="text-[10px] font-medium leading-tight mt-0.5 truncate max-w-[120px]" style={{ color: 'rgba(245,245,242,0.45)' }}>
                  {activeLabel}
                </span>
              </div>
            </Link>

            {/* Right section: Hamburger menu button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMobileNav}
                aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileNavOpen}
                className="p-2 rounded-xl transition-all duration-200 focus:outline-hidden"
                style={{ background: 'rgba(254,186,8,0.1)', border: '1px solid rgba(254,186,8,0.25)', color: '#feba08' }}
              >
                {isMobileNavOpen ? (
                  <X className="w-5 h-5 transition-transform duration-200" />
                ) : (
                  <Menu className="w-5 h-5 transition-transform duration-200" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* 2. Responsive Mobile Drawer / Slide-Over Navigation (md:hidden) */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="mobile-drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleCloseMobileNav}
                className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs md:hidden"
                aria-hidden="true"
              />

              {/* Slide-out Drawer from Left */}
              <motion.aside
                key="mobile-drawer-panel"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col shadow-2xl md:hidden"
                style={{ background: '#0d1117', borderRight: '1px solid rgba(254,186,8,0.15)' }}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile dashboard navigation drawer"
              >
                {/* Drawer Header */}
                <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(254,186,8,0.12)', background: 'rgba(254,186,8,0.04)' }}>
                  <Link
                    href="/dashboard/events"
                    onClick={handleCloseMobileNav}
                    className="flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-[10px] bg-[#feba08] text-[#080d11] flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4 text-[#080d11]" aria-hidden="true" />
                    </div>
                    <div>
                      <span
                        className="font-display text-lg font-extrabold tracking-tight leading-none"
                        style={{ fontFamily: "'Red Rose', Georgia, serif", color: '#f5f5f2' }}
                      >
                        eventizers
                      </span>
                      <p className="text-[10px] font-normal leading-tight mt-0.5" style={{ color: 'rgba(245,245,242,0.4)' }}>
                        Create. Invite. Manage.
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={handleCloseMobileNav}
                    className="p-1.5 rounded-lg transition-colors focus:outline-hidden"
                    style={{ color: 'rgba(245,245,242,0.5)' }}
                    aria-label="Close navigation"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Navigation Items */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 overscroll-contain">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item.href);

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={handleCloseMobileNav}
                        className="group flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-150 text-sm font-medium"
                        style={active
                          ? { background: 'rgba(254,186,8,0.12)', color: '#feba08', fontWeight: 600, border: '1px solid rgba(254,186,8,0.25)' }
                          : { color: 'rgba(245,245,242,0.65)', border: '1px solid transparent' }
                        }
                      >
                        <div
                          className="p-1.5 rounded-lg transition-colors"
                          style={active
                            ? { background: 'rgba(254,186,8,0.18)', color: '#feba08' }
                            : { background: 'rgba(245,245,242,0.07)', color: 'rgba(245,245,242,0.45)' }
                          }
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                        </div>
                        <span className="truncate flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: 'rgba(254,186,8,0.2)', color: '#feba08' }}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Drawer Footer: User Profile & Logout */}
                <div className="p-3 space-y-2" style={{ borderTop: '1px solid rgba(254,186,8,0.12)', background: 'rgba(254,186,8,0.03)' }}>
                  {user && (
                    <div className="px-3 py-2 rounded-xl flex items-center gap-2.5" style={{ background: 'rgba(245,245,242,0.05)', border: '1px solid rgba(245,245,242,0.08)' }}>
                      <div className="w-8 h-8 rounded-full text-black font-semibold text-xs flex items-center justify-center flex-shrink-0" style={{ background: '#feba08' }}>
                        {(user.name || user.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate" style={{ color: '#f5f5f2' }}>
                          {user.name || "User"}
                        </p>
                        <p className="text-[10px] truncate" style={{ color: 'rgba(245,245,242,0.4)' }}>
                          {user.email || ""}
                        </p>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors text-xs font-medium focus:outline-hidden cursor-pointer"
                    style={{ color: 'rgba(245,245,242,0.55)' }}
                  >
                    <LogOut className="w-4 h-4" style={{ color: 'rgba(245,245,242,0.4)' }} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* 4. Desktop Sidebar Layout (untouched, hidden md:flex) */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Sparkle effect on login */}
        <SparkleEffect />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${
            isCollapsed ? "md:pl-[72px]" : "md:pl-[260px]"
          }`}
        >
          {isStaffRootRedirecting ? (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-xs font-medium text-slate-500">Redirecting to Check-In Portal...</p>
              </div>
            </div>
          ) : isAccessForbiddenForStaff ? (
            <ForbiddenAccess
              title="Access Restricted"
              message="Staff / Co-Host accounts are restricted to operational event check-in, guest management, attendee messaging, and attendance reports."
              redirectPath="/dashboard/check-in"
              redirectLabel="Return to Check-In Portal"
            />
          ) : (
            children
          )}
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}


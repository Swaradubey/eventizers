"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, PartyPopper } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { AnimatePresence, motion } from "framer-motion";
import MegaMenu, { featureItems } from "./MegaMenu";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Dashboard", href: "/dashboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, isOpen, setIsOpen, setIsCollapsed } = useSidebar();
  const isDashboard = pathname?.startsWith("/dashboard") || (pathname?.startsWith("/admin") && pathname !== "/admin/login");
  const isHomePage = pathname === "/";

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleCreateEvent = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (user) {
      router.push("/dashboard/events?create=true");
    } else {
      router.push("/login");
    }
  };

  const scrollToSection = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    const targetId = href.replace("#", "");

    if (isHomePage) {
      e.preventDefault();
      scrollToSection(targetId);
      window.history.pushState(null, "", href);
    } else {
      e.preventDefault();
      router.push(`/${href}`);
    }
  };

  useEffect(() => {
    const handleHashScroll = () => {
      if (pathname === "/" && typeof window !== "undefined" && window.location.hash) {
        const targetId = window.location.hash.replace("#", "");
        if (!targetId) return;

        let attempts = 0;
        const timer = setInterval(() => {
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            clearInterval(timer);
          } else {
            attempts++;
            if (attempts >= 15) {
              clearInterval(timer);
            }
          }
        }, 100);
      }
    };

    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, [pathname]);

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setDesktopMenuOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setDesktopMenuOpen(false);
    }, 200);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setDesktopMenuOpen((prev) => !prev);
  };

  const handleClose = () => {
    setDesktopMenuOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setDesktopMenuOpen(false);
      triggerRef.current?.focus();
    }
  };

  // Close desktop dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setDesktopMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100/90 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] transition-all duration-300 ${
      isDashboard
        ? isCollapsed
          ? "left-0 md:left-[72px]"
          : "left-0 md:left-64"
        : "left-0 w-full"
    }`}>
      <nav className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between relative">
        {/* Left Section (Brand Logo) */}
        <div className="flex items-center gap-3">
          {isDashboard && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex md:hidden items-center justify-center p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 transition-all duration-200 shadow-sm focus:outline-none hover:scale-105 active:scale-95"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366f1] via-[#3b82f6] to-[#06b6d4] flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
              <PartyPopper className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-[#4f46e5] via-[#2563eb] to-[#06b6d4] bg-clip-text text-transparent font-sans">
              Eventizers
            </span>
          </Link>
        </div>

        {/* Center Section (Nav Links) */}
        <div className="hidden md:flex items-center gap-7 lg:gap-8 h-full font-sans">
          {navLinks.map((link) => {
            if (link.label === "Features") {
              return (
                <div
                  key={link.label}
                  className="relative h-16 flex items-center"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  ref={menuRef}
                >
                  <button
                    ref={triggerRef}
                    onClick={handleToggleClick}
                    onKeyDown={handleKeyDown}
                    className="text-sm font-medium text-gray-800 hover:text-black transition-colors flex items-center gap-1 h-full focus:outline-none cursor-pointer"
                    aria-haspopup="true"
                    aria-expanded={desktopMenuOpen}
                  >
                    <span>Features</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-600 transition-transform duration-200 ${desktopMenuOpen ? "rotate-180 text-black" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {desktopMenuOpen && (
                      <MegaMenu onClose={handleClose} onKeyDown={handleKeyDown} />
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            if (link.label === "Dashboard") {
              const active = isDashboard;
              return (
                <Link
                  key={link.label}
                  href={user ? (user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard") : "/dashboard"}
                  className={`text-sm font-medium transition-colors ${
                    active ? "text-gray-900 font-semibold" : "text-gray-800 hover:text-black"
                  }`}
                >
                  {link.label}
                </Link>
              );
            }
            return (
              <a
                key={link.label}
                href={isHomePage ? link.href : `/${link.href}`}
                onClick={(e) => handleSectionClick(e, link.href)}
                className="text-sm font-medium text-gray-800 hover:text-black transition-colors"
              >
                {link.label}
              </a>
            );
          })}
          <span className="text-[#E2B93B] text-xs opacity-70 ml-1">✦</span>
        </div>

        {/* Right Section (User Actions) */}
        <div className="hidden md:flex items-center font-sans">
          {user ? (
            <div className="flex items-center gap-4">
              {/* User Greeting */}
              <span className="text-sm font-medium text-gray-700">
                Hi, {(user as any)?.name || (user as any)?.firstName || 'sashia'}
              </span>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                Logout
              </button>

              {/* Create Event CTA */}
              <button
                onClick={handleCreateEvent}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
              >
                Create Event
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 lg:gap-5">
              <Link
                href="/login"
                className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer"
              >
                Sign In
              </Link>
              <button
                onClick={handleCreateEvent}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
              >
                Create Event
              </button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5 text-gray-900" /> : <Menu className="w-5 h-5 text-gray-900" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-5 flex flex-col gap-4 font-sans shadow-lg">
          {navLinks.map((link) => {
            if (link.label === "Features") {
              return (
                <div key={link.label} className="flex flex-col">
                  <button
                    onClick={() => setMobileFeaturesOpen(!mobileFeaturesOpen)}
                    className="text-sm font-medium text-left text-[#4B5563] hover:text-gray-900 flex items-center justify-between py-1 focus:outline-none"
                  >
                    <span>Features</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileFeaturesOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {mobileFeaturesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden pl-4 pr-2 mt-2 flex flex-col gap-3 border-l-2 border-gray-100"
                      >
                        {featureItems.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <a
                              key={item.title}
                              href={item.href}
                              onClick={() => {
                                setOpen(false);
                                setMobileFeaturesOpen(false);
                              }}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                            >
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <IconComponent className="w-4 h-4 text-gray-700" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-900">
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                  {item.description}
                                </span>
                              </div>
                            </a>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            if (link.label === "Dashboard") {
              const active = isDashboard;
              return (
                <Link
                  key={link.label}
                  href={user ? (user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard") : "/dashboard"}
                  className={`text-sm font-medium transition-colors ${
                    active ? "text-gray-900 font-semibold" : "text-[#4B5563] hover:text-gray-900"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            }
            return (
              <a
                key={link.label}
                href={isHomePage ? link.href : `/${link.href}`}
                className="text-sm font-medium text-[#4B5563] hover:text-gray-900"
                onClick={(e) => {
                  setOpen(false);
                  handleSectionClick(e, link.href);
                }}
              >
                {link.label}
              </a>
            );
          })}

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">
            {user ? (
              <>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-medium text-gray-700">
                    Hi, {(user as any)?.name || (user as any)?.firstName || 'sashia'}
                  </span>
                  <button
                    onClick={async () => {
                      setOpen(false);
                      await handleLogout();
                    }}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    setOpen(false);
                    handleCreateEvent(e);
                  }}
                  className="w-full rounded-full px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 text-center transition-all shadow-sm cursor-pointer"
                >
                  Create Event
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
                >
                  Sign In
                </Link>
                <button
                  onClick={(e) => {
                    setOpen(false);
                    handleCreateEvent(e);
                  }}
                  className="w-full rounded-full px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 text-center transition-all shadow-sm cursor-pointer"
                >
                  Create Event
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}


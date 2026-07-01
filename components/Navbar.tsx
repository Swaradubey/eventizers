"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Sparkles, ChevronDown } from "lucide-react";
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
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin/dashboard");

  const handleCreateEventClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push("/dashboard/events?create=true");
    } else {
      router.push("/login");
    }
  };

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
    <header className={`fixed top-0 right-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8C4B8]/30 transition-all duration-300 ${
      isDashboard
        ? isCollapsed
          ? "left-0 md:left-[72px]"
          : "left-0 md:left-64"
        : "left-0"
    }`}>
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left Container with Toggle & Logo */}
        <div className="flex items-center gap-3">
          {isDashboard && (
            <>
              {/* Mobile/Tablet toggle button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex md:hidden items-center justify-center p-2 rounded-xl border border-[#E8C4B8]/40 bg-white hover:bg-[#F0EBE8] text-[#2D1B3D] transition-all duration-300 shadow-sm focus:outline-none hover:scale-105 active:scale-95"
                aria-label="Toggle navigation drawer"
              >
                <Menu className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#2D1B3D] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C9A84C]" />
            </div>
            <span
              className="font-display text-lg font-semibold text-[#2D1B3D]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Eventizers
            </span>
          </Link>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 h-full">
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
                    className="text-sm font-medium text-[#2D1B3D]/70 hover:text-[#2D1B3D] transition-colors flex items-center gap-1 h-full focus:outline-none cursor-pointer"
                    aria-haspopup="true"
                    aria-expanded={desktopMenuOpen}
                  >
                    Features
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${desktopMenuOpen ? "rotate-180" : ""}`} />
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
                  href={user ? (user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard") : "/login"}
                  className={`text-sm font-medium transition-colors ${
                    active ? "text-[#2D1B3D]" : "text-[#2D1B3D]/70 hover:text-[#2D1B3D]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            }
            return (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[#2D1B3D]/70 hover:text-[#2D1B3D] transition-colors"
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm font-medium text-[#2D1B3D]">
                Hi, {user.name}
              </span>
              <button
                onClick={logout}
                className="text-sm font-medium text-[#2D1B3D]/70 hover:text-[#2D1B3D] transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="text-sm font-medium text-[#2D1B3D]/70 hover:text-[#2D1B3D] transition-colors"
            >
              Sign in
            </a>
          )}
          <button
            onClick={handleCreateEventClick}
            className="text-sm font-medium px-4 py-2 rounded-full bg-[#2D1B3D] text-[#FAF8F5] hover:bg-[#3d2a52] transition-colors cursor-pointer"
          >
            Create Event
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-[#F0EBE8] transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5 text-[#2D1B3D]" /> : <Menu className="w-5 h-5 text-[#2D1B3D]" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#FAF8F5] border-t border-[#E8C4B8]/30 px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => {
            if (link.label === "Features") {
              return (
                <div key={link.label} className="flex flex-col">
                  <button
                    onClick={() => setMobileFeaturesOpen(!mobileFeaturesOpen)}
                    className="text-sm font-medium text-left text-[#2D1B3D]/80 hover:text-[#2D1B3D] flex items-center justify-between py-1 focus:outline-none"
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
                        className="overflow-hidden pl-4 pr-2 mt-2 flex flex-col gap-3 border-l-2 border-[#E8C4B8]/30"
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
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F8FAFF] active:bg-[#F8FAFF]"
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                                <IconComponent className="w-4 h-4 text-[#6366F1]" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-[#111827]">
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-[#6B7280]">
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
                  href={user ? (user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard") : "/login"}
                  className={`text-sm font-medium transition-colors ${
                    active ? "text-[#2D1B3D]" : "text-[#2D1B3D]/80 hover:text-[#2D1B3D]"
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
                href={link.href}
                className="text-sm font-medium text-[#2D1B3D]/80 hover:text-[#2D1B3D]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            );
          })}
          {user ? (
            <>
              <div className="text-sm font-medium text-[#2D1B3D] border-t border-[#E8C4B8]/20 pt-2">
                Hi, <span className="font-semibold">{user.name}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="text-sm font-medium text-left text-[#2D1B3D]/70 hover:text-[#2D1B3D]"
              >
                Logout
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="text-sm font-medium text-[#2D1B3D]/80 hover:text-[#2D1B3D]"
              onClick={() => setOpen(false)}
            >
              Sign in
            </a>
          )}
          <button
            onClick={(e) => {
              setOpen(false);
              handleCreateEventClick(e);
            }}
            className="text-sm font-medium px-4 py-2 rounded-full bg-[#2D1B3D] text-[#FAF8F5] text-center hover:bg-[#3d2a52] transition-colors cursor-pointer"
          >
            Create Event
          </button>
        </div>
      )}
    </header>
  );
}


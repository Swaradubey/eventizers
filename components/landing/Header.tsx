"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Calendar,
  ChevronDown,
  User as UserIcon,
} from "lucide-react";
import { NAV } from "./data";
import { useCreateSheet } from "./CreateSheetContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { open } = useCreateSheet();
  const { user, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close desktop user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setUserMenuOpen(false);
      setMenuOpen(false);
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const firstName = displayName.split(" ")[0];
  const initial = displayName.charAt(0).toUpperCase();
  const dashboardHref =
    user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || menuOpen
          ? "bg-[#080d11]/85 backdrop-blur-xl border-b border-white/10 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <a href="#top" aria-label="Eventizers home" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[10px] bg-primary text-primary-foreground shadow">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-white">
            eventizers
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/75 transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right CTA & Links */}
        <div className="flex items-center gap-2 sm:gap-3">
          {mounted && user ? (
            <>
              {/* Dashboard Link - only shown when logged in */}
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20 hover:border-primary/60 shadow-sm"
              >
                <LayoutDashboard className="size-3.5" aria-hidden="true" />
                <span>Dashboard</span>
              </Link>

              {/* User Profile Pill & Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1 pl-1.5 pr-2.5 text-xs font-medium text-white transition hover:bg-white/10 hover:border-white/30 cursor-pointer"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="grid size-6 place-items-center rounded-full bg-gradient-to-tr from-primary to-amber-300 text-[11px] font-bold text-black shadow-sm">
                    {initial}
                  </span>
                  <span className="max-w-[120px] truncate text-white/90 font-medium">
                    {firstName}
                  </span>
                  <ChevronDown
                    className={`size-3 text-white/60 transition-transform duration-200 ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#0c1218]/95 p-1.5 text-white shadow-2xl backdrop-blur-2xl ring-1 ring-black/50 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-xs font-semibold text-white truncate">
                        {displayName}
                      </p>
                      <p className="text-[11px] text-white/50 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href={dashboardHref}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
                      >
                        <LayoutDashboard className="size-3.5 text-primary" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/dashboard/events"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
                      >
                        <Calendar className="size-3.5 text-primary" />
                        <span>My Events</span>
                      </Link>
                    </div>
                    <div className="border-t border-white/10 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition cursor-pointer"
                      >
                        <LogOut className="size-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Sign In link - only shown when logged out */
            <Link
              href="/login?redirect=/"
              className="hidden text-sm font-medium text-white/75 hover:text-white transition sm:inline-block px-3 py-1.5"
            >
              Sign In
            </Link>
          )}

          <button
            type="button"
            onClick={() => open("ai")}
            className="inline-flex min-w-11 select-none items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition active:scale-[0.97] bg-primary text-primary-foreground hover:brightness-110 h-10 px-5 text-sm cursor-pointer shadow-md"
          >
            Create Event
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="grid size-10 place-items-center rounded-full hover:bg-white/10 text-white lg:hidden cursor-pointer"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="border-b border-white/10 bg-[#080d11]/95 px-5 py-6 backdrop-blur-2xl lg:hidden">
          <nav className="flex flex-col gap-4">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-base font-semibold text-white/80 transition hover:text-white"
              >
                {item.label}
              </a>
            ))}

            <div className="my-2 h-px bg-white/10" />

            {mounted && user ? (
              <>
                {/* Mobile User Card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-tr from-primary to-amber-300 text-xs font-bold text-black shadow">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-white/50 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 px-2.5 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 shrink-0 ml-2 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>

                <Link
                  href={dashboardHref}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-2xl bg-primary/15 border border-primary/30 px-4 py-3 text-base font-bold text-primary transition hover:bg-primary/25"
                >
                  <LayoutDashboard className="size-5" />
                  <span>Dashboard</span>
                </Link>
              </>
            ) : (
              <Link
                href="/login?redirect=/"
                onClick={() => setMenuOpen(false)}
                className="text-base font-semibold text-white/80 transition hover:text-white"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => {
                setMenuOpen(false);
                open("ai");
              }}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-primary font-bold text-primary-foreground cursor-pointer shadow-lg"
            >
              Create Event
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

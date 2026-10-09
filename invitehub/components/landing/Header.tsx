"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";
import { NAV } from "./data";
import { useCreateSheet } from "./CreateSheetContext";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { open } = useCreateSheet();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          <span className="grid size-8 place-items-center rounded-[10px] bg-primary text-primary-foreground">
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
          <Link
            href="/login"
            className="hidden text-sm font-medium text-white/75 hover:text-white transition sm:inline-block px-3 py-1.5"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="hidden text-sm font-medium text-white/75 hover:text-white transition sm:inline-block px-3 py-1.5"
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => open("ai")}
            className="inline-flex min-w-11 select-none items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition active:scale-[0.97] bg-primary text-primary-foreground hover:brightness-110 h-10 px-5 text-sm"
          >
            Create Event
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="grid size-10 place-items-center rounded-full hover:bg-white/10 text-white lg:hidden"
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
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="text-base font-semibold text-white/80 transition hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-base font-semibold text-white/80 transition hover:text-white"
            >
              Sign In
            </Link>
            <button
              onClick={() => {
                setMenuOpen(false);
                open("ai");
              }}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-primary font-bold text-primary-foreground"
            >
              Create Event
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

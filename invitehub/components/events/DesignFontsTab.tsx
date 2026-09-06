"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Type,
  Palette,
  Image as ImageIcon,
  ChevronDown,
  Check,
  Save,
  Loader2,
  Sparkles,
  RefreshCw,
  Sliders,
  Eye,
  Layers,
} from "lucide-react";
import eventService, {
  DesignSettingsData,
  TypographySettings,
  ColorSchemeSettings,
  BackgroundSettings,
} from "@/services/eventService";

interface DesignFontsTabProps {
  eventId: string;
  initialSettings?: DesignSettingsData | null;
  onSaveSuccess?: (updatedSettings: DesignSettingsData) => void;
  showToast?: (text: string, type?: "success" | "error") => void;
}

// Curated Google Fonts for Title
const TITLE_FONTS = [
  { name: "Playfair Display", category: "Serif / Luxury", google: true },
  { name: "Cinzel", category: "Classic / Royal", google: true },
  { name: "Cormorant Garamond", category: "Editorial Serif", google: true },
  { name: "Prata", category: "Vogue Elegance", google: true },
  { name: "Bodoni Moda", category: "Contemporary Serif", google: true },
  { name: "Montserrat", category: "Modern Clean", google: true },
  { name: "Inter", category: "Minimalist Modern", google: true },
  { name: "Outfit", category: "Geometric Sans", google: true },
  { name: "Plus Jakarta Sans", category: "Clean Contemporary", google: true },
  { name: "Dancing Script", category: "Calligraphy Script", google: true },
  { name: "Great Vibes", category: "Formal Script", google: true },
  { name: "Alex Brush", category: "Delicate Cursive", google: true },
  { name: "Lora", category: "Literary Serif", google: true },
  { name: "Merriweather", category: "Traditional Serif", google: true },
  { name: "Questrial", category: "Modern Minimal", google: true },
];

// Curated Google Fonts for Body
const BODY_FONTS = [
  { name: "Questrial", category: "Modern Geometric", google: true },
  { name: "Inter", category: "Clean Precision", google: true },
  { name: "Plus Jakarta Sans", category: "Crisp Modern", google: true },
  { name: "Montserrat", category: "Modern Versatile", google: true },
  { name: "Outfit", category: "Rounded Clean", google: true },
  { name: "Poppins", category: "Friendly Geometric", google: true },
  { name: "Open Sans", category: "Neutral Humanist", google: true },
  { name: "Lato", category: "Harmonious Sans", google: true },
  { name: "Roboto", category: "Structured Sans", google: true },
  { name: "Lora", category: "Refined Book Serif", google: true },
  { name: "Cormorant Garamond", category: "Literary Serif", google: true },
  { name: "Playfair Display", category: "Luxury Accent", google: true },
];

// 8 Preset Palettes matching Screenshot 1 exactly
const PRESET_PALETTES = [
  {
    id: "stripe-blurple",
    name: "Stripe Blurple",
    primary: "#635BFF",
    secondary: "#00D4FF",
    text: "#1F2937",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    primary: "#0066FF",
    secondary: "#00C2FF",
    text: "#0F172A",
  },
  {
    id: "forest-green",
    name: "Forest Green",
    primary: "#10B981",
    secondary: "#84CC16",
    text: "#064E3B",
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    primary: "#F97316",
    secondary: "#FBBF24",
    text: "#1C1917",
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    primary: "#F43F5E",
    secondary: "#FB7185",
    text: "#1F2937",
  },
  {
    id: "midnight",
    name: "Midnight",
    primary: "#0F172A",
    secondary: "#6366F1",
    text: "#0F172A",
  },
  {
    id: "coral-reef",
    name: "Coral Reef",
    primary: "#F97316",
    secondary: "#06B6D4",
    text: "#1E293B",
  },
  {
    id: "sky",
    name: "Sky",
    primary: "#6366F1",
    secondary: "#818CF8",
    text: "#1E1B4B",
  },
];

// Gradient Direction Presets matching Screenshot 2
const GRADIENT_PRESETS = [
  {
    id: "to-r",
    label: "Left to Right",
    css: (primary: string, secondary: string) =>
      `linear-gradient(90deg, ${primary}15 0%, ${secondary}20 100%)`,
    gradientValue: "to-r",
  },
  {
    id: "to-br",
    label: "Top Left to Bottom Right",
    css: (primary: string, secondary: string) =>
      `linear-gradient(135deg, ${secondary}15 0%, #ffffff 60%, ${primary}15 100%)`,
    gradientValue: "to-br",
  },
  {
    id: "to-b",
    label: "Top to Bottom",
    css: (primary: string, secondary: string) =>
      `linear-gradient(180deg, #ffffff 0%, ${primary}12 50%, ${secondary}18 100%)`,
    gradientValue: "to-b",
  },
  {
    id: "radial",
    label: "Soft Radial Glow",
    css: (primary: string, secondary: string) =>
      `radial-gradient(circle at 50% 30%, ${secondary}20 0%, ${primary}08 60%, #ffffff 100%)`,
    gradientValue: "radial",
  },
];

export default function DesignFontsTab({
  eventId,
  initialSettings,
  onSaveSuccess,
  showToast,
}: DesignFontsTabProps) {
  // Design settings state matching schema
  const [typography, setTypography] = useState<TypographySettings>({
    titleFont: "Playfair Display",
    bodyFont: "Questrial",
  });

  const [colorScheme, setColorScheme] = useState<ColorSchemeSettings>({
    preset: "Stripe Blurple",
    primaryColor: "#635BFF",
    secondaryColor: "#00D4FF",
    textColor: "#1F2937",
  });

  const [background, setBackground] = useState<BackgroundSettings>({
    type: "gradient",
    gradientDirection: "to-r",
    color: "#ffffff",
    patternUrl: "",
    imageUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Dropdown states
  const [titleFontOpen, setTitleFontOpen] = useState(false);
  const [bodyFontOpen, setBodyFontOpen] = useState(false);
  const titleDropdownRef = useRef<HTMLDivElement>(null);
  const bodyDropdownRef = useRef<HTMLDivElement>(null);

  // Color picker refs
  const primaryColorRef = useRef<HTMLInputElement>(null);
  const secondaryColorRef = useRef<HTMLInputElement>(null);
  const textColorRef = useRef<HTMLInputElement>(null);

  // Dynamically load Google Fonts
  useEffect(() => {
    const fontsToLoad = [typography.titleFont, typography.bodyFont, "Playfair Display", "Questrial", "Cinzel", "Montserrat", "Inter", "Plus Jakarta Sans", "Great Vibes", "Dancing Script"];
    const uniqueFonts = Array.from(new Set(fontsToLoad)).map((f) => f.replace(/\s+/g, "+"));
    const fontString = uniqueFonts.map((f) => `family=${f}:wght@300;400;500;600;700`).join("&");
    const linkId = "invitehub-google-fonts-loader";

    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?${fontString}&display=swap`;
  }, [typography.titleFont, typography.bodyFont]);

  // Pre-fill on mount or when initialSettings changes
  useEffect(() => {
    if (initialSettings) {
      if (initialSettings.typography) setTypography(initialSettings.typography);
      if (initialSettings.colorScheme) setColorScheme(initialSettings.colorScheme);
      if (initialSettings.background) setBackground(initialSettings.background);
    } else if (eventId) {
      const fetchDesign = async () => {
        setLoading(true);
        try {
          const res = await eventService.getDesignSettings(eventId);
          if (res && res.success && res.design) {
            if (res.design.typography) setTypography(res.design.typography);
            if (res.design.colorScheme) setColorScheme(res.design.colorScheme);
            if (res.design.background) setBackground(res.design.background);
          }
        } catch (err) {
          console.warn("Could not fetch design settings:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchDesign();
    }
  }, [eventId, initialSettings]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (titleDropdownRef.current && !titleDropdownRef.current.contains(e.target as Node)) {
        setTitleFontOpen(false);
      }
      if (bodyDropdownRef.current && !bodyDropdownRef.current.contains(e.target as Node)) {
        setBodyFontOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Preset Palette click handler
  const handleSelectPalette = (palette: typeof PRESET_PALETTES[0]) => {
    setColorScheme({
      preset: palette.name,
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      textColor: palette.text,
    });
  };

  // Save handler
  const handleSave = async () => {
    if (!eventId) return;
    setSaving(true);
    try {
      const payload: DesignSettingsData = {
        typography,
        colorScheme,
        background,
      };
      const res = await eventService.updateDesignSettings(eventId, payload);
      if (res && res.success) {
        if (showToast) showToast("Design & Fonts updated successfully!", "success");
        if (onSaveSuccess && res.design) {
          onSaveSuccess(res.design);
        }
      } else {
        if (showToast) showToast(res.message || "Failed to save design settings", "error");
      }
    } catch (err: any) {
      console.error("Error saving design settings:", err);
      if (showToast) {
        showToast(err.response?.data?.error || "Error saving design settings", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-white rounded-3xl border border-slate-100 shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin text-[#635BFF]" />
        <p className="text-sm font-medium text-slate-500">Loading design & fonts configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Save Button Bar */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Design & Typography</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Customize the fonts, color scheme, and background aesthetic for your event invitations.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#635BFF] hover:bg-[#5249e0] active:scale-[0.98] transition-all shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION A: TYPOGRAPHY CARD */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100/90 shadow-xs transition-shadow hover:shadow-sm">
        {/* Card Header */}
        <div className="flex items-center gap-3 pb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 text-[#635BFF]">
            <Type className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Typography</h3>
        </div>

        {/* Two-Column Grid: Title Font & Body Font */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column: Title Font */}
          <div className="relative" ref={titleDropdownRef}>
            <label className="block text-sm font-semibold text-slate-800 mb-2.5">
              Title Font
            </label>

            {/* Custom Select Button */}
            <button
              type="button"
              onClick={() => {
                setTitleFontOpen(!titleFontOpen);
                setBodyFontOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl text-slate-800 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 focus:border-[#635BFF] cursor-pointer text-left"
            >
              <span className="truncate text-base" style={{ fontFamily: typography.titleFont }}>
                {typography.titleFont}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${
                  titleFontOpen ? "rotate-180 text-[#635BFF]" : ""
                }`}
              />
            </button>

            {/* Dynamic Font Preview Text */}
            <p
              className="text-xs text-slate-500 mt-2 px-1 transition-all"
              style={{ fontFamily: typography.titleFont }}
            >
              Preview: The quick brown fox jumps over the lazy dog
            </p>

            {/* Dropdown Menu */}
            {titleFontOpen && (
              <div className="absolute z-30 left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl max-h-64 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Title Font
                </div>
                {TITLE_FONTS.map((font) => (
                  <button
                    key={font.name}
                    type="button"
                    onClick={() => {
                      setTypography((prev) => ({ ...prev, titleFont: font.name }));
                      setTitleFontOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      typography.titleFont === font.name
                        ? "bg-indigo-50/80 text-[#635BFF]"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div>
                      <span className="text-sm block" style={{ fontFamily: font.name }}>
                        {font.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{font.category}</span>
                    </div>
                    {typography.titleFont === font.name && (
                      <Check className="w-4 h-4 text-[#635BFF] flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Body Font */}
          <div className="relative" ref={bodyDropdownRef}>
            <label className="block text-sm font-semibold text-slate-800 mb-2.5">
              Body Font
            </label>

            {/* Custom Select Button */}
            <button
              type="button"
              onClick={() => {
                setBodyFontOpen(!bodyFontOpen);
                setTitleFontOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl text-slate-800 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 focus:border-[#635BFF] cursor-pointer text-left"
            >
              <span className="truncate text-base" style={{ fontFamily: typography.bodyFont }}>
                {typography.bodyFont}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${
                  bodyFontOpen ? "rotate-180 text-[#635BFF]" : ""
                }`}
              />
            </button>

            {/* Dynamic Font Preview Text */}
            <p
              className="text-xs text-slate-500 mt-2 px-1 transition-all"
              style={{ fontFamily: typography.bodyFont }}
            >
              Preview: The quick brown fox jumps over the lazy dog
            </p>

            {/* Dropdown Menu */}
            {bodyFontOpen && (
              <div className="absolute z-30 left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl max-h-64 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Body Font
                </div>
                {BODY_FONTS.map((font) => (
                  <button
                    key={font.name}
                    type="button"
                    onClick={() => {
                      setTypography((prev) => ({ ...prev, bodyFont: font.name }));
                      setBodyFontOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      typography.bodyFont === font.name
                        ? "bg-indigo-50/80 text-[#635BFF]"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div>
                      <span className="text-sm block" style={{ fontFamily: font.name }}>
                        {font.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{font.category}</span>
                    </div>
                    {typography.bodyFont === font.name && (
                      <Check className="w-4 h-4 text-[#635BFF] flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION B: COLOR SCHEME CARD */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100/90 shadow-xs transition-shadow hover:shadow-sm">
        {/* Card Header */}
        <div className="flex items-center gap-3 pb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 text-[#635BFF]">
            <Palette className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Color scheme</h3>
        </div>

        {/* Preset Palettes */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-800 mb-4">
            Preset Palettes
          </label>

          {/* Grid list of selectable palette pills/cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {PRESET_PALETTES.map((palette) => {
              const isSelected = colorScheme.preset === palette.name;
              return (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => handleSelectPalette(palette)}
                  className={`relative flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "border-2 border-[#635BFF] bg-white shadow-xs ring-2 ring-[#635BFF]/10"
                      : "border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50/50"
                  }`}
                >
                  {/* Two color dots */}
                  <div className="flex items-center -space-x-1 flex-shrink-0">
                    <span
                      className="w-5 h-5 rounded-full border-2 border-white shadow-xs flex-shrink-0"
                      style={{ backgroundColor: palette.primary }}
                    />
                    <span
                      className="w-5 h-5 rounded-full border-2 border-white shadow-xs flex-shrink-0"
                      style={{ backgroundColor: palette.secondary }}
                    />
                  </div>

                  {/* Palette Name */}
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {palette.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Color Picker / Values Row */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Column 1: Primary Color */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => primaryColorRef.current?.click()}
                  className="w-12 h-10 rounded-xl border border-black/10 shadow-xs flex-shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95 relative overflow-hidden"
                  style={{ backgroundColor: colorScheme.primaryColor }}
                  title="Click to choose color"
                >
                  <input
                    ref={primaryColorRef}
                    type="color"
                    value={colorScheme.primaryColor}
                    onChange={(e) =>
                      setColorScheme((p) => ({
                        ...p,
                        primaryColor: e.target.value.toUpperCase(),
                        preset: "Custom",
                      }))
                    }
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                </button>
                <div className="flex-1">
                  <input
                    type="text"
                    value={colorScheme.primaryColor}
                    onChange={(e) =>
                      setColorScheme((p) => ({
                        ...p,
                        primaryColor: e.target.value,
                        preset: "Custom",
                      }))
                    }
                    className="w-full text-sm font-semibold text-slate-800 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl px-3 py-2 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 focus:border-[#635BFF]"
                  />
                </div>
              </div>
            </div>

            {/* Column 2: Secondary Color */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => secondaryColorRef.current?.click()}
                  className="w-12 h-10 rounded-xl border border-black/10 shadow-xs flex-shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95 relative overflow-hidden"
                  style={{ backgroundColor: colorScheme.secondaryColor }}
                  title="Click to choose color"
                >
                  <input
                    ref={secondaryColorRef}
                    type="color"
                    value={colorScheme.secondaryColor}
                    onChange={(e) =>
                      setColorScheme((p) => ({
                        ...p,
                        secondaryColor: e.target.value.toUpperCase(),
                        preset: "Custom",
                      }))
                    }
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                </button>
                <div className="flex-1">
                  <input
                    type="text"
                    value={colorScheme.secondaryColor}
                    onChange={(e) =>
                      setColorScheme((p) => ({
                        ...p,
                        secondaryColor: e.target.value,
                        preset: "Custom",
                      }))
                    }
                    className="w-full text-sm font-semibold text-slate-800 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl px-3 py-2 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 focus:border-[#635BFF]"
                  />
                </div>
              </div>
            </div>

            {/* Column 3: Text Color */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Text Color
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => textColorRef.current?.click()}
                  className="w-12 h-10 rounded-xl border border-black/10 shadow-xs flex-shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95 relative overflow-hidden"
                  style={{ backgroundColor: colorScheme.textColor }}
                  title="Click to choose color"
                >
                  <input
                    ref={textColorRef}
                    type="color"
                    value={colorScheme.textColor}
                    onChange={(e) =>
                      setColorScheme((p) => ({
                        ...p,
                        textColor: e.target.value.toUpperCase(),
                        preset: "Custom",
                      }))
                    }
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                </button>
                <div className="flex-1">
                  <input
                    type="text"
                    value={colorScheme.textColor}
                    onChange={(e) =>
                      setColorScheme((p) => ({
                        ...p,
                        textColor: e.target.value,
                        preset: "Custom",
                      }))
                    }
                    className="w-full text-sm font-semibold text-slate-800 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl px-3 py-2 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 focus:border-[#635BFF]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION C: BACKGROUND CARD */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100/90 shadow-xs transition-shadow hover:shadow-sm">
        {/* Card Header */}
        <div className="flex items-center gap-3 pb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 text-[#635BFF]">
            <ImageIcon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Background</h3>
        </div>

        {/* Background Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-800 mb-3">
            Background Type
          </label>

          {/* 4 Segmented Tab/Button Options matching Screenshot 2 */}
          <div className="flex flex-wrap items-center gap-3">
            {(["solid", "gradient", "pattern", "image"] as const).map((type) => {
              const isSelected = background.type === type;
              const capitalized = type.charAt(0).toUpperCase() + type.slice(1);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBackground((p) => ({ ...p, type }))}
                  className={`px-8 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "border-2 border-[#635BFF] bg-indigo-50/40 text-[#635BFF] shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  {capitalized}
                </button>
              );
            })}
          </div>
        </div>

        {/* Condition 1: Gradient Direction Selector (shown when type === 'gradient') */}
        {background.type === "gradient" && (
          <div className="pt-2">
            <label className="block text-sm font-semibold text-slate-800 mb-3">
              Gradient Direction
            </label>

            {/* Row of visual gradient preview boxes with rounded corners */}
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {GRADIENT_PRESETS.map((preset) => {
                const isSelected = background.gradientDirection === preset.gradientValue;
                const gradientStyle = preset.css(colorScheme.primaryColor, colorScheme.secondaryColor);

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      setBackground((p) => ({
                        ...p,
                        gradientDirection: preset.gradientValue,
                      }))
                    }
                    className={`h-20 rounded-2xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-end p-2.5 ${
                      isSelected
                        ? "border-2 border-[#635BFF] shadow-xs ring-2 ring-[#635BFF]/10"
                        : "border border-slate-200/90 hover:border-slate-300"
                    }`}
                    style={{ background: gradientStyle }}
                  >
                    <span className="text-[11px] font-semibold text-slate-700 bg-white/70 backdrop-blur-xs px-2 py-0.5 rounded-md w-fit shadow-2xs">
                      {preset.label}
                    </span>
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#635BFF] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Condition 2: Solid Background Color (shown when type === 'solid') */}
        {background.type === "solid" && (
          <div className="pt-2">
            <label className="block text-sm font-semibold text-slate-800 mb-3">
              Solid Background Color
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {[
                { hex: "#FFFFFF", name: "Pure White" },
                { hex: "#F8FAFC", name: "Soft Slate" },
                { hex: "#F3F4F6", name: "Modern Grey" },
                { hex: "#FEF3C7", name: "Warm Champagne" },
                { hex: "#EFF6FF", name: "Ice Blue" },
                { hex: "#FAF5FF", name: "Soft Lavender" },
                { hex: "#0F172A", name: "Obsidian Dark" },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setBackground((p) => ({ ...p, color: c.hex }))}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                    background.color === c.hex
                      ? "border-2 border-[#635BFF] bg-indigo-50/20 text-[#635BFF] font-semibold shadow-xs"
                      : "border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-xs font-medium">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Condition 3: Pattern Background (shown when type === 'pattern') */}
        {background.type === "pattern" && (
          <div className="pt-2">
            <label className="block text-sm font-semibold text-slate-800 mb-3">
              Pattern Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {[
                { id: "dots", name: "Polka Dots", pattern: "radial-gradient(#635bff25 1.5px, transparent 1.5px)" },
                { id: "grid", name: "Clean Grid", pattern: "linear-gradient(to right, #635bff15 1px, transparent 1px), linear-gradient(to bottom, #635bff15 1px, transparent 1px)" },
                { id: "stripes", name: "Diagonal Lines", pattern: "repeating-linear-gradient(45deg, #635bff10, #635bff10 10px, transparent 10px, transparent 20px)" },
                { id: "minimal", name: "Subtle Noise", pattern: "radial-gradient(#1e293b10 1px, #ffffff 1px)" },
              ].map((p) => {
                const isSelected = background.patternUrl === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setBackground((prev) => ({ ...prev, patternUrl: p.id }))}
                    className={`h-20 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-end p-2.5 ${
                      isSelected
                        ? "border-2 border-[#635BFF] shadow-xs"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    style={{
                      backgroundImage: p.pattern,
                      backgroundSize: p.id === "grid" ? "20px 20px" : p.id === "dots" ? "16px 16px" : "auto",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <span className="text-xs font-semibold text-slate-700 bg-white/80 px-2 py-0.5 rounded-md w-fit">
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Condition 4: Image Background (shown when type === 'image') */}
        {background.type === "image" && (
          <div className="pt-2 space-y-3">
            <label className="block text-sm font-semibold text-slate-800">
              Custom Background Image URL
            </label>
            <input
              type="text"
              value={background.imageUrl || ""}
              onChange={(e) => setBackground((p) => ({ ...p, imageUrl: e.target.value }))}
              placeholder="https://example.com/invitation-bg.jpg"
              className="w-full text-sm font-medium text-slate-800 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/20 focus:border-[#635BFF]"
            />
            {background.imageUrl && (
              <div className="w-full h-32 rounded-2xl overflow-hidden border border-slate-200 mt-2 relative">
                <img
                  src={background.imageUrl}
                  alt="Background preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Composite Harmonization Card */}
      <div
        className="rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs relative overflow-hidden transition-all"
        style={{
          background:
            background.type === "gradient"
              ? GRADIENT_PRESETS.find((g) => g.gradientValue === background.gradientDirection)?.css(
                  colorScheme.primaryColor,
                  colorScheme.secondaryColor
                ) || "#ffffff"
              : background.type === "solid"
              ? background.color || "#ffffff"
              : "#ffffff",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#635BFF]" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Live Harmonization Preview
          </span>
        </div>
        <h4
          className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
          style={{
            fontFamily: typography.titleFont,
            color: colorScheme.primaryColor,
          }}
        >
          An Evening Under The Stars
        </h4>
        <p
          className="text-sm sm:text-base max-w-xl leading-relaxed"
          style={{
            fontFamily: typography.bodyFont,
            color: colorScheme.textColor,
          }}
        >
          Join us in celebrating this unforgettable milestone. Cocktails and dinner will follow the ceremony.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <span
            className="px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-xs"
            style={{ backgroundColor: colorScheme.secondaryColor }}
          >
            Confirmed RSVP
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Preset: <strong className="text-slate-700">{colorScheme.preset}</strong>
          </span>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#635BFF] hover:bg-[#5249e0] active:scale-[0.98] transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Design & Fonts</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

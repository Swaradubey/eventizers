"use client";

import React, { useState } from "react";
import {
  Gift,
  HeartHandshake,
  Coins,
  Plus,
  ExternalLink,
  Trash2,
  X,
  Check,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Store,
  Globe,
} from "lucide-react";
import { GiftItem, GiftingState } from "../../types/invitationTypes";

export type { GiftItem, GiftingState };

export interface WishlistData {
  id: string;
  platform: string;
  title: string;
  url: string;
}

export interface CharityData {
  id: string;
  name: string;
  description?: string;
  url?: string;
}

export interface PersonalFundData {
  id: string;
  title: string;
  goal?: string;
  url: string;
}

interface InvitationWorkflowGiftingProps {
  // GiftingState integration
  gifting?: GiftingState;
  onUpdateGifting?: (gifting: GiftingState) => void;

  // Backward compatibility
  wishlists?: WishlistData[];
  charities?: CharityData[];
  personalFunds?: PersonalFundData[];
  onAddWishlist?: (wishlist: WishlistData) => void;
  onRemoveWishlist?: (id: string) => void;
  onAddCharity?: (charity: CharityData) => void;
  onRemoveCharity?: (id: string) => void;
  onAddPersonalFund?: (fund: PersonalFundData) => void;
  onRemovePersonalFund?: (id: string) => void;
}

// Helper to determine partner provider from platform string or URL
export const detectProvider = (platformOrUrl: string): 'amazon' | 'walmart' | 'target' | 'other' => {
  const lower = (platformOrUrl || "").toLowerCase();
  if (lower.includes("amazon")) return "amazon";
  if (lower.includes("target")) return "target";
  if (lower.includes("walmart")) return "walmart";
  return "other";
};

export default function InvitationWorkflowGifting({
  gifting,
  onUpdateGifting,
  wishlists = [],
  charities = [],
  personalFunds = [],
  onAddWishlist,
  onRemoveWishlist,
  onAddCharity,
  onRemoveCharity,
  onAddPersonalFund,
  onRemovePersonalFund,
}: InvitationWorkflowGiftingProps) {
  // Modals
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [wishlistForm, setWishlistForm] = useState<{
    provider: 'amazon' | 'walmart' | 'target' | 'other';
    title: string;
    url: string;
    description: string;
  }>({
    provider: "amazon",
    title: "Amazon Wishlist",
    url: "",
    description: "",
  });

  const [isCharityModalOpen, setIsCharityModalOpen] = useState(false);
  const [charityForm, setCharityForm] = useState({
    name: "American Red Cross",
    description: "Disaster relief and emergency assistance",
    url: "https://www.redcross.org/donate/donation.html/",
  });

  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundForm, setFundForm] = useState({
    title: "Honeymoon & Future Fund",
    description: "Support our new beginning",
    url: "",
  });

  // Consolidate effective items
  const effectiveItems: GiftItem[] = gifting?.items || [
    ...wishlists.map((w): GiftItem => ({
      id: w.id,
      type: "wishlist",
      provider: detectProvider(w.platform || w.url),
      title: w.title || `${w.platform} Wishlist`,
      url: w.url,
      enabled: true,
    })),
    ...charities.map((c): GiftItem => ({
      id: c.id,
      type: "charity",
      provider: "other",
      title: c.name,
      description: c.description || "Charity Donation",
      url: c.url || "",
      enabled: true,
    })),
    ...personalFunds.map((f): GiftItem => ({
      id: f.id,
      type: "fundraiser",
      provider: "other",
      title: f.title,
      description: f.goal ? `Goal: ${f.goal}` : "Personal Cause",
      url: f.url,
      enabled: true,
    })),
  ];

  const updateItems = (nextItems: GiftItem[]) => {
    if (onUpdateGifting) {
      onUpdateGifting({
        enabled: gifting ? gifting.enabled : true,
        items: nextItems,
      });
    }
  };

  const handleToggleItem = (id: string) => {
    const next = effectiveItems.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    updateItems(next);
  };

  const handleDeleteItem = (id: string, type: 'wishlist' | 'charity' | 'fundraiser' | 'custom') => {
    const next = effectiveItems.filter((item) => item.id !== id);
    updateItems(next);

    // Call legacy handlers if provided
    if (type === "wishlist" && onRemoveWishlist) onRemoveWishlist(id);
    if (type === "charity" && onRemoveCharity) onRemoveCharity(id);
    if ((type === "fundraiser" || type === "custom") && onRemovePersonalFund) onRemovePersonalFund(id);
  };

  // Add Wishlist
  const handleSaveWishlist = () => {
    if (!wishlistForm.url.trim()) return;
    const newItem: GiftItem = {
      id: `w-${Date.now()}`,
      type: "wishlist",
      provider: wishlistForm.provider,
      title: wishlistForm.title.trim() || `${wishlistForm.provider.toUpperCase()} Wishlist`,
      description: wishlistForm.description.trim() || undefined,
      url: wishlistForm.url.trim(),
      enabled: true,
    };
    updateItems([...effectiveItems, newItem]);

    if (onAddWishlist) {
      onAddWishlist({
        id: newItem.id,
        platform: wishlistForm.provider.charAt(0).toUpperCase() + wishlistForm.provider.slice(1),
        title: newItem.title,
        url: newItem.url,
      });
    }

    setWishlistForm({ provider: "amazon", title: "Amazon Wishlist", url: "", description: "" });
    setIsWishlistModalOpen(false);
  };

  // Add Charity
  const handleSaveCharity = () => {
    if (!charityForm.name.trim()) return;
    const newItem: GiftItem = {
      id: `c-${Date.now()}`,
      type: "charity",
      provider: "other",
      title: charityForm.name.trim(),
      description: charityForm.description.trim() || "Charity Donation",
      url: charityForm.url.trim(),
      enabled: true,
    };
    updateItems([...effectiveItems, newItem]);

    if (onAddCharity) {
      onAddCharity({
        id: newItem.id,
        name: newItem.title,
        description: newItem.description,
        url: newItem.url,
      });
    }

    setIsCharityModalOpen(false);
  };

  // Add Fund
  const handleSaveFund = () => {
    if (!fundForm.title.trim()) return;
    const newItem: GiftItem = {
      id: `f-${Date.now()}`,
      type: "fundraiser",
      provider: "other",
      title: fundForm.title.trim(),
      description: fundForm.description.trim() || undefined,
      url: fundForm.url.trim(),
      enabled: true,
    };
    updateItems([...effectiveItems, newItem]);

    if (onAddPersonalFund) {
      onAddPersonalFund({
        id: newItem.id,
        title: newItem.title,
        url: newItem.url,
      });
    }

    setIsFundModalOpen(false);
  };

  const wishlistItems = effectiveItems.filter((i) => i.type === "wishlist");
  const charityItems = effectiveItems.filter((i) => i.type === "charity");
  const fundItems = effectiveItems.filter((i) => i.type === "fundraiser" || i.type === "custom");

  return (
    <div className="flex-1 h-full overflow-y-auto bg-white p-6 sm:p-8 space-y-8 text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200/80 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Evite-Style Gifting
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Event Gifting &amp; Registries
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Give your guests easy ways to celebrate you by linking wishlists, registries, or supporting meaningful charities.
            </p>
          </div>
          {effectiveItems.length > 0 && (
            <div className="text-right shrink-0">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {effectiveItems.filter((i) => i.enabled).length} Active Link(s)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 1. Section: Add a wishlist */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-4 h-4 text-[#3e5622]" />
            Add a Wishlist or Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Take the guesswork out of gifting by linking your Amazon, Target, Walmart, or custom registry.
          </p>
        </div>

        {/* Partner Logos Bar */}
        <div className="flex items-center gap-4 py-2.5 px-4 bg-slate-50/80 rounded-xl border border-slate-200/70 select-none flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-1">Supported Partners:</span>
          {/* Amazon */}
          <button
            type="button"
            onClick={() => {
              setWishlistForm({
                provider: "amazon",
                title: "Amazon Wishlist",
                url: "",
                description: "View and buy from our Amazon list",
              });
              setIsWishlistModalOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-xs font-black tracking-tight text-slate-800 transition-all cursor-pointer shadow-2xs"
          >
            amazon
            <span className="text-amber-500 text-xs ml-0.5">⌣</span>
          </button>
          {/* Target */}
          <button
            type="button"
            onClick={() => {
              setWishlistForm({
                provider: "target",
                title: "Target Registry",
                url: "",
                description: "Target gift registry items",
              });
              setIsWishlistModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-red-400 text-xs font-extrabold text-[#cc0000] transition-all cursor-pointer shadow-2xs"
          >
            <span className="w-3.5 h-3.5 rounded-full border-2 border-[#cc0000] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cc0000]" />
            </span>
            TARGET
          </button>
          {/* Walmart */}
          <button
            type="button"
            onClick={() => {
              setWishlistForm({
                provider: "walmart",
                title: "Walmart Registry",
                url: "",
                description: "Walmart registry & gift ideas",
              });
              setIsWishlistModalOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs font-bold text-[#0071dc] transition-all cursor-pointer shadow-2xs"
          >
            Walmart <span className="text-amber-400 font-black text-xs">✱</span>
          </button>
          {/* Custom Link */}
          <button
            type="button"
            onClick={() => {
              setWishlistForm({
                provider: "other",
                title: "Online Gift Registry",
                url: "",
                description: "Our custom registry",
              });
              setIsWishlistModalOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-400 text-xs font-semibold text-slate-600 transition-all cursor-pointer shadow-2xs"
          >
            <Globe className="w-3 h-3 text-slate-400" />
            Custom URL
          </button>
        </div>

        {/* Wishlist item row */}
        <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3e5622]/10 flex items-center justify-center text-[#3e5622]">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Wishlist &amp; Registry Links</p>
              <p className="text-xs text-slate-500">
                {wishlistItems.length > 0
                  ? `${wishlistItems.filter((w) => w.enabled).length} of ${wishlistItems.length} active`
                  : "Link your favorite online stores"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsWishlistModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Wishlist
          </button>
        </div>

        {/* Added Wishlists list */}
        {wishlistItems.length > 0 && (
          <div className="space-y-2 pt-1">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  item.enabled
                    ? "bg-slate-50/70 border-slate-200"
                    : "bg-slate-100/50 border-dashed border-slate-300 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3 truncate pr-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                      item.provider === "amazon"
                        ? "bg-amber-100 text-amber-900"
                        : item.provider === "target"
                        ? "bg-red-100 text-red-800"
                        : item.provider === "walmart"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {item.provider === "amazon" ? "Amz" : item.provider === "target" ? "Tgt" : item.provider === "walmart" ? "Wmt" : "Gift"}
                  </span>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{item.title}</span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-0.5 text-[11px] shrink-0"
                      >
                        Visit <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 truncate">{item.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleItem(item.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={item.enabled ? "Disable link" : "Enable link"}
                  >
                    {item.enabled ? (
                      <ToggleRight className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id, "wishlist")}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Section: Charity Donations */}
      <div className="space-y-4 pt-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-rose-500" />
            Fundraise for Charity
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Suggest a charitable cause close to your heart instead of physical gifts.
          </p>
        </div>

        {/* Charity Row */}
        <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Charity Donations</p>
              <p className="text-xs text-slate-500">
                {charityItems.length > 0
                  ? `${charityItems.filter((c) => c.enabled).length} charity cause(s) listed`
                  : "Support Red Cross, UNICEF, St. Jude, or any non-profit"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCharityModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Charity
          </button>
        </div>

        {/* Added Charity List */}
        {charityItems.length > 0 && (
          <div className="space-y-2 pt-1">
            {charityItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  item.enabled
                    ? "bg-rose-50/40 border-rose-200/80"
                    : "bg-slate-100/50 border-dashed border-slate-300 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3 truncate pr-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{item.title}</span>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-rose-600 hover:text-rose-800 inline-flex items-center gap-0.5 text-[11px] shrink-0"
                        >
                          Donate link <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 truncate">{item.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleItem(item.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={item.enabled ? "Disable charity" : "Enable charity"}
                  >
                    {item.enabled ? (
                      <ToggleRight className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id, "charity")}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                    title="Remove charity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Section: Personal Cause / Cash Fund */}
      <div className="space-y-4 pt-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-500" />
            Raise Money for a Personal Cause
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Honeymoon fund, baby fund, or cash gifting link (PayPal, Venmo, GoFundMe).
          </p>
        </div>

        {/* Personal Fund Row */}
        <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Personal Cash Fund / Fundraiser</p>
              <p className="text-xs text-slate-500">
                {fundItems.length > 0
                  ? `${fundItems.filter((f) => f.enabled).length} fund(s) active`
                  : "Link your honeymoon or group gift pool"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFundModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Fund
          </button>
        </div>

        {/* Added Funds List */}
        {fundItems.length > 0 && (
          <div className="space-y-2 pt-1">
            {fundItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  item.enabled
                    ? "bg-amber-50/40 border-amber-200/80"
                    : "bg-slate-100/50 border-dashed border-slate-300 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3 truncate pr-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{item.title}</span>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-700 hover:text-amber-900 inline-flex items-center gap-0.5 text-[11px] shrink-0 font-semibold"
                        >
                          Payment link <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 truncate">{item.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleItem(item.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={item.enabled ? "Disable fund" : "Enable fund"}
                  >
                    {item.enabled ? (
                      <ToggleRight className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id, "fundraiser")}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                    title="Remove fund"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wishlist Add Modal */}
      {isWishlistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#3e5622]" />
                <h3 className="text-base font-bold text-slate-900">Add Wishlist Link</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWishlistModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Partner Provider</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["amazon", "target", "walmart", "other"] as const).map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => {
                        const defaultTitles: Record<string, string> = {
                          amazon: "Amazon Wishlist",
                          target: "Target Registry",
                          walmart: "Walmart Registry",
                          other: "Gift Registry",
                        };
                        setWishlistForm((p) => ({
                          ...p,
                          provider: prov,
                          title: defaultTitles[prov] || p.title,
                        }));
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border capitalize transition-all cursor-pointer ${
                        wishlistForm.provider === prov
                          ? "border-[#3e5622] bg-[#3e5622]/10 text-[#3e5622]"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                      }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={wishlistForm.title}
                  onChange={(e) => setWishlistForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Birthday Wishlist"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#3e5622] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Link URL *</label>
                <input
                  type="url"
                  value={wishlistForm.url}
                  onChange={(e) => {
                    const urlVal = e.target.value;
                    const detected = detectProvider(urlVal);
                    setWishlistForm((p) => ({
                      ...p,
                      url: urlVal,
                      provider: detected !== "other" && p.provider === "other" ? detected : p.provider,
                    }));
                  }}
                  placeholder="https://www.amazon.com/baby-reg/..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#3e5622] outline-none font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Optional Note or Subtext</label>
                <input
                  type="text"
                  value={wishlistForm.description}
                  onChange={(e) => setWishlistForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. Nursery essentials, books, or gift cards"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#3e5622] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsWishlistModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveWishlist}
                disabled={!wishlistForm.url.trim()}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#3e5622] hover:bg-[#32481b] text-white disabled:opacity-50 transition-all cursor-pointer"
              >
                Save Wishlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charity Add Modal */}
      {isCharityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-slate-900">Select or Enter a Charity</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCharityModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Quick Presets</label>
              <div className="grid grid-cols-2 gap-2 text-left">
                {[
                  { name: "American Red Cross", url: "https://www.redcross.org/donate/donation.html/", desc: "Disaster relief & humanitarian aid" },
                  { name: "UNICEF", url: "https://www.unicef.org/", desc: "Support children worldwide" },
                  { name: "St. Jude Children's", url: "https://www.stjude.org/donate/", desc: "Fighting childhood cancer" },
                  { name: "World Wildlife Fund", url: "https://www.worldwildlife.org/", desc: "Conservation & nature preservation" },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      setCharityForm({
                        name: item.name,
                        description: item.desc,
                        url: item.url,
                      });
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      charityForm.name === item.name
                        ? "border-rose-500 bg-rose-50 text-rose-900 font-bold"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <p className="font-bold truncate">{item.name}</p>
                    <p className="text-[10px] opacity-75 truncate">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Charity Name *</label>
                <input
                  type="text"
                  value={charityForm.name}
                  onChange={(e) => setCharityForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. American Red Cross, UNICEF"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Donation Link URL *</label>
                <input
                  type="url"
                  value={charityForm.url}
                  onChange={(e) => setCharityForm((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://www.charity.org/donate"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cause Description</label>
                <input
                  type="text"
                  value={charityForm.description}
                  onChange={(e) => setCharityForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. In lieu of gifts, please consider a donation"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCharityModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCharity}
                disabled={!charityForm.name.trim()}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#3e5622] hover:bg-[#32481b] text-white disabled:opacity-50 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personal Fund Modal */}
      {isFundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Personal Cause / Cash Fund</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFundModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fund Name or Cause *</label>
                <input
                  type="text"
                  value={fundForm.title}
                  onChange={(e) => setFundForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Honeymoon Fund, College Fund"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment / Donation Link *</label>
                <input
                  type="url"
                  value={fundForm.url}
                  onChange={(e) => setFundForm((p) => ({ ...p, url: e.target.value }))}
                  placeholder="PayPal, Venmo, GoFundMe, or Cash App link"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Goal Note</label>
                <input
                  type="text"
                  value={fundForm.description}
                  onChange={(e) => setFundForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. Help send us on our dream getaway to Italy"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsFundModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFund}
                disabled={!fundForm.title.trim()}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#3e5622] hover:bg-[#32481b] text-white disabled:opacity-50 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

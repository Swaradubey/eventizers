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
} from "lucide-react";

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
  wishlists: WishlistData[];
  charities: CharityData[];
  personalFunds: PersonalFundData[];
  onAddWishlist: (wishlist: WishlistData) => void;
  onRemoveWishlist: (id: string) => void;
  onAddCharity: (charity: CharityData) => void;
  onRemoveCharity: (id: string) => void;
  onAddPersonalFund: (fund: PersonalFundData) => void;
  onRemovePersonalFund: (id: string) => void;
}

export default function InvitationWorkflowGifting({
  wishlists,
  charities,
  personalFunds,
  onAddWishlist,
  onRemoveWishlist,
  onAddCharity,
  onRemoveCharity,
  onAddPersonalFund,
  onRemovePersonalFund,
}: InvitationWorkflowGiftingProps) {
  // Modal states for adding
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [wishlistForm, setWishlistForm] = useState({ platform: "Amazon", title: "Registry", url: "" });

  const [isCharityModalOpen, setIsCharityModalOpen] = useState(false);
  const [charityForm, setCharityForm] = useState({ name: "Red Cross", url: "https://www.redcross.org" });

  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundForm, setFundForm] = useState({ title: "Honeymoon & Future Fund", url: "" });

  const handleSaveWishlist = () => {
    if (!wishlistForm.url.trim()) return;
    onAddWishlist({
      id: "w-" + Date.now(),
      platform: wishlistForm.platform,
      title: wishlistForm.title || `${wishlistForm.platform} Wishlist`,
      url: wishlistForm.url.trim(),
    });
    setWishlistForm({ platform: "Amazon", title: "Registry", url: "" });
    setIsWishlistModalOpen(false);
  };

  const handleSaveCharity = () => {
    if (!charityForm.name.trim()) return;
    onAddCharity({
      id: "c-" + Date.now(),
      name: charityForm.name.trim(),
      url: charityForm.url.trim(),
    });
    setIsCharityModalOpen(false);
  };

  const handleSaveFund = () => {
    if (!fundForm.title.trim()) return;
    onAddPersonalFund({
      id: "f-" + Date.now(),
      title: fundForm.title.trim(),
      url: fundForm.url.trim(),
    });
    setIsFundModalOpen(false);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-white p-6 sm:p-8 space-y-8 text-slate-800">
      {/* 1. Section: Add a wishlist */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add a wishlist</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Take the guesswork out of gifting by linking out to a wishlist.
          </p>
        </div>

        {/* Partner Logos Preview */}
        <div className="flex items-center gap-5 py-2 select-none flex-wrap">
          {/* Amazon */}
          <span className="text-sm font-black tracking-tighter text-slate-800 flex items-center font-sans">
            amazon
            <span className="text-amber-500 text-xs ml-0.5">⌣</span>
          </span>
          {/* Walmart */}
          <span className="text-sm font-bold text-[#0071dc] flex items-center gap-0.5">
            Walmart <span className="text-amber-400 font-black text-xs">✱</span>
          </span>
          {/* Target */}
          <span className="text-sm font-extrabold text-[#cc0000] flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-[#cc0000] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cc0000]" />
            </span>
            TARGET
          </span>
          <span className="text-xs font-semibold text-slate-400">&amp; more</span>
        </div>

        {/* Wishlist item row */}
        <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Wishlist</p>
              {wishlists.length > 0 && (
                <p className="text-xs text-emerald-600 font-medium">
                  {wishlists.length} link(s) added
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsWishlistModalOpen(true)}
            className="px-4 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
          >
            Add
          </button>
        </div>

        {/* Added Wishlists list */}
        {wishlists.length > 0 && (
          <div className="space-y-2 pt-1">
            {wishlists.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="font-bold text-slate-800">{item.platform}:</span>
                  <span className="text-slate-600 truncate">{item.title}</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveWishlist(item.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Section: Fundraise for charity or a personal cause */}
      <div className="space-y-4 pt-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Fundraise for charity or a personal cause
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Make it easy for guests to donate.
          </p>
        </div>

        {/* Charity Row */}
        <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Select a charity</p>
              {charities.length > 0 && (
                <p className="text-xs text-emerald-600 font-medium">
                  {charities.map((c) => c.name).join(", ")}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCharityModalOpen(true)}
            className="px-4 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
          >
            Add
          </button>
        </div>

        {/* Personal Cause / Fund Row */}
        <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Raise money for yourself or someone else
              </p>
              {personalFunds.length > 0 && (
                <p className="text-xs text-emerald-600 font-medium">
                  {personalFunds.map((f) => f.title).join(", ")}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFundModalOpen(true)}
            className="px-4 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      {/* Wishlist Add Modal */}
      {isWishlistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add Wishlist Link</h3>
              <button
                type="button"
                onClick={() => setIsWishlistModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Platform</label>
                <select
                  value={wishlistForm.platform}
                  onChange={(e) => setWishlistForm((p) => ({ ...p, platform: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none"
                >
                  <option value="Amazon">Amazon</option>
                  <option value="Target">Target</option>
                  <option value="Walmart">Walmart</option>
                  <option value="Crate & Barrel">Crate &amp; Barrel</option>
                  <option value="Custom">Other Wishlist / Registry</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={wishlistForm.title}
                  onChange={(e) => setWishlistForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Birthday Wishlist"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Link URL*</label>
                <input
                  type="url"
                  value={wishlistForm.url}
                  onChange={(e) => setWishlistForm((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsWishlistModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveWishlist}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#3e5622] hover:bg-[#32481b] text-white"
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
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Select or Enter a Charity</h3>
              <button
                type="button"
                onClick={() => setIsCharityModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Charity Name*
                </label>
                <input
                  type="text"
                  value={charityForm.name}
                  onChange={(e) => setCharityForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. American Red Cross, UNICEF"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Donation Link (Optional)
                </label>
                <input
                  type="url"
                  value={charityForm.url}
                  onChange={(e) => setCharityForm((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCharityModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCharity}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#3e5622] hover:bg-[#32481b] text-white"
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
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Personal Cause / Fund</h3>
              <button
                type="button"
                onClick={() => setIsFundModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Fund Name or Cause*
                </label>
                <input
                  type="text"
                  value={fundForm.title}
                  onChange={(e) => setFundForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Honeymoon Fund, College Fund"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Payment / Donation Link
                </label>
                <input
                  type="url"
                  value={fundForm.url}
                  onChange={(e) => setFundForm((p) => ({ ...p, url: e.target.value }))}
                  placeholder="GoFundMe, PayPal, or Venmo link"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFundModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFund}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#3e5622] hover:bg-[#32481b] text-white"
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

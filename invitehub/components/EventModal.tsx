"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, MapPin, Tag, Info, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import eventService, { Event } from "../services/eventService";
import adminService from "../services/adminService";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  eventToEdit?: Event | null;
  isAdmin?: boolean;
}

const EVENT_TYPES = [
  "Wedding",
  "Conference",
  "Concert",
  "Birthday",
  "Corporate Meeting",
  "Dinner Party",
  "Seminar",
  "Exhibition",
  "Workshop",
  "Other",
];

const STATUSES = ["draft", "published", "cancelled"];

export default function EventModal({
  isOpen,
  onClose,
  onSuccess,
  eventToEdit = null,
  isAdmin = false,
}: EventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "Wedding",
    venue: "",
    address: "",
    city: "",
    state: "",
    country: "",
    eventDate: "",
    eventTime: "",
    status: "draft",
    coverImage: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";

      return () => {
        document.body.style.overflow = "";
        document.body.style.touchAction = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Populate form if we are editing an event
  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title || "",
        description: eventToEdit.description || "",
        eventType: eventToEdit.eventType || "Wedding",
        venue: eventToEdit.venue || "",
        address: eventToEdit.address || "",
        city: eventToEdit.city || "",
        state: eventToEdit.state || "",
        country: eventToEdit.country || "",
        eventDate: eventToEdit.eventDate || "",
        eventTime: eventToEdit.eventTime || "",
        status: eventToEdit.status || "draft",
        coverImage: eventToEdit.coverImage || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        eventType: "Wedding",
        venue: "",
        address: "",
        city: "",
        state: "",
        country: "",
        eventDate: "",
        eventTime: "",
        status: "draft",
        coverImage: "",
      });
    }
    setError(null);
  }, [eventToEdit, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!formData.title.trim()) {
      setError("Event Name (Title) is required.");
      return;
    }
    if (!formData.eventDate) {
      setError("Event Date is required.");
      return;
    }
    if (!formData.eventTime) {
      setError("Event Time is required.");
      return;
    }
    if (!formData.venue.trim()) {
      setError("Venue is required.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        eventType: formData.eventType || undefined,
        venue: formData.venue.trim(),
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        country: formData.country.trim() || undefined,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        status: formData.status || "draft",
        coverImage: formData.coverImage.trim() || undefined,
      };

      if (isAdmin) {
        if (eventToEdit && eventToEdit.id) {
          await adminService.updateAdminEvent(eventToEdit.id, payload);
          onSuccess("Event updated successfully!");
        } else {
          await adminService.createAdminEvent(payload);
          onSuccess("Event created successfully!");
        }
      } else {
        if (eventToEdit && eventToEdit.id) {
          await eventService.updateEvent(eventToEdit.id, payload);
          onSuccess("Event updated successfully!");
        } else {
          await eventService.createEvent(payload);
          onSuccess("Event created successfully!");
        }
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error || "An error occurred while saving the event. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2D1B3D]/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-[#FAF8F5] w-full max-w-2xl max-h-[90vh] my-auto flex flex-col rounded-2xl shadow-2xl border border-[#E8C4B8]/30 overflow-hidden z-10 font-body text-[#2D1B3D]"
          >
            {/* Header */}
            <div className="bg-[#2D1B3D] text-white px-6 py-4 flex items-center justify-between border-b border-[#E8C4B8]/20 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#C9A84C]" />
                </div>
                <h3
                  className="text-xl font-semibold font-display tracking-wide"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {eventToEdit ? "Edit Event" : "Create Event"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2 animate-shake flex-shrink-0">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
              {/* Event Name */}
              <div>
                <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                  Event Name <span className="text-[#C9A84C]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="E.g., Sarah & John's Wedding"
                    className="w-full px-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Share details about the event..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                />
              </div>

              {/* Event Type & Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                    Event Type
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                    Date <span className="text-[#C9A84C]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                      required
                    />
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-[#C9A84C]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                    Time <span className="text-[#C9A84C]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      name="eventTime"
                      value={formData.eventTime}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                      required
                    />
                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-[#C9A84C]" />
                  </div>
                </div>
              </div>

              {/* Venue & Cover Image Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                    Venue <span className="text-[#C9A84C]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      placeholder="E.g., The Plaza Hall"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                      required
                    />
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-[#C9A84C]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    placeholder="E.g., https://images.unsplash.com/photo..."
                    className="w-full px-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
                  className="w-full px-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                />
              </div>

              {/* City, State, Country Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full px-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full px-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D1B3D]/70 uppercase tracking-wider mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Country"
                    className="w-full px-3 py-2 bg-white border border-[#E8C4B8]/40 rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all text-[#2D1B3D]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E8C4B8]/30">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-[#2D1B3D] bg-white border border-[#E8C4B8]/50 rounded-xl hover:bg-[#F0EBE8] active:scale-95 transition-all focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-[#FAF8F5] bg-[#2D1B3D] rounded-xl hover:bg-[#3d2a52] active:scale-95 transition-all shadow-md focus:outline-none disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : null}
                  {eventToEdit ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSidebar } from "../../../context/SidebarContext";
import { useAuth } from "../../../context/AuthContext";
import Navbar from "../../../components/Navbar";
import gpsCheckInService, {
  GpsEvent,
  GpsArrival,
} from "../../../services/gpsCheckInService";
import {
  MapPin,
  Crosshair,
  SlidersHorizontal,
  Radio,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  ChevronDown,
  Navigation,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Info,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Standard Haversine distance formula in meters
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function GpsCheckInContent() {
  const { user } = useAuth();
  const { setIsOpen: setSidebarOpen } = useSidebar();
  const searchParams = useSearchParams();
  const queryEventId = searchParams?.get("eventId") || null;

  // Events & selection
  const [events, setEvents] = useState<GpsEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(queryEventId);
  const [currentEvent, setCurrentEvent] = useState<GpsEvent | null>(null);
  const [eventsLoading, setEventsLoading] = useState(true);

  // User Coordinates & Geofence
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Geofence radius
  const [geofenceRadius, setGeofenceRadius] = useState<number>(150);
  const [isUpdatingRadius, setIsUpdatingRadius] = useState(false);

  // Check-In Action state
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);
  const [checkInResult, setCheckInResult] = useState<{
    success: boolean;
    message: string;
    distance?: number;
    checkedInAt?: string;
  } | null>(null);

  // Live Arrivals Stream
  const [arrivals, setArrivals] = useState<GpsArrival[]>([]);
  const [arrivalsLoading, setArrivalsLoading] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load events list on mount
  useEffect(() => {
    async function loadEvents() {
      setEventsLoading(true);
      try {
        const list = await gpsCheckInService.getEventsList();
        setEvents(list);

        if (list.length > 0) {
          const matched = queryEventId ? list.find((e) => e.id === queryEventId) : null;
          const meetup = list.find((e) => e.title?.toLowerCase().includes("community meetup"));
          const initial = matched || meetup || list[0];

          setSelectedEventId(initial.id);
          setCurrentEvent(initial);
          if (initial.geofenceRadius) {
            setGeofenceRadius(Number(initial.geofenceRadius));
          }
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setEventsLoading(false);
      }
    }
    loadEvents();
  }, [queryEventId]);

  // When selected event changes, fetch full details & arrivals
  useEffect(() => {
    if (!selectedEventId) return;

    async function loadEventData() {
      try {
        const details = await gpsCheckInService.getEventDetails(selectedEventId!);
        if (details) {
          setCurrentEvent(details);
          if (details.geofenceRadius) {
            setGeofenceRadius(Number(details.geofenceRadius));
          }
        }
      } catch (err) {
        console.error("Failed to fetch event details:", err);
      }

      loadArrivals(selectedEventId!);
    }

    loadEventData();
  }, [selectedEventId]);

  // Fetch arrivals function
  const loadArrivals = async (eventId: string) => {
    try {
      setArrivalsLoading(true);
      const res = await gpsCheckInService.getLiveArrivals(eventId);
      if (res && res.success) {
        setArrivals(res.arrivals || []);
      }
    } catch (err) {
      console.error("Failed to fetch arrivals:", err);
    } finally {
      setArrivalsLoading(false);
    }
  };

  // Poll arrivals every 7 seconds
  useEffect(() => {
    if (!selectedEventId) return;
    const interval = setInterval(() => {
      loadArrivals(selectedEventId);
    }, 7000);
    return () => clearInterval(interval);
  }, [selectedEventId]);

  // Trigger browser geolocation
  const fetchLocation = (showToast = false) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      if (showToast) {
        setToast({ type: "error", message: "Geolocation not supported by this browser." });
      }
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setUserCoords(coords);
        setIsLocating(false);

        recalculateDistance(coords, currentEvent);

        if (showToast) {
          setToast({ type: "success", message: "Location updated successfully." });
        }
      },
      (err) => {
        setIsLocating(false);
        let errorMsg = "Unable to retrieve GPS location.";
        if (err.code === 1) {
          errorMsg = "Location permission denied. Please allow location access in your browser settings.";
        } else if (err.code === 2) {
          errorMsg = "Position unavailable. Please ensure GPS/location services are enabled.";
        } else if (err.code === 3) {
          errorMsg = "Location request timed out. Please try again.";
        }
        setLocationError(errorMsg);
        if (showToast) {
          setToast({ type: "error", message: errorMsg });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  // Recalculate distance between user and event coordinates
  const recalculateDistance = (
    coords: { latitude: number; longitude: number } | null,
    event: GpsEvent | null
  ) => {
    if (!coords || !event) {
      setDistanceMeters(null);
      return;
    }

    const venueLat =
      event.venueLatitude !== null && event.venueLatitude !== undefined
        ? Number(event.venueLatitude)
        : 28.535517;
    const venueLon =
      event.venueLongitude !== null && event.venueLongitude !== undefined
        ? Number(event.venueLongitude)
        : 77.391029;

    const d = calculateHaversineDistance(
      coords.latitude,
      coords.longitude,
      venueLat,
      venueLon
    );
    setDistanceMeters(d);
  };

  // Fetch location on initial load
  useEffect(() => {
    fetchLocation(false);
  }, []);

  // Recalculate distance whenever user coords or current event changes
  useEffect(() => {
    if (userCoords && currentEvent) {
      recalculateDistance(userCoords, currentEvent);
    }
  }, [userCoords, currentEvent]);

  // Handle Event selection change
  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedEventId(newId);
    const found = events.find((ev) => ev.id === newId) || null;
    setCurrentEvent(found);
    if (found?.geofenceRadius) {
      setGeofenceRadius(Number(found.geofenceRadius));
    }
    setCheckInResult(null);
  };

  // Handle Self Check-In with GPS
  const handleGpsCheckIn = async () => {
    if (!selectedEventId) {
      setToast({ type: "error", message: "Please select an event first." });
      return;
    }

    setIsSubmittingCheckIn(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setIsSubmittingCheckIn(false);
      setToast({ type: "error", message: "Geolocation not supported by this browser." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setUserCoords(coords);
        recalculateDistance(coords, currentEvent);

        try {
          const res = await gpsCheckInService.submitGpsCheckIn(selectedEventId, coords);

          if (res.success) {
            setCheckInResult({
              success: true,
              message: res.message || "Checked in successfully via GPS!",
              distance: res.distance,
              checkedInAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            });
            setToast({ type: "success", message: "Venue check-in successful! Welcome to the event." });
            loadArrivals(selectedEventId);
          } else {
            setCheckInResult({
              success: false,
              message: res.message || "You are outside the check-in perimeter.",
              distance: res.distance,
            });
            setToast({
              type: "error",
              message: res.message || `You are outside the ${geofenceRadius}m check-in perimeter (${res.distance}m away).`,
            });
          }
        } catch (err: any) {
          const apiError = err?.response?.data?.message || err?.response?.data?.error;
          const dist = err?.response?.data?.distance;

          setCheckInResult({
            success: false,
            message: apiError || "Failed to process check-in.",
            distance: dist,
          });

          setToast({
            type: "error",
            message:
              apiError ||
              (dist
                ? `You are ${dist}m away, which is outside the ${geofenceRadius}m perimeter.`
                : "Failed to process check-in. Please try again."),
          });
        } finally {
          setIsSubmittingCheckIn(false);
        }
      },
      (err) => {
        setIsSubmittingCheckIn(false);
        let errorMsg = "Unable to retrieve GPS coordinates.";
        if (err.code === 1) {
          errorMsg = "Location permission denied. Please allow location access in your browser.";
        }
        setLocationError(errorMsg);
        setToast({ type: "error", message: errorMsg });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle updating geofence perimeter radius
  const handleRadiusSelect = async (radius: number) => {
    if (!selectedEventId || radius === geofenceRadius) return;
    setGeofenceRadius(radius);
    setIsUpdatingRadius(true);

    try {
      await gpsCheckInService.updateGeofenceRadius(selectedEventId, {
        geofenceRadius: radius,
      });
      setToast({
        type: "success",
        message: `Geofence perimeter set to ${radius}m.`,
      });
      if (currentEvent) {
        setCurrentEvent({ ...currentEvent, geofenceRadius: radius });
      }
    } catch (err) {
      console.error("Failed to update geofence:", err);
      setToast({ type: "error", message: "Failed to update geofence on server." });
    } finally {
      setIsUpdatingRadius(false);
    }
  };

  // Helper: Synchronize venue location to current position
  const handleSyncVenueToCurrentLocation = async () => {
    if (!selectedEventId || !userCoords) return;
    setIsUpdatingRadius(true);
    try {
      await gpsCheckInService.updateGeofenceRadius(selectedEventId, {
        geofenceRadius,
        venueLatitude: userCoords.latitude,
        venueLongitude: userCoords.longitude,
      });
      if (currentEvent) {
        setCurrentEvent({
          ...currentEvent,
          venueLatitude: userCoords.latitude,
          venueLongitude: userCoords.longitude,
        });
      }
      setDistanceMeters(0);
      setToast({
        type: "success",
        message: "Venue coordinates synced to your current GPS position! Distance is now 0m.",
      });
    } catch (err) {
      setToast({ type: "error", message: "Could not sync venue coordinates." });
    } finally {
      setIsUpdatingRadius(false);
    }
  };

  const isWithinPerimeter =
    distanceMeters !== null && distanceMeters <= geofenceRadius;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 z-50 max-w-md shadow-lg rounded-xl overflow-hidden border"
          >
            <div
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium ${
                toast.type === "success"
                  ? "bg-emerald-600 text-white border-emerald-700"
                  : toast.type === "error"
                  ? "bg-rose-600 text-white border-rose-700"
                  : "bg-blue-600 text-white border-blue-700"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : toast.type === "error" ? (
                <AlertCircle className="w-5 h-5 shrink-0" />
              ) : (
                <Info className="w-5 h-5 shrink-0" />
              )}
              <span className="leading-snug">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {/* TOP BAR / EVENT SELECTOR */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Event dropdown selector */}
            <div className="flex-1 relative">
              <label
                htmlFor="gps-event-selector"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
              >
                Active Event
              </label>
              <div className="relative">
                <select
                  id="gps-event-selector"
                  value={selectedEventId || ""}
                  onChange={handleEventChange}
                  disabled={eventsLoading || events.length === 0}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-sm sm:text-base font-semibold rounded-xl px-3.5 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {eventsLoading ? (
                    <option value="">Loading events...</option>
                  ) : events.length === 0 ? (
                    <option value="">No events available</option>
                  ) : (
                    events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} {ev.venue ? `(${ev.venue})` : ""}
                      </option>
                    ))
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Re-center / Location refresh button */}
            <div className="flex items-end sm:items-center gap-2 pt-1 sm:pt-6">
              <button
                type="button"
                onClick={() => fetchLocation(true)}
                disabled={isLocating}
                title="Refresh GPS location & re-center"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition-all duration-150 disabled:opacity-60 shadow-2xs"
              >
                <Crosshair
                  className={`w-4 h-4 text-blue-600 ${isLocating ? "animate-spin text-blue-500" : ""}`}
                />
                <span>{isLocating ? "Locating..." : "Refresh GPS"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* CARD 1: EVENT LOCATION & PROXIMITY BADGE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400" />

          {/* Centered map pin icon inside subtle circular shadow badge */}
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-sm mx-auto mb-4 ring-4 ring-blue-50/60 transition-transform duration-300 hover:scale-105">
            <MapPin className="w-8 h-8 drop-shadow-xs" />
          </div>

          {/* Event title & venue subtitle */}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
            {currentEvent ? currentEvent.title : "Select an Event"}
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 mt-1.5">
            <Navigation className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {currentEvent?.venue || currentEvent?.address || "Oakwood Community Park"}
            </span>
          </div>

          {/* Distance chip / pill showing calculated distance & perimeter */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {distanceMeters !== null ? (
              <span
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide border shadow-2xs transition-all ${
                  isWithinPerimeter
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isWithinPerimeter ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                {isWithinPerimeter
                  ? `Within Perimeter (${distanceMeters}m Away • Radius: ${geofenceRadius}m)`
                  : `${distanceMeters}m Away (Radius: ${geofenceRadius}m)`}
              </span>
            ) : isLocating ? (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-slate-100 text-slate-600 border border-slate-200 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                Calculating distance to venue...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                GPS location needed to measure distance
              </span>
            )}
          </div>

          {/* Quick Demo Assist Banner if outside perimeter */}
          {distanceMeters !== null && !isWithinPerimeter && (
            <div className="mt-5 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-left">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Testing from home or office? You can sync the venue location to your current GPS position.
                </span>
              </div>
              <button
                type="button"
                onClick={handleSyncVenueToCurrentLocation}
                disabled={isUpdatingRadius}
                className="shrink-0 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors"
              >
                Sync Venue Here
              </button>
            </div>
          )}
        </div>

        {/* CARD 2: SELF CHECK-IN (GUEST ACTION) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Self Check-In (Guest Action)
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Arrived at the event? Tap below to verify your GPS location and check in automatically.
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Location permission or outside perimeter error feedback */}
          {locationError && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{locationError}</span>
            </div>
          )}

          {/* Previous check-in status display */}
          {checkInResult && (
            <div
              className={`mt-4 p-4 rounded-xl border text-sm flex items-start gap-3 ${
                checkInResult.success
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                  : "bg-amber-50/80 border-amber-200 text-amber-900"
              }`}
            >
              {checkInResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{checkInResult.message}</p>
                {checkInResult.distance !== undefined && (
                  <p className="text-xs mt-0.5 opacity-90">
                    Verified Distance: {checkInResult.distance}m (Geofence Limit: {geofenceRadius}m)
                  </p>
                )}
                {checkInResult.checkedInAt && (
                  <p className="text-xs mt-0.5 opacity-80">
                    Checked in at {checkInResult.checkedInAt}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Full-width action button [Check In With GPS] */}
          <div className="mt-5">
            <button
              type="button"
              onClick={handleGpsCheckIn}
              disabled={isSubmittingCheckIn || !selectedEventId}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-white transition-all duration-150 shadow-sm flex items-center justify-center gap-2 text-base ${
                isSubmittingCheckIn
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99] hover:shadow-md cursor-pointer"
              }`}
            >
              {isSubmittingCheckIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying GPS Location...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" />
                  <span>Check In With GPS</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* CARD 3: GEOFENCE PERIMETER RADIUS (CONFIGURABLE) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Geofence Perimeter Radius
                </h2>
                {isUpdatingRadius && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Sets the allowable boundary around the venue for automatic guest check-in.
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
          </div>

          {/* Segmented pill buttons: 50m, 150m, 300m, 500m */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
            {[50, 150, 300, 500].map((radius) => {
              const isSelected = geofenceRadius === radius;
              return (
                <button
                  key={radius}
                  type="button"
                  onClick={() => handleRadiusSelect(radius)}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 border cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/20"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[2.5]" />}
                  <span>{radius}m</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CARD 4: LIVE ARRIVALS STREAM */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm">
          {/* Header with counter badge & live broadcast icon */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Live Arrivals Stream
              </h2>
              {/* Pulse live icon ((•)) */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live</span>
              </div>
            </div>

            {/* Arrival counter badge */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold tracking-wide">
                {arrivals.length} Arrived
              </span>
              <button
                type="button"
                onClick={() => selectedEventId && loadArrivals(selectedEventId)}
                title="Refresh arrivals"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${arrivalsLoading ? "animate-spin text-blue-600" : ""}`} />
              </button>
            </div>
          </div>

          {/* Stream list or empty state */}
          <div className="mt-5">
            {arrivals.length === 0 ? (
              // Empty State
              <div className="py-12 px-4 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-7 h-7" />
                </div>
                <p className="text-sm font-medium text-slate-600 max-w-sm mx-auto">
                  No guests checked in yet. Arrivals will appear here in real-time.
                </p>
              </div>
            ) : (
              // Filled State: List of checked-in guests
              <div className="divide-y divide-slate-100">
                {arrivals.map((guest, idx) => {
                  const initials = guest.guestName
                    ? guest.guestName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "G";

                  const formattedTime = guest.checkedInAt
                    ? new Date(guest.checkedInAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Just now";

                  return (
                    <motion.div
                      key={guest.id || idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="py-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {guest.guestName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            {guest.guestEmail && (
                              <span className="truncate max-w-[150px] sm:max-w-xs">
                                {guest.guestEmail}
                              </span>
                            )}
                            {guest.distanceMeters !== null && guest.distanceMeters !== undefined && (
                              <span className="text-slate-400">
                                • {guest.distanceMeters}m away
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-xs font-semibold text-slate-700">
                          {formattedTime}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 border border-emerald-200/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {guest.method || "GPS"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function GpsCheckInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <GpsCheckInContent />
    </Suspense>
  );
}

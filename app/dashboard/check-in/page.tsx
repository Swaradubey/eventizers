"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSidebar } from "../../../context/SidebarContext";
import Navbar from "../../../components/Navbar";
import checkInService from "../../../services/checkInService";
import gpsCheckInService, {
  GpsEvent,
} from "../../../services/gpsCheckInService";
import { CheckInGuest, CheckInSummary } from "../../../types/checkInTypes";
import {
  Menu,
  ChevronDown,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  QrCode,
  Users,
  Clock,
  UserCheck,
  RotateCcw,
  Compass,
  Camera,
  Play,
  Square,
  AlertTriangle,
  Wifi,
  MapPin,
  Crosshair,
  Navigation,
  Sparkles,
  ShieldCheck,
  SlidersHorizontal,
  Check,
  Loader2,
  Info,
  CheckCircle2,
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

function CheckInPageContent() {
  const { user, loading: authLoading } = useAuth();
  const { setIsOpen: setSidebarOpen } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEventId = searchParams?.get("eventId") || null;

  // Events list for switcher
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(queryEventId);

  // States
  const [summary, setSummary] = useState<CheckInSummary | null>(null);
  const [guests, setGuests] = useState<CheckInGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });

  // Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const html5QrcodeRef = useRef<any>(null);

  // Action Loading States
  const [submittingGuestId, setSubmittingGuestId] = useState<string | null>(null);
  const [isScanSubmitting, setIsScanSubmitting] = useState(false);

  // Toasts
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // GPS Check-In States
  const [currentGpsEvent, setCurrentGpsEvent] = useState<GpsEvent | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [geofenceRadius, setGeofenceRadius] = useState<number>(150);
  const [isUpdatingRadius, setIsUpdatingRadius] = useState(false);
  const [isSubmittingGpsCheckIn, setIsSubmittingGpsCheckIn] = useState(false);
  const [gpsCheckInResult, setGpsCheckInResult] = useState<{
    success: boolean;
    message: string;
    distance?: number;
    checkedInAt?: string;
  } | null>(null);

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

  // Trigger browser geolocation
  const fetchLocation = (showToast = false) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      if (showToast) {
        triggerToast("Geolocation not supported by this browser.", "error");
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
        recalculateDistance(coords, currentGpsEvent);

        if (showToast) {
          triggerToast("Location updated successfully.", "success");
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
          triggerToast(errorMsg, "error");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  // Fetch initial location
  useEffect(() => {
    fetchLocation(false);
  }, []);

  // Fetch GPS event details when selectedEventId changes
  useEffect(() => {
    if (!selectedEventId) {
      setCurrentGpsEvent(null);
      setDistanceMeters(null);
      return;
    }

    let isMounted = true;
    async function loadGpsEventData() {
      try {
        const details = await gpsCheckInService.getEventDetails(selectedEventId!);
        if (isMounted && details) {
          setCurrentGpsEvent(details);
          if (details.geofenceRadius) {
            setGeofenceRadius(Number(details.geofenceRadius));
          }
        }
      } catch (err) {
        console.error("Failed to fetch GPS event details:", err);
      }
    }

    setGpsCheckInResult(null);
    loadGpsEventData();

    return () => {
      isMounted = false;
    };
  }, [selectedEventId]);

  // Recalculate distance when userCoords or currentGpsEvent changes
  useEffect(() => {
    if (userCoords && currentGpsEvent) {
      recalculateDistance(userCoords, currentGpsEvent);
    }
  }, [userCoords, currentGpsEvent]);

  // Handle Self Check-In with GPS
  const handleGpsCheckIn = async () => {
    if (!selectedEventId) {
      triggerToast("Please select an event first.", "error");
      return;
    }

    setIsSubmittingGpsCheckIn(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setIsSubmittingGpsCheckIn(false);
      triggerToast("Geolocation not supported by this browser.", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setUserCoords(coords);
        recalculateDistance(coords, currentGpsEvent);

        try {
          const res = await gpsCheckInService.submitGpsCheckIn(selectedEventId, coords);

          if (res.success) {
            setGpsCheckInResult({
              success: true,
              message: res.message || "Checked in successfully via GPS!",
              distance: res.distance,
              checkedInAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            });
            triggerToast("Venue check-in successful! Welcome to the event.", "success");
            fetchCheckInData(selectedEventId, debouncedSearch, statusFilter, page);
          } else {
            setGpsCheckInResult({
              success: false,
              message: res.message || "You are outside the check-in perimeter.",
              distance: res.distance,
            });
            triggerToast(
              res.message || `You are outside the ${geofenceRadius}m check-in perimeter (${res.distance}m away).`,
              "error"
            );
          }
        } catch (err: any) {
          const apiError = err?.response?.data?.message || err?.response?.data?.error;
          const dist = err?.response?.data?.distance;

          setGpsCheckInResult({
            success: false,
            message: apiError || "Failed to process check-in.",
            distance: dist,
          });

          triggerToast(
            apiError ||
              (dist
                ? `You are ${dist}m away, which is outside the ${geofenceRadius}m perimeter.`
                : "Failed to process check-in. Please try again."),
            "error"
          );
        } finally {
          setIsSubmittingGpsCheckIn(false);
        }
      },
      (err) => {
        setIsSubmittingGpsCheckIn(false);
        let errorMsg = "Unable to retrieve GPS coordinates.";
        if (err.code === 1) {
          errorMsg = "Location permission denied. Please allow location access in your browser.";
        }
        setLocationError(errorMsg);
        triggerToast(errorMsg, "error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle Geofence Radius Selection
  const handleRadiusSelect = async (radius: number) => {
    if (!selectedEventId || radius === geofenceRadius) return;
    setGeofenceRadius(radius);
    setIsUpdatingRadius(true);

    try {
      await gpsCheckInService.updateGeofenceRadius(selectedEventId, {
        geofenceRadius: radius,
      });
      triggerToast(`Geofence perimeter set to ${radius}m.`, "success");
      if (currentGpsEvent) {
        setCurrentGpsEvent({ ...currentGpsEvent, geofenceRadius: radius });
      }
    } catch (err) {
      console.error("Failed to update geofence:", err);
      triggerToast("Failed to update geofence on server.", "error");
    } finally {
      setIsUpdatingRadius(false);
    }
  };

  // Handle Sync Venue to Current Location
  const handleSyncVenueToCurrentLocation = async () => {
    if (!selectedEventId || !userCoords) return;
    setIsUpdatingRadius(true);
    try {
      await gpsCheckInService.updateGeofenceRadius(selectedEventId, {
        geofenceRadius,
        venueLatitude: userCoords.latitude,
        venueLongitude: userCoords.longitude,
      });
      if (currentGpsEvent) {
        setCurrentGpsEvent({
          ...currentGpsEvent,
          venueLatitude: userCoords.latitude,
          venueLongitude: userCoords.longitude,
        });
      }
      setDistanceMeters(0);
      triggerToast("Venue coordinates synced to your current GPS position! Distance is now 0m.", "success");
    } catch (err) {
      triggerToast("Could not sync venue coordinates.", "error");
    } finally {
      setIsUpdatingRadius(false);
    }
  };

  const isWithinPerimeter =
    distanceMeters !== null && distanceMeters <= geofenceRadius;
  const activeEventTitle =
    currentGpsEvent?.title ||
    events.find((e) => e.id === selectedEventId)?.title ||
    "Selected Event";
  const activeVenue =
    currentGpsEvent?.venue ||
    currentGpsEvent?.address ||
    "Oakwood Community Park";

  // Geolocation helpers
  const getCoordinates = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          resolve(null); // Silent fail, coordinates remain optional
        },
        { timeout: 5000 }
      );
    });
  };

  // Toast Auto-clear
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on search
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  // Route protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load events
  useEffect(() => {
    if (user) {
      const fetchEvents = async () => {
        try {
          const res = await checkInService.getCheckInEvents();
          if (res.success) {
            setEvents(res.events || []);
            if (!queryEventId && res.events && res.events.length > 0) {
              const firstId = res.events[0].id;
              setSelectedEventId(firstId);
              updateUrl(firstId);
            }
          }
        } catch (err: any) {
          console.error("Error loading events:", err);
          setError("Failed to load events. Please try again.");
        }
      };
      fetchEvents();
    }
  }, [user, queryEventId]);

  // Load data for the selected event
  const fetchCheckInData = async (eventId: string, currentSearch: string, currentStatus: string, currentPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, guestsRes] = await Promise.all([
        checkInService.getCheckInSummary(eventId),
        checkInService.getEventGuests(eventId, {
          search: currentSearch || undefined,
          status: currentStatus !== "all" ? currentStatus : undefined,
          page: currentPage,
          limit: 50,
        }),
      ]);

      if (summaryRes.success) {
        setSummary(summaryRes.summary);
      }
      if (guestsRes.success) {
        setGuests(guestsRes.guests || []);
        setPagination(guestsRes.pagination);
      }
    } catch (err: any) {
      console.error("Error loading check-in data:", err);
      setError(err.response?.data?.message || "Unable to load check-in data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && selectedEventId) {
      fetchCheckInData(selectedEventId, debouncedSearch, statusFilter, page);
    } else {
      setLoading(false);
    }
  }, [user, selectedEventId, debouncedSearch, statusFilter, page]);

  // Helper to update EventId in URL
  const updateUrl = (eventId: string | null) => {
    const url = new URL(window.location.href);
    if (eventId) {
      url.searchParams.set("eventId", eventId);
    } else {
      url.searchParams.delete("eventId");
    }
    window.history.pushState({}, "", url.toString());
  };

  // QR Scanning Logic
  const startScanner = async () => {
    setScannerError(null);
    setIsScanning(true);
    
    // Dynamically load html5-qrcode on client side
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      
      // Allow minor delay to ensure DOM element exists
      setTimeout(() => {
        const scanner = new Html5Qrcode("reader");
        html5QrcodeRef.current = scanner;

        scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            // Success scan
            await handleQrScanSuccess(decodedText);
          },
          (errorMessage) => {
            // Scanner logs errors continuously while hunting for code, we don't spam the UI
          }
        ).catch((err) => {
          console.error("Failed to start scanner:", err);
          setScannerError("Camera permission denied or camera not found.");
          setIsScanning(false);
        });
      }, 100);
    } catch (err) {
      console.error(err);
      setScannerError("Failed to initialize scanner module.");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop();
        }
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
      html5QrcodeRef.current = null;
    }
    setIsScanning(false);
  };

  // Release camera resource when page unmounts
  useEffect(() => {
    return () => {
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop().catch((err: any) => console.error(err));
      }
    };
  }, []);

  const handleQrScanSuccess = async (qrCodeText: string) => {
    if (!selectedEventId) return;

    // Debug: log raw scanned data for tracing
    console.log("[CheckIn Scanner] Scanned Raw QR Data:", qrCodeText);

    // Stop camera immediately on success to provide responsive feedback
    await stopScanner();
    setScannerError(null); // Clear any stale scanner error banner
    setIsScanSubmitting(true);

    try {
      const location = await getCoordinates();
      const res = await checkInService.checkInGuestScan(
        selectedEventId,
        qrCodeText,
        location?.latitude,
        location?.longitude
      );

      if (res.success) {
        triggerToast(res.message || "Checked in successfully!");
        // Refresh stats and guest list
        fetchCheckInData(selectedEventId, debouncedSearch, statusFilter, page);
      }
    } catch (err: any) {
      console.error("[CheckIn Scanner] QR Check-In Error:", err);
      const errMsg: string =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Invalid ticket or QR code.";

      // Surface contextual error messages
      if (errMsg.toLowerCase().includes("different event")) {
        triggerToast("Wrong event: This QR code is valid but belongs to a different event. Please select the correct event.", "error");
      } else if (errMsg.toLowerCase().includes("already checked in")) {
        triggerToast("Guest already checked in.", "error");
      } else if (errMsg.toLowerCase().includes("unpaid") || errMsg.toLowerCase().includes("only paid")) {
        triggerToast("Ticket payment not confirmed. Only paid tickets are valid.", "error");
      } else {
        triggerToast(errMsg, "error");
      }
    } finally {
      setIsScanSubmitting(false);
    }
  };

  // Manual Check-In
  const handleManualCheckIn = async (guestId: string) => {
    if (!selectedEventId || submittingGuestId) return;
    setSubmittingGuestId(guestId);

    try {
      const location = await getCoordinates();
      const res = await checkInService.checkInGuestManual(
        selectedEventId,
        guestId,
        location?.latitude,
        location?.longitude
      );

      if (res.success) {
        triggerToast(res.message || "Guest checked in successfully!");
        // Update list and counts inline without full page reload
        setGuests((prev) =>
          prev.map((g) =>
            g.id === guestId
              ? {
                  ...g,
                  status: "CHECKED_IN",
                  checkedInAt: new Date().toISOString(),
                  method: "MANUAL",
                  gpsVerified: location !== null,
                  checkInId: res.checkIn?.id,
                }
              : g
          )
        );
        setSummary((prev) =>
          prev
            ? {
                ...prev,
                checkedIn: prev.checkedIn + 1,
                pending: Math.max(0, prev.pending - 1),
              }
            : null
        );
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || "Check-in failed.", "error");
    } finally {
      setSubmittingGuestId(null);
    }
  };

  // Undo Check-In
  const handleUndoCheckIn = async (checkInId: string, guestId: string) => {
    if (!selectedEventId || submittingGuestId) return;
    setSubmittingGuestId(guestId);

    try {
      const res = await checkInService.undoCheckIn(checkInId);
      if (res.success) {
        triggerToast("Check-in undone successfully.");
        // Update states inline
        setGuests((prev) =>
          prev.map((g) =>
            g.id === guestId
              ? {
                  ...g,
                  status: "PENDING",
                  checkedInAt: null,
                  method: null,
                  gpsVerified: false,
                  checkInId: null,
                }
              : g
          )
        );
        setSummary((prev) =>
          prev
            ? {
                ...prev,
                checkedIn: Math.max(0, prev.checkedIn - 1),
                pending: prev.pending + 1,
              }
            : null
        );
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.message || "Failed to undo check-in.", "error");
    } finally {
      setSubmittingGuestId(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2D1B3D]/30 border-t-[#2D1B3D] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-body text-slate-800 relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-8 pt-4 md:pt-6 pb-10 z-10">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm focus:outline-none"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-slate-800" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] font-sans tracking-tight">
                Check-In
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-sans">
                Scan QR codes and verify guest arrival
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {events.length > 0 && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-xs">
                <span className="text-slate-500 font-semibold">Event:</span>
                <select
                  value={selectedEventId || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedEventId(val || null);
                    updateUrl(val || null);
                    setPage(1);
                  }}
                  className="bg-transparent font-bold focus:outline-none text-slate-800 cursor-pointer max-w-[180px] truncate"
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 bg-[#ECFDF5] border border-emerald-100/80 text-[#059669] rounded-full py-1.5 px-4 shadow-sm">
              <Wifi className="w-4 h-4 text-[#059669]" />
              <span className="text-sm font-medium text-[#059669]">Online</span>
            </div>
          </div>
        </div>

        {/* Toast Alerts */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white border-slate-200"
            >
              {toast.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span className="text-xs font-semibold text-slate-800">{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State: No events created */}
        {events.length === 0 && !loading && (
          <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
              <QrCode className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold font-sans text-slate-900 mb-2">Create an event before using check-in.</h3>
            <p className="text-sm text-slate-500 max-w-md mb-8">
              You must have at least one active event to enable QR scanning, ticket resolution, and guest arrivals management.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-md focus:outline-none"
            >
              Go to Events
            </button>
          </div>
        )}

        {events.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: QR Scanner Section */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100/90 flex flex-col items-center justify-between w-full">
                
                {/* Viewfinder Card */}
                <div className="w-full aspect-square max-w-[340px] rounded-3xl bg-[#E6F4FE] relative flex items-center justify-center p-6 sm:p-7 overflow-hidden shadow-inner">
                  {/* Dashed Rounded Border Container */}
                  <div className="w-full h-full rounded-2xl border-[1.5px] border-dashed border-[#818CF8]/60 relative flex items-center justify-center">
                    
                    {/* Glowing Purple/Blue Corner Brackets */}
                    {/* Top-Left */}
                    <div className="absolute -top-[3px] -left-[3px] w-6 h-6 border-t-[3.5px] border-l-[3.5px] border-[#6366F1] rounded-tl-xl shadow-[0_0_8px_rgba(99,102,241,0.6)] z-10" />
                    {/* Top-Right */}
                    <div className="absolute -top-[3px] -right-[3px] w-6 h-6 border-t-[3.5px] border-r-[3.5px] border-[#6366F1] rounded-tr-xl shadow-[0_0_8px_rgba(99,102,241,0.6)] z-10" />
                    {/* Bottom-Left */}
                    <div className="absolute -bottom-[3px] -left-[3px] w-6 h-6 border-b-[3.5px] border-l-[3.5px] border-[#6366F1] rounded-bl-xl shadow-[0_0_8px_rgba(99,102,241,0.6)] z-10" />
                    {/* Bottom-Right */}
                    <div className="absolute -bottom-[3px] -right-[3px] w-6 h-6 border-b-[3.5px] border-r-[3.5px] border-[#6366F1] rounded-br-xl shadow-[0_0_8px_rgba(99,102,241,0.6)] z-10" />

                    {/* Viewfinder Content */}
                    {isScanning ? (
                      <div className="w-full h-full rounded-xl overflow-hidden relative bg-black/10">
                        <div id="reader" className="w-full h-full"></div>
                        {/* Accent Scanning Line Animation */}
                        <div
                          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#6366F1] to-transparent animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)] z-10"
                          style={{ top: "50%" }}
                        ></div>
                      </div>
                    ) : isScanSubmitting ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-[#4F46E5] rounded-full animate-spin"></div>
                        <span className="text-xs font-semibold text-indigo-600">Verifying Ticket...</span>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center justify-center"
                      >
                        {/* Stylized QR placeholder icon */}
                        <svg
                          className="w-28 h-28 text-[#818CF8]/85"
                          viewBox="0 0 100 100"
                          fill="currentColor"
                        >
                          {/* Top-Left Finder */}
                          <rect x="10" y="10" width="30" height="30" rx="9" fill="none" stroke="currentColor" strokeWidth="6" />
                          <rect x="20" y="20" width="10" height="10" rx="3.5" fill="currentColor" />

                          {/* Top-Right Finder */}
                          <rect x="60" y="10" width="30" height="30" rx="9" fill="none" stroke="currentColor" strokeWidth="6" />
                          <rect x="70" y="20" width="10" height="10" rx="3.5" fill="currentColor" />

                          {/* Bottom-Left Finder */}
                          <rect x="10" y="60" width="30" height="30" rx="9" fill="none" stroke="currentColor" strokeWidth="6" />
                          <rect x="20" y="70" width="10" height="10" rx="3.5" fill="currentColor" />

                          {/* Stylized QR dots and bars matching reference */}
                          <rect x="47" y="14" width="7" height="18" rx="3.5" fill="currentColor" />
                          <rect x="47" y="38" width="7" height="14" rx="3.5" fill="currentColor" />
                          <rect x="10" y="47" width="7" height="7" rx="3" fill="currentColor" />
                          <rect x="23" y="47" width="17" height="7" rx="3.5" fill="currentColor" />
                          <rect x="60" y="47" width="14" height="7" rx="3.5" fill="currentColor" />
                          <rect x="80" y="47" width="10" height="7" rx="3.5" fill="currentColor" />
                          <rect x="47" y="60" width="7" height="18" rx="3.5" fill="currentColor" />
                          <rect x="60" y="60" width="18" height="7" rx="3.5" fill="currentColor" />
                          <rect x="83" y="60" width="7" height="14" rx="3.5" fill="currentColor" />
                          <rect x="60" y="73" width="7" height="17" rx="3.5" fill="currentColor" />
                          <rect x="73" y="80" width="17" height="7" rx="3.5" fill="currentColor" />
                          <circle cx="50.5" cy="85.5" r="3.5" fill="currentColor" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Error Banner */}
                {scannerError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2.5 items-center text-red-600 text-xs text-left w-full max-w-[340px]">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{scannerError}</span>
                  </div>
                )}

                {/* Action Button & GPS Status Indicator */}
                <div className="w-full max-w-[340px] mt-6 flex flex-col items-center">
                  {isScanning ? (
                    <button
                      onClick={stopScanner}
                      className="w-full flex items-center justify-center gap-2.5 py-4 px-6 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-red-500/25 focus:outline-none"
                    >
                      <Square className="w-5 h-5 fill-current" />
                      <span>Stop Scanner</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => { setScannerError(null); startScanner(); }}
                      disabled={isScanSubmitting}
                      className="w-full flex items-center justify-center gap-2.5 py-4 px-6 text-sm font-bold text-white bg-gradient-to-r from-[#4F46E5] via-[#3B82F6] to-[#06B6D4] hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-blue-500/25 focus:outline-none cursor-pointer"
                    >
                      <svg
                        className="w-5 h-5 text-white flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="6" height="6" rx="1.5" />
                        <rect x="15" y="3" width="6" height="6" rx="1.5" />
                        <rect x="3" y="15" width="6" height="6" rx="1.5" />
                        <path d="M15 15h2v2h-2z" />
                        <path d="M21 15v2h-2" />
                        <path d="M15 21v-2h2v2h4" />
                      </svg>
                      <span>Scan Next Guest</span>
                    </button>
                  )}

                  {/* GPS Verification Status */}
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs font-medium text-slate-500">
                    <svg
                      className="w-4 h-4 text-emerald-500 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="8" />
                      <circle cx="12" cy="12" r="3" fill="currentColor" />
                    </svg>
                    <span>GPS verification enabled</span>
                  </div>
                </div>

              </div>

              {/* GPS Check-In Section */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100/90 w-full space-y-5">
                {/* 1. Header with Active Event & Refresh GPS */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        GPS Venue Check-In
                      </h3>
                      <p className="text-xs text-slate-500 truncate max-w-[180px] sm:max-w-xs">
                        {activeEventTitle}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchLocation(true)}
                    disabled={isLocating}
                    title="Refresh GPS location"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-60 shrink-0 cursor-pointer"
                  >
                    <Crosshair
                      className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? "animate-spin text-blue-500" : ""}`}
                    />
                    <span>{isLocating ? "Locating..." : "Refresh GPS"}</span>
                  </button>
                </div>

                {/* 2. Venue & Proximity Distance Badge */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/70 p-4 text-center space-y-2.5">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600">
                    <Navigation className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-xs">{activeVenue}</span>
                  </div>

                  <div className="flex items-center justify-center">
                    {distanceMeters !== null ? (
                      <span
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border shadow-2xs transition-all ${
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
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                        Calculating distance to venue...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                        GPS location needed to measure distance
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Sync Venue Here Action Card */}
                {distanceMeters !== null && !isWithinPerimeter && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-left">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs leading-snug">
                        Testing from home or office? Sync venue to your current GPS position.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSyncVenueToCurrentLocation}
                      disabled={isUpdatingRadius}
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      {isUpdatingRadius ? "Syncing..." : "Sync Venue Here"}
                    </button>
                  </div>
                )}

                {/* 4. Self Check-In Controls */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                        Self Check-In (Guest Action)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Verify GPS location and check in automatically.
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>

                  {locationError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{locationError}</span>
                    </div>
                  )}

                  {gpsCheckInResult && (
                    <div
                      className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                        gpsCheckInResult.success
                          ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                          : "bg-amber-50/80 border-amber-200 text-amber-900"
                      }`}
                    >
                      {gpsCheckInResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{gpsCheckInResult.message}</p>
                        {gpsCheckInResult.distance !== undefined && (
                          <p className="text-[11px] mt-0.5 opacity-90">
                            Verified Distance: {gpsCheckInResult.distance}m (Geofence Limit: {geofenceRadius}m)
                          </p>
                        )}
                        {gpsCheckInResult.checkedInAt && (
                          <p className="text-[11px] mt-0.5 opacity-80">
                            Checked in at {gpsCheckInResult.checkedInAt}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleGpsCheckIn}
                    disabled={isSubmittingGpsCheckIn || !selectedEventId}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-white transition-all shadow-sm flex items-center justify-center gap-2 text-sm ${
                      isSubmittingGpsCheckIn
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99] hover:shadow-md cursor-pointer"
                    }`}
                  >
                    {isSubmittingGpsCheckIn ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying GPS Location...</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        <span>Check In With GPS</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 5. Geofence Perimeter Radius */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs font-semibold text-slate-700">Geofence Radius</span>
                    </div>
                    {isUpdatingRadius && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[50, 150, 300, 500].map((radius) => {
                      const isSelected = geofenceRadius === radius;
                      return (
                        <button
                          key={radius}
                          type="button"
                          onClick={() => handleRadiusSelect(radius)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 border cursor-pointer ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                          <span>{radius}m</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Stats cards & Guest list */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                {/* Checked In */}
                <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">Checked In</p>
                      <p className="text-xl font-bold text-[#2D1B3D] mt-0.5">
                        {loading || !summary ? "..." : summary.checkedIn}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pending */}
                <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-[#C9A84C]">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">Pending</p>
                      <p className="text-xl font-bold text-[#2D1B3D] mt-0.5">
                        {loading || !summary ? "..." : summary.pending}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#2D1B3D]/50">Total</p>
                      <p className="text-xl font-bold text-[#2D1B3D] mt-0.5">
                        {loading || !summary ? "..." : summary.total}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest search and scrollable table area */}
              <div className="bg-white border border-[#E8C4B8]/30 rounded-2xl p-6 shadow-sm flex flex-col min-h-[460px] max-h-[580px]">
                
                {/* Search, Filter & Tabs */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-5 w-full">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="w-4 h-4 text-[#2D1B3D]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by name, email, ticket..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E8C4B8]/40 focus:border-[#2D1B3D] focus:ring-1 focus:ring-[#2D1B3D] outline-none rounded-xl text-xs transition-colors"
                    />
                  </div>

                  <div className="flex gap-1.5 p-1 bg-[#FAF8F5] border border-[#E8C4B8]/35 rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
                    <button
                      onClick={() => { setStatusFilter("all"); setPage(1); }}
                      className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${statusFilter === "all" ? "bg-[#2D1B3D] text-white shadow-sm" : "text-[#2D1B3D]/60 hover:text-[#2D1B3D]"}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => { setStatusFilter("checked_in"); setPage(1); }}
                      className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${statusFilter === "checked_in" ? "bg-[#2D1B3D] text-white shadow-sm" : "text-[#2D1B3D]/60 hover:text-[#2D1B3D]"}`}
                    >
                      Checked In
                    </button>
                    <button
                      onClick={() => { setStatusFilter("pending"); setPage(1); }}
                      className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${statusFilter === "pending" ? "bg-[#2D1B3D] text-white shadow-sm" : "text-[#2D1B3D]/60 hover:text-[#2D1B3D]"}`}
                    >
                      Pending
                    </button>
                  </div>
                </div>

                {/* Table Content with internal vertical scroll */}
                <div className="flex-1 overflow-y-auto min-h-[300px] border border-[#E8C4B8]/15 rounded-xl bg-[#FAF8F5]/30">
                  {loading ? (
                    <div className="p-4 space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-14 bg-white border border-[#E8C4B8]/15 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center text-center p-12 h-full">
                      <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                      <p className="text-sm font-semibold text-[#2D1B3D]">Unable to load check-in data.</p>
                      <button
                        onClick={() => selectedEventId && fetchCheckInData(selectedEventId, debouncedSearch, statusFilter, page)}
                        className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-[#2D1B3D] rounded-xl hover:bg-[#3d2a52] transition-colors"
                      >
                        Please try again.
                      </button>
                    </div>
                  ) : guests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-12 h-full">
                      <Users className="w-10 h-10 text-[#2D1B3D]/30 mb-2" />
                      <p className="text-xs font-semibold text-[#2D1B3D]/50">
                        {debouncedSearch
                          ? "No guests match your search."
                          : statusFilter === "checked_in"
                          ? "No checked-in guests found."
                          : statusFilter === "pending"
                          ? "No pending guests found."
                          : "No guests found for this event."}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E8C4B8]/20">
                      {guests.map((g) => {
                        const isCheckingIn = submittingGuestId === g.id;
                        
                        return (
                          <div key={g.id} className="flex items-center justify-between p-3.5 hover:bg-white transition-colors duration-150 group">
                            
                            {/* Initials & Name */}
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#E8C4B8]/40 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-[#2D1B3D]">
                                {g.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#2D1B3D] truncate">{g.name}</p>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#2D1B3D]/50">
                                  <span className="font-semibold px-1.5 py-0.5 bg-[#FAF8F5] border border-[#E8C4B8]/30 rounded uppercase text-[8px] tracking-wide text-[#C9A84C]">
                                    {g.ticketTier}
                                  </span>
                                  {g.status === "CHECKED_IN" && g.checkedInAt && (
                                    <span className="flex items-center gap-0.5 text-emerald-600">
                                      <Clock className="w-2.5 h-2.5" />
                                      {new Date(g.checkedInAt).toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        second: "2-digit",
                                      })}
                                    </span>
                                  )}
                                  {g.gpsVerified && (
                                    <span className="flex items-center gap-0.5 px-1 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded text-[7px] font-bold uppercase">
                                      <Compass className="w-2.5 h-2.5" />
                                      GPS
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              {g.status === "CHECKED_IN" ? (
                                <div className="flex items-center gap-1.5">
                                  <div className="text-emerald-600 p-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                                    <CheckCircle className="w-4 h-4" />
                                  </div>
                                  <button
                                    onClick={() => g.checkInId && handleUndoCheckIn(g.checkInId, g.id)}
                                    disabled={isCheckingIn}
                                    title="Undo Check-In"
                                    className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-all"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleManualCheckIn(g.id)}
                                  disabled={isCheckingIn}
                                  className="px-3.5 py-1.5 text-[10px] font-bold text-white bg-[#2D1B3D] hover:bg-[#3d2a52] disabled:opacity-60 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all focus:outline-none whitespace-nowrap active:scale-95"
                                >
                                  {isCheckingIn ? "Checking..." : "Check In"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#E8C4B8]/20 text-[10px] font-bold text-[#2D1B3D]/50 uppercase tracking-wider">
                    <button
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 border border-[#E8C4B8]/40 rounded-lg bg-white text-[#2D1B3D] hover:bg-[#FAF8F5] disabled:opacity-40 transition-colors"
                    >
                      Prev
                    </button>
                    <span>
                      Page {page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                      disabled={page === pagination.totalPages}
                      className="px-3 py-1.5 border border-[#E8C4B8]/40 rounded-lg bg-white text-[#2D1B3D] hover:bg-[#FAF8F5] disabled:opacity-40 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2D1B3D]/30 border-t-[#2D1B3D] rounded-full animate-spin"></div>
      </div>
    }>
      <CheckInPageContent />
    </Suspense>
  );
}

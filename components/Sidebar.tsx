"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Mail,
  Ticket,
  UserCheck,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  Shield,
  CreditCard,
  Settings,
  BarChart3,
  LogOut,
  Sparkles,
  ShieldCheck,
  UserCog,
  ImageIcon,
  MapPin,
  KeyRound,
  QrCode,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isOpen, setIsOpen, isCollapsed, setIsCollapsed } = useSidebar();

  const isAdminPath = pathname?.startsWith("/admin");
  const isGuestUser = user?.role === "GUEST";
  const isStaffCoHost = user?.role === "STAFF_COHOST" || user?.role === "COHOST" || user?.role === "STAFF";

  const guestMenuItems = [
    {
      label: "Guest Portal",
      href: "/dashboard/guest",
      icon: LayoutDashboard,
    },
    {
      label: "My Invitation",
      href: "/dashboard/guest?tab=invitation",
      icon: Mail,
    },
    {
      label: "RSVP Status",
      href: "/dashboard/guest?tab=rsvp",
      icon: UserCheck,
    },
    {
      label: "QR Ticket & Badge",
      href: "/dashboard/guest?tab=ticket",
      icon: Ticket,
    },
    {
      label: "Event Gallery",
      href: "/dashboard/guest?tab=gallery",
      icon: ImageIcon,
    },
    {
      label: "Venue Check-In",
      href: "/dashboard/guest?tab=checkin",
      icon: MapPin,
    },
    {
      label: "Access Recovery",
      href: "/dashboard/guest?tab=recovery",
      icon: KeyRound,
    },
  ];

  const menuItems = isAdminPath
    ? [
        {
          label: "My Events",
          href: "/admin/events",
          icon: Calendar,
        },
        {
          label: "Guests",
          href: "/admin/guests",
          icon: Users,
        },
        {
          label: "Canvas",
          href: "/admin/invitations",
          icon: Mail,
        },
        {
          label: "Ticketing",
          href: "/admin/ticketing",
          icon: Ticket,
        },
        {
          label: "Check-In",
          href: "/admin/check-in",
          icon: UserCheck,
        },
        {
          label: "Messages",
          href: "/admin/messages",
          icon: MessageSquare,
        },
        {
          label: "Users & Roles",
          href: "/admin/users",
          icon: UserCog,
        },
        {
          label: "Billing",
          href: "/admin/billing",
          icon: CreditCard,
        },
        {
          label: "Settings",
          href: "/admin/settings",
          icon: Settings,
        },
      ]
    : isGuestUser
    ? guestMenuItems
    : isStaffCoHost
    ? [
        {
          label: "Check-in",
          href: "/dashboard/check-in",
          icon: QrCode,
        },
        {
          label: "Guests",
          href: "/dashboard/guests",
          icon: Users,
        },
        {
          label: "Messages",
          href: "/dashboard/messages",
          icon: MessageSquare,
        },
        {
          label: "Reports",
          href: "/dashboard/reports",
          icon: BarChart3,
        },
      ]
    : [
        {
          label: "AI Assistant",
          href: "/dashboard/ai-assistant",
          icon: Sparkles,
        },
        {
          label: "My Events",
          href: "/dashboard/events",
          icon: Calendar,
        },
        {
          label: "Guests",
          href: "/dashboard/guests",
          icon: Users,
        },
        {
          label: "Canvas",
          href: "/dashboard/invitations",
          icon: Mail,
        },
        {
          label: "Ticketing",
          href: "/dashboard/ticketing",
          icon: Ticket,
        },
        {
          label: "Check-In",
          href: "/dashboard/check-in",
          icon: UserCheck,
        },
        {
          label: "Messages",
          href: "/dashboard/messages",
          icon: MessageSquare,
        },
        {
          label: "Attendance Commitment",
          href: "/dashboard/attendance-commitment",
          icon: ShieldCheck,
        },
        {
          label: "Analytics",
          href: "/dashboard/analytics",
          icon: BarChart3,
        },
        {
          label: "Security",
          href: "/dashboard/security",
          icon: Shield,
        },
        {
          label: "Billing",
          href: "/dashboard/billing",
          icon: CreditCard,
        },
        {
          label: "Settings",
          href: "/dashboard/settings",
          icon: Settings,
        },
      ];



  // Helper to determine if menu item is active
  const isActive = (href: string, disabled?: boolean) => {
    if (disabled) return false;
    if (href === "/admin/dashboard" || href === "/dashboard") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const handleDesktopToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleMobileClose = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsOpen(false);
      await logout();
      if (isAdminPath) {
        router.push("/admin/login");
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ── Sidebar inner content (shared by desktop & mobile drawer) ──
  const renderSidebarContent = (forceExpanded = false) => {
    const collapsed = isCollapsed && !forceExpanded;
    const isMobileDrawer = forceExpanded;

    return (
      <div
        className="sidebar-shell"
        data-collapsed={collapsed}
      >
        {/* ─── Header: Toggle ─── */}
        <div className={`sidebar-header ${collapsed ? "sidebar-header--collapsed" : ""}`}>
          {/* Toggle button */}
          <button
            onClick={isMobileDrawer ? handleMobileClose : handleDesktopToggle}
            className="sidebar-toggle"
            aria-label={
              isMobileDrawer
                ? "Close navigation"
                : collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            title={
              isMobileDrawer
                ? "Close navigation"
                : collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            {isMobileDrawer ? (
              <X className="sidebar-toggle-icon" />
            ) : collapsed ? (
              <PanelLeftOpen className="sidebar-toggle-icon" />
            ) : (
              <PanelLeftClose className="sidebar-toggle-icon" />
            )}
          </button>
        </div>


        {/* ─── Navigation items ─── */}
        <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
          <ul className="sidebar-menu" role="list">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const disabled = (item as any).disabled;
              const active = isActive(item.href, disabled);

              return (
                <li key={item.label} role="listitem">
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      if (disabled) {
                        e.preventDefault();
                        return;
                      }
                      setIsOpen(false);
                    }}
                    aria-label={collapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={`sidebar-menu-item ${
                      active ? "sidebar-menu-item--active" : ""
                    } ${collapsed ? "sidebar-menu-item--collapsed" : ""} ${
                      disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""
                    }`}
                  >
                    {/* Active background pill */}
                    {active && (
                      <motion.div
                        layoutId={isMobileDrawer ? "mobileActiveNav" : "desktopActiveNav"}
                        className="sidebar-menu-item-bg"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}

                    <Icon
                      className={`sidebar-menu-icon ${
                        active ? "sidebar-menu-icon--active" : ""
                      }`}
                    />

                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="sidebar-menu-label"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Tooltip (collapsed state only) */}
                    {collapsed && (
                      <div
                        role="tooltip"
                        className="sidebar-tooltip"
                      >
                        {item.label}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}

            {/* ─── Logout button ─── */}
            <li role="listitem">
              <button
                type="button"
                onClick={handleLogout}
                aria-label={collapsed ? "Logout" : undefined}
                className={`sidebar-menu-item w-full text-left bg-transparent border-0 outline-none ${
                  collapsed ? "sidebar-menu-item--collapsed" : ""
                }`}
              >
                <LogOut className="sidebar-menu-icon" />

                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="sidebar-menu-label"
                    >
                      Logout
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip (collapsed state only) */}
                {collapsed && (
                  <div
                    role="tooltip"
                    className="sidebar-tooltip"
                  >
                    Logout
                  </div>
                )}
              </button>
            </li>
          </ul>
        </nav>

        {/* ─── Bottom: subtle divider + version ─── */}
        <div className="sidebar-footer">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              className="sidebar-version"
            >
              v1.0
            </motion.span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── Desktop & Tablet sidebar (fixed) ── */}
      <aside
        className={`sidebar-desktop ${isCollapsed ? "sidebar-desktop--collapsed" : "sidebar-desktop--expanded"}`}
        role="complementary"
        aria-label="Sidebar navigation"
      >
        {renderSidebarContent(false)}
      </aside>

      {/* ── Mobile Drawer (overlay) ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleMobileClose}
              className="sidebar-backdrop"
              aria-hidden="true"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="sidebar-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation drawer"
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

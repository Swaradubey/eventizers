"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
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
  Gift,
  MessageSquare,
  Shield,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen, isCollapsed, setIsCollapsed } = useSidebar();

  const isAdminPath = pathname?.startsWith("/admin");
  const menuItems = isAdminPath
    ? [
        {
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Events",
          href: "/admin/events",
          icon: Calendar,
        },
        {
          label: "Guests",
          href: "/admin/guests",
          icon: Users,
        },
        {
          label: "Invitations",
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
          label: "Registries",
          href: "/admin/registries",
          icon: Gift,
        },
        {
          label: "Messages",
          href: "/admin/messages",
          icon: MessageSquare,
        },
      ]
    : [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Events",
          href: "/dashboard/events",
          icon: Calendar,
        },
        {
          label: "Guests",
          href: "/dashboard/guests",
          icon: Users,
        },
        {
          label: "Invitations",
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
          label: "Registries",
          href: "/dashboard/registries",
          icon: Gift,
        },
        {
          label: "Messages",
          href: "/dashboard/messages",
          icon: MessageSquare,
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

        {/* ─── Section label ─── */}
        {!collapsed && (
          <div className="sidebar-section-label">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              Navigation
            </motion.span>
          </div>
        )}

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

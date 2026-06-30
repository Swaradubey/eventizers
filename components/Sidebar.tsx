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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen, isCollapsed, setIsCollapsed } = useSidebar();

  const menuItems = [
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
  ];



  // Helper to determine if menu item is active
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
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
              const active = isActive(item.href);

              return (
                <li key={item.label} role="listitem">
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    aria-label={collapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={`sidebar-menu-item ${
                      active ? "sidebar-menu-item--active" : ""
                    } ${collapsed ? "sidebar-menu-item--collapsed" : ""}`}
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

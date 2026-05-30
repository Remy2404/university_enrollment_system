"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Bell, GraduationCap, Menu, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/src/providers/auth-provider";
import { notificationService } from "@/src/services/notification";
import { createClient } from "@/src/lib/supabase/client";
import type { Notification } from "@/src/types";
import { toast } from "sonner";

interface TopBarProps {
  title?: string;
  userName?: string;
  userRole?: "student" | "staff" | "admin";
  onMenuClick?: () => void;
}

export function TopBar({
  title = "Dashboard",
  userName = "Sok Dara",
  userRole = "student",
  onMenuClick,
}: TopBarProps) {
  const { user, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const notificationTriggerRef = useRef<HTMLButtonElement>(null);

  const roleDisplay = {
    student: "Student",
    staff: "Admission Staff",
    admin: "System Administrator",
  };

  const currentUserId = user?.id;
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");

  const loadNotifications = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const list = await notificationService.getByUserId(currentUserId);
      setNotifications(list.slice(0, 5)); // Show up to 5 recent notifications
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  }, [currentUserId]);

  // Load notifications on mount and when user logs in
  useEffect(() => {
    if (currentUserId) {
      const timeoutId = window.setTimeout(() => void loadNotifications(), 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [currentUserId, loadNotifications]);

  // Load avatar preview URL
  useEffect(() => {
    if (user?.avatarUrl) {
      if (user.avatarUrl.startsWith("http")) {
        const timeoutId = window.setTimeout(() => {
          setAvatarPreviewUrl(user.avatarUrl ?? "");
        }, 0);
        return () => window.clearTimeout(timeoutId);
      } else {
        const fetchAvatarUrl = async () => {
          try {
            const supabase = createClient();
            const { data } = await supabase.storage
              .from("application-documents")
              .createSignedUrl(user.avatarUrl, 60 * 60);
            setAvatarPreviewUrl(data?.signedUrl ?? "");
          } catch (err) {
            console.error("Failed to load avatar url", err);
            setAvatarPreviewUrl("");
          }
        };
        const timeoutId = window.setTimeout(() => void fetchAvatarUrl(), 0);
        return () => window.clearTimeout(timeoutId);
      }
    } else {
      const timeoutId = window.setTimeout(() => {
        setAvatarPreviewUrl("");
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [user?.avatarUrl]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        profileRef.current &&
        !profileRef.current.contains(target) &&
        profileTriggerRef.current &&
        !profileTriggerRef.current.contains(target)
      ) {
        setIsProfileOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target) &&
        notificationTriggerRef.current &&
        !notificationTriggerRef.current.contains(target)
      ) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Escape key to close dropdowns
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (isProfileOpen) {
          setIsProfileOpen(false);
          profileTriggerRef.current?.focus();
        }
        if (isNotificationsOpen) {
          setIsNotificationsOpen(false);
          notificationTriggerRef.current?.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isProfileOpen, isNotificationsOpen]);

  const toggleProfile = () => {
    setIsProfileOpen((prev) => !prev);
    setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => {
      const next = !prev;
      if (next) {
        void loadNotifications();
      }
      return next;
    });
    setIsProfileOpen(false);
  };

  const handleMarkAllRead = async () => {
    if (!currentUserId) return;
    try {
      await notificationService.markAllAsRead(currentUserId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      toast.success("Notification marked as read");
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="relative flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 md:px-6">
      {/* Far Left: Hamburger Menu and Brand Logo/Title on Mobile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#E2E8F0] text-primary-navy lg:hidden hover:bg-[#F8FAFC] active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-primary-navy/30 focus:outline-none"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Logo/Name shown on Mobile/Tablet and Desktop */}
        <div className="flex items-center gap-1.5 text-primary-navy font-bold">
          <GraduationCap className="w-5.5 h-5.5 text-primary-navy shrink-0" />
          <span className="text-sm font-extrabold tracking-tight whitespace-nowrap">Academia UES</span>
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 hidden md:block" />

        {/* Desktop Page Title & Breadcrumbs */}
        <div className="hidden md:block">
          <div className="flex items-center gap-1.5 text-xs text-cool-gray">
            <span>Portal</span>
            <span>/</span>
            <span className="capitalize">{userRole}</span>
            <span>/</span>
            <span className="font-medium text-slate-gray">{title}</span>
          </div>
        </div>
      </div>

      {/* Right-side Controls */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Active Session Period Indicator */}
        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-[#E2E8F0] text-xs font-semibold rounded-full text-slate-gray">
          <GraduationCap className="w-3.5 h-3.5" />
          Academic Year: 2026-2027
        </span>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            ref={notificationTriggerRef}
            onClick={toggleNotifications}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] text-slate-gray hover:bg-[#F8FAFC] active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-primary-navy/30 focus:outline-none ${
              isNotificationsOpen ? "bg-[#F8FAFC] border-primary-navy/20" : ""
            }`}
            aria-label="View notifications"
            aria-haspopup="true"
            aria-expanded={isNotificationsOpen}
          >
            <Bell className="w-5 h-5 text-slate-gray" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error-red text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div
              ref={notificationsRef}
              className="absolute right-0 top-12 z-50 w-80 rounded-bento-sm border border-[#E2E8F0] bg-white p-3 shadow-lg animate-in fade-in slide-in-from-top-1 duration-200"
              role="menu"
            >
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 mb-2">
                <h3 className="text-xs font-bold text-academic-blue">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-primary-navy hover:underline focus:outline-none"
                    role="menuitem"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-0.5">
                {notifications.length === 0 ? (
                  <p className="text-xs text-cool-gray text-center py-6 italic">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                        n.read
                          ? "bg-slate-50/50 border-slate-100 text-slate-gray"
                          : "bg-soft-blue/20 border-soft-blue/50 text-academic-blue font-medium"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-bold truncate">{n.title}</span>
                        {!n.read && (
                          <button
                            onClick={(e) => handleMarkRead(n.id, e)}
                            className="text-[10px] text-primary-navy hover:underline font-bold shrink-0 ml-2"
                            title="Mark as read"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-gray leading-normal mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <span className="text-[9px] text-cool-gray block mt-1">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {userRole === "student" && (
                <Link
                  href="/student/notifications"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="block text-center text-xs font-bold text-primary-navy hover:underline border-t border-[#E2E8F0] pt-2 mt-2"
                  role="menuitem"
                >
                  View all notifications
                </Link>
              )}
            </div>
          )}
        </div>

        {/* User Info & Avatar Button */}
        <div className="relative">
          <button
            ref={profileTriggerRef}
            onClick={toggleProfile}
            className={`flex items-center gap-3 border-l border-[#E2E8F0] pl-3 md:pl-4 text-left hover:opacity-90 active:scale-98 transition-all focus-visible:ring-2 focus-visible:ring-primary-navy/30 focus:outline-none ${
              isProfileOpen ? "opacity-90" : ""
            }`}
            aria-label="Open user menu"
            aria-haspopup="true"
            aria-expanded={isProfileOpen}
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-academic-blue leading-none mb-0.5 max-w-[120px] lg:max-w-[180px] truncate">
                {userName}
              </p>
              <p className="text-xs text-cool-gray font-medium leading-none">
                {roleDisplay[userRole]}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-soft-blue text-sm font-bold text-primary-navy border border-primary-navy/10 hover:border-primary-navy/20 transition-all overflow-hidden">
              {avatarPreviewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={avatarPreviewUrl}
                  alt={userName}
                  className="h-full w-full object-cover"
                />
              ) : (
                userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              )}
            </div>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div
              ref={profileRef}
              className="absolute right-0 top-12 z-50 w-56 rounded-bento-sm border border-[#E2E8F0] bg-white p-2 shadow-lg animate-in fade-in slide-in-from-top-1 duration-200"
              role="menu"
            >
              <div className="px-3 py-2 border-b border-[#E2E8F0] mb-1">
                <p className="text-sm font-bold text-academic-blue truncate">{userName}</p>
                <p className="text-xs text-cool-gray truncate">{roleDisplay[userRole]}</p>
              </div>

              {userRole === "student" && (
                <Link
                  href="/student/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-gray hover:bg-slate-50 hover:text-primary-navy transition-colors focus-visible:bg-slate-50 focus:outline-none"
                  role="menuitem"
                >
                  <User className="w-4 h-4 text-cool-gray" />
                  My Profile
                </Link>
              )}

              {(userRole === "student" || userRole === "admin") && (
                <Link
                  href="/student/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-gray hover:bg-slate-50 hover:text-primary-navy transition-colors focus-visible:bg-slate-50 focus:outline-none"
                  role="menuitem"
                >
                  <Settings className="w-4 h-4 text-cool-gray" />
                  Settings
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  void signOut();
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-error-red hover:bg-red-50 transition-colors focus-visible:bg-red-50 focus:outline-none mt-1 border-t border-[#E2E8F0] pt-2"
                role="menuitem"
              >
                <LogOut className="w-4 h-4 text-error-red" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  LayoutDashboard,
  ClipboardList,
  FileSpreadsheet,
  FolderOpen,
  Activity,
  Bell,
  User,
  LogOut,
  GraduationCap,
  Calendar,
  BarChart3,
  CheckSquare,
  Settings,
} from "lucide-react";
import { useAuth } from "@/src/providers/auth-provider";

interface AppSidebarProps {
  role?: "student" | "staff" | "admin";
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function AppSidebar({ role = "student", isOpen, setIsOpen }: AppSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const studentNav = [
    { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "Enrollment Form", href: "/student/enrollment-form", icon: FileSpreadsheet },
    { name: "Documents", href: "/student/documents", icon: FolderOpen },
    { name: "Application Status", href: "/student/status", icon: Activity },
    { name: "Notifications", href: "/student/notifications", icon: Bell },
    { name: "Profile", href: "/student/profile", icon: User },
  ];

  const staffNav = [
    { name: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
    { name: "Applications", href: "/staff/applications", icon: ClipboardList },
    { name: "Doc Verification", href: "/staff/verify", icon: CheckSquare },
    { name: "Notifications", href: "/staff/notifications", icon: Bell },
  ];

  const adminNav = [
    { name: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
    { name: "Program Manager", href: "/admin/programs", icon: GraduationCap },
    { name: "Enrollment Periods", href: "/admin/periods", icon: Calendar },
    { name: "Analytics & Reports", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/student/settings", icon: Settings },
  ];

  const navigation =
    role === "student"
      ? studentNav
      : role === "staff"
      ? staffNav
      : adminNav;

  return (
    <>
      {/* Drawer Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={twMerge(
          clsx(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#E2E8F0] bg-white transition-transform duration-300 lg:static lg:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-2 border-b border-[#E2E8F0] px-6 text-primary-navy">
          <GraduationCap className="w-7 h-7" />
          <span className="font-bold text-lg tracking-tight">University ES</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-4 h-11 rounded-bento-sm text-sm font-medium transition-colors",
                  isActive
                    ? "bg-soft-blue text-primary-navy"
                    : "text-slate-gray hover:bg-slate-50 hover:text-primary-navy"
                )}
              >
                <Icon className={clsx("w-5 h-5", isActive ? "text-primary-navy" : "text-cool-gray")} />
                {item.name}
              </Link>
            );
          })}
        </nav>


        {/* Footer Logout */}
        <div className="border-t border-[#E2E8F0] p-4">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              void signOut();
            }}
            className="flex items-center gap-3 px-4 h-11 rounded-bento-sm text-sm font-medium text-error-red hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 text-error-red" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

"use client";

import React from "react";
import { Bell, GraduationCap } from "lucide-react";

interface TopBarProps {
  title?: string;
  userName?: string;
  userRole?: "student" | "staff" | "admin";
  notificationCount?: number;
}

export function TopBar({
  title = "Dashboard",
  userName = "Sok Dara",
  userRole = "student",
  notificationCount = 2,
}: TopBarProps) {
  const roleDisplay = {
    student: "Student",
    staff: "Admission Staff",
    admin: "System Administrator",
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white px-6">
      {/* Page Title & Breadcrumbs */}
      <div>
        <h1 className="text-lg font-bold text-academic-blue tracking-tight leading-none">
          {title}
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-cool-gray mt-1">
          <span>Portal</span>
          <span>/</span>
          <span className="capitalize">{userRole}</span>
          <span>/</span>
          <span className="font-medium text-slate-gray">{title}</span>
        </div>
      </div>

      {/* Right-side Controls */}
      <div className="flex items-center gap-4">
        {/* Active Session Period Indicator */}
        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-[#E2E8F0] text-xs font-semibold rounded-full text-slate-gray">
          <GraduationCap className="w-3.5 h-3.5" />
          Academic Year: 2026-2027
        </span>

        {/* Notifications Icon */}
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] text-slate-gray hover:bg-[#F8FAFC] transition-colors focus:outline-none"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5 text-slate-gray" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error-red text-[10px] font-bold text-white ring-2 ring-white">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User Info & Avatar */}
        <div className="flex items-center gap-3 border-l border-[#E2E8F0] pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-academic-blue leading-none mb-0.5">
              {userName}
            </p>
            <p className="text-xs text-cool-gray font-medium leading-none">
              {roleDisplay[userRole]}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-soft-blue text-sm font-bold text-primary-navy border border-primary-navy/10">
            {userName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
        </div>
      </div>
    </header>
  );
}

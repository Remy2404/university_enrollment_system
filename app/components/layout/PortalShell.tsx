"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { useAuth } from "@/src/providers/auth-provider";
import type { User } from "@/src/types";

type PortalRole = User["role"];

const defaultRoute: Record<PortalRole, string> = {
  student: "/student/dashboard",
  staff: "/staff/dashboard",
  admin: "/admin/programs",
};

export function PortalShell({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: PortalRole[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    
    // Admin is allowed to access settings under student route
    const isAllowed = allowedRoles.includes(user.role) || (user.role === "admin" && pathname === "/student/settings");
    if (!isAllowed) {
      router.replace(defaultRoute[user.role]);
    }
  }, [allowedRoles, loading, router, user, pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-navy" />
      </div>
    );
  }

  const isAllowed = allowedRoles.includes(user.role) || (user.role === "admin" && pathname === "/student/settings");
  if (!isAllowed) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AppSidebar role={user.role} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar 
          userName={user.name} 
          userRole={user.role} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}


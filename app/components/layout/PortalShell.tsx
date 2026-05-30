"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
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
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.replace(defaultRoute[user.role]);
    }
  }, [allowedRoles, loading, router, user]);

  if (loading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-navy" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AppSidebar role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar userName={user.name} userRole={user.role} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

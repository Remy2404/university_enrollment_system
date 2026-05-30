"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "../components/layout/AppSidebar";
import { TopBar } from "../components/layout/TopBar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "staff" | "admin">("admin");
  const [userName, setUserName] = useState("Administrator");
  const [loading, setLoading] = useState(true);

  const loadSession = React.useCallback(() => {
    const stored = localStorage.getItem("ues_user");
    if (!stored) {
      router.push("/login");
    } else {
      try {
        const user = JSON.parse(stored);
        if (user.role !== "admin") {
          // Admin guard
          if (user.role === "staff") {
            router.push("/staff/dashboard");
          } else {
            router.push("/student/dashboard");
          }
          return;
        }
        setRole(user.role);
        setUserName(user.name || "Administrator");
      } catch (e) {
        localStorage.removeItem("ues_user");
        router.push("/login");
      }
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadSession();
    window.addEventListener("storage", loadSession);
    return () => {
      window.removeEventListener("storage", loadSession);
    };
  }, [loadSession]);


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-navy"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AppSidebar role={role} />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar userName={userName} userRole={role} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

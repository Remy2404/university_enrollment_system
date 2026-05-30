"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "../components/layout/AppSidebar";
import { TopBar } from "../components/layout/TopBar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "staff" | "admin">("student");
  const [userName, setUserName] = useState("Student");
  const [loading, setLoading] = useState(true);

  const loadSession = React.useCallback(() => {
    const stored = localStorage.getItem("ues_user");
    if (!stored) {
      router.push("/login");
    } else {
      try {
        const user = JSON.parse(stored);
        setRole(user.role || "student");
        setUserName(user.name || "Student");
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

  const handleRoleChange = (newRole: "student" | "staff" | "admin") => {
    setRole(newRole);
    // Sync to local storage for testing other portal perspectives
    const stored = localStorage.getItem("ues_user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        user.role = newRole;
        localStorage.setItem("ues_user", JSON.stringify(user));
      } catch (e) {}
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-navy"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AppSidebar role={role} onRoleChange={handleRoleChange} />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar userName={userName} userRole={role} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

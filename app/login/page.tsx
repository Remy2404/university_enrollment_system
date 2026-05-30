"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  GraduationCap,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  BookOpen,
  Users,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAuth } from "@/src/providers/auth-provider";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const user = await signIn(data.email, data.password);
      toast.success(`Welcome back, ${user.name}!`);

      if (user.role === "student") {
        router.push("/student/dashboard");
      } else if (user.role === "staff") {
        router.push("/staff/dashboard");
      } else {
        router.push("/admin/programs");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
    }
  };

  const features = [
    { icon: BookOpen, text: "5 Accredited Faculties" },
    { icon: Users, text: "500+ Students Enrolled" },
    { icon: FileCheck, text: "100% Paperless Admission" },
    { icon: TrendingUp, text: "Real-time Application Tracking" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left: Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-navy to-academic-blue relative overflow-hidden">
        {/* Decorative dots pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-12">
            <GraduationCap className="w-12 h-12 text-soft-blue" />
            <span className="text-2xl font-extrabold tracking-tight">
              UES Academia
            </span>
          </div>

          <h2 className="text-4xl font-extrabold leading-tight mb-6">
            Your Academic
            <br />
            Journey Starts Here
          </h2>
          <p className="text-lg text-blue-200 max-w-md leading-relaxed mb-12">
            Access your enrollment dashboard, track application progress, and
            manage documents in one unified platform.
          </p>

          <div className="grid grid-cols-2 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.text}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-bento-sm px-4 py-3"
                >
                  <Icon className="w-5 h-5 text-soft-blue shrink-0" />
                  <span className="text-sm font-medium text-blue-100">
                    {f.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-[#F8FAFC]">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <GraduationCap className="w-8 h-8 text-primary-navy" />
            <span className="text-xl font-extrabold text-primary-navy tracking-tight">
              UES Academia
            </span>
          </div>

          <div className="bg-white rounded-bento-lg border border-[#E2E8F0] shadow-sm p-8">
            <h1 className="text-2xl font-bold text-academic-blue mb-1">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-gray mb-6">
              Sign in to your enrollment portal account
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-semibold text-academic-blue mb-1.5"
                >
                  Email Address <span className="text-error-red">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-cool-gray" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@student.edu.kh"
                    {...register("email")}
                    className="w-full h-11 pl-11 pr-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue placeholder:text-cool-gray/60 focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-error-red mt-1.5 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-semibold text-academic-blue mb-1.5"
                >
                  Password <span className="text-error-red">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-cool-gray" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    className="w-full h-11 pl-11 pr-12 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue placeholder:text-cool-gray/60 focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cool-gray hover:text-primary-navy transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-error-red mt-1.5 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs font-medium text-primary-navy hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="w-full h-12 text-sm font-semibold"
              >
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Demo credentials info */}
            <div className="mt-6 p-3 bg-soft-blue/30 border border-soft-blue rounded-bento-sm">
              <p className="text-xs font-semibold text-primary-navy mb-1">
                Demo Accounts
              </p>
              <p className="text-[11px] text-slate-gray leading-relaxed">
                Student: <code className="font-mono text-primary-navy">sok.dara@student.edu.kh</code>
                <br />
                Staff: <code className="font-mono text-primary-navy">keo.sarath@staff.edu.kh</code>
                <br />
                Admin: <code className="font-mono text-primary-navy">ouk.vichea@admin.edu.kh</code>
                <br />
                Password: <code className="font-mono text-primary-navy">Test@12345</code>
              </p>
            </div>

            {/* Register link */}
            <p className="text-sm text-center text-slate-gray mt-6">
              New student?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary-navy hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

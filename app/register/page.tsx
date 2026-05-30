"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  GraduationCap,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAuth } from "@/src/providers/auth-provider";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.email("Please enter a valid email address"),
    phoneNumber: z.string().min(8, "Phone number must be at least 8 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = useWatch({ control, name: "password", defaultValue: "" });

  const passwordChecks = [
    { label: "At least 8 characters", met: passwordValue.length >= 8 },
    { label: "Contains a number", met: /\d/.test(passwordValue) },
    {
      label: "Contains uppercase letter",
      met: /[A-Z]/.test(passwordValue),
    },
  ];

  const onSubmit = async (data: RegisterForm) => {
    try {
      await signUp({
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
      });

      toast.success("Account created. Sign in after confirming your email if confirmation is enabled.");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create your account. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <GraduationCap className="w-8 h-8 text-primary-navy" />
          <span className="text-xl font-extrabold text-primary-navy tracking-tight">
            UES Academia
          </span>
        </div>

        <div className="bg-white rounded-bento-lg border border-[#E2E8F0] shadow-sm p-8">
          <h1 className="text-2xl font-bold text-academic-blue mb-1">
            Create Student Account
          </h1>
          <p className="text-sm text-slate-gray mb-8">
            Register to start your enrollment application
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="reg-name"
                className="block text-sm font-semibold text-academic-blue mb-1.5"
              >
                Full Name <span className="text-error-red">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-cool-gray" />
                <input
                  id="reg-name"
                  type="text"
                  placeholder="Sok Dara"
                  {...register("fullName")}
                  className="w-full h-11 pl-11 pr-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue placeholder:text-cool-gray/60 focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-error-red mt-1.5 font-medium">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="reg-email"
                className="block text-sm font-semibold text-academic-blue mb-1.5"
              >
                Email Address <span className="text-error-red">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-cool-gray" />
                <input
                  id="reg-email"
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

            {/* Phone */}
            <div>
              <label
                htmlFor="reg-phone"
                className="block text-sm font-semibold text-academic-blue mb-1.5"
              >
                Phone Number <span className="text-error-red">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-cool-gray" />
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="+855 12 345 678"
                  {...register("phoneNumber")}
                  className="w-full h-11 pl-11 pr-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue placeholder:text-cool-gray/60 focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-xs text-error-red mt-1.5 font-medium">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="reg-password"
                className="block text-sm font-semibold text-academic-blue mb-1.5"
              >
                Password <span className="text-error-red">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-cool-gray" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  {...register("password")}
                  className="w-full h-11 pl-11 pr-12 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue placeholder:text-cool-gray/60 focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cool-gray hover:text-primary-navy transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

              {/* Password strength indicators */}
              {passwordValue.length > 0 && (
                <div className="flex flex-col gap-1 mt-2">
                  {passwordChecks.map((check) => (
                    <div
                      key={check.label}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          check.met
                            ? "text-success-green"
                            : "text-cool-gray/40"
                        }`}
                      />
                      <span
                        className={
                          check.met
                            ? "text-success-green font-medium"
                            : "text-cool-gray"
                        }
                      >
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="reg-confirm"
                className="block text-sm font-semibold text-academic-blue mb-1.5"
              >
                Confirm Password <span className="text-error-red">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-cool-gray" />
                <input
                  id="reg-confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  {...register("confirmPassword")}
                  className="w-full h-11 pl-11 pr-12 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue placeholder:text-cool-gray/60 focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cool-gray hover:text-primary-navy transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeOff className="w-4.5 h-4.5" />
                  ) : (
                    <Eye className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-error-red mt-1.5 font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full h-12 text-sm font-semibold"
            >
              Create Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Login link */}
          <p className="text-sm text-center text-slate-gray mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary-navy hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

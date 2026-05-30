import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  isLoading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const baseStyle =
    "relative inline-flex items-center justify-center font-medium rounded-bento-sm px-5 h-11 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-98 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

  const variants = {
    primary:
      "bg-primary-navy text-white hover:bg-academic-blue focus:ring-primary-navy/45 shadow-sm",
    secondary:
      "bg-white border border-[#E2E8F0] text-primary-navy hover:bg-[#F8FAFC] focus:ring-[#E2E8F0]",
    danger: "bg-error-red text-white hover:bg-red-700 focus:ring-error-red/45 shadow-sm",
  };

  return (
    <button
      className={twMerge(clsx(baseStyle, variants[variant], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

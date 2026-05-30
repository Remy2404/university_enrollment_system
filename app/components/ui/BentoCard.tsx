import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function BentoCard({
  children,
  className,
  hoverEffect = true,
  ...props
}: BentoCardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "bg-white border border-[#E2E8F0] p-6 rounded-bento shadow-xs overflow-hidden",
          hoverEffect && "hover:shadow-sm hover:scale-[1.01] hover:border-primary-navy/20 transition-all duration-300 ease-out",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

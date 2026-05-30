"use client";

import React from "react";
import { Check } from "lucide-react";
import { clsx } from "clsx";

interface ProgressStepperProps {
  currentStep: number;
  steps: string[];
  completedSteps: number[];
}

export function ProgressStepper({
  currentStep,
  steps,
  completedSteps,
}: ProgressStepperProps) {
  return (
    <div className="w-full" aria-label="Progress tracker">
      {/* Mobile progress label */}
      <div className="flex flex-col gap-2 mb-4 lg:hidden text-sm">
        <div className="flex justify-between items-center">
          <span className="text-cool-gray font-medium">
            Step {currentStep} of {steps.length}
          </span>
          <span className="font-bold text-primary-navy">
            {steps[currentStep - 1]}
          </span>
        </div>
        <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary-navy h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Stepper bar */}
      <div className="hidden lg:flex items-center justify-between relative w-full mb-8">
        {/* Track Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#E2E8F0] -translate-y-1/2 z-0" />
        
        {/* Fill Line */}
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-primary-navy -translate-y-1/2 z-0 transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((label, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = completedSteps.includes(stepNumber) || stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div
              key={label}
              className="relative flex flex-col items-center z-10 w-1/6"
            >
              {/* Circle indicator */}
              <div
                className={clsx(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-200",
                  isCompleted && "bg-primary-navy border-primary-navy text-white",
                  isActive && "bg-white border-primary-navy text-primary-navy shadow-xs scale-110",
                  !isCompleted && !isActive && "bg-white border-[#E2E8F0] text-cool-gray"
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {isCompleted ? (
                  <Check className="w-4.5 h-4.5 stroke-[2.5]" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>

              {/* Label text */}
              <span
                className={clsx(
                  "mt-2 text-center text-xs font-semibold max-w-[100px] leading-tight",
                  isActive && "text-primary-navy font-bold",
                  isCompleted && "text-slate-gray",
                  !isCompleted && !isActive && "text-cool-gray"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

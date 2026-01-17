"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressStep {
  id: string;
  name: string;
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  currentStep: number;
  className?: string;
}

export function ProgressTracker({ steps, currentStep, className }: ProgressTrackerProps) {
  if (steps.length === 0) return null;

  const current = steps[currentStep];

  return (
    <div className={cn("bg-zinc-900/50 border-b border-zinc-800", className)}>
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div
                    className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition-colors",
                      index < currentStep
                        ? "bg-emerald-500 text-white"
                        : index === currentStep
                        ? "bg-primary text-white"
                        : "bg-zinc-800 text-zinc-500"
                    )}
                    aria-current={index === currentStep ? "step" : undefined}
                  >
                    {index < currentStep ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-8 h-0.5 transition-colors",
                        index < currentStep ? "bg-emerald-500" : "bg-zinc-800"
                      )}
                      aria-hidden="true"
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Step text */}
            <span className="text-sm text-zinc-400">
              Step {currentStep + 1} of {steps.length}:
            </span>
            <span className="text-sm font-medium text-zinc-200">
              {current?.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, CheckCircle } from "lucide-react";

const ONBOARDING_KEY = "veilpass_onboarding_complete";

interface OnboardingSlide {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: <Shield className="h-12 w-12 text-red-400" aria-hidden="true" />,
    title: "The Problem",
    description:
      "Traditional KYC verification forces you to share everything—your full name, address, documents—just to prove you're compliant.",
    highlight: "Your private data is exposed to every party in the chain.",
  },
  {
    icon: <Lock className="h-12 w-12 text-primary" aria-hidden="true" />,
    title: "The Solution",
    description:
      "VeilPass uses cryptographic attestations to prove your compliance status without revealing the underlying data.",
    highlight: "Zero-knowledge proofs on Solana blockchain.",
  },
  {
    icon: <Eye className="h-12 w-12 text-emerald-400" aria-hidden="true" />,
    title: "You're in Control",
    description:
      "Choose exactly which compliance claims to disclose. Share KYC status without revealing your identity. Set time limits and access controls.",
    highlight: "Selective disclosure puts you in the driver's seat.",
  },
  {
    icon: <CheckCircle className="h-12 w-12 text-emerald-500" aria-hidden="true" />,
    title: "The Outcome",
    description:
      "Auditors can cryptographically verify your compliance without ever seeing your personal data. Privacy that passes compliance.",
    highlight: "Verification without exposure.",
  },
];

export function OnboardingModal() {
  const [open, setOpen] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    // Check if user has already completed onboarding
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setOpen(false);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      localStorage.setItem(ONBOARDING_KEY, "true");
      setOpen(false);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        localStorage.setItem(ONBOARDING_KEY, "true");
      }
      setOpen(isOpen);
    }}>
      <DialogContent className="sm:max-w-md border-zinc-800 bg-zinc-900">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
            {slide.icon}
          </div>
          <DialogTitle className="text-xl tracking-tight">
            {slide.title}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {slide.description}
          </DialogDescription>
          <p className="mt-2 text-sm font-medium text-emerald-400">
            {slide.highlight}
          </p>
        </DialogHeader>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 py-4" role="group" aria-label="Onboarding progress">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentSlide
                  ? "bg-primary"
                  : "bg-zinc-700 hover:bg-zinc-600"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentSlide ? "step" : undefined}
            />
          ))}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-zinc-400 hover:text-zinc-200"
          >
            Skip
          </Button>
          <div className="flex gap-2">
            {currentSlide > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                Back
              </Button>
            )}
            <Button onClick={handleNext}>
              {isLastSlide ? "Get Started" : "Next"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

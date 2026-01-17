"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CHECKLIST_KEY = "veilpass_checklist";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  href: string;
  ctaText: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "attestation",
    title: "Generate your first attestation",
    description: "Create a cryptographic proof of your compliance status",
    href: "/attest",
    ctaText: "Generate Attestation",
  },
  {
    id: "disclosure",
    title: "Create a disclosure",
    description: "Select which claims to share with auditors",
    href: "/disclose",
    ctaText: "Create Disclosure",
  },
  {
    id: "share",
    title: "Share with an auditor",
    description: "Copy and send your disclosure link",
    href: "/disclose",
    ctaText: "Create & Share",
  },
];

interface ChecklistState {
  attestation: boolean;
  disclosure: boolean;
  share: boolean;
}

export function OnboardingChecklist() {
  const [completed, setCompleted] = React.useState<ChecklistState>({
    attestation: false,
    disclosure: false,
    share: false,
  });
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [showCelebration, setShowCelebration] = React.useState(false);

  // Load state from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(CHECKLIST_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCompleted(parsed);
        // Auto-collapse if at least one item is complete
        if (Object.values(parsed).some(Boolean)) {
          setIsCollapsed(true);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Listen for custom events to update checklist
  React.useEffect(() => {
    const handleAttestationComplete = () => {
      updateItem("attestation");
    };
    const handleDisclosureComplete = () => {
      updateItem("disclosure");
      updateItem("share"); // Sharing happens when disclosure is created
    };

    window.addEventListener("veilpass:attestation:complete", handleAttestationComplete);
    window.addEventListener("veilpass:disclosure:complete", handleDisclosureComplete);

    return () => {
      window.removeEventListener("veilpass:attestation:complete", handleAttestationComplete);
      window.removeEventListener("veilpass:disclosure:complete", handleDisclosureComplete);
    };
  }, []);

  const updateItem = (id: keyof ChecklistState) => {
    setCompleted((prev) => {
      const newState = { ...prev, [id]: true };
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(newState));

      // Check if all items are complete for celebration
      if (Object.values(newState).every(Boolean)) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }

      return newState;
    });
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const allComplete = completedCount === CHECKLIST_ITEMS.length;
  const progressPercent = (completedCount / CHECKLIST_ITEMS.length) * 100;

  // Don't render if all complete and we've celebrated
  if (allComplete && !showCelebration) {
    return null;
  }

  return (
    <Card className={cn(
      "bg-zinc-900 border-zinc-800 mb-8 transition-all duration-300",
      showCelebration && "border-emerald-500/50 bg-emerald-500/5"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {showCelebration ? (
              <>
                <span className="text-2xl" role="img" aria-label="celebration">🎉</span>
                All Done!
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Getting Started
              </>
            )}
          </CardTitle>
          {!allComplete && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-zinc-400 hover:text-zinc-200 transition-colors p-1"
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? "Expand checklist" : "Collapse checklist"}
            >
              <svg
                className={cn("w-5 h-5 transition-transform", isCollapsed && "rotate-180")}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Progress bar */}
        {!allComplete && (
          <div className="mt-3">
            <div className="flex justify-between text-sm text-zinc-400 mb-1">
              <span>{completedCount} of {CHECKLIST_ITEMS.length} complete</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      {!isCollapsed && !allComplete && (
        <CardContent className="pt-0">
          <ul className="space-y-3">
            {CHECKLIST_ITEMS.map((item) => {
              const isComplete = completed[item.id as keyof ChecklistState];
              return (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    isComplete
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-zinc-800 hover:border-zinc-700"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 mt-0.5 transition-colors",
                    isComplete ? "bg-emerald-500 text-white" : "border-2 border-zinc-700"
                  )}>
                    {isComplete && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium",
                      isComplete && "text-zinc-500 line-through"
                    )}>
                      {item.title}
                    </p>
                    <p className="text-sm text-zinc-500">{item.description}</p>
                  </div>
                  {!isComplete && (
                    <Link href={item.href}>
                      <Button size="sm" variant="outline" className="flex-shrink-0">
                        {item.ctaText}
                      </Button>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      )}

      {showCelebration && (
        <CardContent className="pt-0">
          <p className="text-emerald-400 text-center">
            You&apos;ve completed the VeilPass onboarding! You&apos;re now ready to manage privacy-preserving compliance.
          </p>
        </CardContent>
      )}
    </Card>
  );
}

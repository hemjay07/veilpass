"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Technical term definitions for VeilPass
 * Each definition should be under 50 words for quick understanding
 */
export const HELP_DEFINITIONS: Record<string, { term: string; definition: string }> = {
  attestation: {
    term: "Attestation",
    definition: "A cryptographic proof that you've passed compliance checks (like KYC) without revealing your personal data. Think of it as a verified stamp that says 'this person is compliant' without showing who they are.",
  },
  "selective-disclosure": {
    term: "Selective Disclosure",
    definition: "Share only the specific compliance claims you choose with auditors. You control exactly what information is revealed while keeping everything else private.",
  },
  "zero-knowledge": {
    term: "Zero-Knowledge Proof",
    definition: "A way to prove something is true without revealing the underlying data. Like proving you're over 21 without showing your ID or actual birthdate.",
  },
  commitment: {
    term: "Cryptographic Commitment",
    definition: "A secure hash that locks in your claim data. It proves the data existed at a certain time without revealing what's inside until you choose to disclose it.",
  },
  "secret-file": {
    term: "Secret File",
    definition: "A private key file that only you possess. Required to create disclosures and prove ownership of your attestation. Never share this file - it cannot be recovered if lost.",
  },
  "proof-hash": {
    term: "Proof Hash",
    definition: "A unique fingerprint of your disclosed data. Auditors can verify this hash matches what you claim, ensuring the data hasn't been tampered with.",
  },
  kyc: {
    term: "KYC (Know Your Customer)",
    definition: "Identity verification process required by regulations. Proves you are who you say you are, typically involving ID documents and address verification.",
  },
  aml: {
    term: "AML (Anti-Money Laundering)",
    definition: "Checks that ensure funds aren't from illegal sources. Required for financial compliance to prevent money laundering and terrorism financing.",
  },
  "accredited-investor": {
    term: "Accredited Investor",
    definition: "A regulatory status for individuals meeting income or net worth thresholds. Required to invest in certain securities and tokenized assets.",
  },
  rwa: {
    term: "RWA (Real-World Assets)",
    definition: "Physical assets like real estate, art, or commodities represented as digital tokens on blockchain. Enables fractional ownership and easier trading.",
  },
};

interface HelpTooltipProps {
  /** Key from HELP_DEFINITIONS or custom term */
  term: string;
  /** Custom definition (optional, uses HELP_DEFINITIONS if not provided) */
  customDefinition?: string;
  /** Custom title (optional) */
  customTitle?: string;
  /** Additional class names */
  className?: string;
  /** Icon size */
  size?: "sm" | "md";
}

export function HelpTooltip({
  term,
  customDefinition,
  customTitle,
  className,
  size = "sm",
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const definition = HELP_DEFINITIONS[term];
  const title = customTitle || definition?.term || term;
  const content = customDefinition || definition?.definition || "No definition available.";

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center justify-center rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors focus-ring",
          size === "sm" ? "p-0.5" : "p-1"
        )}
        aria-label={`Help: ${title}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <HelpCircle className={iconSize} aria-hidden="true" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Tooltip content */}
          <div
            ref={tooltipRef}
            role="tooltip"
            className={cn(
              "absolute z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg",
              // Desktop: positioned near the trigger
              "md:left-1/2 md:-translate-x-1/2 md:top-full md:mt-2",
              // Mobile: centered modal-style
              "fixed md:absolute left-4 right-4 top-1/2 md:top-auto -translate-y-1/2 md:translate-y-0 md:left-1/2 md:right-auto",
              "max-w-sm md:w-72"
            )}
          >
            {/* Arrow for desktop */}
            <div
              className="hidden md:block absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900 border-l border-t border-zinc-700 rotate-45"
              aria-hidden="true"
            />

            <div className="p-4 relative">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-zinc-50">{title}</h4>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded hover:bg-zinc-800 transition-colors"
                  aria-label="Close help"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{content}</p>
            </div>
          </div>
        </>
      )}
    </span>
  );
}

/**
 * Inline text with help tooltip
 */
interface HelpTextProps {
  children: React.ReactNode;
  term: string;
  className?: string;
}

export function HelpText({ children, term, className }: HelpTextProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {children}
      <HelpTooltip term={term} />
    </span>
  );
}

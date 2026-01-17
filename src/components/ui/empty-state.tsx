"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// SVG Shield Icon for brand identity
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("text-primary", className)}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 1.5a.75.75 0 01.53.22l8.25 8.25a.75.75 0 010 1.06l-8.25 8.25a.75.75 0 01-1.06 0l-8.25-8.25a.75.75 0 010-1.06l8.25-8.25A.75.75 0 0112 1.5zm0 2.121L4.621 11 12 18.379 19.379 11 12 3.621z"
        clipRule="evenodd"
      />
      <path d="M12 7.5a.75.75 0 01.75.75v2.25h2.25a.75.75 0 010 1.5h-2.25v2.25a.75.75 0 01-1.5 0v-2.25H9a.75.75 0 010-1.5h2.25V8.25A.75.75 0 0112 7.5z" />
    </svg>
  );
}

// Privacy Lock Icon
function PrivacyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("text-emerald-400", className)}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Document Icon for attestations
function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("text-primary", className)}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z"
        clipRule="evenodd"
      />
      <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
    </svg>
  );
}

type EmptyStateVariant = "connect-wallet" | "no-attestations" | "no-disclosures" | "custom";

interface EmptyStateProps {
  variant: EmptyStateVariant;
  title?: string;
  description?: string;
  subtext?: string;
  ctaText?: string;
  ctaHref?: string;
  onCta?: () => void;
  icon?: "shield" | "privacy" | "document";
  className?: string;
}

const VARIANTS: Record<EmptyStateVariant, {
  icon: "shield" | "privacy" | "document";
  title: string;
  description: string;
  subtext: string;
  ctaText?: string;
  ctaHref?: string;
}> = {
  "connect-wallet": {
    icon: "privacy",
    title: "Your Compliance Profile is Private",
    description: "Connect your wallet to generate attestations and prove compliance without exposing your personal data.",
    subtext: "Privacy that passes compliance.",
  },
  "no-attestations": {
    icon: "document",
    title: "No Attestations Yet",
    description: "Your attestations will appear here after you generate them. Each attestation is a cryptographic proof of your compliance status.",
    subtext: "Ready to prove your compliance?",
    ctaText: "Generate Your First Attestation",
    ctaHref: "/attest",
  },
  "no-disclosures": {
    icon: "shield",
    title: "No Disclosures Created",
    description: "Create a disclosure to share specific compliance claims with auditors. You control exactly what they see.",
    subtext: "Selective disclosure keeps you in control.",
    ctaText: "Create a Disclosure",
    ctaHref: "/disclose",
  },
  "custom": {
    icon: "shield",
    title: "",
    description: "",
    subtext: "",
  },
};

const ICONS = {
  shield: ShieldIcon,
  privacy: PrivacyIcon,
  document: DocumentIcon,
};

export function EmptyState({
  variant,
  title,
  description,
  subtext,
  ctaText,
  ctaHref,
  onCta,
  icon,
  className,
}: EmptyStateProps) {
  const config = VARIANTS[variant];
  const IconComponent = ICONS[icon || config.icon];

  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalSubtext = subtext || config.subtext;
  const finalCtaText = ctaText || config.ctaText;
  const finalCtaHref = ctaHref || config.ctaHref;

  return (
    <Card className={cn("bg-zinc-900 border-zinc-800", className)}>
      <CardContent className="pt-12 pb-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800/50">
          <IconComponent className="h-10 w-10" />
        </div>

        <h3 className="text-xl font-semibold mb-3">{finalTitle}</h3>
        <p className="text-zinc-400 max-w-md mx-auto mb-2">{finalDescription}</p>
        <p className="text-sm text-emerald-400 font-medium mb-6">{finalSubtext}</p>

        {finalCtaText && (finalCtaHref || onCta) && (
          finalCtaHref ? (
            <Link href={finalCtaHref}>
              <Button variant="cta" size="lg">
                {finalCtaText}
              </Button>
            </Link>
          ) : (
            <Button variant="cta" size="lg" onClick={onCta}>
              {finalCtaText}
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
}

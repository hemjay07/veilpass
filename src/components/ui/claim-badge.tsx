import { UserCheck, ShieldCheck, BadgeCheck, Globe, FileCheck } from "lucide-react";
import type { ClaimType } from "@/types";
import { cn } from "@/lib/utils";

interface ClaimIconConfig {
  icon: React.ElementType;
  label: string;
}

const CLAIM_ICONS: Record<ClaimType, ClaimIconConfig> = {
  KYC_VERIFIED: {
    icon: UserCheck,
    label: "KYC Verified",
  },
  AML_PASSED: {
    icon: ShieldCheck,
    label: "AML Passed",
  },
  ACCREDITED_INVESTOR: {
    icon: BadgeCheck,
    label: "Accredited Investor",
  },
  JURISDICTION_COMPLIANT: {
    icon: Globe,
    label: "Jurisdiction Compliant",
  },
  SOURCE_OF_FUNDS_VERIFIED: {
    icon: FileCheck,
    label: "Source of Funds",
  },
};

interface ClaimBadgeProps {
  type: ClaimType;
  /** Show full label or just icon */
  variant?: "full" | "icon-only";
  /** Size of the badge */
  size?: "sm" | "md" | "lg";
  /** Additional class names */
  className?: string;
  /** For verified state */
  verified?: boolean;
}

export function ClaimBadge({
  type,
  variant = "full",
  size = "md",
  className,
  verified = false,
}: ClaimBadgeProps) {
  const config = CLAIM_ICONS[type];
  if (!config) return null;

  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  if (variant === "icon-only") {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded bg-accent/20 text-accent",
          sizeClasses[size],
          className
        )}
        aria-label={config.label}
        title={config.label}
      >
        <Icon className={iconSizes[size]} aria-hidden="true" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded bg-accent/20 text-accent",
        sizeClasses[size],
        verified && "bg-emerald-500/20 text-emerald-400",
        className
      )}
      aria-label={config.label}
    >
      <Icon className={cn(iconSizes[size], "flex-shrink-0")} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}

/**
 * Get claim configuration for external use
 */
export function getClaimConfig(type: ClaimType): ClaimIconConfig | undefined {
  return CLAIM_ICONS[type];
}

/**
 * Get claim label for external use
 */
export function getClaimLabel(type: ClaimType): string {
  return CLAIM_ICONS[type]?.label || type;
}

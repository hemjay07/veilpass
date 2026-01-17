"use client";

import { useState } from "react";

interface TrustBadge {
  icon: React.ReactNode;
  label: string;
  description: string;
}

const badges: TrustBadge[] = [
  {
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    ),
    label: "Zero-Knowledge Proofs",
    description: "Prove compliance without revealing personal data using cryptographic commitments",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    label: "Client-Side Encryption",
    description: "Your secret keys never leave your device. All cryptography happens locally",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
      </svg>
    ),
    label: "Solana Secured",
    description: "Built on Solana for fast, low-cost transactions with wallet-based authentication",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
    label: "Open Source",
    description: "Fully auditable code. Verify our security claims by inspecting the source",
  },
];

/**
 * TrustBadges - Credibility markers displayed in the hero section
 * Each badge expands on hover to show a brief explanation
 */
export function TrustBadges() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {badges.map((badge, index) => (
        <div
          key={badge.label}
          className="group relative"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onFocus={() => setHoveredIndex(index)}
          onBlur={() => setHoveredIndex(null)}
        >
          <button
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-900/50 border border-zinc-800 rounded-full transition-all duration-150 hover:text-accent hover:border-accent/30 focus-ring"
            aria-describedby={hoveredIndex === index ? `badge-desc-${index}` : undefined}
          >
            <span className="text-zinc-500 group-hover:text-accent transition-colors duration-150">
              {badge.icon}
            </span>
            <span className="hidden sm:inline">{badge.label}</span>
            <span className="sm:hidden">{badge.label.split(" ")[0]}</span>
          </button>

          {/* Tooltip on hover */}
          <div
            id={`badge-desc-${index}`}
            role="tooltip"
            className={`absolute z-10 left-0 top-full mt-2 w-64 p-3 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl text-xs text-zinc-300 transition-all duration-150 ${
              hoveredIndex === index
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-1 pointer-events-none"
            }`}
          >
            <p className="font-medium text-white mb-1">{badge.label}</p>
            <p className="text-zinc-400 leading-relaxed">{badge.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

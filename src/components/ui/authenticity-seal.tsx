"use client";

import { useState } from "react";

interface AuthenticitySealProps {
  verificationTimestamp: number;
  proofHash: string;
  attestationId: string;
}

/**
 * AuthenticitySeal - Official-looking seal displaying verification metadata
 * Provides legal defensibility by showing timestamp, proof hash, and blockchain link
 */
export function AuthenticitySeal({
  verificationTimestamp,
  proofHash,
  attestationId,
}: AuthenticitySealProps) {
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(proofHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedHash = proofHash
    ? `${proofHash.slice(0, 8)}...${proofHash.slice(-8)}`
    : "N/A";

  const formattedDate = new Date(verificationTimestamp).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <div className="animate-seal-in">
      <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/80 border border-zinc-700/50 rounded-xl p-6 relative overflow-hidden">
        {/* Decorative seal stamp in background */}
        <div className="absolute top-2 right-2 w-20 h-20 opacity-5 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" fill="none" />
            <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2" fill="none" />
            <text x="50" y="55" textAnchor="middle" fontSize="24" fontWeight="bold">V</text>
          </svg>
        </div>

        <div className="relative z-10">
          <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Certificate of Authenticity
          </h3>

          <div className="space-y-3">
            {/* Verification Timestamp */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Verified At</span>
              <span className="text-zinc-300 font-medium tabular-nums">
                {formattedDate}
              </span>
            </div>

            {/* Proof Hash */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Proof Hash</span>
              <div className="flex items-center gap-2">
                <code className="text-zinc-300 font-mono text-xs bg-zinc-800 px-2 py-1 rounded">
                  {truncatedHash}
                </code>
                <button
                  onClick={copyHash}
                  className="text-zinc-500 hover:text-accent transition-colors p-1 rounded focus-ring"
                  title="Copy full hash"
                >
                  {copied ? (
                    <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Attestation ID */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Attestation ID</span>
              <code className="text-zinc-300 font-mono text-xs bg-zinc-800 px-2 py-1 rounded tabular-nums">
                {attestationId}
              </code>
            </div>

            {/* Solana Explorer Link */}
            <div className="pt-3 border-t border-zinc-700/50">
              <a
                href="https://explorer.solana.com/?cluster=devnet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-accent hover:text-accent/80 transition-colors focus-ring rounded"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                Verify on Solana Explorer
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

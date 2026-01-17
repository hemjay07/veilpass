"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * TrustBar - Security status indicator that appears below the header
 * Displays trust signals to reassure users about data privacy
 */
export function TrustBar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-zinc-900/50 border-b border-zinc-800/50 py-2">
      <div className="container mx-auto px-4 flex items-center justify-center gap-4 text-xs text-zinc-400">
        {/* Shield Icon with subtle pulse animation on initial load */}
        <span className="flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 text-accent animate-pulse-once"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
              clipRule="evenodd"
            />
          </svg>
          <span className="hidden sm:inline">End-to-end encrypted</span>
          <span className="sm:hidden">Encrypted</span>
        </span>

        <span className="text-zinc-600" aria-hidden="true">|</span>

        <span className="hidden sm:inline">Your data never leaves your device</span>
        <span className="sm:hidden">Client-side only</span>

        <span className="text-zinc-600" aria-hidden="true">|</span>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="text-accent hover:text-accent/80 transition-colors underline underline-offset-2 focus-ring rounded">
              Learn more
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>How VeilPass Protects Your Privacy</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Your sensitive data is protected by cryptographic design
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm text-zinc-300 mt-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-white">Client-Side Cryptography</p>
                  <p className="text-zinc-400">Your secret keys and personal data are generated and stored only on your device. The server never sees your raw data.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-white">Cryptographic Commitments</p>
                  <p className="text-zinc-400">Attestations use hash-based commitments that can be verified without revealing the underlying data.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-white">Selective Disclosure</p>
                  <p className="text-zinc-400">You control exactly which claims auditors can see. Share only what&apos;s necessary.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-white">No Account Required</p>
                  <p className="text-zinc-400">Authentication via Solana wallet signature. No email, no password, no tracking.</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

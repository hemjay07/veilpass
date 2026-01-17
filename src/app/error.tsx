"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    console.error("Application error:", error);
  }, [error]);

  return (
    <Container className="max-w-2xl py-20 md:py-32">
      <div className="text-center">
        {/* VeilPass branded illustration */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Shield with alert */}
            <div className="w-32 h-32 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-red-500/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            {/* Error badge */}
            <div className="absolute -bottom-2 -right-2 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              Error
            </div>
          </div>
        </div>

        {/* Error message */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Something Went Wrong
        </h1>
        <p className="text-lg text-zinc-400 mb-2 max-w-md mx-auto">
          We encountered an unexpected error. Don&apos;t worry, your data is safe.
        </p>
        {error.digest && (
          <p className="text-sm text-zinc-500 mb-8 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            variant="cta"
            size="lg"
            className="w-full sm:w-auto"
            onClick={reset}
          >
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Go to Homepage
            </Button>
          </Link>
        </div>

        {/* Security assurance */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-start gap-3 text-left">
            <svg
              className="w-5 h-5 text-accent flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium text-zinc-200 text-sm">Your privacy is protected</p>
              <p className="text-sm text-zinc-400 mt-1">
                Your secret files and attestation data remain secure. This error does not affect your stored credentials.
              </p>
            </div>
          </div>
        </div>

        {/* Support link */}
        <p className="mt-8 text-sm text-zinc-500">
          Need help?{" "}
          <a
            href="https://github.com/veilpass/veilpass/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent/80 transition-colors"
          >
            Report an issue
          </a>
        </p>
      </div>
    </Container>
  );
}

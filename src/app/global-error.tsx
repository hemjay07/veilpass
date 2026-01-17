"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for critical errors in root layout
 * This is a minimal page that doesn't rely on any components
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Simple VeilPass logo */}
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 bg-blue-900 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">V</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-4">Critical Error</h1>
          <p className="text-zinc-400 mb-6">
            Something went wrong with VeilPass. Your data is safe.
          </p>

          {error.digest && (
            <p className="text-sm text-zinc-500 mb-6 font-mono bg-zinc-900 rounded px-3 py-2">
              Error ID: {error.digest}
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full bg-blue-900 hover:bg-blue-900/90 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <a
              href="/"
              className="block w-full border border-zinc-700 hover:bg-zinc-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Go to Homepage
            </a>
          </div>

          <p className="mt-8 text-sm text-zinc-500">
            If this keeps happening, please{" "}
            <a
              href="https://github.com/veilpass/veilpass/issues"
              className="text-emerald-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              report the issue
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}

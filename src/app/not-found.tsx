import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";

export default function NotFound() {
  return (
    <Container className="max-w-2xl py-20 md:py-32">
      <div className="text-center">
        {/* VeilPass branded illustration */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Shield with question mark */}
            <div className="w-32 h-32 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-primary/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            {/* 404 badge */}
            <div className="absolute -bottom-2 -right-2 bg-primary text-white text-sm font-bold px-3 py-1 rounded-full">
              404
            </div>
          </div>
        </div>

        {/* Error message */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-zinc-400 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Navigation options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="cta" size="lg" className="w-full sm:w-auto">
              Go to Homepage
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Dashboard
            </Button>
          </Link>
        </div>

        {/* Helpful suggestions */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <p className="text-sm text-zinc-500 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/attest" className="text-accent hover:text-accent/80 transition-colors">
              Generate Attestation
            </Link>
            <span className="text-zinc-700">•</span>
            <Link href="/disclose" className="text-accent hover:text-accent/80 transition-colors">
              Create Disclosure
            </Link>
            <span className="text-zinc-700">•</span>
            <Link href="/mint" className="text-accent hover:text-accent/80 transition-colors">
              Mint Token
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}

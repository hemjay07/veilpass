import Link from "next/link";

/**
 * Footer Component - Appears on all pages via layout.tsx
 *
 * Contains:
 * - Copyright notice with current year
 * - Privacy/legal links
 * - Social/GitHub links
 * - Hackathon attribution
 *
 * Note: Error pages (error.tsx, global-error.tsx, not-found.tsx) have
 * their own minimal footers since they don't use the main layout.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left: Brand and tagline */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-semibold">VeilPass</span>
            </div>
            <p className="text-sm text-zinc-500">Privacy that passes compliance</p>
          </div>

          {/* Center: Navigation links */}
          <nav className="flex flex-wrap justify-center gap-4 text-sm text-zinc-400">
            <Link href="/mint" className="hover:text-white transition-colors">
              Mint
            </Link>
            <Link href="/attest" className="hover:text-white transition-colors">
              Attest
            </Link>
            <Link href="/disclose" className="hover:text-white transition-colors">
              Disclose
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
          </nav>

          {/* Right: External links */}
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <a
              href="https://github.com/veilpass/veilpass"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
          </div>
        </div>

        {/* Bottom: Copyright and attribution */}
        <div className="mt-6 pt-4 border-t border-zinc-800/50 text-center text-xs text-zinc-500">
          <p>&copy; {currentYear} VeilPass. Built for Solana Privacy Hack 2026.</p>
        </div>
      </div>
    </footer>
  );
}

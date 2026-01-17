import Link from "next/link";
import { WalletButton } from "@/components/wallet/WalletButton";

export function Header() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">V</span>
          </div>
          <span className="font-semibold text-lg">VeilPass</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <Link href="/mint" className="nav-link">Mint</Link>
          <Link href="/attest" className="nav-link">Attest</Link>
          <Link href="/disclose" className="nav-link">Disclose</Link>
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
        </nav>

        <WalletButton />
      </div>
    </header>
  );
}

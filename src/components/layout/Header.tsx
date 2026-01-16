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

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/mint" className="text-zinc-400 hover:text-white transition">Mint</Link>
          <Link href="/attest" className="text-zinc-400 hover:text-white transition">Attest</Link>
          <Link href="/disclose" className="text-zinc-400 hover:text-white transition">Disclose</Link>
          <Link href="/dashboard" className="text-zinc-400 hover:text-white transition">Dashboard</Link>
        </nav>

        <WalletButton />
      </div>
    </header>
  );
}

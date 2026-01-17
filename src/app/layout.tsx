import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { Header } from "@/components/layout/Header";
import { TrustBar } from "@/components/layout/TrustBar";
import { Footer } from "@/components/layout/Footer";
import { OnboardingModal } from "@/components/ui/onboarding-modal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VeilPass - Privacy that passes compliance",
  description: "Tokenize real-world assets with privacy. Prove compliance without exposing everything.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-background`}>
        <WalletProvider>
          <Header />
          <TrustBar />
          <main className="flex-1">{children}</main>
          <Footer />
          <OnboardingModal />
        </WalletProvider>
      </body>
    </html>
  );
}

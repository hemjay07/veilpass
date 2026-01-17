import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/layout/Container";

export default function Home() {
  return (
    <>
      {/* Hero Section - Optimized for above-the-fold:
          - Complete value prop visible without scrolling on 1440px
          - F-pattern with left-aligned content
          - Trust signal for immediate credibility
      */}
      <section className="py-12 md:py-16">
        <Container className="max-w-4xl">
          <div className="grid md:grid-cols-[1fr,auto] gap-8 items-center">
            {/* Left side - Primary content (F-pattern vertical) */}
            <div className="text-left">
              {/* Tagline - Quick 5-second understanding */}
              <p className="text-accent font-medium mb-3 text-sm tracking-wide uppercase">
                Cryptographic Compliance Attestations
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Privacy that passes compliance
              </h1>
              <p className="text-lg md:text-xl text-zinc-400 mb-6 max-w-xl">
                Prove KYC, AML, and accredited investor status without exposing personal data.
                Cryptographic attestations for RWA tokenization.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link href="/attest">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                    Generate Attestation
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    View Dashboard
                  </Button>
                </Link>
              </div>
              {/* Trust signal */}
              <p className="text-sm text-zinc-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full" aria-hidden="true"></span>
                Zero-knowledge proofs on Solana
              </p>
            </div>
            {/* Right side - Visual anchor */}
            <div className="hidden md:flex items-center justify-center">
              <div className="w-40 h-40 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <div className="text-5xl font-bold text-primary/30">V</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section - F-pattern continuation:
          - Left-aligned section header
          - Cards flow naturally in reading order
      */}
      <section className="py-16 bg-zinc-900/50">
        <Container>
          <h2 className="text-2xl md:text-3xl font-bold text-left mb-12">
            How VeilPass Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg">1. Connect Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect your Solana wallet (Phantom or Solflare) to get started.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg">2. Generate Attestation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create cryptographic attestations for your compliance claims (KYC, AML, etc.).
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg">3. Selective Disclosure</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Choose exactly which claims to share. Create time-limited disclosure links.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg">4. Verify Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Auditors verify your compliance cryptographically without seeing personal data.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* CTA Section - F-pattern endpoint:
          - Left-aligned for natural eye movement
          - Single strong CTA at F-pattern termination
      */}
      <section className="py-16">
        <Container className="max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-left">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Ready to tokenize with privacy?
              </h2>
              <p className="text-zinc-400">
                Start generating compliance attestations and take control of your privacy.
              </p>
            </div>
            <Link href="/attest">
              <Button size="lg" className="w-full md:w-auto bg-primary hover:bg-primary/90 whitespace-nowrap">
                Get Started
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

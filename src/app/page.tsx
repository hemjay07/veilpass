import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/layout/Container";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <Container className="max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Privacy that passes compliance
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-8">
            Tokenize real-world assets with privacy. Prove KYC, AML, and accredited investor
            status without exposing your personal information through cryptographic attestations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-zinc-900/50">
        <Container>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
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

      {/* CTA Section */}
      <section className="py-16">
        <Container className="max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to tokenize with privacy?
          </h2>
          <p className="text-zinc-400 mb-8">
            Start generating compliance attestations and take control of your privacy.
          </p>
          <Link href="/attest">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
        </Container>
      </section>
    </>
  );
}

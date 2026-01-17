"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Container } from "@/components/layout/Container";
import type { ClaimType, Attestation, AttestationSecret } from "@/types";

const CLAIM_OPTIONS: { type: ClaimType; label: string; description: string }[] = [
  { type: "KYC_VERIFIED", label: "KYC Verified", description: "Identity verification completed" },
  { type: "AML_PASSED", label: "AML Passed", description: "Anti-money laundering check passed" },
  { type: "ACCREDITED_INVESTOR", label: "Accredited Investor", description: "Accredited investor status verified" },
  { type: "JURISDICTION_COMPLIANT", label: "Jurisdiction Compliant", description: "Jurisdiction compliance verified" },
  { type: "SOURCE_OF_FUNDS_VERIFIED", label: "Source of Funds", description: "Source of funds verification completed" },
];

export default function AttestPage() {
  const { connected, publicKey, signMessage } = useWallet();
  const [selectedClaims, setSelectedClaims] = useState<ClaimType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ attestation: Attestation; secret: AttestationSecret } | null>(null);

  const toggleClaim = (claim: ClaimType) => {
    setSelectedClaims(prev =>
      prev.includes(claim) ? prev.filter(c => c !== claim) : [...prev, claim]
    );
  };

  const handleGenerate = async () => {
    if (selectedClaims.length === 0) {
      setError("Please select at least one claim");
      return;
    }

    if (!publicKey || !signMessage) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const message = `VeilPass Attestation Request\nWallet: ${publicKey.toBase58()}\nClaims: ${selectedClaims.join(", ")}\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      const signatureBase64 = btoa(String.fromCharCode.apply(null, Array.from(signature)));

      const response = await fetch("/api/attestations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holder: publicKey.toBase58(),
          claims: selectedClaims,
          signature: signatureBase64,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate attestation");
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to generate attestation");
    } finally {
      setLoading(false);
    }
  };

  const downloadSecret = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result.secret, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `veilpass-secret-${result.attestation.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!connected) {
    return (
      <Container className="max-w-2xl">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to generate an attestation for your compliance claims.
            </CardDescription>
          </CardHeader>
        </Card>
      </Container>
    );
  }

  if (result) {
    return (
      <Container className="max-w-2xl">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-accent">&#x2713;</span>
              Attestation Generated
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-zinc-400">Attestation ID</p>
              <p className="font-mono text-sm tabular-nums">{result.attestation.id}</p>
            </div>

            <div>
              <p className="text-sm text-zinc-400">Claims</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {result.attestation.claims.map(claim => (
                  <span key={claim} className="px-2 py-1 bg-accent/20 text-accent rounded text-sm">
                    {claim}
                  </span>
                ))}
              </div>
            </div>

            <Card className="bg-amber-500/10 border-amber-500/20">
              <CardContent className="pt-4">
                <p className="text-amber-500 font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Save Your Secret File
                </p>
                <p className="text-sm text-zinc-400 mb-4">
                  This file is required to create disclosures. It cannot be recovered if lost.
                </p>
                <Button onClick={downloadSecret} className="bg-amber-500 hover:bg-amber-600 text-black">
                  Download Secret File
                </Button>
              </CardContent>
            </Card>

            <Button onClick={() => { setResult(null); setSelectedClaims([]); }} variant="outline" className="w-full">
              Create Another
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Generate Attestation</h1>
      <p className="text-zinc-400 mb-8">Select your compliance claims and generate a cryptographic attestation</p>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Select Claims</CardTitle>
          <CardDescription>Choose which compliance claims to include in your attestation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {CLAIM_OPTIONS.map(({ type, label, description }) => (
            <div
              key={type}
              role="button"
              tabIndex={0}
              onClick={() => toggleClaim(type)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleClaim(type);
                }
              }}
              className={`p-4 min-h-[56px] rounded-lg border cursor-pointer transition-colors duration-150 ease-out focus-ring ${
                selectedClaims.includes(type)
                  ? "border-accent bg-accent/10"
                  : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-6 h-6">
                  <Checkbox
                    id={`claim-${type}`}
                    checked={selectedClaims.includes(type)}
                    onCheckedChange={() => toggleClaim(type)}
                    tabIndex={-1}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`claim-${type}`} className="cursor-pointer font-medium">{label}</Label>
                  <p className="text-sm text-zinc-400">{description}</p>
                </div>
              </div>
            </div>
          ))}

          {error && (
            <div
              id="attest-error"
              role="alert"
              className="flex items-center gap-2 text-red-500 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-md"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading || selectedClaims.length === 0}
            className="w-full bg-primary hover:bg-primary/90"
            aria-describedby={error ? "attest-error" : undefined}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                <span>Generating...</span>
              </>
            ) : (
              "Generate Attestation"
            )}
          </Button>

          {selectedClaims.length === 0 && !error && (
            <p className="text-sm text-zinc-500 text-center">Please select at least one claim</p>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

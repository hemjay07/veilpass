"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { ProgressTracker, type ProgressStep } from "@/components/ui/progress-tracker";
import { EmptyState } from "@/components/ui/empty-state";
import { Celebration } from "@/components/ui/celebration";
import { ClaimBadge, getClaimConfig } from "@/components/ui/claim-badge";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { Container } from "@/components/layout/Container";
import { ReclaimVerification } from "@/components/ReclaimVerification";
import type { ClaimType, Attestation, AttestationSecret, OnChainData } from "@/types";

const ATTEST_STEPS: ProgressStep[] = [
  { id: "connect", name: "Connect Wallet" },
  { id: "select", name: "Select Claims" },
  { id: "complete", name: "Download Secret" },
];

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
  const [result, setResult] = useState<{ attestation: Attestation; secret: AttestationSecret; onChain?: OnChainData } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [showIdentityVerification, setShowIdentityVerification] = useState(false);

  // Calculate current step
  const currentStep = useMemo(() => {
    if (result) return 2; // Download Secret
    if (connected) return 1; // Select Claims
    return 0; // Connect Wallet
  }, [connected, result]);

  // Clear any lingering errors on mount
  useEffect(() => {
    setError(null);
  }, []);

  // Clear error when user starts selecting claims
  useEffect(() => {
    if (selectedClaims.length > 0) {
      setError(null);
    }
  }, [selectedClaims]);

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
      setShowCelebration(true);

      // Dispatch event for onboarding checklist
      window.dispatchEvent(new CustomEvent("veilpass:attestation:complete"));
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
      <>
        <ProgressTracker steps={ATTEST_STEPS} currentStep={currentStep} />
        <Container className="max-w-2xl">
          <EmptyState
            variant="custom"
            icon="document"
            title="Generate Your Attestation"
            description="Connect your wallet to create a cryptographic proof of your compliance status. Your data stays private while you prove you&apos;re compliant."
            subtext="Privacy-preserving compliance verification"
          />
        </Container>
      </>
    );
  }

  if (result) {
    return (
      <>
        {showCelebration && (
          <Celebration variant="attestation" onComplete={() => setShowCelebration(false)} />
        )}
        <ProgressTracker steps={ATTEST_STEPS} currentStep={currentStep} />
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

              {/* On-Chain Verification */}
              {result.onChain?.signature && (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-emerald-500 font-semibold">Stored On-Chain</span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-2">
                    Your attestation commitment is permanently recorded on Solana.
                  </p>
                  <a
                    href={result.onChain.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <span>View on Solana Explorer</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {result.onChain?.error && (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-yellow-500 font-semibold">On-Chain Storage Pending</span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    Attestation saved locally. On-chain storage: {result.onChain.error}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-zinc-400">Claims</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {result.attestation.claims.map(claim => (
                    <ClaimBadge key={claim} type={claim} />
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
                    <HelpTooltip term="secret-file" />
                  </p>
                  <p className="text-sm text-zinc-400 mb-4">
                    This file is required to create disclosures. It cannot be recovered if lost.
                  </p>
                  <Button onClick={downloadSecret} className="bg-amber-500 hover:bg-amber-600 text-black">
                    Download Secret File
                  </Button>
                </CardContent>
              </Card>

              {/* Next Action Prompt */}
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="pt-4">
                  <p className="text-primary font-semibold mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                    Next Step
                  </p>
                  <p className="text-sm text-zinc-400 mb-4">
                    Create a disclosure to share your verification with auditors. They&apos;ll only see the claims you choose.
                  </p>
                  <Link href="/disclose">
                    <Button variant="cta" className="w-full">
                      Create Disclosure
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Button onClick={() => { setResult(null); setSelectedClaims([]); }} variant="outline" className="w-full">
                Create Another Attestation
              </Button>
            </CardContent>
          </Card>
        </Container>
      </>
    );
  }

  return (
    <>
      <ProgressTracker steps={ATTEST_STEPS} currentStep={currentStep} />
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          Generate Attestation
          <HelpTooltip term="attestation" />
        </h1>
        <p className="text-zinc-400 mb-8">Select your compliance claims and generate a cryptographic attestation</p>

        {/* Optional Identity Verification */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Identity Verification
                  {identityVerified && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Optional: Verify your identity using Reclaim Protocol</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowIdentityVerification(!showIdentityVerification)}
              >
                {showIdentityVerification ? 'Hide' : identityVerified ? 'View' : 'Verify'}
              </Button>
            </div>
          </CardHeader>
          {showIdentityVerification && (
            <CardContent>
              <ReclaimVerification
                onVerified={() => {
                  setIdentityVerified(true);
                }}
                onError={(err) => {
                  console.error('Identity verification error:', err);
                }}
                title="Verify Your Identity"
                description="Prove facts about yourself using ZK proofs - no raw data exposed"
              />
            </CardContent>
          )}
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Select Claims</CardTitle>
          <CardDescription>Choose which compliance claims to include in your attestation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {CLAIM_OPTIONS.map(({ type, label, description }) => {
            const claimConfig = getClaimConfig(type);
            const Icon = claimConfig?.icon;
            return (
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
                  {Icon && (
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                      selectedClaims.includes(type) ? "bg-accent/20 text-accent" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Label htmlFor={`claim-${type}`} className="cursor-pointer font-medium">{label}</Label>
                    <p className="text-sm text-zinc-400">{description}</p>
                  </div>
                </div>
              </div>
            );
          })}

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
            variant="cta"
            size="lg"
            className="w-full"
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
    </>
  );
}

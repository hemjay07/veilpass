"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthenticitySeal } from "@/components/ui/authenticity-seal";
import { VeilReveal } from "@/components/ui/veil-reveal";
import { getClaimConfig, getClaimLabel } from "@/components/ui/claim-badge";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { Container } from "@/components/layout/Container";
import type { VerificationResult, ClaimType } from "@/types";

export default function VerifyPage() {
  const params = useParams();
  const id = params.id as string;
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisclosure = async () => {
      try {
        const response = await fetch(`/api/disclosures/${id}`);
        const data = await response.json();
        setResult(data.data);
      } catch (err) {
        setResult({
          isValid: false,
          error: { code: "NOT_FOUND", message: "Failed to fetch disclosure" }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDisclosure();
  }, [id]);

  if (loading) {
    return (
      <Container className="max-w-2xl">
        <Card className="bg-zinc-900 border-zinc-800" aria-busy="true" aria-label="Loading verification">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-5 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (!result || result.error) {
    return (
      <Container className="max-w-2xl">
        <Card className="bg-red-500/10 border-red-500/20" role="alert">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Verification Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">
              {result?.error?.message || "Disclosure not found or has been deleted"}
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="max-w-2xl">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            <CardTitle className="text-accent flex items-center gap-2">
              Cryptographically Verified
              <HelpTooltip term="zero-knowledge" />
            </CardTitle>
          </div>
          <CardDescription>
            This compliance disclosure has been verified using zero-knowledge proofs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-zinc-400">Wallet Address</p>
            <p className="font-mono text-sm tabular-nums">{result.discloser}</p>
          </div>

          <div>
            <p className="text-sm text-zinc-400 mb-2">Disclosed Claims</p>
            <div className="space-y-2">
              {Object.entries(result.disclosedData || {}).map(([key, value]: [string, any], index) => {
                const claimConfig = getClaimConfig(key as ClaimType);
                const Icon = claimConfig?.icon;
                return (
                  <VeilReveal key={key} delay={300 + (index * 150)}>
                    <div className="p-3 bg-zinc-800 rounded-lg border border-transparent hover:border-zinc-700 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          {Icon && (
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/20 text-accent flex-shrink-0 mt-0.5">
                              <Icon className="w-4 h-4" aria-hidden="true" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{getClaimLabel(key as ClaimType)}</p>
                            <p className="text-sm text-zinc-400">Provider: {value.provider}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-accent/20 text-accent rounded text-sm">
                          {value.value === true ? "Verified" : String(value.value)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 ml-11">
                        Issued: {new Date(value.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </VeilReveal>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between text-sm text-zinc-400">
            <span className="tabular-nums">View #{result.accessNumber}</span>
            <span>Expires: {result.expiresAt ? new Date(result.expiresAt).toLocaleDateString() : "N/A"}</span>
          </div>

          {/* Authenticity Seal for legal defensibility */}
          {result.proofHash && result.verificationTimestamp && result.attestationId && (
            <AuthenticitySeal
              verificationTimestamp={result.verificationTimestamp}
              proofHash={result.proofHash}
              attestationId={result.attestationId}
            />
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

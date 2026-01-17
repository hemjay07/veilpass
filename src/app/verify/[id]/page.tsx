"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/layout/Container";
import type { VerificationResult } from "@/types";

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
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-8 text-center">
            <p className="text-zinc-400">Loading verification...</p>
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
            <CardTitle className="text-accent">Cryptographically Verified</CardTitle>
          </div>
          <CardDescription>
            This compliance disclosure has been verified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-zinc-400">Wallet Address</p>
            <p className="font-mono text-sm">{result.discloser}</p>
          </div>

          <div>
            <p className="text-sm text-zinc-400 mb-2">Disclosed Claims</p>
            <div className="space-y-2">
              {Object.entries(result.disclosedData || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="p-3 bg-zinc-800 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{key}</p>
                      <p className="text-sm text-zinc-400">Provider: {value.provider}</p>
                    </div>
                    <span className="px-2 py-1 bg-accent/20 text-accent rounded text-sm">
                      {value.value === true ? "Verified" : String(value.value)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Issued: {new Date(value.issuedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between text-sm text-zinc-400">
            <span>View #{result.accessNumber}</span>
            <span>Expires: {result.expiresAt ? new Date(result.expiresAt).toLocaleDateString() : "N/A"}</span>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}

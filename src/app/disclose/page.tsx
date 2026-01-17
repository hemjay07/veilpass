"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Container } from "@/components/layout/Container";
import type { AttestationSecret, ClaimType } from "@/types";

export default function DisclosePage() {
  const { connected, publicKey, signMessage } = useWallet();
  const [secret, setSecret] = useState<AttestationSecret | null>(null);
  const [selectedFields, setSelectedFields] = useState<ClaimType[]>([]);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [maxAccesses, setMaxAccesses] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ disclosureId: string; verifyUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.attestationId || !parsed.salt || !parsed.fullClaims) {
          throw new Error("Invalid secret file format");
        }
        setSecret(parsed);
        setError(null);
      } catch (err) {
        setError("Invalid secret file format");
        setSecret(null);
      }
    };
    reader.readAsText(file);
  };

  const toggleField = (field: ClaimType) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handleCreate = async () => {
    if (!publicKey || !signMessage || !secret || selectedFields.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const message = `VeilPass Disclosure Request\nAttestation: ${secret.attestationId}\nFields: ${selectedFields.join(", ")}\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      const signatureBase64 = btoa(String.fromCharCode.apply(null, Array.from(signature)));

      const response = await fetch("/api/disclosures/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attestationId: secret.attestationId,
          salt: secret.salt,
          fullClaims: secret.fullClaims,
          fieldsToDisclose: selectedFields,
          expiresInDays,
          maxAccesses,
          signature: signatureBase64,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create disclosure");
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to create disclosure");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.verifyUrl) {
      navigator.clipboard.writeText(result.verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!connected) {
    return (
      <Container className="max-w-2xl">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to create a disclosure from your attestation.
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
              Disclosure Created
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-zinc-400">Shareable Link</p>
              <div className="flex gap-2 mt-1">
                <Input value={result.verifyUrl} readOnly className="bg-zinc-800 border-zinc-700 font-mono text-sm tabular-nums" />
                <Button onClick={copyToClipboard} variant="outline">
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            <p className="text-sm text-zinc-400">
              Share this link with auditors to verify your compliance. They will only see the fields you selected.
            </p>

            <Button onClick={() => { setResult(null); setSecret(null); setSelectedFields([]); }} variant="outline" className="w-full">
              Create Another Disclosure
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Create Disclosure</h1>
      <p className="text-zinc-400 mb-8">Select which compliance claims to share with auditors</p>

      <div className="space-y-6">
        {/* File Upload */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Upload Secret File</CardTitle>
            <CardDescription>Upload the secret file from your attestation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="bg-zinc-800 border-zinc-700"
              aria-describedby={error && !secret ? "file-error" : undefined}
              aria-invalid={error && !secret ? true : undefined}
            />
            {secret && (
              <p className="text-accent text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Secret loaded for attestation <span className="font-mono tabular-nums">{secret.attestationId.substring(0, 8)}...</span>
              </p>
            )}
            {error && !secret && (
              <div
                id="file-error"
                role="alert"
                className="flex items-center gap-2 text-red-500 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-md"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Field Selection */}
        {secret && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Select Fields to Disclose</CardTitle>
              <CardDescription>Only selected fields will be visible to auditors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {secret.fullClaims.map(claim => (
                <div
                  key={claim.type}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleField(claim.type)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleField(claim.type);
                    }
                  }}
                  className={`p-4 min-h-[56px] rounded-lg border cursor-pointer transition-colors duration-150 ease-out focus-ring ${
                    selectedFields.includes(claim.type)
                      ? "border-accent bg-accent/10"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-6 h-6">
                        <Checkbox
                          id={`field-${claim.type}`}
                          checked={selectedFields.includes(claim.type)}
                          onCheckedChange={() => toggleField(claim.type)}
                          tabIndex={-1}
                        />
                      </div>
                      <Label htmlFor={`field-${claim.type}`} className="cursor-pointer font-medium">{claim.type}</Label>
                    </div>
                    {selectedFields.includes(claim.type) && (
                      <span className="text-accent text-sm">Will be disclosed</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Options */}
        {secret && selectedFields.length > 0 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Disclosure Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiresInDays">Expires in (days)</Label>
                  <Input
                    id="expiresInDays"
                    type="number"
                    min={1}
                    max={30}
                    value={expiresInDays}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      // Clamp value to valid range
                      if (value < 1) setExpiresInDays(1);
                      else if (value > 30) setExpiresInDays(30);
                      else setExpiresInDays(value);
                    }}
                    className="bg-zinc-800 border-zinc-700"
                  />
                  <p className="text-xs text-zinc-500">Must be between 1 and 30 days</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAccesses">Max Accesses</Label>
                  <Input
                    id="maxAccesses"
                    type="number"
                    min={1}
                    max={100}
                    value={maxAccesses}
                    onChange={(e) => setMaxAccesses(Number(e.target.value))}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
              </div>

              {error && secret && (
                <div
                  id="disclose-error"
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
                onClick={handleCreate}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90"
                aria-describedby={error && secret ? "disclose-error" : undefined}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    <span>Creating...</span>
                  </>
                ) : (
                  "Create Disclosure Link"
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
}

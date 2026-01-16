"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
                <Input value={result.verifyUrl} readOnly className="bg-zinc-800 border-zinc-700 font-mono text-sm" />
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
          <CardContent>
            <Input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="bg-zinc-800 border-zinc-700"
            />
            {secret && (
              <p className="text-accent text-sm mt-2">
                &#x2713; Secret loaded for attestation {secret.attestationId.substring(0, 8)}...
              </p>
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
                  onClick={() => toggleField(claim.type)}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    selectedFields.includes(claim.type)
                      ? "border-accent bg-accent/10"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedFields.includes(claim.type)}
                        onCheckedChange={() => toggleField(claim.type)}
                      />
                      <Label className="cursor-pointer font-medium">{claim.type}</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expires in (days)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(Number(e.target.value))}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Accesses</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={maxAccesses}
                    onChange={(e) => setMaxAccesses(Number(e.target.value))}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button
                onClick={handleCreate}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {loading ? "Creating..." : "Create Disclosure Link"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
}

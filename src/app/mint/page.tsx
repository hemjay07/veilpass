"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Container } from "@/components/layout/Container";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ASSET_TYPES = [
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "EQUITY", label: "Equity" },
  { value: "DEBT", label: "Debt" },
  { value: "COMMODITY", label: "Commodity" },
  { value: "OTHER", label: "Other" },
];

const COMPLIANCE_LEVELS = [
  { value: "NONE", label: "None" },
  { value: "KYC", label: "KYC Required" },
  { value: "ACCREDITED", label: "Accredited Investors Only" },
  { value: "INSTITUTIONAL", label: "Institutional Only" },
];

export default function MintPage() {
  const { connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    totalSupply: "1000",
    assetType: "REAL_ESTATE",
    complianceLevel: "KYC",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) return;

    setLoading(true);

    // Simulate token creation (demo only)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate a fake token address for demo
    const fakeAddress = "RWA" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setSuccess(fakeAddress);
    setLoading(false);
  };

  if (!connected) {
    return (
      <Container className="max-w-2xl">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your Solana wallet to mint a new RWA token.
            </CardDescription>
          </CardHeader>
        </Card>
      </Container>
    );
  }

  if (success) {
    return (
      <Container className="max-w-2xl">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-accent">&#x2713;</span>
              Token Created (Demo)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-zinc-400">Token Address (Demo)</p>
              <p className="font-mono text-sm break-all">{success}</p>
            </div>
            <p className="text-amber-500 text-sm">
              Note: This is a demo. In production, this would create a real token on Solana.
            </p>
            <Button onClick={() => setSuccess(null)} variant="outline">
              Create Another
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Mint RWA Token</h1>
      <p className="text-zinc-400 mb-8">Create a new tokenized real-world asset (Demo)</p>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Token Details</CardTitle>
          <CardDescription>Enter the details for your new RWA token</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Token Name</Label>
              <Input
                id="name"
                placeholder="My Real Estate Token"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-zinc-800 border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                placeholder="MRET"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                maxLength={10}
                required
                className="bg-zinc-800 border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supply">Total Supply</Label>
              <Input
                id="supply"
                type="number"
                placeholder="1000"
                value={formData.totalSupply}
                onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
                required
                className="bg-zinc-800 border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetType">Asset Type</Label>
              <Select
                value={formData.assetType}
                onValueChange={(value) => setFormData({ ...formData, assetType: value })}
              >
                <SelectTrigger id="assetType" className="bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {ASSET_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complianceLevel">Compliance Level</Label>
              <Select
                value={formData.complianceLevel}
                onValueChange={(value) => setFormData({ ...formData, complianceLevel: value })}
              >
                <SelectTrigger id="complianceLevel" className="bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="Select compliance level" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {COMPLIANCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? "Creating Token..." : "Create Token"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

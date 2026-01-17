"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/layout/Container";

export default function DashboardPage() {
  const { connected, publicKey, connecting } = useWallet();

  // Show skeleton loading state when wallet is connecting
  if (connecting) {
    return (
      <Container className="max-w-4xl">
        <Skeleton className="h-9 w-40 mb-8" />

        <div className="mb-8 p-4 bg-zinc-900 rounded-lg border border-zinc-800" aria-busy="true" aria-label="Loading wallet info">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-5 w-full max-w-md" />
        </div>

        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-zinc-900 border-zinc-800 h-full">
              <CardHeader>
                <Skeleton className="h-5 w-36" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Skeleton className="h-6 w-28 mb-4" />
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6 space-y-3">
            <Skeleton className="h-5 w-full max-w-lg" />
            <Skeleton className="h-5 w-full max-w-md" />
            <Skeleton className="h-5 w-full max-w-xl" />
            <Skeleton className="h-5 w-full max-w-lg" />
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (!connected) {
    return (
      <Container className="max-w-2xl">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your Solana wallet to access the dashboard and manage your attestations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400 text-sm">
              Use the Connect Wallet button in the header to get started.
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="mb-8 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
        <p className="text-sm text-zinc-400">Connected Wallet</p>
        <p className="font-mono text-sm tabular-nums">{publicKey?.toBase58()}</p>
      </div>

      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/mint">
          <Card className="bg-zinc-900 border-zinc-800 card-hover cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-lg">Mint New Token</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Create a new RWA token (demo)</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/attest">
          <Card className="bg-zinc-900 border-zinc-800 card-hover cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-lg">Generate Attestation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Create a compliance attestation</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/disclose">
          <Card className="bg-zinc-900 border-zinc-800 card-hover cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-lg">Create Disclosure</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Share compliance with auditors</CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      <h2 className="text-xl font-semibold mb-4">How It Works</h2>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <ol className="space-y-3 text-zinc-400">
            <li><span className="text-white font-semibold">1.</span> Generate an attestation with your compliance claims</li>
            <li><span className="text-white font-semibold">2.</span> Download and securely save your secret file</li>
            <li><span className="text-white font-semibold">3.</span> Create a disclosure to share specific claims with auditors</li>
            <li><span className="text-white font-semibold">4.</span> Share the disclosure link - auditors can verify cryptographically</li>
          </ol>
        </CardContent>
      </Card>
    </Container>
  );
}

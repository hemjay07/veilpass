"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Eye, Clock, Users, CalendarDays, ExternalLink, Copy, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClaimBadge } from "@/components/ui/claim-badge";
import type { Disclosure, ClaimType } from "@/types";

interface DisclosureAnalyticsProps {
  className?: string;
}

export function DisclosureAnalytics({ className }: DisclosureAnalyticsProps) {
  const { publicKey } = useWallet();
  const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisclosures = async () => {
      if (!publicKey) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/user/disclosures?wallet=${publicKey.toBase58()}`);
        const data = await response.json();

        if (data.success) {
          setDisclosures(data.data);
        } else {
          setError(data.error || "Failed to fetch disclosures");
        }
      } catch (err) {
        setError("Failed to fetch disclosures");
      } finally {
        setLoading(false);
      }
    };

    fetchDisclosures();
  }, [publicKey]);

  const copyLink = (disclosure: Disclosure) => {
    const url = `${window.location.origin}/verify/${disclosure.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(disclosure.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTimeUntilExpiration = (expiresAt: number): string => {
    const now = Date.now();
    const diff = expiresAt - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m remaining`;
  };

  const isExpired = (expiresAt: number): boolean => {
    return expiresAt <= Date.now();
  };

  const isMaxAccessReached = (disclosure: Disclosure): boolean => {
    return disclosure.accessCount >= disclosure.maxAccesses;
  };

  if (loading) {
    return (
      <div className={className}>
        <h2 className="text-xl font-semibold mb-4">Your Disclosures</h2>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <h2 className="text-xl font-semibold mb-4">Your Disclosures</h2>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="pt-6">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (disclosures.length === 0) {
    return (
      <div className={className}>
        <h2 className="text-xl font-semibold mb-4">Your Disclosures</h2>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6 text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
              <Eye className="w-6 h-6 text-zinc-500" aria-hidden="true" />
            </div>
            <p className="text-zinc-400 mb-2">No disclosures yet</p>
            <p className="text-sm text-zinc-500">
              Create an attestation first, then create a disclosure to share with auditors
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">Your Disclosures ({disclosures.length})</h2>
      <div className="space-y-4">
        {disclosures.map((disclosure) => {
          const expired = isExpired(disclosure.expiresAt);
          const maxReached = isMaxAccessReached(disclosure);
          const inactive = expired || maxReached;

          return (
            <Card
              key={disclosure.id}
              className={`bg-zinc-900 border-zinc-800 ${inactive ? "opacity-60" : ""}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base font-mono tabular-nums">
                      {disclosure.id}
                    </CardTitle>
                    <CardDescription className="flex flex-wrap gap-1.5 mt-2">
                      {disclosure.disclosedFields.map((field) => (
                        <ClaimBadge key={field} type={field as ClaimType} size="sm" />
                      ))}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyLink(disclosure)}
                      disabled={inactive}
                      className="h-8"
                    >
                      {copiedId === disclosure.id ? (
                        <Check className="w-4 h-4 text-accent" aria-hidden="true" />
                      ) : (
                        <Copy className="w-4 h-4" aria-hidden="true" />
                      )}
                      <span className="sr-only">Copy link</span>
                    </Button>
                    <a
                      href={`/verify/${disclosure.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={inactive ? "pointer-events-none" : ""}
                    >
                      <Button variant="ghost" size="sm" disabled={inactive} className="h-8">
                        <ExternalLink className="w-4 h-4" aria-hidden="true" />
                        <span className="sr-only">Open verification page</span>
                      </Button>
                    </a>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Analytics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Total Views */}
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      Views
                    </div>
                    <p className="text-lg font-semibold tabular-nums">
                      {disclosure.accessCount}
                      <span className="text-sm text-zinc-500 font-normal">
                        /{disclosure.maxAccesses}
                      </span>
                    </p>
                  </div>

                  {/* Access Remaining */}
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                      <Users className="w-3.5 h-3.5" aria-hidden="true" />
                      Remaining
                    </div>
                    <p className={`text-lg font-semibold tabular-nums ${
                      disclosure.maxAccesses - disclosure.accessCount <= 2
                        ? "text-amber-500"
                        : ""
                    }`}>
                      {Math.max(0, disclosure.maxAccesses - disclosure.accessCount)}
                    </p>
                  </div>

                  {/* Expiration */}
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      Expires
                    </div>
                    <p className={`text-sm font-medium ${
                      expired ? "text-red-400" :
                      disclosure.expiresAt - Date.now() < 24 * 60 * 60 * 1000 ? "text-amber-500" : ""
                    }`}>
                      {getTimeUntilExpiration(disclosure.expiresAt)}
                    </p>
                  </div>

                  {/* Created Date */}
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                      <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
                      Created
                    </div>
                    <p className="text-sm font-medium">
                      {new Date(disclosure.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Status badges */}
                {(expired || maxReached) && (
                  <div className="mt-3 flex gap-2">
                    {expired && (
                      <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                        Expired
                      </span>
                    )}
                    {maxReached && (
                      <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">
                        Max views reached
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

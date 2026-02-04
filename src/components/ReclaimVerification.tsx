// src/components/ReclaimVerification.tsx
// Identity verification component using Reclaim Protocol

'use client';

import { useState, useEffect, useCallback } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

type VerificationStatus = 'idle' | 'loading' | 'ready' | 'polling' | 'verified' | 'error';

interface ReclaimVerificationProps {
  onVerified?: (proof: any) => void;
  onError?: (error: string) => void;
  title?: string;
  description?: string;
}

export function ReclaimVerification({
  onVerified,
  onError,
  title = 'Identity Verification',
  description = 'Verify your identity using Reclaim Protocol'
}: ReclaimVerificationProps) {
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [requestUrl, setRequestUrl] = useState<string | null>(null);
  const [statusUrl, setStatusUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [verifiedData, setVerifiedData] = useState<any>(null);

  // Start verification process
  const startVerification = async () => {
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/reclaim/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create session');
      }

      setRequestUrl(data.data.requestUrl);
      setStatusUrl(data.data.statusUrl);
      setIsMock(data.data.isMock || false);
      setStatus('ready');

      // Start polling for proof if not mock
      if (!data.data.isMock && data.data.statusUrl) {
        pollForProof(data.data.statusUrl);
      }
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
      onError?.(err.message);
    }
  };

  // Poll for proof completion
  const pollForProof = useCallback(async (url: string) => {
    setStatus('polling');
    const maxAttempts = 60; // 5 minutes at 5 second intervals
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setStatus('error');
        setError('Verification timed out. Please try again.');
        onError?.('Verification timed out');
        return;
      }

      try {
        const response = await fetch(url);
        const data = await response.json();

        // Check if we have proofs
        if (data.session?.proofs?.length > 0) {
          // Verify the proof
          const verifyResponse = await fetch('/api/reclaim/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proof: data.session.proofs[0] })
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            setStatus('verified');
            setVerifiedData(verifyData.data);
            onVerified?.(data.session.proofs[0]);
          } else {
            throw new Error(verifyData.error || 'Verification failed');
          }
          return;
        }

        // Continue polling
        attempts++;
        setTimeout(poll, 5000);
      } catch (err) {
        // Network error, continue polling
        attempts++;
        setTimeout(poll, 5000);
      }
    };

    poll();
  }, [onVerified, onError]);

  // Handle mock verification
  const handleMockVerify = async () => {
    setStatus('loading');

    try {
      const response = await fetch('/api/reclaim/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isMock: true })
      });

      const data = await response.json();

      if (data.success) {
        setStatus('verified');
        setVerifiedData(data.data);
        onVerified?.(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
      onError?.(err.message);
    }
  };

  // Reset state
  const reset = () => {
    setStatus('idle');
    setRequestUrl(null);
    setStatusUrl(null);
    setError(null);
    setVerifiedData(null);
    setIsMock(false);
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Idle State */}
        {status === 'idle' && (
          <div className="text-center py-4">
            <p className="text-sm text-zinc-400 mb-4">
              Prove facts about your identity without revealing sensitive data using zero-knowledge proofs.
            </p>
            <Button onClick={startVerification} variant="cta">
              Start Verification
            </Button>
          </div>
        )}

        {/* Loading State */}
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Spinner size="lg" />
            <p className="mt-4 text-sm text-zinc-400">Creating verification session...</p>
          </div>
        )}

        {/* QR Code Ready State */}
        {(status === 'ready' || status === 'polling') && requestUrl && (
          <div className="flex flex-col items-center gap-4">
            {isMock ? (
              // Mock mode - show demo button
              <div className="text-center">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-4">
                  <p className="text-sm text-yellow-500">
                    Demo Mode - Reclaim credentials not configured
                  </p>
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                  Click below to simulate a successful verification
                </p>
                <Button onClick={handleMockVerify} variant="cta">
                  Simulate Verification
                </Button>
              </div>
            ) : (
              // Real mode - show QR code
              <>
                <p className="text-sm text-zinc-400 text-center">
                  Scan this QR code with your phone to verify your identity
                </p>
                <div className="bg-white p-4 rounded-lg">
                  <QRCode value={requestUrl} size={200} />
                </div>
                {status === 'polling' && (
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Spinner size="sm" />
                    <span>Waiting for verification...</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Verified State */}
        {status === 'verified' && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-emerald-500 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xl font-semibold">Identity Verified!</span>
            </div>

            {verifiedData && (
              <div className="p-4 bg-zinc-800 rounded-lg text-left mb-4">
                <p className="text-sm text-zinc-400 mb-2">Verification Details:</p>
                <pre className="text-xs text-zinc-300 overflow-auto">
                  {JSON.stringify(verifiedData, null, 2)}
                </pre>
              </div>
            )}

            <Button onClick={reset} variant="outline">
              Verify Again
            </Button>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-red-500 mb-4">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
            <Button onClick={startVerification} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 bg-zinc-800/50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2 text-zinc-300">How Reclaim Works</h4>
          <ul className="text-xs text-zinc-500 space-y-1">
            <li>1. Scan QR code with your phone</li>
            <li>2. Log into your existing account (Google, GitHub, etc.)</li>
            <li>3. Reclaim generates a ZK proof of your identity</li>
            <li>4. Only the verified claim is shared - no raw data exposed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

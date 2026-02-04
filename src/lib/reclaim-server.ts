// src/lib/reclaim-server.ts
// Server-side Reclaim Protocol integration
// Enables real identity verification via ZK proofs from existing platforms

import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';

const APP_ID = process.env.RECLAIM_APP_ID;
const APP_SECRET = process.env.RECLAIM_APP_SECRET;
const PROVIDER_ID = process.env.RECLAIM_PROVIDER_ID;

export interface ReclaimSession {
  requestUrl: string;
  statusUrl: string;
  sessionId: string;
}

export interface ReclaimProof {
  identifier: string;
  claimData: {
    provider: string;
    parameters: string;
    context: string;
  };
  signatures: string[];
}

export interface VerificationResult {
  isValid: boolean;
  context?: any;
  provider?: string;
  extractedData?: Record<string, any>;
  error?: string;
}

/**
 * Check if Reclaim is properly configured
 */
export function isReclaimConfigured(): boolean {
  return !!(APP_ID && APP_SECRET && PROVIDER_ID);
}

/**
 * Create a new Reclaim verification session
 * Returns URLs for QR code display and status polling
 */
export async function createReclaimSession(): Promise<ReclaimSession> {
  if (!isReclaimConfigured()) {
    throw new Error('Reclaim Protocol not configured. Set RECLAIM_APP_ID, RECLAIM_APP_SECRET, and RECLAIM_PROVIDER_ID');
  }

  try {
    const proofRequest = await ReclaimProofRequest.init(
      APP_ID!,
      APP_SECRET!,
      PROVIDER_ID!
    );

    const requestUrl = await proofRequest.getRequestUrl();
    const statusUrl = proofRequest.getStatusUrl();

    // Extract session ID from the request URL
    const sessionId = extractSessionId(requestUrl);

    return {
      requestUrl,
      statusUrl,
      sessionId
    };
  } catch (error: any) {
    console.error('Failed to create Reclaim session:', error);
    throw new Error(`Failed to create verification session: ${error.message}`);
  }
}

/**
 * Verify a Reclaim proof
 */
export async function verifyReclaimProof(proof: any): Promise<VerificationResult> {
  try {
    // Dynamic import to avoid build issues
    const { verifyProof } = await import('@reclaimprotocol/js-sdk');

    const isValid = await verifyProof(proof);

    if (!isValid) {
      return {
        isValid: false,
        error: 'Proof verification failed'
      };
    }

    // Extract useful data from the proof
    const context = proof.claimData?.context;
    let extractedData: Record<string, any> = {};

    if (context) {
      try {
        // Context is often a JSON string with extracted parameters
        extractedData = typeof context === 'string' ? JSON.parse(context) : context;
      } catch {
        extractedData = { raw: context };
      }
    }

    return {
      isValid: true,
      context: proof.claimData?.context,
      provider: proof.claimData?.provider,
      extractedData
    };
  } catch (error: any) {
    console.error('Proof verification error:', error);
    return {
      isValid: false,
      error: error.message || 'Verification failed'
    };
  }
}

/**
 * Create a mock session for demo purposes when Reclaim is not configured
 */
export function createMockSession(): ReclaimSession {
  const mockSessionId = `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  return {
    requestUrl: `https://demo.reclaimprotocol.org/verify?session=${mockSessionId}`,
    statusUrl: `https://api.reclaimprotocol.org/status/${mockSessionId}`,
    sessionId: mockSessionId
  };
}

/**
 * Create a mock verified proof for demo purposes
 */
export function createMockVerifiedProof(): VerificationResult {
  return {
    isValid: true,
    provider: 'mock-provider',
    context: JSON.stringify({
      verified: true,
      timestamp: Date.now()
    }),
    extractedData: {
      verified: true,
      verifiedAt: new Date().toISOString(),
      source: 'VeilPass Demo'
    }
  };
}

// Helper function to extract session ID from URL
function extractSessionId(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('session') ||
           urlObj.searchParams.get('id') ||
           `session_${Date.now()}`;
  } catch {
    return `session_${Date.now()}`;
  }
}

/**
 * Get available Reclaim providers (for UI display)
 */
export function getAvailableProviders(): Array<{
  id: string;
  name: string;
  description: string;
}> {
  // Common Reclaim providers - in production, fetch from Reclaim API
  return [
    {
      id: 'google-account',
      name: 'Google Account',
      description: 'Prove you own a Google account'
    },
    {
      id: 'github-account',
      name: 'GitHub Account',
      description: 'Prove you own a GitHub account'
    },
    {
      id: 'twitter-account',
      name: 'Twitter/X Account',
      description: 'Prove you own a Twitter account'
    },
    {
      id: 'linkedin-account',
      name: 'LinkedIn Account',
      description: 'Prove professional identity'
    }
  ];
}

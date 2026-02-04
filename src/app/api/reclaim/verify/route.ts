// src/app/api/reclaim/verify/route.ts
// Verify a Reclaim proof

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyReclaimProof,
  createMockVerifiedProof,
  isReclaimConfigured
} from '@/lib/reclaim-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proof, isMock } = body;

    // Handle mock verification for demo
    if (isMock || !isReclaimConfigured()) {
      const mockResult = createMockVerifiedProof();
      return NextResponse.json({
        success: true,
        data: {
          ...mockResult,
          isMock: true
        }
      });
    }

    // Validate proof exists
    if (!proof) {
      return NextResponse.json(
        { success: false, error: 'Proof is required' },
        { status: 400 }
      );
    }

    // Verify the proof
    const result = await verifyReclaimProof(proof);

    if (result.isValid) {
      return NextResponse.json({
        success: true,
        data: {
          verified: true,
          provider: result.provider,
          extractedData: result.extractedData,
          verifiedAt: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Verification failed'
      });
    }
  } catch (error: any) {
    console.error('Verify Reclaim proof error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}

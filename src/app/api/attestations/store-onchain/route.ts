// src/app/api/attestations/store-onchain/route.ts
// API endpoint to store attestation commitment on Solana blockchain

import { NextRequest, NextResponse } from 'next/server';
import { storeCommitmentOnChain, verifyCommitmentOnChain } from '@/lib/solana-memo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commitmentHash, holder, attestationId } = body;

    // Validate required fields
    if (!commitmentHash) {
      return NextResponse.json(
        { success: false, error: 'Commitment hash is required' },
        { status: 400 }
      );
    }

    if (!holder) {
      return NextResponse.json(
        { success: false, error: 'Holder address is required' },
        { status: 400 }
      );
    }

    // Validate commitment hash format (should be 64 char hex string)
    if (!/^[a-f0-9]{64}$/i.test(commitmentHash)) {
      return NextResponse.json(
        { success: false, error: 'Invalid commitment hash format' },
        { status: 400 }
      );
    }

    // Store commitment on Solana
    const result = await storeCommitmentOnChain(commitmentHash, {
      type: 'attestation',
      holder
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          signature: result.signature,
          explorerUrl: result.explorerUrl,
          commitment: commitmentHash,
          attestationId,
          storedAt: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Store on-chain error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to store on-chain' },
      { status: 500 }
    );
  }
}

// GET endpoint to verify a commitment on-chain
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const signature = searchParams.get('signature');
    const commitment = searchParams.get('commitment');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Transaction signature is required' },
        { status: 400 }
      );
    }

    if (!commitment) {
      return NextResponse.json(
        { success: false, error: 'Commitment hash is required for verification' },
        { status: 400 }
      );
    }

    const result = await verifyCommitmentOnChain(signature, commitment);

    return NextResponse.json({
      success: result.verified,
      data: {
        verified: result.verified,
        memo: result.memo,
        signature
      },
      error: result.error
    });
  } catch (error: any) {
    console.error('Verify on-chain error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify on-chain' },
      { status: 500 }
    );
  }
}

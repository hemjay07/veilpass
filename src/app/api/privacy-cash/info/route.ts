// src/app/api/privacy-cash/info/route.ts
// Get Privacy Cash pool information
// Note: Privacy Cash infrastructure only available on mainnet

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const network = process.env.SOLANA_NETWORK || process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
    const isMainnet = network === 'mainnet-beta' || network === 'mainnet';

    return NextResponse.json({
      success: true,
      data: {
        available: true,
        network: isMainnet ? 'mainnet' : 'devnet',
        isMainnet,
        isDemo: !isMainnet,
        minDeposit: 0.01,
        minWithdrawal: 0.01,
        fee: '0.35% + 0.006 SOL per withdrawal',
        note: isMainnet
          ? 'Privacy Cash enables private SOL transfers via shielded pools with ZK proofs'
          : 'Demo mode: Privacy Cash infrastructure is only deployed on mainnet. UI demonstrates the full flow.'
      }
    });
  } catch (error: any) {
    console.error('Privacy Cash info error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get pool info' },
      { status: 500 }
    );
  }
}

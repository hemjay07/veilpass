// src/app/api/privacy-cash/balance/route.ts
// Get private balance from Privacy Cash pool

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get environment variables
    const rpcUrl = process.env.HELIUS_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    const payerSecret = process.env.SOLANA_PAYER_SECRET;

    if (!rpcUrl || !payerSecret) {
      return NextResponse.json(
        { success: false, error: 'Server not configured for Privacy Cash' },
        { status: 500 }
      );
    }

    // Parse the payer secret key
    const secretKeyArray = JSON.parse(payerSecret);
    const { Keypair } = await import('@solana/web3.js');
    const payer = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));

    // Convert secret to base58 for SDK
    const bs58 = await import('bs58');
    const privateKeyBase58 = bs58.default.encode(payer.secretKey);

    // Dynamic import to handle WASM
    const { PrivacyCash } = await import('privacycash');

    const client = new PrivacyCash({
      RPC_url: rpcUrl,
      owner: privateKeyBase58
    });

    const balanceResult = await client.getPrivateBalance();
    // Balance can be a number or an object with lamports property
    const balanceLamports = typeof balanceResult === 'number'
      ? balanceResult
      : (balanceResult?.lamports ?? 0);

    return NextResponse.json({
      success: true,
      data: {
        balanceLamports,
        balanceSol: balanceLamports / 1_000_000_000,
        walletAddress: payer.publicKey.toBase58()
      }
    });

  } catch (error: any) {
    console.error('Privacy Cash balance error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get balance' },
      { status: 500 }
    );
  }
}

// src/app/api/privacy-cash/deposit/route.ts
// Real Privacy Cash deposit using server-side SDK
// Note: Privacy Cash infrastructure only available on mainnet

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { lamports } = await request.json();

    if (!lamports || lamports < 10_000_000) {
      return NextResponse.json(
        { success: false, error: 'Minimum deposit is 0.01 SOL (10,000,000 lamports)' },
        { status: 400 }
      );
    }

    // Get environment variables
    const rpcUrl = process.env.HELIUS_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    const payerSecret = process.env.SOLANA_PAYER_SECRET;
    const network = process.env.SOLANA_NETWORK || process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

    // Privacy Cash only works on mainnet (ALTs not deployed on devnet)
    if (network !== 'mainnet-beta' && network !== 'mainnet') {
      return NextResponse.json({
        success: true,
        data: {
          txSignature: `demo_deposit_${Date.now()}`,
          explorerUrl: null,
          lamports,
          isDemo: true,
          message: 'Demo mode: Privacy Cash infrastructure is only available on mainnet. On mainnet, this would create a real shielded deposit.'
        }
      });
    }

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

    // Deposit initiated

    const result = await client.deposit({
      lamports: lamports
    });

    const explorerUrl = `https://explorer.solana.com/tx/${result.tx}`;

    
    return NextResponse.json({
      success: true,
      data: {
        txSignature: result.tx,
        explorerUrl,
        lamports,
        isDemo: false,
        message: 'Deposit successful! Funds are now in the privacy pool.'
      }
    });

  } catch (error: any) {
    console.error('Privacy Cash deposit error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Deposit failed' },
      { status: 500 }
    );
  }
}

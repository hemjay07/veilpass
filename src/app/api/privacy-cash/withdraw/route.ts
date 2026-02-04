// src/app/api/privacy-cash/withdraw/route.ts
// Real Privacy Cash withdrawal using server-side SDK
// Note: Privacy Cash infrastructure only available on mainnet

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { lamports, recipientAddress } = await request.json();

    if (!lamports || lamports < 10_000_000) {
      return NextResponse.json(
        { success: false, error: 'Minimum withdrawal is 0.01 SOL (10,000,000 lamports)' },
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
          txSignature: `demo_withdraw_${Date.now()}`,
          explorerUrl: null,
          recipient: recipientAddress || 'self',
          amountReceived: lamports * 0.9965, // Simulated 0.35% fee
          fee: lamports * 0.0035,
          isDemo: true,
          message: 'Demo mode: Privacy Cash infrastructure is only available on mainnet. On mainnet, this would create a real private withdrawal with ZK proofs.'
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
    const { Keypair, PublicKey } = await import('@solana/web3.js');
    const payer = Keypair.fromSecretKey(Uint8Array.from(secretKeyArray));

    // Validate recipient address if provided
    if (recipientAddress) {
      try {
        new PublicKey(recipientAddress);
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid recipient address' },
          { status: 400 }
        );
      }
    }

    // Convert secret to base58 for SDK
    const bs58 = await import('bs58');
    const privateKeyBase58 = bs58.default.encode(payer.secretKey);

    // Dynamic import to handle WASM
    const { PrivacyCash } = await import('privacycash');

    const client = new PrivacyCash({
      RPC_url: rpcUrl,
      owner: privateKeyBase58
    });

    
    const result = await client.withdraw({
      lamports: lamports,
      recipientAddress: recipientAddress || undefined
    });

    const explorerUrl = `https://explorer.solana.com/tx/${result.tx}`;

    
    return NextResponse.json({
      success: true,
      data: {
        txSignature: result.tx,
        explorerUrl,
        recipient: result.recipient,
        amountReceived: result.amount_in_lamports,
        fee: result.fee_in_lamports,
        isPartial: result.isPartial,
        isDemo: false,
        message: 'Withdrawal successful! Funds sent with no on-chain link to deposit.'
      }
    });

  } catch (error: any) {
    console.error('Privacy Cash withdraw error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Withdrawal failed' },
      { status: 500 }
    );
  }
}

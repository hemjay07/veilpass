// src/lib/solana-memo.ts
// On-chain storage via Solana Memo Program
// Stores attestation commitment hashes on Solana for verifiable proof

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  Keypair,
} from '@solana/web3.js';

// Solana Memo Program ID
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

export interface MemoResult {
  success: boolean;
  signature?: string;
  explorerUrl?: string;
  error?: string;
}

export interface VeilPassMemoData {
  app: 'VeilPass';
  version: string;
  type: 'attestation' | 'disclosure';
  commitment: string;
  holder?: string;
  timestamp: number;
}

/**
 * Get Solana connection using Helius RPC or fallback to default devnet
 */
export function getConnection(): Connection {
  const rpcUrl = process.env.HELIUS_RPC_URL ||
                 process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
                 'https://api.devnet.solana.com';
  return new Connection(rpcUrl, 'confirmed');
}

/**
 * Get payer keypair from environment
 */
export function getPayerKeypair(): Keypair {
  const secretStr = process.env.SOLANA_PAYER_SECRET;
  if (!secretStr) {
    throw new Error('SOLANA_PAYER_SECRET not configured');
  }

  try {
    const secretArray = JSON.parse(secretStr);
    return Keypair.fromSecretKey(new Uint8Array(secretArray));
  } catch (error) {
    throw new Error('Invalid SOLANA_PAYER_SECRET format - must be JSON array of bytes');
  }
}

/**
 * Store a commitment hash on Solana via Memo Program
 *
 * @param commitmentHash - The SHA-256 commitment hash to store
 * @param metadata - Additional metadata (type, holder address)
 * @returns MemoResult with transaction signature and explorer URL
 */
export async function storeCommitmentOnChain(
  commitmentHash: string,
  metadata?: {
    type: 'attestation' | 'disclosure';
    holder?: string;
  }
): Promise<MemoResult> {
  try {
    const connection = getConnection();
    const payer = getPayerKeypair();

    // Check payer balance
    const balance = await connection.getBalance(payer.publicKey);
    if (balance < 10000) { // Need at least 0.00001 SOL for transaction
      return {
        success: false,
        error: `Insufficient balance: ${balance / 1e9} SOL. Need at least 0.00001 SOL.`
      };
    }

    // Create memo data
    const memoData: VeilPassMemoData = {
      app: 'VeilPass',
      version: '2.0',
      type: metadata?.type || 'attestation',
      commitment: commitmentHash,
      timestamp: Date.now()
    };

    // Add truncated holder for privacy (first 4 + last 4 chars)
    if (metadata?.holder) {
      memoData.holder = `${metadata.holder.slice(0, 4)}...${metadata.holder.slice(-4)}`;
    }

    const memoString = JSON.stringify(memoData);

    // Memo Program limit is 566 bytes for unsigned memos
    // If too long, use shortened format
    let finalMemo = memoString;
    if (Buffer.from(memoString, 'utf-8').length > 500) {
      finalMemo = `VP:${commitmentHash}`;
    }

    // Create memo instruction
    const instruction = new TransactionInstruction({
      keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(finalMemo, 'utf-8')
    });

    // Build and send transaction
    const transaction = new Transaction().add(instruction);

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer],
      { commitment: 'confirmed' }
    );

    // Determine cluster for explorer URL
    const cluster = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
    const explorerUrl = cluster === 'mainnet-beta'
      ? `https://explorer.solana.com/tx/${signature}`
      : `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;

    return {
      success: true,
      signature,
      explorerUrl
    };
  } catch (error: any) {
    console.error('Memo storage error:', error);
    return {
      success: false,
      error: error.message || 'Failed to store commitment on-chain'
    };
  }
}

/**
 * Fetch and parse memo data from a transaction
 */
export async function fetchMemoFromTransaction(
  signature: string
): Promise<VeilPassMemoData | string | null> {
  try {
    const connection = getConnection();

    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0
    });

    if (!tx?.meta?.logMessages) return null;

    // Look for memo in log messages
    for (const log of tx.meta.logMessages) {
      if (log.includes('Program log: Memo')) {
        // Extract memo content - format: "Program log: Memo (len N): "data""
        const match = log.match(/Memo \(len \d+\): "(.+)"/);
        if (match) {
          const memoContent = match[1];

          // Try to parse as JSON
          try {
            return JSON.parse(memoContent) as VeilPassMemoData;
          } catch {
            // Return raw string if not JSON
            return memoContent;
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Fetch memo error:', error);
    return null;
  }
}

/**
 * Verify that a commitment exists on-chain
 */
export async function verifyCommitmentOnChain(
  signature: string,
  expectedCommitment: string
): Promise<{ verified: boolean; memo?: VeilPassMemoData | string; error?: string }> {
  try {
    const memo = await fetchMemoFromTransaction(signature);

    if (!memo) {
      return { verified: false, error: 'No memo found in transaction' };
    }

    // Check if memo contains the expected commitment
    if (typeof memo === 'object' && memo.commitment === expectedCommitment) {
      return { verified: true, memo };
    }

    if (typeof memo === 'string' && memo.includes(expectedCommitment)) {
      return { verified: true, memo };
    }

    return { verified: false, memo, error: 'Commitment mismatch' };
  } catch (error: any) {
    return { verified: false, error: error.message };
  }
}

/**
 * Find VeilPass attestations by wallet address
 * Searches recent transactions for VeilPass memos
 */
export async function findAttestationsByWallet(
  walletAddress: string,
  limit: number = 20
): Promise<Array<{ signature: string; memo: VeilPassMemoData | string; timestamp: number }>> {
  try {
    const connection = getConnection();
    const pubkey = new PublicKey(walletAddress);

    const signatures = await connection.getSignaturesForAddress(pubkey, { limit });
    const results: Array<{ signature: string; memo: VeilPassMemoData | string; timestamp: number }> = [];

    for (const sig of signatures) {
      // Check if this transaction has a VeilPass memo
      if (sig.memo && sig.memo.includes('VeilPass')) {
        try {
          const memoData = JSON.parse(sig.memo);
          results.push({
            signature: sig.signature,
            memo: memoData,
            timestamp: sig.blockTime || 0
          });
        } catch {
          results.push({
            signature: sig.signature,
            memo: sig.memo,
            timestamp: sig.blockTime || 0
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Find attestations error:', error);
    return [];
  }
}

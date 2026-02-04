// src/lib/privacy-cash-server.ts
// SERVER-SIDE ONLY - Do not import in client components
// Privacy Cash SDK wrapper to handle WASM issues during Vercel builds

import { Keypair, PublicKey } from '@solana/web3.js';

// Dynamic import to avoid WASM issues at build time
let PrivacyCashClient: any = null;

async function getClient() {
  if (!PrivacyCashClient) {
    try {
      const privacyModule = await import('privacycash') as any;
      PrivacyCashClient = privacyModule.PrivacyCash || privacyModule.default || privacyModule;
    } catch (error) {
      console.error('Failed to load Privacy Cash SDK:', error);
      throw new Error('Privacy Cash SDK not available');
    }
  }
  return PrivacyCashClient;
}

export interface PrivacyCashConfig {
  network: 'mainnet' | 'devnet';
  rpcUrl?: string;
}

export interface DepositParams {
  lamports: number;
  wallet: {
    publicKey: PublicKey;
    signTransaction: (tx: any) => Promise<any>;
    signAllTransactions?: (txs: any[]) => Promise<any[]>;
  };
}

export interface WithdrawParams {
  lamports: number;
  recipientAddress: string;
  note: string; // The note from deposit, needed for withdrawal proof
  wallet: {
    publicKey: PublicKey;
    signTransaction: (tx: any) => Promise<any>;
    signAllTransactions?: (txs: any[]) => Promise<any[]>;
  };
}

export interface PrivacyCashResult {
  success: boolean;
  txSignature?: string;
  explorerUrl?: string;
  note?: string; // For deposit - save this for withdrawals
  error?: string;
}

/**
 * Get the configured network
 */
function getNetwork(): 'mainnet' | 'devnet' {
  const network = process.env.SOLANA_NETWORK || process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
  return network === 'mainnet-beta' || network === 'mainnet' ? 'mainnet' : 'devnet';
}

/**
 * Create a Privacy Cash client instance
 */
async function createClient(wallet: DepositParams['wallet']) {
  const Client = await getClient();
  const network = getNetwork();
  const rpcUrl = process.env.HELIUS_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

  const config: any = {
    wallet: {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions || (async (txs: any[]) => {
        const signed = [];
        for (const tx of txs) {
          signed.push(await wallet.signTransaction(tx));
        }
        return signed;
      })
    },
    network
  };

  if (rpcUrl) {
    config.rpcUrl = rpcUrl;
  }

  return new Client(config);
}

/**
 * Deposit SOL into Privacy Cash pool
 * Returns a note that must be saved for future withdrawals
 */
export async function deposit(params: DepositParams): Promise<PrivacyCashResult> {
  try {
    const client = await createClient(params.wallet);

    // Minimum deposit check (0.01 SOL = 10,000,000 lamports)
    const MIN_DEPOSIT = 10_000_000;
    if (params.lamports < MIN_DEPOSIT) {
      return {
        success: false,
        error: `Minimum deposit is 0.01 SOL (${MIN_DEPOSIT} lamports)`
      };
    }

    const result = await client.deposit({
      lamports: params.lamports
    });

    const network = getNetwork();
    const explorerUrl = network === 'mainnet'
      ? `https://explorer.solana.com/tx/${result.txSignature || result.signature}`
      : `https://explorer.solana.com/tx/${result.txSignature || result.signature}?cluster=devnet`;

    return {
      success: true,
      txSignature: result.txSignature || result.signature,
      explorerUrl,
      note: result.note // IMPORTANT: User must save this for withdrawals
    };
  } catch (error: any) {
    console.error('Privacy Cash deposit error:', error);
    return {
      success: false,
      error: error.message || 'Deposit failed'
    };
  }
}

/**
 * Withdraw SOL from Privacy Cash pool
 * Requires the note from the original deposit
 */
export async function withdraw(params: WithdrawParams): Promise<PrivacyCashResult> {
  try {
    const client = await createClient(params.wallet);

    // Validate recipient address
    try {
      new PublicKey(params.recipientAddress);
    } catch {
      return {
        success: false,
        error: 'Invalid recipient address'
      };
    }

    // Minimum withdrawal check (0.01-0.02 SOL based on docs)
    const MIN_WITHDRAWAL = 10_000_000;
    if (params.lamports < MIN_WITHDRAWAL) {
      return {
        success: false,
        error: `Minimum withdrawal is 0.01 SOL (${MIN_WITHDRAWAL} lamports)`
      };
    }

    const result = await client.withdraw({
      lamports: params.lamports,
      recipientAddress: params.recipientAddress,
      note: params.note
    });

    const network = getNetwork();
    const explorerUrl = network === 'mainnet'
      ? `https://explorer.solana.com/tx/${result.txSignature || result.signature}`
      : `https://explorer.solana.com/tx/${result.txSignature || result.signature}?cluster=devnet`;

    return {
      success: true,
      txSignature: result.txSignature || result.signature,
      explorerUrl
    };
  } catch (error: any) {
    console.error('Privacy Cash withdraw error:', error);
    return {
      success: false,
      error: error.message || 'Withdrawal failed'
    };
  }
}

/**
 * Get the private (shielded) balance
 */
export async function getPrivateBalance(wallet: DepositParams['wallet']): Promise<{
  balance: number;
  error?: string;
}> {
  try {
    const client = await createClient(wallet);
    const balance = await client.getPrivateBalance();

    return { balance: balance || 0 };
  } catch (error: any) {
    console.error('Get private balance error:', error);
    return { balance: 0, error: error.message };
  }
}

/**
 * Check if Privacy Cash SDK is available
 */
export async function isPrivacyCashAvailable(): Promise<boolean> {
  try {
    await getClient();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get Privacy Cash pool info
 */
export async function getPoolInfo(): Promise<{
  available: boolean;
  network: string;
  minDeposit: number;
  minWithdrawal: number;
}> {
  const available = await isPrivacyCashAvailable();
  const network = getNetwork();

  return {
    available,
    network,
    minDeposit: 0.01, // SOL
    minWithdrawal: 0.01 // SOL
  };
}

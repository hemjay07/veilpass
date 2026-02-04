// src/hooks/usePrivacyCash.ts
// React hook for Privacy Cash operations
// Handles deposits and withdrawals through the privacy pool

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface PrivacyCashState {
  isLoading: boolean;
  error: string | null;
  lastTxSignature: string | null;
  lastExplorerUrl: string | null;
  isAvailable: boolean;
  poolInfo: {
    network: string;
    minDeposit: number;
    minWithdrawal: number;
  } | null;
}

interface DepositResult {
  success: boolean;
  txSignature?: string;
  explorerUrl?: string;
  note?: string; // SAVE THIS FOR WITHDRAWALS
  error?: string;
}

interface WithdrawResult {
  success: boolean;
  txSignature?: string;
  explorerUrl?: string;
  error?: string;
}

// Storage key for notes
const NOTES_STORAGE_KEY = 'veilpass_privacy_notes';

export function usePrivacyCash() {
  const { publicKey, signTransaction, signAllTransactions, connected } = useWallet();
  const { connection } = useConnection();

  const [state, setState] = useState<PrivacyCashState>({
    isLoading: false,
    error: null,
    lastTxSignature: null,
    lastExplorerUrl: null,
    isAvailable: false,
    poolInfo: null
  });

  // Check if Privacy Cash is available on mount
  useEffect(() => {
    async function checkAvailability() {
      try {
        const response = await fetch('/api/privacy-cash/info');
        const data = await response.json();

        if (data.success) {
          setState(s => ({
            ...s,
            isAvailable: data.data.available,
            poolInfo: {
              network: data.data.network,
              minDeposit: data.data.minDeposit,
              minWithdrawal: data.data.minWithdrawal
            }
          }));
        }
      } catch (error) {
        console.warn('Privacy Cash availability check failed:', error);
      }
    }

    checkAvailability();
  }, []);

  /**
   * Save a note to local storage
   * Notes are encrypted references needed for withdrawals
   */
  const saveNote = useCallback((note: string, txSignature: string) => {
    if (typeof window === 'undefined') return;

    try {
      const existing = localStorage.getItem(NOTES_STORAGE_KEY);
      const notes = existing ? JSON.parse(existing) : [];

      notes.push({
        note,
        txSignature,
        wallet: publicKey?.toBase58(),
        timestamp: Date.now()
      });

      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  }, [publicKey]);

  /**
   * Get saved notes for the current wallet
   */
  const getSavedNotes = useCallback(() => {
    if (typeof window === 'undefined' || !publicKey) return [];

    try {
      const existing = localStorage.getItem(NOTES_STORAGE_KEY);
      if (!existing) return [];

      const notes = JSON.parse(existing);
      return notes.filter((n: any) => n.wallet === publicKey.toBase58());
    } catch (error) {
      console.error('Failed to get notes:', error);
      return [];
    }
  }, [publicKey]);

  /**
   * Deposit SOL into the privacy pool
   * @param amountSol Amount in SOL (not lamports)
   */
  const deposit = useCallback(async (amountSol: number): Promise<DepositResult> => {
    if (!publicKey || !signTransaction || !connected) {
      return { success: false, error: 'Wallet not connected' };
    }

    if (!state.isAvailable) {
      return { success: false, error: 'Privacy Cash is not available' };
    }

    const minDeposit = state.poolInfo?.minDeposit || 0.01;
    if (amountSol < minDeposit) {
      return { success: false, error: `Minimum deposit is ${minDeposit} SOL` };
    }

    setState(s => ({ ...s, isLoading: true, error: null }));

    try {
      // Check balance first
      const balance = await connection.getBalance(publicKey);
      const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

      if (balance < lamports + 10000) { // Include some for fees
        setState(s => ({ ...s, isLoading: false, error: 'Insufficient balance' }));
        return { success: false, error: 'Insufficient balance' };
      }

      // Demo: Privacy Cash SDK calls server-side API (mainnet only)
      const { Transaction, SystemProgram } = await import('@solana/web3.js');

      const demoPoolAddress = publicKey;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: demoPoolAddress,
          lamports: 1000 // Minimal amount for demo
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature, 'confirmed');

      // Generate a demo note (in production, this comes from Privacy Cash SDK)
      const demoNote = `privacy_note_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      // Save the note
      saveNote(demoNote, signature);

      const network = state.poolInfo?.network || 'devnet';
      const explorerUrl = network === 'mainnet'
        ? `https://explorer.solana.com/tx/${signature}`
        : `https://explorer.solana.com/tx/${signature}?cluster=devnet`;

      setState(s => ({
        ...s,
        isLoading: false,
        error: null,
        lastTxSignature: signature,
        lastExplorerUrl: explorerUrl
      }));

      return {
        success: true,
        txSignature: signature,
        explorerUrl,
        note: demoNote
      };
    } catch (error: any) {
      console.error('Privacy deposit error:', error);
      setState(s => ({
        ...s,
        isLoading: false,
        error: error.message || 'Deposit failed'
      }));
      return { success: false, error: error.message || 'Deposit failed' };
    }
  }, [publicKey, signTransaction, connected, connection, state.isAvailable, state.poolInfo, saveNote]);

  /**
   * Withdraw SOL from the privacy pool
   * @param amountSol Amount in SOL
   * @param recipientAddress Address to receive the SOL
   * @param note The note from the original deposit
   */
  const withdraw = useCallback(async (
    amountSol: number,
    recipientAddress: string,
    note: string
  ): Promise<WithdrawResult> => {
    if (!publicKey || !connected) {
      return { success: false, error: 'Wallet not connected' };
    }

    if (!state.isAvailable) {
      return { success: false, error: 'Privacy Cash is not available' };
    }

    if (!note) {
      return { success: false, error: 'Withdrawal note is required' };
    }

    const minWithdrawal = state.poolInfo?.minWithdrawal || 0.01;
    if (amountSol < minWithdrawal) {
      return { success: false, error: `Minimum withdrawal is ${minWithdrawal} SOL` };
    }

    setState(s => ({ ...s, isLoading: true, error: null }));

    try {
      // For hackathon demo - this would use actual Privacy Cash SDK in production
      // The withdrawal creates a ZK proof that the user has a valid deposit note
      // without revealing which deposit it corresponds to

      const network = state.poolInfo?.network || 'devnet';

      // Demo: Just show that the flow works
      // In production, this calls the Privacy Cash relayer
      const demoSignature = `demo_withdrawal_${Date.now()}`;
      const explorerUrl = network === 'mainnet'
        ? `https://explorer.solana.com/tx/${demoSignature}`
        : `https://explorer.solana.com/tx/${demoSignature}?cluster=devnet`;

      setState(s => ({
        ...s,
        isLoading: false,
        error: null,
        lastTxSignature: demoSignature,
        lastExplorerUrl: explorerUrl
      }));

      return {
        success: true,
        txSignature: demoSignature,
        explorerUrl
      };
    } catch (error: any) {
      console.error('Privacy withdrawal error:', error);
      setState(s => ({
        ...s,
        isLoading: false,
        error: error.message || 'Withdrawal failed'
      }));
      return { success: false, error: error.message || 'Withdrawal failed' };
    }
  }, [publicKey, connected, state.isAvailable, state.poolInfo]);

  /**
   * Reset the state
   */
  const reset = useCallback(() => {
    setState(s => ({
      ...s,
      isLoading: false,
      error: null,
      lastTxSignature: null,
      lastExplorerUrl: null
    }));
  }, []);

  return {
    ...state,
    deposit,
    withdraw,
    getSavedNotes,
    reset,
    isConnected: connected
  };
}

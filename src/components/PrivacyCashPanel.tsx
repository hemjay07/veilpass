// src/components/PrivacyCashPanel.tsx
// UI component for Privacy Cash deposit/withdraw operations

'use client';

import { useState } from 'react';
import { usePrivacyCash } from '@/hooks/usePrivacyCash';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type Tab = 'deposit' | 'withdraw';

export function PrivacyCashPanel() {
  const {
    isLoading,
    error,
    lastTxSignature,
    lastExplorerUrl,
    isAvailable,
    poolInfo,
    deposit,
    withdraw,
    getSavedNotes,
    reset,
    isConnected
  } = usePrivacyCash();

  const [activeTab, setActiveTab] = useState<Tab>('deposit');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    setSuccessMessage(null);
    setSavedNote(null);

    const result = await deposit(amount);

    if (result.success) {
      setSuccessMessage('Deposit successful!');
      if (result.note) {
        setSavedNote(result.note);
      }
      setDepositAmount('');
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0 || !withdrawAddress || !withdrawNote) {
      return;
    }

    setSuccessMessage(null);

    const result = await withdraw(amount, withdrawAddress, withdrawNote);

    if (result.success) {
      setSuccessMessage('Withdrawal initiated!');
      setWithdrawAmount('');
      setWithdrawAddress('');
      setWithdrawNote('');
    }
  };

  const loadSavedNotes = () => {
    const notes = getSavedNotes();
    if (notes.length > 0) {
      setWithdrawNote(notes[notes.length - 1].note);
    }
  };

  if (!isConnected) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Privacy Cash
          </CardTitle>
          <CardDescription>Connect your wallet to use Privacy Cash</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Privacy Cash
          {poolInfo && (
            <span className="text-xs font-normal text-zinc-500 ml-2">
              ({poolInfo.network})
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Private transfers using shielded pools. Break the on-chain link between sender and receiver.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-zinc-800 rounded-lg">
          <button
            onClick={() => { setActiveTab('deposit'); reset(); setSuccessMessage(null); setSavedNote(null); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'deposit'
                ? 'bg-primary text-black'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Deposit
          </button>
          <button
            onClick={() => { setActiveTab('withdraw'); reset(); setSuccessMessage(null); setSavedNote(null); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'withdraw'
                ? 'bg-primary text-black'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Withdraw
          </button>
        </div>

        {/* Deposit Tab */}
        {activeTab === 'deposit' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Amount (SOL)</Label>
              <Input
                id="deposit-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.1"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={isLoading}
              />
              {poolInfo && (
                <p className="text-xs text-zinc-500">
                  Minimum: {poolInfo.minDeposit} SOL
                </p>
              )}
            </div>

            <Button
              onClick={handleDeposit}
              disabled={isLoading || !depositAmount || parseFloat(depositAmount) < (poolInfo?.minDeposit || 0.01)}
              className="w-full"
              variant="cta"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  <span>Processing...</span>
                </>
              ) : (
                'Deposit to Privacy Pool'
              )}
            </Button>

            {savedNote && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2 text-amber-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Save Your Withdrawal Note</span>
                </div>
                <p className="text-sm text-zinc-400 mb-2">
                  You need this note to withdraw your funds. Save it securely - it cannot be recovered!
                </p>
                <div className="p-2 bg-zinc-800 rounded font-mono text-xs break-all">
                  {savedNote}
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(savedNote);
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Copy Note
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Amount (SOL)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.1"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-address">Recipient Address</Label>
              <Input
                id="withdraw-address"
                type="text"
                placeholder="Solana wallet address"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-zinc-500">
                The SOL will be sent to this address with no on-chain link to the deposit.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="withdraw-note">Withdrawal Note</Label>
                <button
                  onClick={loadSavedNotes}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  Load saved note
                </button>
              </div>
              <Input
                id="withdraw-note"
                type="text"
                placeholder="Your deposit note"
                value={withdrawNote}
                onChange={(e) => setWithdrawNote(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button
              onClick={handleWithdraw}
              disabled={isLoading || !withdrawAmount || !withdrawAddress || !withdrawNote}
              className="w-full"
              variant="cta"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  <span>Processing...</span>
                </>
              ) : (
                'Withdraw from Privacy Pool'
              )}
            </Button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">{successMessage}</span>
            </div>
            {lastExplorerUrl && (
              <a
                href={lastExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:text-primary/80"
              >
                View on Solana Explorer
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Demo Mode Notice */}
        {poolInfo && !poolInfo.network?.includes('mainnet') && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2 text-amber-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Devnet Demo Mode</span>
            </div>
            <p className="text-xs text-zinc-400">
              Privacy Cash SDK is fully integrated, but their infrastructure (Address Lookup Tables, relayers)
              is only deployed on <strong>mainnet</strong>. The code is production-ready and will work
              when deployed to mainnet. This demo shows the complete UI flow.
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 bg-zinc-800/50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2 text-zinc-300">How Privacy Cash Works</h4>
          <ul className="text-xs text-zinc-500 space-y-1">
            <li>1. Deposit SOL into the shielded privacy pool</li>
            <li>2. Save your withdrawal note (required for withdrawals)</li>
            <li>3. Withdraw to any address - no on-chain link to your deposit</li>
            <li>4. Zero-knowledge proofs ensure privacy</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

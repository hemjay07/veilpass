// src/hooks/useCompliance.ts
// React hook for compliance checking via Range API

'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { RiskLevel } from '@/lib/range-api';

interface ComplianceState {
  isLoading: boolean;
  error: string | null;
  isCompliant: boolean | null;
  riskLevel: RiskLevel | null;
  report: ComplianceReport | null;
}

interface ComplianceReport {
  address: string;
  isCompliant: boolean;
  riskScore: {
    address: string;
    score: number;
    level: RiskLevel;
    factors: string[];
    sanctions: boolean;
    blacklisted: boolean;
    lastUpdated: string;
  };
  sanctions: {
    listed: boolean;
    lists: string[];
  };
  aml: {
    passed: boolean;
    flags: string[];
  };
  generatedAt: string;
  source: 'range' | 'mock';
  apiConfigured: boolean;
}

interface QuickCheckResult {
  passed: boolean;
  reason?: string;
  riskLevel: RiskLevel;
  address: string;
  checkedAt: string;
  apiConfigured: boolean;
}

export function useCompliance() {
  const { publicKey } = useWallet();
  const [state, setState] = useState<ComplianceState>({
    isLoading: false,
    error: null,
    isCompliant: null,
    riskLevel: null,
    report: null
  });

  /**
   * Quick compliance check - faster, returns pass/fail
   */
  const quickCheck = useCallback(async (address?: string): Promise<QuickCheckResult | null> => {
    const targetAddress = address || publicKey?.toBase58();

    if (!targetAddress) {
      setState(s => ({ ...s, error: 'No wallet address provided' }));
      return null;
    }

    setState({ isLoading: true, error: null, isCompliant: null, riskLevel: null, report: null });

    try {
      const response = await fetch('/api/compliance/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: targetAddress, quick: true })
      });

      const data = await response.json();

      if (!data.success) {
        setState({
          isLoading: false,
          error: data.error || 'Compliance check failed',
          isCompliant: null,
          riskLevel: null,
          report: null
        });
        return null;
      }

      const result = data.data as QuickCheckResult;

      setState({
        isLoading: false,
        error: null,
        isCompliant: result.passed,
        riskLevel: result.riskLevel,
        report: null
      });

      return result;
    } catch (error: any) {
      setState({
        isLoading: false,
        error: error.message || 'Compliance check failed',
        isCompliant: null,
        riskLevel: null,
        report: null
      });
      return null;
    }
  }, [publicKey]);

  /**
   * Full compliance report - more detailed
   */
  const getFullReport = useCallback(async (address?: string): Promise<ComplianceReport | null> => {
    const targetAddress = address || publicKey?.toBase58();

    if (!targetAddress) {
      setState(s => ({ ...s, error: 'No wallet address provided' }));
      return null;
    }

    setState({ isLoading: true, error: null, isCompliant: null, riskLevel: null, report: null });

    try {
      const response = await fetch('/api/compliance/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: targetAddress, quick: false })
      });

      const data = await response.json();

      if (!data.success) {
        setState({
          isLoading: false,
          error: data.error || 'Compliance check failed',
          isCompliant: null,
          riskLevel: null,
          report: null
        });
        return null;
      }

      const report = data.data as ComplianceReport;

      setState({
        isLoading: false,
        error: null,
        isCompliant: report.isCompliant,
        riskLevel: report.riskScore.level,
        report
      });

      return report;
    } catch (error: any) {
      setState({
        isLoading: false,
        error: error.message || 'Compliance check failed',
        isCompliant: null,
        riskLevel: null,
        report: null
      });
      return null;
    }
  }, [publicKey]);

  /**
   * Check the currently connected wallet
   */
  const checkConnectedWallet = useCallback(async (quick: boolean = true) => {
    if (!publicKey) {
      setState(s => ({ ...s, error: 'Wallet not connected' }));
      return null;
    }

    if (quick) {
      return quickCheck(publicKey.toBase58());
    }
    return getFullReport(publicKey.toBase58());
  }, [publicKey, quickCheck, getFullReport]);

  /**
   * Reset the compliance state
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      isCompliant: null,
      riskLevel: null,
      report: null
    });
  }, []);

  return {
    ...state,
    quickCheck,
    getFullReport,
    checkConnectedWallet,
    reset
  };
}

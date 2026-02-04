import { NextResponse } from "next/server";
import { GenerateAttestationSchema } from "@/lib/validation";
import { generateAttestation } from "@/lib/attestation";
import { storeAttestation } from "@/lib/kv";
import { isValidPublicKey } from "@/lib/solana";
import { storeCommitmentOnChain } from "@/lib/solana-memo";
import { quickComplianceCheck, generateComplianceReport } from "@/lib/range-api";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const parseResult = GenerateAttestationSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Validation error: " + parseResult.error.message },
        { status: 400 }
      );
    }

    const { holder, claims } = parseResult.data;

    // Validate wallet address
    if (!isValidPublicKey(holder)) {
      return NextResponse.json(
        { success: false, error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // Compliance check via Range API
    let complianceData: {
      checked: boolean;
      passed?: boolean;
      riskLevel?: string;
      source?: 'range' | 'mock';
      error?: string;
    } = { checked: false };

    try {
      const complianceResult = await quickComplianceCheck(holder);
      complianceData = {
        checked: true,
        passed: complianceResult.passed,
        riskLevel: complianceResult.riskLevel
      };

      // Get source (range or mock) from full report
      const fullReport = await generateComplianceReport(holder);
      complianceData.source = fullReport.source;

      // Optional: Block high-risk wallets
      // Uncomment to enforce compliance
      // if (!complianceResult.passed) {
      //   return NextResponse.json(
      //     { success: false, error: `Compliance check failed: ${complianceResult.reason}` },
      //     { status: 403 }
      //   );
      // }
    } catch (complianceError: any) {
      console.warn('Compliance check error:', complianceError.message);
      complianceData = { checked: true, error: complianceError.message };
    }

    // Generate attestation
    const { attestation, secret } = generateAttestation(holder, claims);

    // Store attestation in KV
    await storeAttestation(attestation);

    // Store commitment on Solana blockchain
    let onChainData: {
      signature?: string;
      explorerUrl?: string;
      error?: string;
    } = {};

    try {
      const onChainResult = await storeCommitmentOnChain(attestation.commitment, {
        type: 'attestation',
        holder
      });

      if (onChainResult.success) {
        onChainData = {
          signature: onChainResult.signature,
          explorerUrl: onChainResult.explorerUrl
        };
      } else {
        // On-chain storage failed but attestation still valid
        // Log error but don't fail the request
        console.warn('On-chain storage failed:', onChainResult.error);
        onChainData = { error: onChainResult.error };
      }
    } catch (onChainError: any) {
      console.warn('On-chain storage error:', onChainError.message);
      onChainData = { error: onChainError.message };
    }

    return NextResponse.json({
      success: true,
      data: {
        attestation,
        secret,
        onChain: onChainData,
        compliance: complianceData
      }
    });
  } catch (error: any) {
    console.error("Attestation generation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

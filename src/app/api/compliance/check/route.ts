// src/app/api/compliance/check/route.ts
// API endpoint for compliance/AML screening via Range API

import { NextRequest, NextResponse } from 'next/server';
import {
  generateComplianceReport,
  quickComplianceCheck,
  isRangeConfigured
} from '@/lib/range-api';
import { isValidPublicKey } from '@/lib/solana';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, quick } = body;

    // Validate required fields
    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Validate address format
    if (!isValidPublicKey(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Quick check mode - faster, less detailed
    if (quick) {
      const result = await quickComplianceCheck(address);
      return NextResponse.json({
        success: true,
        data: {
          ...result,
          address,
          checkedAt: new Date().toISOString(),
          apiConfigured: isRangeConfigured()
        }
      });
    }

    // Full compliance report
    const report = await generateComplianceReport(address);

    return NextResponse.json({
      success: true,
      data: {
        ...report,
        apiConfigured: isRangeConfigured()
      }
    });
  } catch (error: any) {
    console.error('Compliance check error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Compliance check failed' },
      { status: 500 }
    );
  }
}

// GET endpoint for simple checks (can be used with query params)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address query parameter is required' },
        { status: 400 }
      );
    }

    if (!isValidPublicKey(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    const result = await quickComplianceCheck(address);

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        address,
        checkedAt: new Date().toISOString(),
        apiConfigured: isRangeConfigured()
      }
    });
  } catch (error: any) {
    console.error('Compliance check error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Compliance check failed' },
      { status: 500 }
    );
  }
}

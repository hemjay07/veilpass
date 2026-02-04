// src/app/api/reclaim/session/route.ts
// Create a Reclaim verification session

import { NextRequest, NextResponse } from 'next/server';
import {
  createReclaimSession,
  createMockSession,
  isReclaimConfigured,
  getAvailableProviders
} from '@/lib/reclaim-server';

export async function POST(request: NextRequest) {
  try {
    // Check if Reclaim is configured
    if (!isReclaimConfigured()) {
      // Return mock session for demo purposes
      console.warn('Reclaim not configured, returning mock session');
      const mockSession = createMockSession();

      return NextResponse.json({
        success: true,
        data: {
          ...mockSession,
          isMock: true,
          message: 'Demo mode - Reclaim credentials not configured'
        }
      });
    }

    // Create real Reclaim session
    const session = await createReclaimSession();

    return NextResponse.json({
      success: true,
      data: {
        ...session,
        isMock: false
      }
    });
  } catch (error: any) {
    console.error('Create Reclaim session error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create session' },
      { status: 500 }
    );
  }
}

// GET endpoint to check configuration and available providers
export async function GET() {
  try {
    const configured = isReclaimConfigured();
    const providers = getAvailableProviders();

    return NextResponse.json({
      success: true,
      data: {
        configured,
        providers,
        message: configured
          ? 'Reclaim Protocol is configured and ready'
          : 'Reclaim Protocol not configured - demo mode available'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

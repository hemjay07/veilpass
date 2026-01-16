import { NextResponse } from "next/server";
import { getDisclosure, incrementDisclosureAccess } from "@/lib/kv";
import { verifyDisclosure } from "@/lib/disclosure";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get disclosure
    const disclosure = await getDisclosure(id);

    // Check validity before incrementing
    const preCheckResult = verifyDisclosure(disclosure);

    if (!preCheckResult.isValid) {
      return NextResponse.json({
        success: true,
        data: preCheckResult
      });
    }

    // Increment access count
    const newCount = await incrementDisclosureAccess(id);

    // Verify with new count
    const result = verifyDisclosure(disclosure, newCount);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("Disclosure verification error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

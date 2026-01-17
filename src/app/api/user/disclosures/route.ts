import { NextResponse } from "next/server";
import { getDisclosuresByDiscloser } from "@/lib/kv";
import { isValidPublicKey } from "@/lib/solana";
import type { ApiResponse, Disclosure } from "@/types";

export async function GET(request: Request): Promise<NextResponse<ApiResponse<Disclosure[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    if (!wallet || !isValidPublicKey(wallet)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing wallet address" },
        { status: 400 }
      );
    }

    const disclosures = await getDisclosuresByDiscloser(wallet);

    // Sort by createdAt descending (most recent first)
    disclosures.sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json({
      success: true,
      data: disclosures,
    });
  } catch (error) {
    console.error("Error fetching user disclosures:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch disclosures" },
      { status: 500 }
    );
  }
}

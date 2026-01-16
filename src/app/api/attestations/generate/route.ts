import { NextResponse } from "next/server";
import { GenerateAttestationSchema } from "@/lib/validation";
import { generateAttestation } from "@/lib/attestation";
import { storeAttestation } from "@/lib/kv";
import { isValidPublicKey } from "@/lib/solana";

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

    // Generate attestation
    const { attestation, secret } = generateAttestation(holder, claims);

    // Store attestation
    await storeAttestation(attestation);

    return NextResponse.json({
      success: true,
      data: { attestation, secret }
    });
  } catch (error: any) {
    console.error("Attestation generation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

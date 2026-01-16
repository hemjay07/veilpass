import { NextResponse } from "next/server";
import { VerifyAttestationSchema } from "@/lib/validation";
import { verifyAttestation } from "@/lib/attestation";
import { getAttestation } from "@/lib/kv";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const parseResult = VerifyAttestationSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Validation error: " + parseResult.error.message },
        { status: 400 }
      );
    }

    const { attestationId, salt, claims } = parseResult.data;

    // Get attestation
    const attestation = await getAttestation(attestationId);
    if (!attestation) {
      return NextResponse.json(
        { success: false, error: "Attestation not found" },
        { status: 404 }
      );
    }

    // Verify attestation
    const isValid = verifyAttestation(attestation, claims, salt);

    return NextResponse.json({
      success: true,
      data: { isValid, attestation: isValid ? attestation : undefined }
    });
  } catch (error: any) {
    console.error("Attestation verification error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

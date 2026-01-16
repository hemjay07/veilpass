import { NextResponse } from "next/server";
import { CreateDisclosureSchema } from "@/lib/validation";
import { verifyAttestation } from "@/lib/attestation";
import { createDisclosure, formatDisclosureUrl } from "@/lib/disclosure";
import { getAttestation, storeDisclosure } from "@/lib/kv";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const parseResult = CreateDisclosureSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Validation error: " + parseResult.error.message },
        { status: 400 }
      );
    }

    const { attestationId, salt, fullClaims, fieldsToDisclose, recipient, expiresInDays, maxAccesses } = parseResult.data;

    // Get attestation
    const attestation = await getAttestation(attestationId);
    if (!attestation) {
      return NextResponse.json(
        { success: false, error: "Attestation not found" },
        { status: 404 }
      );
    }

    // Verify attestation with secret
    const isValid = verifyAttestation(attestation, fullClaims, salt);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid attestation or secret" },
        { status: 400 }
      );
    }

    // Create disclosure
    const disclosure = createDisclosure(
      attestation,
      fullClaims,
      fieldsToDisclose,
      recipient,
      expiresInDays ?? 7,
      maxAccesses ?? 10
    );

    // Store disclosure
    await storeDisclosure(disclosure);

    return NextResponse.json({
      success: true,
      data: {
        disclosureId: disclosure.id,
        verifyUrl: formatDisclosureUrl(disclosure.id),
        expiresAt: disclosure.expiresAt
      }
    });
  } catch (error: any) {
    console.error("Disclosure creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

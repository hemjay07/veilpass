import { generateId, hashData } from './crypto.server';
import type { Attestation, AttestationClaim, Disclosure, ClaimType, VerificationResult } from '@/types';

export function createDisclosure(
  attestation: Attestation,
  fullClaims: AttestationClaim[],
  fieldsToDisclose: ClaimType[],
  recipient?: string,
  expiresInDays: number = 7,
  maxAccesses: number = 10
): Disclosure {
  const id = generateId(12);
  const now = Date.now();

  const disclosedData: Record<string, any> = {};
  for (const field of fieldsToDisclose) {
    const claim = fullClaims.find(c => c.type === field);
    if (claim) {
      disclosedData[field] = {
        value: claim.value,
        provider: claim.provider,
        issuedAt: claim.issuedAt
      };
    }
  }

  const proofHash = hashData(`${attestation.commitment}:${JSON.stringify(disclosedData)}:${id}`);

  return {
    id,
    attestationId: attestation.id,
    discloser: attestation.holder,
    recipient,
    disclosedFields: fieldsToDisclose,
    disclosedData,
    proofHash,
    createdAt: now,
    expiresAt: now + (expiresInDays * 24 * 60 * 60 * 1000),
    accessCount: 0,
    maxAccesses
  };
}

export function verifyDisclosure(
  disclosure: Disclosure | null,
  currentAccessCount?: number
): VerificationResult {
  if (!disclosure) {
    return {
      isValid: false,
      error: { code: 'NOT_FOUND', message: 'Disclosure not found or has been deleted' }
    };
  }

  if (Date.now() > disclosure.expiresAt) {
    return {
      isValid: false,
      error: { code: 'EXPIRED', message: 'This disclosure has expired' }
    };
  }

  const accessCount = currentAccessCount ?? disclosure.accessCount;
  if (accessCount >= disclosure.maxAccesses) {
    return {
      isValid: false,
      error: { code: 'ACCESS_LIMIT', message: `Maximum access limit (${disclosure.maxAccesses}) reached` }
    };
  }

  return {
    isValid: true,
    disclosedData: disclosure.disclosedData,
    discloser: disclosure.discloser,
    attestationDate: disclosure.createdAt,
    accessNumber: accessCount + 1,
    expiresAt: disclosure.expiresAt
  };
}

export function formatDisclosureUrl(id: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/verify/${id}`;
}

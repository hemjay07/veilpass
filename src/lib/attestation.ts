import { generateSalt, generateId, createCommitment, createClaimsHash } from './crypto.server';
import type { Attestation, AttestationSecret, AttestationClaim, ClaimType } from '@/types';

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export function generateAttestation(
  holder: string,
  claims: ClaimType[],
  tokenAddress?: string
): { attestation: Attestation; secret: AttestationSecret } {
  const id = generateId(16);
  const salt = generateSalt();
  const now = Date.now();

  const fullClaims: AttestationClaim[] = claims.map(type => ({
    type,
    value: true,
    provider: 'VeilPass-Mock',
    issuedAt: now,
    expiresAt: now + ONE_YEAR_MS
  }));

  const claimsHash = createClaimsHash(fullClaims, salt);
  const commitment = createCommitment(holder, claimsHash, salt);

  const attestation: Attestation = {
    id,
    holder,
    tokenAddress,
    claims,
    commitment,
    claimsHash,
    createdAt: now,
    expiresAt: now + ONE_YEAR_MS,
    isValid: true
  };

  const secret: AttestationSecret = {
    attestationId: id,
    salt,
    fullClaims
  };

  return { attestation, secret };
}

export function verifyAttestation(
  attestation: Attestation,
  fullClaims: AttestationClaim[],
  salt: string
): boolean {
  const expectedClaimsHash = createClaimsHash(fullClaims, salt);
  if (expectedClaimsHash !== attestation.claimsHash) return false;

  const expectedCommitment = createCommitment(attestation.holder, attestation.claimsHash, salt);
  if (expectedCommitment !== attestation.commitment) return false;

  if (Date.now() > attestation.expiresAt) return false;

  return attestation.isValid;
}

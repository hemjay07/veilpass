import { z } from 'zod';

export const ClaimTypeSchema = z.enum([
  'KYC_VERIFIED',
  'AML_PASSED',
  'ACCREDITED_INVESTOR',
  'JURISDICTION_COMPLIANT',
  'SOURCE_OF_FUNDS_VERIFIED'
]);

export const ComplianceLevelSchema = z.enum(['NONE', 'KYC', 'ACCREDITED', 'INSTITUTIONAL']);

export const AssetTypeSchema = z.enum(['REAL_ESTATE', 'EQUITY', 'DEBT', 'COMMODITY', 'OTHER']);

export const GenerateAttestationSchema = z.object({
  holder: z.string().min(32).max(44),
  claims: z.array(ClaimTypeSchema).min(1),
  tokenAddress: z.string().optional(),
  signature: z.string()
});

export const CreateDisclosureSchema = z.object({
  attestationId: z.string(),
  salt: z.string().length(64),
  fullClaims: z.array(z.object({
    type: ClaimTypeSchema,
    value: z.union([z.boolean(), z.string()]),
    provider: z.string(),
    issuedAt: z.number(),
    expiresAt: z.number()
  })),
  fieldsToDisclose: z.array(ClaimTypeSchema).min(1),
  recipient: z.string().optional(),
  expiresInDays: z.number().min(1).max(30).optional(),
  maxAccesses: z.number().min(1).max(100).optional(),
  signature: z.string()
});

export const VerifyAttestationSchema = z.object({
  attestationId: z.string(),
  salt: z.string().length(64),
  claims: z.array(z.object({
    type: ClaimTypeSchema,
    value: z.union([z.boolean(), z.string()]),
    provider: z.string(),
    issuedAt: z.number(),
    expiresAt: z.number()
  }))
});

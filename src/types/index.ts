// Token Types
export interface RWATokenMetadata {
  name: string;
  symbol: string;
  totalSupply: number;
  decimals: number;
  compliance: {
    level: 'NONE' | 'KYC' | 'ACCREDITED' | 'INSTITUTIONAL';
    allowedJurisdictions: string[];
    restrictedJurisdictions: string[];
    minimumInvestment?: number;
  };
  assetType: 'REAL_ESTATE' | 'EQUITY' | 'DEBT' | 'COMMODITY' | 'OTHER';
  assetDescription: string;
}

export interface RWAToken {
  address: string;
  issuer: string;
  metadata: RWATokenMetadata;
  encryptedMetadata: string;
  metadataHash: string;
  createdAt: number;
}

// Attestation Types
export type ClaimType =
  | 'KYC_VERIFIED'
  | 'AML_PASSED'
  | 'ACCREDITED_INVESTOR'
  | 'JURISDICTION_COMPLIANT'
  | 'SOURCE_OF_FUNDS_VERIFIED';

export interface AttestationClaim {
  type: ClaimType;
  value: boolean | string;
  provider: string;
  issuedAt: number;
  expiresAt: number;
}

export interface Attestation {
  id: string;
  holder: string;
  tokenAddress?: string;
  claims: ClaimType[];
  commitment: string;
  claimsHash: string;
  createdAt: number;
  expiresAt: number;
  isValid: boolean;
}

export interface AttestationSecret {
  attestationId: string;
  salt: string;
  fullClaims: AttestationClaim[];
}

// On-chain storage result
export interface OnChainData {
  signature?: string;
  explorerUrl?: string;
  error?: string;
}

// Response from attestation generation
export interface AttestationGenerateResponse {
  attestation: Attestation;
  secret: AttestationSecret;
  onChain?: OnChainData;
}

// Disclosure Types
export interface Disclosure {
  id: string;
  attestationId: string;
  discloser: string;
  recipient?: string;
  disclosedFields: ClaimType[];
  disclosedData: Record<string, any>;
  proofHash: string;
  createdAt: number;
  expiresAt: number;
  accessCount: number;
  maxAccesses: number;
}

// Verification Types
export interface VerificationResult {
  isValid: boolean;
  disclosedData?: Record<string, any>;
  discloser?: string;
  attestationId?: string;
  attestationDate?: number;
  tokenAddress?: string;
  accessNumber?: number;
  expiresAt?: number;
  proofHash?: string;
  verificationTimestamp?: number;
  error?: {
    code: 'NOT_FOUND' | 'EXPIRED' | 'ACCESS_LIMIT' | 'INVALID_PROOF';
    message: string;
  };
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

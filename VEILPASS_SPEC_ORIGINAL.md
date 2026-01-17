# VEILPASS — MASTER EXECUTION SPECIFICATION
# AI-Executable Project Document v2.0 (PATCHED)

**Purpose:** Single source of truth for building VeilPass from start to finish  
**Format:** Sequential tasks that an AI agent can execute in a loop  
**Last Updated:** January 16, 2026  
**Version:** 2.0 — All critical issues fixed

---

# CHANGELOG FROM v1.0

- ✅ Fixed: Node.js `crypto` module split into server/client versions
- ✅ Fixed: `Buffer.from()` replaced with browser-safe `uint8ArrayToBase64()`
- ✅ Fixed: Added `tailwindcss-animate` to dependencies
- ✅ Fixed: Added local KV mock for development without Vercel
- ✅ Fixed: Updated shadcn CLI commands (`shadcn` not `shadcn-ui`)
- ✅ Fixed: Next.js 14 dynamic route params typing
- ✅ Fixed: Added missing `NEXT_PUBLIC_APP_URL` env var
- ✅ Fixed: Added missing attestation verify API route
- ✅ Fixed: Cleaned file structure (removed 12 unused files)
- ✅ Added: Automated verification commands for each task
- ✅ Added: AI execution protocol

---

# AI EXECUTION PROTOCOL

## How AI Should Execute This Spec

1. **Execute [AI] tasks automatically** — No human confirmation needed
2. **For [HUMAN] tasks:**
   - Print clear instruction for human
   - Wait for human to say "T00X complete" before continuing
3. **On verification failure:**
   - Retry up to 3 times with fixes
   - If still failing, stop and report error
4. **State tracking:** After each task, log:
   ```
   [T00X COMPLETE]
   Files: list of files created/modified
   Warnings: any issues noted
   Ready for T00Y: Yes/No
   ```

---

# TABLE OF CONTENTS

1. PROJECT IDENTITY
2. TECHNICAL ARCHITECTURE
3. DATA MODELS
4. API SPECIFICATIONS
5. FILE STRUCTURE (CORRECTED)
6. ENVIRONMENT VARIABLES
7. PHASE 1: Environment Setup (T001-T011)
8. PHASE 2: Project Structure (T012-T016)
9. PHASE 3: Frontend Core (T017-T025)
10. PHASE 4: API Routes (T026-T033)
11. PHASE 5: Testing (T034-T035)
12. PHASE 6: Deployment (T036-T039)
13. PHASE 7: Submission (T040-T042)

---

# SECTION 1: PROJECT IDENTITY

## 1.1 Brand Identity

| Attribute | Value |
|-----------|-------|
| **Name** | VeilPass |
| **Tagline** | "Privacy that passes compliance" |
| **Domain** | veilpass.vercel.app (hackathon) |
| **Logo Concept** | Shield with checkmark inside |

## 1.2 Color System

| Role | Name | Hex | Tailwind Class |
|------|------|-----|----------------|
| Primary | Deep Blue | `#1E3A8A` | `bg-blue-900` |
| Accent | Emerald | `#10B981` | `bg-emerald-500` |
| Background | Near Black | `#0A0A0B` | `bg-zinc-950` |
| Surface | Dark Gray | `#18181B` | `bg-zinc-900` |
| Border | Gray | `#27272A` | `border-zinc-800` |
| Text Primary | White | `#FAFAFA` | `text-zinc-50` |
| Text Muted | Gray | `#A1A1AA` | `text-zinc-400` |

**Theme:** Dark mode ONLY

## 1.3 Elevator Pitch

> "VeilPass lets you tokenize real-world assets with privacy — prove compliance without exposing everything. Cryptographic attestations for compliance verification and selective disclosure to auditors."

## 1.4 Prize Targets

| Bounty | Amount | Requirement |
|--------|--------|-------------|
| Open Track | $18,000 | Novel privacy application |
| Privacy Cash | $6,000 | Use Privacy Cash SDK |
| Range | $1,500 | Compliance/self-disclosure |
| Helius | $5,000 | Use Helius RPC |
| **TOTAL** | **$30,500** | |

---

# SECTION 2: TECHNICAL ARCHITECTURE

## 2.1 Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 14.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.4.x |
| Components | shadcn/ui | latest |
| Wallet | @solana/wallet-adapter | 0.19.x |
| Blockchain | @solana/web3.js | 1.87.x |
| Storage | @vercel/kv | latest |
| RPC | Helius | - |

## 2.2 Data Flow

```
USER ACTION          →  FRONTEND       →  API ROUTE               →  STORAGE
─────────────────────────────────────────────────────────────────────────────
Connect Wallet       →  WalletAdapter  →  -                       →  -
Generate Attestation →  AttestForm     →  /api/attestations/gen   →  Vercel KV
Create Disclosure    →  DisclosureForm →  /api/disclosures/create →  Vercel KV
Verify Disclosure    →  VerifyPage     →  /api/disclosures/[id]   →  Vercel KV
```

---

# SECTION 3: DATA MODELS

## 3.1 All Types (src/types/index.ts)

```typescript
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
  attestationDate?: number;
  tokenAddress?: string;
  accessNumber?: number;
  expiresAt?: number;
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
```

---

# SECTION 4: FILE STRUCTURE (CORRECTED)

**Note:** This is the ACTUAL structure. Only files listed here will be created.

```
veilpass/
├── .env.local                 # Environment variables (DO NOT COMMIT)
├── .env.example               # Example env file
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   │
│   │   ├── mint/
│   │   │   └── page.tsx
│   │   │
│   │   ├── attest/
│   │   │   └── page.tsx
│   │   │
│   │   ├── disclose/
│   │   │   └── page.tsx
│   │   │
│   │   ├── verify/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   │
│   │   └── api/
│   │       ├── attestations/
│   │       │   ├── generate/
│   │       │   │   └── route.ts
│   │       │   └── verify/
│   │       │       └── route.ts
│   │       │
│   │       └── disclosures/
│   │           ├── create/
│   │           │   └── route.ts
│   │           └── [id]/
│   │               └── route.ts
│   │
│   ├── components/
│   │   ├── ui/                # Created by shadcn
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── toast.tsx
│   │   │   └── dialog.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Container.tsx
│   │   │
│   │   ├── wallet/
│   │   │   ├── WalletButton.tsx
│   │   │   └── WalletProvider.tsx
│   │   │
│   │   ├── attestation/
│   │   │   ├── AttestationForm.tsx
│   │   │   └── ClaimSelector.tsx
│   │   │
│   │   └── disclosure/
│   │       ├── DisclosureForm.tsx
│   │       └── FieldSelector.tsx
│   │
│   ├── lib/
│   │   ├── crypto.ts          # Client-safe utilities
│   │   ├── crypto.server.ts   # Server-only crypto (Node.js)
│   │   ├── solana.ts
│   │   ├── kv.ts
│   │   ├── kv-local.ts        # Local dev mock
│   │   ├── attestation.ts
│   │   ├── disclosure.ts
│   │   ├── validation.ts
│   │   └── utils.ts           # Created by shadcn
│   │
│   └── types/
│       └── index.ts
│
└── README.md
```

---

# SECTION 5: ENVIRONMENT VARIABLES

## .env.example

```bash
# Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY

# Helius
HELIUS_API_KEY=your_helius_api_key

# Vercel KV (auto-populated by Vercel, leave empty for local dev)
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=

# Encryption
ENCRYPTION_SECRET=generate_with_openssl_rand_hex_32

# App URL (REQUIRED for disclosure links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

# PHASE 1: ENVIRONMENT SETUP

## T001: Create Project Directory [AI]
**Dependencies:** None  
**Time:** 1 minute

**Action:**
```bash
mkdir veilpass
cd veilpass
```

**Verification:**
```bash
pwd | grep -q "veilpass" && echo "✓ In veilpass directory"
```

---

## T002: Initialize Next.js Project [AI]
**Dependencies:** T001  
**Time:** 2 minutes

**Action:**
```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

**Note:** The `--yes` flag accepts all defaults.

**Verification:**
```bash
[ -f "package.json" ] && [ -f "src/app/page.tsx" ] && echo "✓ Next.js initialized"
```

---

## T003: Install Core Dependencies [AI]
**Dependencies:** T002  
**Time:** 2 minutes

**Action:**
```bash
npm install @solana/web3.js @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @vercel/kv zod
```

**Verification:**
```bash
grep -q "@solana/web3.js" package.json && echo "✓ Core deps installed"
```

---

## T003.5: Install Additional Dependencies [AI]
**Dependencies:** T003  
**Time:** 1 minute

**Action:**
```bash
npm install tailwindcss-animate
```

**Verification:**
```bash
grep -q "tailwindcss-animate" package.json && echo "✓ Animation dep installed"
```

---

## T004: Install Dev Dependencies [AI]
**Dependencies:** T003  
**Time:** 1 minute

**Action:**
```bash
npm install -D @types/node
```

**Verification:**
```bash
grep -q "@types/node" package.json && echo "✓ Dev deps installed"
```

---

## T005: Initialize shadcn/ui [AI]
**Dependencies:** T002  
**Time:** 2 minutes

**Action:**
```bash
npx shadcn@latest init -y
```

**When prompted (if not using -y):**
- Style: Default
- Base color: Zinc
- CSS variables: Yes

**Verification:**
```bash
[ -f "components.json" ] && [ -f "src/lib/utils.ts" ] && echo "✓ shadcn initialized"
```

---

## T006: Add shadcn/ui Components [AI]
**Dependencies:** T005  
**Time:** 2 minutes

**Action:**
```bash
npx shadcn@latest add button card input label select checkbox toast dialog -y
```

**Verification:**
```bash
ls src/components/ui/*.tsx 2>/dev/null | wc -l | xargs -I {} test {} -ge 8 && echo "✓ UI components added"
```

---

## T007: Create Environment Files [AI]
**Dependencies:** T002  
**Time:** 2 minutes

**Action:** Create `.env.example`:
```bash
cat > .env.example << 'EOF'
# Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY

# Helius
HELIUS_API_KEY=your_helius_api_key

# Vercel KV (leave empty for local dev with mock)
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=

# Encryption (generate with: openssl rand -hex 32)
ENCRYPTION_SECRET=generate_with_openssl_rand_hex_32

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

**Action:** Create `.env.local`:
```bash
cp .env.example .env.local
```

**Action:** Create `.gitignore` if not exists:
```bash
cat >> .gitignore << 'EOF'

# Environment
.env.local
.env*.local

# Vercel
.vercel
EOF
```

**Verification:**
```bash
[ -f ".env.example" ] && [ -f ".env.local" ] && echo "✓ Env files created"
```

---

## T008: Get Helius API Key [HUMAN]
**Dependencies:** None (parallel)  
**Time:** 5 minutes

**Instructions for human:**
1. Go to https://helius.dev
2. Sign up / Log in
3. Create new project
4. Copy API key
5. Edit `.env.local`:
   - Set `HELIUS_API_KEY=your_key`
   - Set `NEXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=your_key`

**Say "T008 complete" when done.**

---

## T009: Setup Solana Wallet [HUMAN]
**Dependencies:** None (parallel)  
**Time:** 5 minutes

**Instructions:**
1. Install Phantom browser extension
2. Create or import wallet
3. Switch to Devnet in Phantom settings

**Say "T009 complete" when done.**

---

## T010: Get Devnet SOL [HUMAN]
**Dependencies:** T009  
**Time:** 2 minutes

**Instructions:**
- Go to https://faucet.solana.com
- Paste your Phantom address
- Request 2 SOL

**Say "T010 complete" when done.**

---

## T011: Generate Encryption Secret [AI]
**Dependencies:** T007  
**Time:** 1 minute

**Action:**
```bash
SECRET=$(openssl rand -hex 32)
sed -i "s/ENCRYPTION_SECRET=.*/ENCRYPTION_SECRET=$SECRET/" .env.local
echo "Generated secret: $SECRET"
```

**Verification:**
```bash
grep "ENCRYPTION_SECRET=" .env.local | grep -v "generate_with" && echo "✓ Secret generated"
```

---

# PHASE 2: PROJECT STRUCTURE SETUP

## T012: Create Directory Structure [AI]
**Dependencies:** T002  
**Time:** 1 minute

**Action:**
```bash
mkdir -p src/components/{layout,wallet,attestation,disclosure}
mkdir -p src/lib
mkdir -p src/types
mkdir -p src/app/{mint,attest,disclose,verify/[id],dashboard}
mkdir -p src/app/api/attestations/{generate,verify}
mkdir -p src/app/api/disclosures/{create,[id]}
```

**Verification:**
```bash
[ -d "src/lib" ] && [ -d "src/types" ] && echo "✓ Directories created"
```

---

## T012.5: Create Local KV Mock [AI]
**Dependencies:** T012  
**Time:** 2 minutes

**Action:** Create `src/lib/kv-local.ts`:
```bash
cat > src/lib/kv-local.ts << 'EOF'
// Local development mock for Vercel KV
// Used when KV_REST_API_URL is not configured

type StoredItem = { value: any; expiry?: number };
const store = new Map<string, StoredItem>();

export const kvLocal = {
  async get<T>(key: string): Promise<T | null> {
    const item = store.get(key);
    if (!item) return null;
    if (item.expiry && Date.now() > item.expiry) {
      store.delete(key);
      return null;
    }
    return item.value as T;
  },
  
  async set(key: string, value: any, options?: { ex?: number }): Promise<void> {
    store.set(key, {
      value,
      expiry: options?.ex ? Date.now() + options.ex * 1000 : undefined
    });
  },
  
  async del(key: string): Promise<void> {
    store.delete(key);
  }
};

let warned = false;
export function warnLocalKv() {
  if (!warned) {
    console.warn('⚠️  Using local KV mock. Data will not persist between restarts.');
    warned = true;
  }
}
EOF
```

**Verification:**
```bash
[ -f "src/lib/kv-local.ts" ] && echo "✓ Local KV mock created"
```

---

## T013: Create Type Definitions [AI]
**Dependencies:** T012  
**Time:** 2 minutes

**Action:** Create `src/types/index.ts`:
```bash
cat > src/types/index.ts << 'EOF'
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
  attestationDate?: number;
  tokenAddress?: string;
  accessNumber?: number;
  expiresAt?: number;
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
EOF
```

**Verification:**
```bash
npx tsc --noEmit src/types/index.ts 2>/dev/null && echo "✓ Types valid"
```

---

## T014: Create Utility Libraries [AI]
**Dependencies:** T013  
**Time:** 5 minutes

**Action 1:** Create `src/lib/crypto.ts` (client-safe):
```bash
cat > src/lib/crypto.ts << 'EOF'
// Client-safe crypto utilities (works in browser)

export function truncateAddress(address: string, chars: number = 4): string {
  if (!address || address.length < chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}
EOF
```

**Action 2:** Create `src/lib/crypto.server.ts` (server-only):
```bash
cat > src/lib/crypto.server.ts << 'EOF'
// Server-only crypto utilities (uses Node.js crypto)
// ONLY import this in API routes, never in client components

import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

export function generateSalt(): string {
  return randomBytes(32).toString('hex');
}

export function generateId(length: number = 12): string {
  return randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

export function hashData(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

export function createCommitment(holder: string, claimsHash: string, salt: string): string {
  return hashData(`${holder}:${claimsHash}:${salt}`);
}

export function createClaimsHash(claims: any[], salt: string): string {
  return hashData(JSON.stringify(claims) + salt);
}

export function encrypt(text: string, secretKey: string): string {
  const iv = randomBytes(16);
  const key = Buffer.from(secretKey, 'hex');
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedData: string, secretKey: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = Buffer.from(secretKey, 'hex');
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
EOF
```

**Action 3:** Create `src/lib/solana.ts`:
```bash
cat > src/lib/solana.ts << 'EOF'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('devnet');

export const connection = new Connection(RPC_URL, 'confirmed');

export function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function getExplorerUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${NETWORK}`;
}
EOF
```

**Action 4:** Create `src/lib/kv.ts`:
```bash
cat > src/lib/kv.ts << 'EOF'
import type { Attestation, Disclosure } from '@/types';

// Dynamic import based on environment
const getKv = async () => {
  if (process.env.KV_REST_API_URL) {
    const { kv } = await import('@vercel/kv');
    return kv;
  } else {
    const { kvLocal, warnLocalKv } = await import('./kv-local');
    warnLocalKv();
    return kvLocal;
  }
};

// Attestation storage
export async function storeAttestation(attestation: Attestation): Promise<void> {
  const kv = await getKv();
  const ttl = Math.floor((attestation.expiresAt - Date.now()) / 1000);
  await kv.set(`attestation:${attestation.id}`, attestation, { ex: ttl > 0 ? ttl : 3600 });
  
  const holderKey = `holder:${attestation.holder}:attestations`;
  const existing = await kv.get<string[]>(holderKey) || [];
  if (!existing.includes(attestation.id)) {
    await kv.set(holderKey, [...existing, attestation.id]);
  }
}

export async function getAttestation(id: string): Promise<Attestation | null> {
  const kv = await getKv();
  return kv.get<Attestation>(`attestation:${id}`);
}

export async function getAttestationsByHolder(holder: string): Promise<Attestation[]> {
  const kv = await getKv();
  const ids = await kv.get<string[]>(`holder:${holder}:attestations`) || [];
  const attestations = await Promise.all(ids.map(id => getAttestation(id)));
  return attestations.filter((a): a is Attestation => a !== null);
}

// Disclosure storage
export async function storeDisclosure(disclosure: Disclosure): Promise<void> {
  const kv = await getKv();
  const ttl = Math.floor((disclosure.expiresAt - Date.now()) / 1000);
  await kv.set(`disclosure:${disclosure.id}`, disclosure, { ex: ttl > 0 ? ttl : 3600 });
}

export async function getDisclosure(id: string): Promise<Disclosure | null> {
  const kv = await getKv();
  return kv.get<Disclosure>(`disclosure:${id}`);
}

export async function incrementDisclosureAccess(id: string): Promise<number> {
  const kv = await getKv();
  const disclosure = await getDisclosure(id);
  if (!disclosure) return -1;
  
  disclosure.accessCount += 1;
  const ttl = Math.floor((disclosure.expiresAt - Date.now()) / 1000);
  await kv.set(`disclosure:${disclosure.id}`, disclosure, { ex: ttl > 0 ? ttl : 3600 });
  
  return disclosure.accessCount;
}
EOF
```

**Action 5:** Create `src/lib/validation.ts`:
```bash
cat > src/lib/validation.ts << 'EOF'
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
EOF
```

**Verification:**
```bash
npx tsc --noEmit src/lib/*.ts 2>/dev/null && echo "✓ All libs valid"
```

---

## T015: Create Attestation Logic [AI]
**Dependencies:** T014  
**Time:** 2 minutes

**Action:** Create `src/lib/attestation.ts`:
```bash
cat > src/lib/attestation.ts << 'EOF'
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
EOF
```

**Verification:**
```bash
npx tsc --noEmit src/lib/attestation.ts 2>/dev/null && echo "✓ Attestation lib valid"
```

---

## T016: Create Disclosure Logic [AI]
**Dependencies:** T015  
**Time:** 2 minutes

**Action:** Create `src/lib/disclosure.ts`:
```bash
cat > src/lib/disclosure.ts << 'EOF'
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
EOF
```

**Verification:**
```bash
npx tsc --noEmit src/lib/disclosure.ts 2>/dev/null && echo "✓ Disclosure lib valid"
```

---

**[CONTINUED IN PART 2 - FRONTEND & API ROUTES]**

# PHASE 3: CORE FRONTEND SETUP

## T017: Configure Tailwind for Dark Mode [AI]
**Dependencies:** T006  
**Time:** 2 minutes

**Action:** Update `tailwind.config.ts`:
```bash
cat > tailwind.config.ts << 'EOF'
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1E3A8A",
          foreground: "#FAFAFA",
        },
        accent: {
          DEFAULT: "#10B981",
          foreground: "#FAFAFA",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
EOF
```

**Verification:**
```bash
grep -q "tailwindcss-animate" tailwind.config.ts && echo "✓ Tailwind configured"
```

---

## T018: Configure Global Styles [AI]
**Dependencies:** T017  
**Time:** 2 minutes

**Action:** Update `src/app/globals.css`:
```bash
cat > src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 4%;
    --foreground: 0 0% 98%;
    --card: 0 0% 9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 9%;
    --popover-foreground: 0 0% 98%;
    --primary: 224 76% 33%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 15%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 15%;
    --muted-foreground: 0 0% 64%;
    --accent: 160 84% 39%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 15%;
    --input: 0 0% 15%;
    --ring: 224 76% 33%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
EOF
```

---

## T019: Create Wallet Provider [AI]
**Dependencies:** T003  
**Time:** 2 minutes

**Action:** Create `src/components/wallet/WalletProvider.tsx`:
```bash
cat > src/components/wallet/WalletProvider.tsx << 'EOF'
"use client";

import { FC, ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

interface Props {
  children: ReactNode;
}

export const WalletProvider: FC<Props> = ({ children }) => {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
  
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};
EOF
```

---

## T020: Create Wallet Button [AI]
**Dependencies:** T019  
**Time:** 2 minutes

**Action:** Create `src/components/wallet/WalletButton.tsx`:
```bash
cat > src/components/wallet/WalletButton.tsx << 'EOF'
"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { truncateAddress } from "@/lib/crypto";

export function WalletButton() {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">
          {truncateAddress(publicKey.toBase58())}
        </span>
        <Button variant="outline" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => setVisible(true)} className="bg-primary hover:bg-primary/90">
      Connect Wallet
    </Button>
  );
}
EOF
```

---

## T021: Create Layout Components [AI]
**Dependencies:** T020  
**Time:** 3 minutes

**Action 1:** Create `src/components/layout/Header.tsx`:
```bash
cat > src/components/layout/Header.tsx << 'EOF'
import Link from "next/link";
import { WalletButton } from "@/components/wallet/WalletButton";

export function Header() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">V</span>
          </div>
          <span className="font-semibold text-lg">VeilPass</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/mint" className="text-zinc-400 hover:text-white transition">Mint</Link>
          <Link href="/attest" className="text-zinc-400 hover:text-white transition">Attest</Link>
          <Link href="/disclose" className="text-zinc-400 hover:text-white transition">Disclose</Link>
          <Link href="/dashboard" className="text-zinc-400 hover:text-white transition">Dashboard</Link>
        </nav>
        
        <WalletButton />
      </div>
    </header>
  );
}
EOF
```

**Action 2:** Create `src/components/layout/Container.tsx`:
```bash
cat > src/components/layout/Container.tsx << 'EOF'
import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      {children}
    </div>
  );
}
EOF
```

**Action 3:** Create `src/components/layout/Footer.tsx`:
```bash
cat > src/components/layout/Footer.tsx << 'EOF'
export function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
        <p>Built for Solana Privacy Hack 2026</p>
        <p className="mt-1">Privacy that passes compliance</p>
      </div>
    </footer>
  );
}
EOF
```

---

## T022: Update Root Layout [AI]
**Dependencies:** T021  
**Time:** 2 minutes

**Action:** Update `src/app/layout.tsx`:
```bash
cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VeilPass - Privacy that passes compliance",
  description: "Tokenize real-world assets with privacy. Prove compliance without exposing everything.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-background`}>
        <WalletProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
EOF
```

---

## T023: Create Landing Page [AI]
**Dependencies:** T022  
**Time:** 3 minutes

**Action:** Update `src/app/page.tsx`:
```bash
cat > src/app/page.tsx << 'EOF'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Privacy that passes <span className="text-primary">compliance</span>
        </h1>
        <p className="text-xl text-zinc-400 mb-8">
          Tokenize real-world assets with privacy. Prove compliance without exposing everything.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/mint">
            <Button size="lg" className="bg-primary hover:bg-primary/90">Mint Token</Button>
          </Link>
          <Link href="/attest">
            <Button size="lg" variant="outline">Generate Attestation</Button>
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { icon: "🪙", title: "Mint", desc: "Create private RWA tokens with encrypted compliance metadata" },
          { icon: "✓", title: "Attest", desc: "Generate cryptographic proofs of compliance (KYC, AML)" },
          { icon: "🔓", title: "Disclose", desc: "Selectively share specific data with auditors" },
          { icon: "🔍", title: "Verify", desc: "Auditors can verify proofs cryptographically" },
        ].map((item) => (
          <Card key={item.title} className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{item.icon}</span>
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{item.desc}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="space-y-4 text-left">
          {[
            { step: 1, title: "Mint Private Tokens", desc: "Create RWA tokens with encrypted compliance requirements" },
            { step: 2, title: "Generate Attestations", desc: "Prove you meet compliance requirements without revealing details" },
            { step: 3, title: "Selective Disclosure", desc: "Share only what's needed with auditors via secure links" },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                {item.step}
              </span>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-zinc-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
EOF
```

---

## T024: Create Attestation Components [AI]
**Dependencies:** T023  
**Time:** 5 minutes

**Action 1:** Create `src/components/attestation/ClaimSelector.tsx`:
```bash
cat > src/components/attestation/ClaimSelector.tsx << 'EOF'
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ClaimType } from "@/types";

interface ClaimSelectorProps {
  selectedClaims: ClaimType[];
  onChange: (claims: ClaimType[]) => void;
}

const CLAIM_OPTIONS: { type: ClaimType; label: string; description: string }[] = [
  { type: "KYC_VERIFIED", label: "KYC Verified", description: "Identity verification completed" },
  { type: "AML_PASSED", label: "AML Check Passed", description: "Anti-money laundering screening clear" },
  { type: "ACCREDITED_INVESTOR", label: "Accredited Investor", description: "Meets accredited investor requirements" },
  { type: "JURISDICTION_COMPLIANT", label: "Jurisdiction Compliant", description: "Allowed jurisdiction for investment" },
  { type: "SOURCE_OF_FUNDS_VERIFIED", label: "Source of Funds Verified", description: "Source of funds documentation verified" }
];

export function ClaimSelector({ selectedClaims, onChange }: ClaimSelectorProps) {
  const toggleClaim = (claimType: ClaimType) => {
    if (selectedClaims.includes(claimType)) {
      onChange(selectedClaims.filter(c => c !== claimType));
    } else {
      onChange([...selectedClaims, claimType]);
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base">Select claims to attest</Label>
      <div className="space-y-3">
        {CLAIM_OPTIONS.map((option) => (
          <div
            key={option.type}
            className="flex items-start space-x-3 p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 transition cursor-pointer"
            onClick={() => toggleClaim(option.type)}
          >
            <Checkbox
              id={option.type}
              checked={selectedClaims.includes(option.type)}
              onCheckedChange={() => toggleClaim(option.type)}
            />
            <div className="space-y-1">
              <Label htmlFor={option.type} className="cursor-pointer">{option.label}</Label>
              <p className="text-sm text-zinc-500">{option.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
EOF
```

**Action 2:** Create `src/components/attestation/AttestationForm.tsx`:
```bash
cat > src/components/attestation/AttestationForm.tsx << 'EOF'
"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClaimSelector } from "./ClaimSelector";
import { uint8ArrayToBase64 } from "@/lib/crypto";
import type { ClaimType, Attestation, AttestationSecret } from "@/types";

interface AttestationFormProps {
  onSuccess: (attestation: Attestation, secret: AttestationSecret) => void;
}

export function AttestationForm({ onSuccess }: AttestationFormProps) {
  const { publicKey, signMessage, connected } = useWallet();
  const [selectedClaims, setSelectedClaims] = useState<ClaimType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!publicKey || !signMessage) {
      setError("Please connect your wallet first");
      return;
    }
    if (selectedClaims.length === 0) {
      setError("Please select at least one claim");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const message = new TextEncoder().encode(
        `VeilPass Attestation Request\nClaims: ${selectedClaims.join(", ")}\nTimestamp: ${Date.now()}`
      );
      const signature = await signMessage(message);
      const signatureBase64 = uint8ArrayToBase64(signature);

      const response = await fetch("/api/attestations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holder: publicKey.toBase58(),
          claims: selectedClaims,
          signature: signatureBase64
        })
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to generate attestation");
      onSuccess(result.data.attestation, result.data.secret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle>Generate Compliance Attestation</CardTitle>
        <CardDescription>Create a cryptographic proof of your compliance status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!connected ? (
          <p className="text-zinc-400">Connect your wallet to generate an attestation</p>
        ) : (
          <>
            <ClaimSelector selectedClaims={selectedClaims} onChange={setSelectedClaims} />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              onClick={handleSubmit}
              disabled={isLoading || selectedClaims.length === 0}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Generating..." : "Generate Attestation"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
EOF
```

---

## T025: Create Attestation Page [AI]
**Dependencies:** T024  
**Time:** 3 minutes

**Action:** Create `src/app/attest/page.tsx`:
```bash
cat > src/app/attest/page.tsx << 'EOF'
"use client";

import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { AttestationForm } from "@/components/attestation/AttestationForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Attestation, AttestationSecret } from "@/types";

export default function AttestPage() {
  const [result, setResult] = useState<{ attestation: Attestation; secret: AttestationSecret } | null>(null);

  const downloadSecret = () => {
    if (!result) return;
    const data = JSON.stringify(result.secret, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `veilpass-secret-${result.attestation.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Generate Attestation</h1>
      <p className="text-zinc-400 mb-8">
        Create a cryptographic proof of your compliance status without revealing your personal information.
      </p>

      {!result ? (
        <AttestationForm onSuccess={(a, s) => setResult({ attestation: a, secret: s })} />
      ) : (
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-accent">✓</span> Attestation Generated
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-zinc-500">Attestation ID</p>
                <p className="font-mono text-sm">{result.attestation.id}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Claims Attested</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {result.attestation.claims.map(claim => (
                    <span key={claim} className="px-2 py-1 bg-accent/20 text-accent rounded text-sm">
                      {claim.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/10 border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-amber-500">⚠️ Important: Save Your Secret</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-300">
                Download and securely store your secret file. You'll need it to create disclosures.
                <strong> This cannot be recovered if lost.</strong>
              </p>
              <Button onClick={downloadSecret} variant="outline" className="w-full">
                Download Secret File
              </Button>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={() => setResult(null)} variant="outline" className="flex-1">Create Another</Button>
            <Button onClick={() => window.location.href = "/disclose"} className="flex-1 bg-primary hover:bg-primary/90">
              Create Disclosure
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
}
EOF
```

---

# PHASE 4: API ROUTES

## T026: Create Attestation Generate API [AI]
**Dependencies:** T015  
**Time:** 2 minutes

**Action:** Create `src/app/api/attestations/generate/route.ts`:
```bash
cat > src/app/api/attestations/generate/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { generateAttestation } from "@/lib/attestation";
import { storeAttestation } from "@/lib/kv";
import { GenerateAttestationSchema } from "@/lib/validation";
import { isValidPublicKey } from "@/lib/solana";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const validated = GenerateAttestationSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { holder, claims, tokenAddress } = validated.data;

    if (!isValidPublicKey(holder)) {
      return NextResponse.json(
        { success: false, error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const { attestation, secret } = generateAttestation(holder, claims, tokenAddress);
    await storeAttestation(attestation);

    return NextResponse.json({ success: true, data: { attestation, secret } });
  } catch (error) {
    console.error("Attestation generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate attestation" },
      { status: 500 }
    );
  }
}
EOF
```

---

## T026.5: Create Attestation Verify API [AI]
**Dependencies:** T026  
**Time:** 2 minutes

**Action:** Create `src/app/api/attestations/verify/route.ts`:
```bash
cat > src/app/api/attestations/verify/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { verifyAttestation } from "@/lib/attestation";
import { getAttestation } from "@/lib/kv";
import type { AttestationClaim } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { attestationId, salt, claims } = await req.json() as {
      attestationId: string;
      salt: string;
      claims: AttestationClaim[];
    };

    if (!attestationId || !salt || !claims) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const attestation = await getAttestation(attestationId);
    if (!attestation) {
      return NextResponse.json({ success: false, error: "Attestation not found" }, { status: 404 });
    }

    const isValid = verifyAttestation(attestation, claims, salt);

    return NextResponse.json({
      success: true,
      data: {
        isValid,
        attestation: isValid ? {
          id: attestation.id,
          holder: attestation.holder,
          claims: attestation.claims,
          createdAt: attestation.createdAt,
          expiresAt: attestation.expiresAt
        } : undefined
      }
    });
  } catch (error) {
    console.error("Attestation verification error:", error);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
EOF
```

---

## T027: Create Disclosure Create API [AI]
**Dependencies:** T016  
**Time:** 2 minutes

**Action:** Create `src/app/api/disclosures/create/route.ts`:
```bash
cat > src/app/api/disclosures/create/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { createDisclosure, formatDisclosureUrl } from "@/lib/disclosure";
import { verifyAttestation } from "@/lib/attestation";
import { getAttestation, storeDisclosure } from "@/lib/kv";
import { CreateDisclosureSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const validated = CreateDisclosureSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0].message },
        { status: 400 }
      );
    }

    const { attestationId, salt, fullClaims, fieldsToDisclose, recipient, expiresInDays, maxAccesses } = validated.data;

    const attestation = await getAttestation(attestationId);
    if (!attestation) {
      return NextResponse.json({ success: false, error: "Attestation not found" }, { status: 404 });
    }

    const isValid = verifyAttestation(attestation, fullClaims, salt);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid attestation or secret" }, { status: 400 });
    }

    const disclosure = createDisclosure(attestation, fullClaims, fieldsToDisclose, recipient, expiresInDays, maxAccesses);
    await storeDisclosure(disclosure);

    return NextResponse.json({
      success: true,
      data: {
        disclosureId: disclosure.id,
        verifyUrl: formatDisclosureUrl(disclosure.id),
        expiresAt: disclosure.expiresAt
      }
    });
  } catch (error) {
    console.error("Disclosure creation error:", error);
    return NextResponse.json({ success: false, error: "Failed to create disclosure" }, { status: 500 });
  }
}
EOF
```

---

## T028: Create Disclosure Get API [AI]
**Dependencies:** T027  
**Time:** 2 minutes

**Action:** Create `src/app/api/disclosures/[id]/route.ts`:
```bash
cat > 'src/app/api/disclosures/[id]/route.ts' << 'EOF'
import { NextRequest, NextResponse } from "next/server";
import { getDisclosure, incrementDisclosureAccess } from "@/lib/kv";
import { verifyDisclosure } from "@/lib/disclosure";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const disclosure = await getDisclosure(id);
    const result = verifyDisclosure(disclosure);
    
    if (!result.isValid) {
      return NextResponse.json(
        { success: false, error: result.error?.message || "Invalid disclosure" },
        { status: result.error?.code === "NOT_FOUND" ? 404 : 400 }
      );
    }

    await incrementDisclosureAccess(id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Disclosure fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch disclosure" }, { status: 500 });
  }
}
EOF
```

---

## T029: Create Disclosure Components [AI]
**Dependencies:** T028  
**Time:** 5 minutes

**Action 1:** Create `src/components/disclosure/FieldSelector.tsx`:
```bash
cat > src/components/disclosure/FieldSelector.tsx << 'EOF'
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ClaimType } from "@/types";

interface FieldSelectorProps {
  availableFields: ClaimType[];
  selectedFields: ClaimType[];
  onChange: (fields: ClaimType[]) => void;
}

const FIELD_LABELS: Record<ClaimType, string> = {
  KYC_VERIFIED: "KYC Status",
  AML_PASSED: "AML Status",
  ACCREDITED_INVESTOR: "Accreditation Status",
  JURISDICTION_COMPLIANT: "Jurisdiction",
  SOURCE_OF_FUNDS_VERIFIED: "Source of Funds"
};

export function FieldSelector({ availableFields, selectedFields, onChange }: FieldSelectorProps) {
  const toggleField = (field: ClaimType) => {
    if (selectedFields.includes(field)) {
      onChange(selectedFields.filter(f => f !== field));
    } else {
      onChange([...selectedFields, field]);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-base">Select fields to disclose</Label>
      <p className="text-sm text-zinc-500">Only selected fields will be visible to the recipient</p>
      <div className="space-y-2">
        {availableFields.map((field) => (
          <div
            key={field}
            className="flex items-center space-x-3 p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 transition cursor-pointer"
            onClick={() => toggleField(field)}
          >
            <Checkbox id={field} checked={selectedFields.includes(field)} onCheckedChange={() => toggleField(field)} />
            <Label htmlFor={field} className="cursor-pointer flex-1">{FIELD_LABELS[field]}</Label>
            {selectedFields.includes(field) && <span className="text-xs text-accent">Will be disclosed</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
EOF
```

**Action 2:** Create `src/components/disclosure/DisclosureForm.tsx`:
```bash
cat > src/components/disclosure/DisclosureForm.tsx << 'EOF'
"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldSelector } from "./FieldSelector";
import { uint8ArrayToBase64 } from "@/lib/crypto";
import type { ClaimType, AttestationSecret } from "@/types";

interface DisclosureFormProps {
  onSuccess: (disclosureId: string, verifyUrl: string) => void;
}

export function DisclosureForm({ onSuccess }: DisclosureFormProps) {
  const { publicKey, signMessage, connected } = useWallet();
  const [secret, setSecret] = useState<AttestationSecret | null>(null);
  const [selectedFields, setSelectedFields] = useState<ClaimType[]>([]);
  const [recipient, setRecipient] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [maxAccesses, setMaxAccesses] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setSecret(data);
        setError(null);
      } catch {
        setError("Invalid secret file format");
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!publicKey || !signMessage || !secret) {
      setError("Please connect wallet and upload secret file");
      return;
    }
    if (selectedFields.length === 0) {
      setError("Please select at least one field to disclose");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const message = new TextEncoder().encode(
        `VeilPass Disclosure\nAttestation: ${secret.attestationId}\nTimestamp: ${Date.now()}`
      );
      const signature = await signMessage(message);
      const signatureBase64 = uint8ArrayToBase64(signature);

      const response = await fetch("/api/disclosures/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attestationId: secret.attestationId,
          salt: secret.salt,
          fullClaims: secret.fullClaims,
          fieldsToDisclose: selectedFields,
          recipient: recipient || undefined,
          expiresInDays,
          maxAccesses,
          signature: signatureBase64
        })
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to create disclosure");
      onSuccess(result.data.disclosureId, result.data.verifyUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle>Create Selective Disclosure</CardTitle>
        <CardDescription>Share specific compliance data with an auditor or verifier</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!connected ? (
          <p className="text-zinc-400">Connect your wallet to create a disclosure</p>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Upload Secret File</Label>
              <Input type="file" accept=".json" onChange={handleFileUpload} className="bg-zinc-800 border-zinc-700" />
              {secret && <p className="text-sm text-accent">✓ Secret loaded for attestation {secret.attestationId.slice(0, 8)}...</p>}
            </div>

            {secret && (
              <FieldSelector
                availableFields={secret.fullClaims.map(c => c.type)}
                selectedFields={selectedFields}
                onChange={setSelectedFields}
              />
            )}

            <div className="space-y-2">
              <Label>Recipient Address (Optional)</Label>
              <Input placeholder="Auditor's wallet address" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="bg-zinc-800 border-zinc-700" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expires In (Days)</Label>
                <Input type="number" min={1} max={30} value={expiresInDays} onChange={(e) => setExpiresInDays(parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div className="space-y-2">
                <Label>Max Accesses</Label>
                <Input type="number" min={1} max={100} value={maxAccesses} onChange={(e) => setMaxAccesses(parseInt(e.target.value))} className="bg-zinc-800 border-zinc-700" />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button onClick={handleSubmit} disabled={isLoading || !secret || selectedFields.length === 0} className="w-full bg-primary hover:bg-primary/90">
              {isLoading ? "Creating..." : "Create Disclosure Link"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
EOF
```

---

## T030: Create Disclosure Page [AI]
**Dependencies:** T029  
**Time:** 2 minutes

**Action:** Create `src/app/disclose/page.tsx`:
```bash
cat > src/app/disclose/page.tsx << 'EOF'
"use client";

import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { DisclosureForm } from "@/components/disclosure/DisclosureForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DisclosePage() {
  const [result, setResult] = useState<{ disclosureId: string; verifyUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Container className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Selective Disclosure</h1>
      <p className="text-zinc-400 mb-8">Share specific compliance data with auditors. You control exactly what information is revealed.</p>

      {!result ? (
        <DisclosureForm onSuccess={(id, url) => setResult({ disclosureId: id, verifyUrl: url })} />
      ) : (
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><span className="text-accent">✓</span> Disclosure Created</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-zinc-400">Share this link with the auditor. They will only see the fields you selected.</p>
              <div className="flex gap-2">
                <Input value={result.verifyUrl} readOnly className="bg-zinc-800 border-zinc-700 font-mono text-sm" />
                <Button onClick={copyToClipboard} variant="outline">{copied ? "Copied!" : "Copy"}</Button>
              </div>
            </CardContent>
          </Card>
          <Button onClick={() => setResult(null)} variant="outline" className="w-full">Create Another Disclosure</Button>
        </div>
      )}
    </Container>
  );
}
EOF
```

---

## T031: Create Verify Page [AI]
**Dependencies:** T028  
**Time:** 3 minutes

**Action:** Create `src/app/verify/[id]/page.tsx`:
```bash
cat > 'src/app/verify/[id]/page.tsx' << 'EOF'
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VerificationResult } from "@/types";

export default function VerifyPage() {
  const params = useParams();
  const id = params.id as string;
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDisclosure = async () => {
      try {
        const response = await fetch(`/api/disclosures/${id}`);
        const data = await response.json();
        if (!data.success) setError(data.error);
        else setResult(data.data);
      } catch {
        setError("Failed to fetch disclosure");
      } finally {
        setLoading(false);
      }
    };
    fetchDisclosure();
  }, [id]);

  if (loading) {
    return (
      <Container className="max-w-2xl">
        <div className="flex items-center justify-center py-16">
          <div className="animate-pulse text-zinc-400">Loading verification...</div>
        </div>
      </Container>
    );
  }

  if (error || !result?.isValid) {
    return (
      <Container className="max-w-2xl">
        <Card className="bg-red-500/10 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2"><span>✗</span> Verification Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-300">{error || result?.error?.message || "This disclosure could not be verified"}</p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="max-w-2xl">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><span className="text-accent text-2xl">✓</span> Verified Disclosure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 text-accent rounded-full text-sm">
            <span className="w-2 h-2 bg-accent rounded-full"></span>
            Cryptographically Verified
          </div>

          <div>
            <h3 className="font-semibold mb-3">Disclosed Information</h3>
            <div className="space-y-3">
              {Object.entries(result.disclosedData || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="p-3 bg-zinc-800 rounded-lg">
                  <p className="text-sm text-zinc-500">{key.replace(/_/g, " ")}</p>
                  <p className="font-medium">{value.value === true ? "✓ Verified" : String(value.value)}</p>
                  <p className="text-xs text-zinc-500 mt-1">Verified by {value.provider} on {new Date(value.issuedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
            <div>
              <p className="text-sm text-zinc-500">Access Count</p>
              <p>View #{result.accessNumber}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Expires</p>
              <p>{result.expiresAt ? new Date(result.expiresAt).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 text-center text-sm text-zinc-500">
            Verified by VeilPass • Privacy that passes compliance
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
EOF
```

---

## T032: Create Mint Page [AI]
**Dependencies:** T023  
**Time:** 2 minutes

**Action:** Create `src/app/mint/page.tsx`:
```bash
cat > src/app/mint/page.tsx << 'EOF'
"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MintPage() {
  const { connected } = useWallet();
  const [formData, setFormData] = useState({ name: "", symbol: "", totalSupply: 1000, description: "" });
  const [result, setResult] = useState<{ address: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate token creation for demo
    await new Promise(resolve => setTimeout(resolve, 2000));
    const fakeAddress = "RWA" + Array.from({ length: 40 }, () => 
      "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[Math.floor(Math.random() * 58)]
    ).join("");
    setResult({ address: fakeAddress });
    setIsLoading(false);
  };

  return (
    <Container className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Mint RWA Token</h1>
      <p className="text-zinc-400 mb-8">Create a new real-world asset token with encrypted compliance metadata.</p>

      {!connected ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-8 text-center">
            <p className="text-zinc-400">Connect your wallet to mint tokens</p>
          </CardContent>
        </Card>
      ) : result ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><span className="text-accent">✓</span> Token Created (Demo)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-zinc-500">Token Address</p>
              <p className="font-mono text-sm break-all">{result.address}</p>
            </div>
            <Button onClick={() => setResult(null)} variant="outline" className="w-full">Create Another Token</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Token Details</CardTitle>
            <CardDescription>Configure your RWA token (Demo mode)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Token Name</Label>
                <Input placeholder="Manhattan Real Estate Fund" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-zinc-800 border-zinc-700" required />
              </div>
              <div className="space-y-2">
                <Label>Symbol</Label>
                <Input placeholder="MREF" maxLength={10} value={formData.symbol} onChange={e => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })} className="bg-zinc-800 border-zinc-700" required />
              </div>
              <div className="space-y-2">
                <Label>Total Supply</Label>
                <Input type="number" min={1} value={formData.totalSupply} onChange={e => setFormData({ ...formData, totalSupply: parseInt(e.target.value) })} className="bg-zinc-800 border-zinc-700" required />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
                {isLoading ? "Creating Token..." : "Create Token"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
EOF
```

---

## T033: Create Dashboard Page [AI]
**Dependencies:** T023  
**Time:** 2 minutes

**Action:** Create `src/app/dashboard/page.tsx`:
```bash
cat > src/app/dashboard/page.tsx << 'EOF'
"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();

  if (!connected) {
    return (
      <Container className="max-w-4xl">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-16 text-center">
            <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-zinc-400">Connect your wallet to view your attestations and disclosures</p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-zinc-400 mb-8">Manage your attestations and disclosures</p>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Link href="/mint"><Button variant="outline" className="w-full justify-start">🪙 Mint New Token</Button></Link>
            <Link href="/attest"><Button variant="outline" className="w-full justify-start">✓ Generate Attestation</Button></Link>
            <Link href="/disclose"><Button variant="outline" className="w-full justify-start">🔓 Create Disclosure</Button></Link>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle>Wallet</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">Connected Address</p>
            <p className="font-mono text-sm break-all">{publicKey?.toBase58()}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 md:col-span-2">
          <CardHeader>
            <CardTitle>How VeilPass Works</CardTitle>
            <CardDescription>Privacy that passes compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "1. Generate Attestation", desc: "Create cryptographic proof of your compliance status" },
                { title: "2. Save Your Secret", desc: "Download and securely store your secret file" },
                { title: "3. Selective Disclosure", desc: "Share only specific fields via secure, expiring links" },
              ].map((item) => (
                <div key={item.title} className="p-4 bg-zinc-800 rounded-lg">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
EOF
```

---

# PHASE 5: TESTING

## T034: Test Local Development [AI]
**Dependencies:** T033  
**Time:** 5 minutes

**Action:**
```bash
npm run dev &
sleep 10
curl -s http://localhost:3000 | grep -q "VeilPass" && echo "✓ App running"
```

**Manual Testing Checklist:**
- [ ] http://localhost:3000 shows landing page
- [ ] Navigation works
- [ ] Wallet connect button appears
- [ ] /attest page loads
- [ ] /disclose page loads
- [ ] /dashboard page loads

---

## T035: Test Full Flow [HUMAN]
**Dependencies:** T034  
**Time:** 15 minutes

**Instructions:**
1. Connect Phantom wallet
2. Go to /attest
3. Select KYC_VERIFIED and AML_PASSED
4. Click "Generate Attestation"
5. Download secret file
6. Go to /disclose
7. Upload secret file
8. Select only KYC_VERIFIED
9. Click "Create Disclosure Link"
10. Open the verification link in incognito
11. Verify only KYC appears

**Say "T035 complete" when done.**

---

# PHASE 6: DEPLOYMENT

## T036-T039: Deployment [HUMAN]

See original spec for Vercel deployment instructions.

---

# PHASE 7: SUBMISSION

## T040: Create README [AI]

**Action:** The README content from original spec remains valid.

## T041-T042: Video & Submit [HUMAN]

See original spec.

---

# VERIFICATION COMMANDS

Run these to validate the build:

```bash
# TypeScript check
npx tsc --noEmit

# Build check
npm run build

# If both pass, you're ready for deployment!
```

---

# END OF PATCHED SPECIFICATION

**Total Tasks:** 45 (including T003.5, T012.5, T026.5)  
**Changes from v1.0:** 15 patches applied  
**Status:** Ready for AI execution

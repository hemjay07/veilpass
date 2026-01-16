# VeilPass

> Privacy that passes compliance

VeilPass is a privacy-preserving compliance attestation platform for tokenizing real-world assets (RWA) on Solana. It enables users to prove compliance (KYC, AML, accredited investor status) without revealing their personal information through cryptographic attestations and selective disclosure.

## Features

- **Cryptographic Attestations**: Generate compliance attestations with cryptographic commitments
- **Selective Disclosure**: Choose exactly which compliance claims to share with auditors
- **Time-Limited Access**: Create disclosure links with expiration and access limits
- **Privacy-First**: Your personal data never leaves your device - only cryptographic proofs
- **Solana Integration**: Connect with Phantom wallet for secure signing

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Wallet**: Solana wallet-adapter (Phantom)
- **Backend**: Next.js API Routes (serverless)
- **Storage**: Vercel KV (production) / Local memory mock (development)
- **Blockchain**: @solana/web3.js, Helius RPC

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Phantom browser extension
- (Optional) Helius API key from [helius.dev](https://helius.dev)
- (Optional) Devnet SOL from [faucet.solana.com](https://faucet.solana.com)

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd veilpass

# Run the setup script
./init.sh
```

The `init.sh` script will:
1. Check your Node.js version
2. Install dependencies
3. Create `.env.local` with a generated encryption secret
4. Start the development server

### Manual Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Generate encryption secret
echo "ENCRYPTION_SECRET=$(openssl rand -hex 32)" >> .env.local

# Start development server
npm run dev
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ENCRYPTION_SECRET` | 64-char hex for server-side encryption | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL for disclosure links | Yes |
| `NEXT_PUBLIC_SOLANA_NETWORK` | Solana network (devnet/mainnet) | Yes |
| `NEXT_PUBLIC_HELIUS_API_KEY` | Helius API key for RPC | Optional |
| `KV_REST_API_URL` | Vercel KV REST API URL | Optional |
| `KV_REST_API_TOKEN` | Vercel KV REST API token | Optional |

## How It Works

### 1. Generate Attestation
Connect your wallet, select compliance claims (KYC, AML, etc.), and generate a cryptographic attestation. Download and securely save your secret file - it cannot be recovered!

### 2. Create Disclosure
Upload your secret file, select which claims to disclose, and create a time-limited link. Set expiration and access limits for additional security.

### 3. Verify Compliance
Share the disclosure link with auditors. They can verify your compliance cryptographically without seeing your personal data - only the claims you chose to disclose.

## Project Structure

```
veilpass/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── api/              # API routes
│   │   ├── attest/           # Attestation page
│   │   ├── disclose/         # Disclosure page
│   │   ├── dashboard/        # User dashboard
│   │   ├── mint/             # Token minting demo
│   │   └── verify/[id]/      # Verification page
│   ├── components/           # React components
│   │   ├── attestation/      # Attestation-related
│   │   ├── disclosure/       # Disclosure-related
│   │   ├── layout/           # Header, Footer, etc.
│   │   ├── ui/               # shadcn/ui components
│   │   └── wallet/           # Wallet connection
│   ├── lib/                  # Utility libraries
│   │   ├── crypto.ts         # Client-safe crypto utils
│   │   ├── crypto.server.ts  # Server-only crypto
│   │   ├── attestation.ts    # Attestation business logic
│   │   ├── disclosure.ts     # Disclosure business logic
│   │   ├── kv.ts             # Storage abstraction
│   │   └── validation.ts     # Zod schemas
│   └── types/                # TypeScript types
├── init.sh                   # Development setup script
├── app_spec.txt              # Full project specification
└── features.db               # Feature tracking database
```

## API Endpoints

### Attestations
- `POST /api/attestations/generate` - Generate new attestation
- `POST /api/attestations/verify` - Verify attestation with secret

### Disclosures
- `POST /api/disclosures/create` - Create disclosure link
- `GET /api/disclosures/[id]` - Verify and access disclosure

## Compliance Claims

| Claim | Description |
|-------|-------------|
| `KYC_VERIFIED` | Identity verification completed |
| `AML_PASSED` | Anti-money laundering check passed |
| `ACCREDITED_INVESTOR` | Accredited investor status verified |
| `JURISDICTION_COMPLIANT` | Jurisdiction compliance verified |
| `SOURCE_OF_FUNDS_VERIFIED` | Source of funds verification completed |

## Development

```bash
# Run development server
npm run dev

# Type check
npx tsc --noEmit

# Build for production
npm run build

# Start production server
npm start
```

## Hackathon

Built for **Solana Privacy Hack 2026** ($30,500 potential prizes)
- Open Track
- Privacy Cash bounty
- Range bounty
- Helius bounty

## License

MIT

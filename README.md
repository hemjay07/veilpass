# VeilPass

Privacy-preserving compliance attestations for tokenized real-world assets on Solana.

## What is VeilPass?

VeilPass enables users to prove compliance (KYC, AML, accredited investor status) without revealing personal information. Using cryptographic attestations and selective disclosure, auditors can verify compliance while your data stays private.

**Live Demo**: [veilpass.vercel.app](https://veilpass.vercel.app)

## How It Works

1. **Generate Attestation** - Connect your Solana wallet and create cryptographic attestations for your compliance claims
2. **Create Disclosure** - Choose which claims to share with time-limited, access-controlled links
3. **Verify Compliance** - Auditors verify cryptographically without seeing personal data

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Wallet**: Solana wallet-adapter (Phantom)
- **Storage**: Vercel KV
- **Blockchain**: Solana (via Helius RPC)

## Local Development

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Generate encryption secret
echo "ENCRYPTION_SECRET=$(openssl rand -hex 32)" >> .env.local

# Start dev server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ENCRYPTION_SECRET` | Server-side encryption key (64-char hex) |
| `NEXT_PUBLIC_APP_URL` | Application URL |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` or `mainnet-beta` |
| `KV_REST_API_URL` | Vercel KV URL |
| `KV_REST_API_TOKEN` | Vercel KV token |

## Compliance Claims

- KYC Verified
- AML Passed
- Accredited Investor
- Jurisdiction Compliant
- Source of Funds Verified

## License

MIT

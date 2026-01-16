#!/bin/bash

# VeilPass Development Environment Setup
# Privacy-preserving compliance attestation platform for RWA tokenization on Solana

set -e

echo "============================================"
echo "  VeilPass Development Environment Setup"
echo "  Privacy that passes compliance"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js 18+ is required (found v$NODE_VERSION)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"

# Install dependencies
echo ""
echo -e "${BLUE}Installing dependencies...${NC}"
npm install

# Check for .env.local
if [ ! -f .env.local ]; then
    echo ""
    echo -e "${YELLOW}Creating .env.local from template...${NC}"

    # Generate encryption secret
    ENCRYPTION_SECRET=$(openssl rand -hex 32)

    cat > .env.local << EOF
# VeilPass Environment Configuration

# Encryption secret for server-side crypto operations (64-char hex)
ENCRYPTION_SECRET=$ENCRYPTION_SECRET

# Application URL (used for disclosure links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Solana Network
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Helius RPC endpoint (get API key from helius.dev)
# NEXT_PUBLIC_HELIUS_API_KEY=your-helius-api-key
# NEXT_PUBLIC_RPC_URL=https://devnet.helius-rpc.com/?api-key=your-helius-api-key

# Vercel KV (optional - uses local mock if not set)
# KV_REST_API_URL=your-kv-rest-api-url
# KV_REST_API_TOKEN=your-kv-rest-api-token
EOF

    echo -e "${GREEN}✓ Created .env.local with generated ENCRYPTION_SECRET${NC}"
else
    echo -e "${GREEN}✓ .env.local already exists${NC}"
fi

# Verify encryption secret exists
if grep -q "^ENCRYPTION_SECRET=.\+" .env.local 2>/dev/null; then
    echo -e "${GREEN}✓ ENCRYPTION_SECRET is configured${NC}"
else
    echo -e "${YELLOW}⚠ Warning: ENCRYPTION_SECRET not set in .env.local${NC}"
    echo "  Generate one with: openssl rand -hex 32"
fi

# Start development server
echo ""
echo -e "${BLUE}Starting development server...${NC}"
echo ""
echo "============================================"
echo -e "  ${GREEN}VeilPass is starting!${NC}"
echo "============================================"
echo ""
echo -e "  ${BLUE}Local:${NC}        http://localhost:3000"
echo ""
echo -e "  ${YELLOW}Pages:${NC}"
echo "    - Landing:    http://localhost:3000/"
echo "    - Dashboard:  http://localhost:3000/dashboard"
echo "    - Mint Token: http://localhost:3000/mint"
echo "    - Attest:     http://localhost:3000/attest"
echo "    - Disclose:   http://localhost:3000/disclose"
echo ""
echo -e "  ${YELLOW}Prerequisites:${NC}"
echo "    - Phantom wallet extension installed"
echo "    - Devnet SOL (get from faucet.solana.com)"
echo "    - Optional: Helius API key for production RPC"
echo ""
echo "============================================"
echo ""

# Run the development server
npm run dev

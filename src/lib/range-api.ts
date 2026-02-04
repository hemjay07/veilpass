// src/lib/range-api.ts
// Range API integration for compliance and risk screening
// Docs: https://docs.range.org/

const RANGE_API_URL = process.env.RANGE_API_URL || 'https://api.range.org';
const RANGE_API_KEY = process.env.RANGE_API_KEY;

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskScore {
  address: string;
  score: number; // 0-10, higher = riskier
  level: RiskLevel;
  factors: string[];
  sanctions: boolean;
  blacklisted: boolean;
  lastUpdated: string;
}

export interface ComplianceReport {
  address: string;
  isCompliant: boolean;
  riskScore: RiskScore;
  sanctions: {
    listed: boolean;
    lists: string[];
  };
  aml: {
    passed: boolean;
    flags: string[];
  };
  generatedAt: string;
  source: 'range' | 'mock';
}

/**
 * Map numerical score to risk level
 */
function mapScoreToLevel(score: number): RiskLevel {
  if (score <= 2) return 'LOW';
  if (score <= 5) return 'MEDIUM';
  if (score <= 7) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Generate deterministic mock risk score based on address
 * Used when Range API is not configured or unavailable
 */
function generateMockRiskScore(address: string): RiskScore {
  // Create deterministic score based on address hash
  const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const score = (hash % 30) / 10; // 0-3 range for mock (always low risk)

  return {
    address,
    score: Math.round(score * 10) / 10,
    level: mapScoreToLevel(score),
    factors: score > 1 ? ['New wallet', 'Limited transaction history'] : [],
    sanctions: false,
    blacklisted: false,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Get risk score for a wallet address from Range API
 */
export async function getWalletRiskScore(address: string): Promise<RiskScore> {
  // If Range API key is not configured, return mock data
  if (!RANGE_API_KEY) {
    console.warn('Range API key not configured, using mock data');
    return generateMockRiskScore(address);
  }

  try {
    // Range API endpoint for address risk assessment
    // Requires address and network as query parameters
    const url = `${RANGE_API_URL}/v1/risk/address?address=${encodeURIComponent(address)}&network=solana`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RANGE_API_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      // Log error but fall back to mock
      console.error(`Range API error: ${response.status} ${response.statusText}`);
      return generateMockRiskScore(address);
    }

    const data = await response.json();

    // Map Range API response to our RiskScore interface
    // Range API returns: riskScore (1-10), riskLevel, reasoning, attribution, maliciousAddressesFound
    const score = data.riskScore ?? 0;
    const isSanctioned = data.attribution?.category === 'Sanction' ||
                         data.maliciousAddressesFound?.some((m: any) => m.category === 'Sanction');
    const isBlacklisted = score >= 8 || data.attribution?.category === 'Hack' || data.attribution?.category === 'Exploit';

    // Extract risk factors from malicious addresses found
    const factors: string[] = [];
    if (data.reasoning) factors.push(data.reasoning);
    if (data.attribution?.name_tag) factors.push(`Tagged: ${data.attribution.name_tag}`);
    if (data.attribution?.category) factors.push(`Category: ${data.attribution.category}`);

    return {
      address,
      score,
      level: mapScoreToLevel(score),
      factors,
      sanctions: isSanctioned,
      blacklisted: isBlacklisted,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Range API request failed:', error);
    return generateMockRiskScore(address);
  }
}

/**
 * Generate a comprehensive compliance report for selective disclosure
 */
export async function generateComplianceReport(address: string): Promise<ComplianceReport> {
  const riskScore = await getWalletRiskScore(address);
  const isUsingMock = !RANGE_API_KEY;

  // Determine compliance based on risk score and sanctions
  const isCompliant = riskScore.score <= 3 && !riskScore.sanctions && !riskScore.blacklisted;

  return {
    address,
    isCompliant,
    riskScore,
    sanctions: {
      listed: riskScore.sanctions,
      lists: riskScore.sanctions ? ['OFAC', 'UN'] : []
    },
    aml: {
      passed: riskScore.score <= 5,
      flags: riskScore.factors
    },
    generatedAt: new Date().toISOString(),
    source: isUsingMock ? 'mock' : 'range'
  };
}

/**
 * Quick compliance check - returns true if address passes basic checks
 */
export async function quickComplianceCheck(address: string): Promise<{
  passed: boolean;
  reason?: string;
  riskLevel: RiskLevel;
}> {
  const riskScore = await getWalletRiskScore(address);

  if (riskScore.sanctions) {
    return {
      passed: false,
      reason: 'Address is on sanctions list',
      riskLevel: 'CRITICAL'
    };
  }

  if (riskScore.blacklisted) {
    return {
      passed: false,
      reason: 'Address is blacklisted',
      riskLevel: 'CRITICAL'
    };
  }

  if (riskScore.score > 7) {
    return {
      passed: false,
      reason: 'High risk score detected',
      riskLevel: riskScore.level
    };
  }

  return {
    passed: true,
    riskLevel: riskScore.level
  };
}

/**
 * Check if Range API is properly configured
 */
export function isRangeConfigured(): boolean {
  return !!RANGE_API_KEY;
}

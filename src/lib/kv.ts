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

  // Index disclosure by discloser for analytics
  const discloserKey = `discloser:${disclosure.discloser}:disclosures`;
  const existing = await kv.get<string[]>(discloserKey) || [];
  if (!existing.includes(disclosure.id)) {
    await kv.set(discloserKey, [...existing, disclosure.id]);
  }
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

// Get disclosures by discloser address for analytics
export async function getDisclosuresByDiscloser(discloser: string): Promise<Disclosure[]> {
  const kv = await getKv();
  const ids = await kv.get<string[]>(`discloser:${discloser}:disclosures`) || [];
  const disclosures = await Promise.all(ids.map(id => getDisclosure(id)));
  return disclosures.filter((d): d is Disclosure => d !== null);
}

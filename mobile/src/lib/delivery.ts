// Same rules as the website (src/lib/delivery): a known local village has a
// fixed charge; otherwise the flat rate applies.
const FLAT_RATE = 30;

const VILLAGE_RATES: { names: string[]; charge: number }[] = [
  { names: ['new kamalapur', 'new kamlapur'], charge: 20 },
  { names: ['kamalapur', 'kamlapur'], charge: 20 },
  { names: ['golabandha', 'golabandh'], charge: 30 },
  { names: ['gopalpur'], charge: 40 },
  { names: ['hatipada', 'hatiapada'], charge: 30 },
  { names: ['boxipalli', 'boxipali', 'baksipalli'], charge: 40 },
  { names: ['korapalli', 'korapali'], charge: 40 },
];

export function deliveryChargeFor(address: string): number {
  const a = address.toLowerCase();
  for (const v of VILLAGE_RATES) if (v.names.some((n) => a.includes(n))) return v.charge;
  return FLAT_RATE;
}

export const ADVANCE_AMOUNT = 100;

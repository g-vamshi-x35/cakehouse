// Known local villages/localities within roughly 10km of the shop, each
// with its own fixed delivery charge — set directly by the owner rather
// than computed from geocoded distance, since the free geocoder has
// repeatedly mismatched or failed on these exact addresses this session.
// Matching a village here always wins over both the tiered rate card and
// the flat-rate fallback in pricing.ts.
//
// To add a village: add an entry below. `names` should include common
// spelling variants (the address is only matched by substring, case-
// insensitive) so small transliteration differences ("Kamalapur" vs
// "Kamlapur") still resolve to the right price.
type VillageRate = { names: string[]; charge: number };

const VILLAGE_RATES: VillageRate[] = [
  { names: ["new kamalapur", "new kamlapur"], charge: 20 },
  { names: ["kamalapur", "kamlapur"], charge: 20 },
  { names: ["golabandha", "golabandh"], charge: 30 },
  { names: ["gopalpur"], charge: 40 },
  { names: ["hatipada", "hatiapada"], charge: 30 },
  { names: ["boxipalli", "boxipali", "baksipalli"], charge: 40 },
  { names: ["korapalli", "korapali"], charge: 40 },
];

export function matchVillageCharge(address: string): { charge: number; matchedName: string } | null {
  const normalized = address.toLowerCase();
  for (const village of VILLAGE_RATES) {
    const hit = village.names.find((name) => normalized.includes(name));
    if (hit) return { charge: village.charge, matchedName: hit };
  }
  return null;
}

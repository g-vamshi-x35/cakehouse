// Distance-based delivery fee, per the owner's fixed rate card.
const TIERS: { maxKm: number; charge: number }[] = [
  { maxKm: 0.2, charge: 10 },
  { maxKm: 0.5, charge: 20 },
  { maxKm: 1, charge: 30 },
  { maxKm: 3, charge: 50 },
  { maxKm: 5, charge: 65 },
  { maxKm: 10, charge: 80 },
];

const BEYOND_10KM_BASE = 80;
const BEYOND_10KM_PER_KM = 10;

export function calculateDeliveryCharge(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) return BEYOND_10KM_BASE;

  const tier = TIERS.find((t) => distanceKm <= t.maxKm);
  if (tier) return tier.charge;

  const extraKm = Math.ceil(distanceKm - 10);
  return BEYOND_10KM_BASE + extraKm * BEYOND_10KM_PER_KM;
}

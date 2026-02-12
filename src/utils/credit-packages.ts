// Credit purchase packages
export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceUsd: number;
  popular?: boolean;
  bonus?: number; // extra credits for bulk purchases
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 800,
    priceUsd: 8.0,
    bonus: 0,
  },
  {
    id: 'value',
    name: 'Value Pack',
    credits: 2000,
    priceUsd: 18.0,
    bonus: 200, // 2200 total credits
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    credits: 4000,
    priceUsd: 32.0,
    bonus: 600, // 4600 total credits
  },
  {
    id: 'mega',
    name: 'Mega Pack',
    credits: 8000,
    priceUsd: 60.0,
    bonus: 1600, // 9600 total credits
  },
];

export function getCreditPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(pkg => pkg.id === id);
}

export function getTotalCredits(pkg: CreditPackage): number {
  return pkg.credits + (pkg.bonus || 0);
}

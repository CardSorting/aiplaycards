// Currency conversion utilities
// Conversion rate: 6 credits = $0.06 (1 credit = $0.01)
export const CREDITS_PER_USD = 100;
export const USD_PER_CREDIT = 0.01;

/**
 * Convert credits to USD
 */
export function creditsToUsd(credits: number): number {
  return Number((credits * USD_PER_CREDIT).toFixed(2));
}

/**
 * Convert USD to credits
 */
export function usdToCredits(usd: number): number {
  return Math.round(usd * CREDITS_PER_USD);
}

/**
 * Format USD amount for display
 */
export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Parse USD string to number
 */
export function parseUsd(usdString: string): number {
  return parseFloat(usdString.replace('$', ''));
}

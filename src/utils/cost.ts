/**
 * Mapbox API cost calculation utilities
 *
 * Note: Mapbox offers a free tier of 25k requests/month for Search Box API.
 * Check https://www.mapbox.com/pricing for current pricing details.
 * Standard pricing: $1.70 per 1000 requests (25k-100k tier)
 */

const COST_PER_1000_REQUESTS = 1.70 // USD

/**
 * Calculate estimated cost based on number of API requests
 * @param requests Number of API requests made
 * @returns Estimated cost in USD
 */
export function calculateCost(requests: number): number {
  return (requests / 1000) * COST_PER_1000_REQUESTS
}

/**
 * Format cost as currency string
 */
export function formatCost(cost: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(cost)
}

/**
 * Estimate total cost for a given number of tiles
 * @param tileCount Number of tiles to fetch
 * @param currentRequests Current total requests made
 */
export function estimateTotalCost(tileCount: number, currentRequests: number = 0): number {
  const totalRequests = currentRequests + tileCount
  return calculateCost(totalRequests)
}

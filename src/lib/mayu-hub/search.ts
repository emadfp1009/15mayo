/**
 * Search Ranking and Filtering
 * 
 * Implements search result ranking (exact match first, then partial)
 * and combined AND-logic filtering.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.5, 7.2
 */

import type { StoreProfile, SearchFilters } from './types'

/**
 * Ranks search results: exact name match first, then partial match.
 * Returns max 20 results.
 * 
 * @param stores - Array of stores to rank
 * @param query - Search query (minimum 2 characters)
 * @param _primaryNeighborhoodId - Primary neighborhood for proximity sorting
 * @returns Ranked array of stores, max 20
 */
export function rankSearchResults(
  stores: StoreProfile[],
  query: string,
  _primaryNeighborhoodId: string
): StoreProfile[] {
  if (query.length < 2) return []

  const normalizedQuery = query.trim().toLowerCase()

  // Filter stores that match the query
  const matching = stores.filter(store => 
    store.nameAr.toLowerCase().includes(normalizedQuery)
  )

  // Separate exact and partial matches
  const exactMatches: StoreProfile[] = []
  const partialMatches: StoreProfile[] = []

  for (const store of matching) {
    if (store.nameAr.toLowerCase() === normalizedQuery) {
      exactMatches.push(store)
    } else {
      partialMatches.push(store)
    }
  }

  // Combine: exact first, then partial
  const ranked = [...exactMatches, ...partialMatches]

  // Limit to 20 results
  return ranked.slice(0, 20)
}

/**
 * Filters stores using AND logic for all active filters.
 * 
 * @param stores - Array of stores to filter
 * @param filters - Active filters to apply
 * @returns Filtered array of stores
 */
export function filterStores(
  stores: StoreProfile[],
  filters: SearchFilters
): StoreProfile[] {
  return stores.filter(store => {
    // Text query filter
    if (filters.query && filters.query.length >= 2) {
      const normalizedQuery = filters.query.trim().toLowerCase()
      if (!store.nameAr.toLowerCase().includes(normalizedQuery)) {
        return false
      }
    }

    // Category filter
    if (filters.categoryId) {
      if (store.categoryId !== filters.categoryId) {
        return false
      }
    }

    // Neighborhood filter
    if (filters.neighborhoodId) {
      if (store.neighborhoodId !== filters.neighborhoodId) {
        return false
      }
    }

    // Circle filter (store must be in one of the circle neighborhoods)
    if (filters.circleNeighborhoodIds.length > 0) {
      if (!filters.circleNeighborhoodIds.includes(store.neighborhoodId)) {
        return false
      }
    }

    return true
  })
}

/**
 * Sorts stores with premium stores first (by premiumStartedAt ascending),
 * then non-premium stores alphabetically.
 * 
 * @param stores - Array of stores to sort
 * @param currentDate - Current date for checking premium expiration
 * @returns Sorted array
 */
export function sortWithPremiumFirst(
  stores: StoreProfile[],
  currentDate: Date
): StoreProfile[] {
  return [...stores].sort((a, b) => {
    const aIsPremium = a.isPremium && !isPremiumExpired(a.premiumExpiresAt, currentDate)
    const bIsPremium = b.isPremium && !isPremiumExpired(b.premiumExpiresAt, currentDate)

    if (aIsPremium && !bIsPremium) return -1
    if (!aIsPremium && bIsPremium) return 1

    // Both premium: sort by premiumStartedAt ascending (oldest first)
    if (aIsPremium && bIsPremium) {
      const aDate = a.premiumStartedAt ? new Date(a.premiumStartedAt).getTime() : 0
      const bDate = b.premiumStartedAt ? new Date(b.premiumStartedAt).getTime() : 0
      return aDate - bDate
    }

    // Both non-premium: sort alphabetically
    return a.nameAr.localeCompare(b.nameAr, 'ar')
  })
}

/**
 * Checks if a premium subscription has expired.
 */
export function isPremiumExpired(
  premiumExpiresAt: string | null,
  currentDate: Date
): boolean {
  if (!premiumExpiresAt) return false
  return new Date(premiumExpiresAt) < currentDate
}

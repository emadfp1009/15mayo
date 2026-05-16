/**
 * Premium Logic
 * 
 * Handles premium subscription constraints and offer limits.
 * 
 * Requirements: 7.2, 7.3, 7.5
 */

import type { StoreProfile } from './types'

/**
 * Checks if a store can add a new special offer.
 * Premium stores are limited to 5 active offers at a time.
 * 
 * @param activeOfferCount - Current number of active offers
 * @returns true if can add more, false if at limit
 */
export function canAddSpecialOffer(activeOfferCount: number): boolean {
  return activeOfferCount < 5
}

/**
 * Validates that an offer duration does not exceed 30 days.
 * 
 * @param startsAt - Offer start date
 * @param expiresAt - Offer expiration date
 * @returns true if duration is valid (≤ 30 days), false otherwise
 */
export function isOfferDurationValid(startsAt: Date, expiresAt: Date): boolean {
  if (expiresAt <= startsAt) return false
  const diffMs = expiresAt.getTime() - startsAt.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays <= 30
}

/**
 * Checks if a premium subscription has expired.
 * 
 * @param premiumExpiresAt - Expiration date string or null
 * @param currentDate - Current date
 * @returns true if expired, false if still active or no expiration set
 */
export function isPremiumExpired(
  premiumExpiresAt: string | null,
  currentDate: Date
): boolean {
  if (!premiumExpiresAt) return false
  return new Date(premiumExpiresAt) < currentDate
}

/**
 * Sorts stores with premium first (by premiumStartedAt ascending),
 * then non-premium alphabetically.
 * Expired premium stores are treated as non-premium.
 * 
 * @param stores - Array of stores
 * @param currentDate - Current date for expiration check
 * @returns Sorted array
 */
export function sortStoresByPremium(
  stores: StoreProfile[],
  currentDate: Date
): StoreProfile[] {
  return [...stores].sort((a, b) => {
    const aIsPremium = a.isPremium && !isPremiumExpired(a.premiumExpiresAt, currentDate)
    const bIsPremium = b.isPremium && !isPremiumExpired(b.premiumExpiresAt, currentDate)

    if (aIsPremium && !bIsPremium) return -1
    if (!aIsPremium && bIsPremium) return 1

    if (aIsPremium && bIsPremium) {
      const aDate = a.premiumStartedAt ? new Date(a.premiumStartedAt).getTime() : 0
      const bDate = b.premiumStartedAt ? new Date(b.premiumStartedAt).getTime() : 0
      return aDate - bDate
    }

    return a.nameAr.localeCompare(b.nameAr, 'ar')
  })
}

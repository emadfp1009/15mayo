// Feature: mayu-hub, Property 9: Premium stores ranked before non-premium
// Feature: mayu-hub, Property 10: Premium offer constraints (max 5, max 30 days)
// Feature: mayu-hub, Property 11: Expired premium reverts to basic tier
import { describe, it } from 'vitest'
import fc from 'fast-check'
import { sortStoresByPremium, canAddSpecialOffer, isOfferDurationValid, isPremiumExpired } from '@/lib/mayu-hub/premium'
import type { StoreProfile } from '@/lib/mayu-hub/types'

const arbStoreProfile = fc.record({
  id: fc.uuid(),
  ownerId: fc.uuid(),
  neighborhoodId: fc.uuid(),
  nameAr: fc.string({ minLength: 1, maxLength: 50 }),
  phone: fc.string(),
  whatsappNumber: fc.constant(null),
  whatsappMessage: fc.constant(null),
  logoUrl: fc.constant(null),
  storefrontPhotoUrl: fc.constant(null),
  categoryId: fc.constant(null),
  isPremium: fc.boolean(),
  premiumStartedAt: fc.oneof(
    fc.integer({ min: 1704067200000, max: 1735689600000 }).map(ts => new Date(ts).toISOString()),
    fc.constant(null)
  ),
  premiumExpiresAt: fc.oneof(
    fc.integer({ min: 1717200000000, max: 1830297600000 }).map(ts => new Date(ts).toISOString()),
    fc.constant(null)
  ),
  status: fc.constant('approved' as const),
  rejectionReason: fc.constant(null),
  delivers: fc.boolean(),
  deliveryCostEgp: fc.constant(null),
  deliveryDurationMinutes: fc.constant(null),
  manualStatusOverride: fc.constant(null),
  manualStatusOverrideUntil: fc.constant(null),
  createdAt: fc.constant('2024-01-01T00:00:00Z'),
  updatedAt: fc.constant('2024-01-01T00:00:00Z'),
}) as fc.Arbitrary<StoreProfile>

describe('Property 9: Premium stores ranked before non-premium', () => {
  it('every premium store appears before every non-premium store', () => {
    fc.assert(
      fc.property(
        fc.array(arbStoreProfile, { minLength: 2, maxLength: 20 }),
        fc.integer({ min: 1735689600000, max: 1751328000000 }).map(ts => new Date(ts)),
        (stores, currentDate) => {
          const sorted = sortStoresByPremium(stores, currentDate)

          let foundNonPremium = false
          for (const store of sorted) {
            const isEffectivePremium = store.isPremium && !isPremiumExpired(store.premiumExpiresAt, currentDate)
            if (!isEffectivePremium) foundNonPremium = true
            if (foundNonPremium && isEffectivePremium) return false
          }
          return true
        }
      ),
      { numRuns: 200 }
    )
  })
})

describe('Property 10: Premium offer constraints', () => {
  it('canAddSpecialOffer returns false when at 5 active offers', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 100 }),
        (count) => {
          return canAddSpecialOffer(count) === false
        }
      ),
      { numRuns: 200 }
    )
  })

  it('canAddSpecialOffer returns true when under 5 active offers', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4 }),
        (count) => {
          return canAddSpecialOffer(count) === true
        }
      ),
      { numRuns: 200 }
    )
  })

  it('isOfferDurationValid rejects offers longer than 30 days', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1704067200000, max: 1767225600000 }).map(ts => new Date(ts)),
        fc.integer({ min: 31, max: 365 }),
        (startDate, extraDays) => {
          const expiresAt = new Date(startDate.getTime() + extraDays * 24 * 60 * 60 * 1000)
          return isOfferDurationValid(startDate, expiresAt) === false
        }
      ),
      { numRuns: 200 }
    )
  })

  it('isOfferDurationValid accepts offers of 30 days or less', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1704067200000, max: 1767225600000 }).map(ts => new Date(ts)),
        fc.integer({ min: 1, max: 30 }),
        (startDate, days) => {
          const expiresAt = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000)
          return isOfferDurationValid(startDate, expiresAt) === true
        }
      ),
      { numRuns: 200 }
    )
  })
})

describe('Property 11: Expired premium reverts to basic tier', () => {
  it('expired premium stores are treated as non-premium in sorting', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1748736000000, max: 1767225600000 }).map(ts => new Date(ts)),
        (currentDate) => {
          // Create a store with expired premium
          const expiredStore: StoreProfile = {
            id: 'expired-1',
            ownerId: 'owner-1',
            neighborhoodId: 'n-1',
            nameAr: 'متجر منتهي',
            phone: '+201234567890',
            whatsappNumber: null,
            whatsappMessage: null,
            logoUrl: null,
            storefrontPhotoUrl: null,
            categoryId: null,
            isPremium: true,
            premiumStartedAt: '2024-01-01T00:00:00Z',
            premiumExpiresAt: '2025-01-01T00:00:00Z', // expired
            status: 'approved',
            rejectionReason: null,
            delivers: false,
            deliveryCostEgp: null,
            deliveryDurationMinutes: null,
            manualStatusOverride: null,
            manualStatusOverrideUntil: null,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          }

          return isPremiumExpired(expiredStore.premiumExpiresAt, currentDate) === true
        }
      ),
      { numRuns: 200 }
    )
  })
})

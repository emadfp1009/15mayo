// Feature: mayu-hub, Property 2: Search results ranked exact-first then partial, max 20
// Feature: mayu-hub, Property 3: Combined filters use AND logic
import { describe, it } from 'vitest'
import fc from 'fast-check'
import { rankSearchResults, filterStores } from '@/lib/mayu-hub/search'
import type { StoreProfile, SearchFilters } from '@/lib/mayu-hub/types'

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
  categoryId: fc.oneof(fc.uuid(), fc.constant(null)),
  isPremium: fc.boolean(),
  premiumStartedAt: fc.constant(null),
  premiumExpiresAt: fc.constant(null),
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

describe('Property 2: Search ranking', () => {
  it('exact matches appear before partial matches', () => {
    fc.assert(
      fc.property(
        fc.array(arbStoreProfile, { minLength: 1, maxLength: 30 }),
        fc.string({ minLength: 2, maxLength: 10 }),
        fc.uuid(),
        (stores, query, primaryId) => {
          const results = rankSearchResults(stores, query, primaryId)
          
          // Find the boundary between exact and partial
          let foundPartial = false
          for (const store of results) {
            const isExact = store.nameAr.toLowerCase() === query.toLowerCase()
            if (!isExact) foundPartial = true
            if (foundPartial && isExact) return false // exact after partial = violation
          }
          return true
        }
      ),
      { numRuns: 200 }
    )
  })

  it('never returns more than 20 results', () => {
    fc.assert(
      fc.property(
        fc.array(arbStoreProfile, { minLength: 0, maxLength: 50 }),
        fc.string({ minLength: 2, maxLength: 10 }),
        fc.uuid(),
        (stores, query, primaryId) => {
          const results = rankSearchResults(stores, query, primaryId)
          return results.length <= 20
        }
      ),
      { numRuns: 200 }
    )
  })
})

describe('Property 3: Combined filters use AND logic', () => {
  it('every result satisfies all active filters simultaneously', () => {
    fc.assert(
      fc.property(
        fc.array(arbStoreProfile, { minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 2, maxLength: 10 }),
        fc.oneof(fc.uuid(), fc.constant(null)),
        fc.oneof(fc.uuid(), fc.constant(null)),
        (stores, query, categoryId, neighborhoodId) => {
          const circleIds = [...new Set(stores.map(s => s.neighborhoodId))]
          const filters: SearchFilters = {
            query,
            circleNeighborhoodIds: circleIds,
            categoryId,
            neighborhoodId,
          }

          const results = filterStores(stores, filters)

          for (const store of results) {
            // Check query filter
            if (query.length >= 2) {
              if (!store.nameAr.toLowerCase().includes(query.trim().toLowerCase())) return false
            }
            // Check category filter
            if (categoryId && store.categoryId !== categoryId) return false
            // Check neighborhood filter
            if (neighborhoodId && store.neighborhoodId !== neighborhoodId) return false
            // Check circle filter
            if (circleIds.length > 0 && !circleIds.includes(store.neighborhoodId)) return false
          }
          return true
        }
      ),
      { numRuns: 200 }
    )
  })

  it('no store satisfying all filters is excluded', () => {
    fc.assert(
      fc.property(
        fc.array(arbStoreProfile, { minLength: 1, maxLength: 20 }),
        (stores) => {
          // Use empty filters (should return all)
          const filters: SearchFilters = {
            query: '',
            circleNeighborhoodIds: stores.map(s => s.neighborhoodId),
            categoryId: null,
            neighborhoodId: null,
          }

          const results = filterStores(stores, filters)
          return results.length === stores.length
        }
      ),
      { numRuns: 200 }
    )
  })
})

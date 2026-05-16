// Feature: mayu-hub, Property 7: Community service display omits empty fields
// Feature: mayu-hub, Property 8: Combined community service filtering uses AND logic
import { describe, it } from 'vitest'
import fc from 'fast-check'
import { filterCommunityServices, formatCommunityServiceDisplay } from '@/lib/mayu-hub/community-filter'
import type { CommunityService, CommunityServiceType } from '@/lib/mayu-hub/types'

const communityServiceTypes: CommunityServiceType[] = [
  'school', 'post_office', 'youth_center', 'mosque', 'church',
  'hospital', 'police_station', 'civil_registry', 'gas_office', 'electricity_office'
]

const arbCommunityService = fc.record({
  id: fc.uuid(),
  neighborhoodId: fc.uuid(),
  nameAr: fc.string({ minLength: 1, maxLength: 50 }),
  type: fc.constantFrom(...communityServiceTypes),
  schoolType: fc.oneof(
    fc.constantFrom('government' as const, 'experimental' as const, 'private' as const),
    fc.constant(null)
  ),
  address: fc.oneof(fc.string({ minLength: 1, maxLength: 100 }), fc.constant(null)),
  phone: fc.oneof(fc.string({ minLength: 1, maxLength: 15 }), fc.constant(null)),
}) as fc.Arbitrary<CommunityService>

describe('Property 7: Community service display omits empty fields', () => {
  it('always includes nameAr and neighborhoodId', () => {
    fc.assert(
      fc.property(
        arbCommunityService,
        (service) => {
          const display = formatCommunityServiceDisplay(service)
          return 'nameAr' in display && 'neighborhoodId' in display
        }
      ),
      { numRuns: 200 }
    )
  })

  it('omits address when null', () => {
    fc.assert(
      fc.property(
        arbCommunityService.map(s => ({ ...s, address: null })),
        (service) => {
          const display = formatCommunityServiceDisplay(service)
          return !('address' in display)
        }
      ),
      { numRuns: 200 }
    )
  })

  it('omits phone when null', () => {
    fc.assert(
      fc.property(
        arbCommunityService.map(s => ({ ...s, phone: null })),
        (service) => {
          const display = formatCommunityServiceDisplay(service)
          return !('phone' in display)
        }
      ),
      { numRuns: 200 }
    )
  })

  it('includes address when non-null and non-empty', () => {
    fc.assert(
      fc.property(
        arbCommunityService.map(s => ({ ...s, address: 'شارع 15 مايو' })),
        (service) => {
          const display = formatCommunityServiceDisplay(service)
          return 'address' in display
        }
      ),
      { numRuns: 200 }
    )
  })
})

describe('Property 8: Combined community service filtering uses AND logic', () => {
  it('every result matches all active filters', () => {
    fc.assert(
      fc.property(
        fc.array(arbCommunityService, { minLength: 1, maxLength: 20 }),
        fc.oneof(fc.uuid(), fc.constant(null)),
        fc.oneof(fc.constantFrom(...communityServiceTypes), fc.constant(null)),
        (services, neighborhoodId, typeFilter) => {
          const results = filterCommunityServices(services, neighborhoodId, typeFilter)

          for (const service of results) {
            if (neighborhoodId && service.neighborhoodId !== neighborhoodId) return false
            if (typeFilter && service.type !== typeFilter) return false
          }
          return true
        }
      ),
      { numRuns: 200 }
    )
  })

  it('no service matching all filters is excluded', () => {
    fc.assert(
      fc.property(
        fc.array(arbCommunityService, { minLength: 1, maxLength: 20 }),
        fc.oneof(fc.uuid(), fc.constant(null)),
        fc.oneof(fc.constantFrom(...communityServiceTypes), fc.constant(null)),
        (services, neighborhoodId, typeFilter) => {
          const results = filterCommunityServices(services, neighborhoodId, typeFilter)

          // Check that every service matching all filters is in results
          for (const service of services) {
            const matchesNeighborhood = !neighborhoodId || service.neighborhoodId === neighborhoodId
            const matchesType = !typeFilter || service.type === typeFilter

            if (matchesNeighborhood && matchesType) {
              if (!results.includes(service)) return false
            }
          }
          return true
        }
      ),
      { numRuns: 200 }
    )
  })
})

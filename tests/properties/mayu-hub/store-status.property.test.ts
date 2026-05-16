// Feature: mayu-hub, Property 6: Store status computation with manual override priority
import { describe, it } from 'vitest'
import fc from 'fast-check'
import { computeStoreStatus } from '@/lib/mayu-hub/store-status'
import type { WorkingHours, StoreStatusOverride } from '@/lib/mayu-hub/types'

describe('Property 6: Store status computation', () => {
  const arbWorkingHours = fc.array(
    fc.record({
      id: fc.uuid(),
      storeId: fc.uuid(),
      dayOfWeek: fc.integer({ min: 0, max: 6 }),
      openTime: fc.tuple(
        fc.integer({ min: 0, max: 23 }),
        fc.integer({ min: 0, max: 59 })
      ).map(([h, m]) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`),
      closeTime: fc.tuple(
        fc.integer({ min: 0, max: 23 }),
        fc.integer({ min: 0, max: 59 })
      ).map(([h, m]) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`),
      isClosed: fc.boolean(),
    }),
    { minLength: 0, maxLength: 7 }
  ) as fc.Arbitrary<WorkingHours[]>

  const arbDate = fc.integer({ min: 1704067200000, max: 1798761600000 }).map(ts => new Date(ts))

  it('manual override takes priority when not expired', () => {
    fc.assert(
      fc.property(
        arbWorkingHours,
        arbDate,
        fc.constantFrom('open' as const, 'closed' as const),
        (workingHours, currentTime, overrideStatus) => {
          // Override that expires in the future
          const futureDate = new Date(currentTime.getTime() + 3600000) // 1 hour later
          const override: StoreStatusOverride = {
            status: overrideStatus,
            until: futureDate,
          }

          const result = computeStoreStatus(workingHours, currentTime, override)
          return result === overrideStatus
        }
      ),
      { numRuns: 200 }
    )
  })

  it('expired override is ignored', () => {
    fc.assert(
      fc.property(
        arbWorkingHours,
        arbDate,
        fc.constantFrom('open' as const, 'closed' as const),
        (workingHours, currentTime, overrideStatus) => {
          // Override that expired in the past
          const pastDate = new Date(currentTime.getTime() - 3600000) // 1 hour ago
          const override: StoreStatusOverride = {
            status: overrideStatus,
            until: pastDate,
          }

          const result = computeStoreStatus(workingHours, currentTime, override)
          // Result should be based on working hours, not override
          const resultWithoutOverride = computeStoreStatus(workingHours, currentTime, null)
          return result === resultWithoutOverride
        }
      ),
      { numRuns: 200 }
    )
  })

  it('returns closed when no working hours configured', () => {
    fc.assert(
      fc.property(
        arbDate,
        (currentTime) => {
          const result = computeStoreStatus([], currentTime, null)
          return result === 'closed'
        }
      ),
      { numRuns: 200 }
    )
  })

  it('override with null until is always active', () => {
    fc.assert(
      fc.property(
        arbWorkingHours,
        arbDate,
        fc.constantFrom('open' as const, 'closed' as const),
        (workingHours, currentTime, overrideStatus) => {
          const override: StoreStatusOverride = {
            status: overrideStatus,
            until: null,
          }

          const result = computeStoreStatus(workingHours, currentTime, override)
          return result === overrideStatus
        }
      ),
      { numRuns: 200 }
    )
  })
})

// Feature: mayu-hub, Property 12: Active banner filtering by date with max limit
import { describe, it } from 'vitest'
import fc from 'fast-check'
import { getActiveBanners } from '@/lib/mayu-hub/banner-rotation'
import type { BannerAd } from '@/lib/mayu-hub/types'

describe('Property 12: Banner filtering', () => {
  // Use integer timestamps to avoid NaN date issues
  const arbDateStr = fc.integer({ min: 1704067200000, max: 1798761600000 }) // 2024-01-01 to 2026-12-31
    .map(ts => new Date(ts).toISOString().split('T')[0])

  const arbBannerAd = fc.record({
    id: fc.uuid(),
    imageUrl: fc.constant('https://example.com/banner.jpg'),
    targetType: fc.constantFrom('store' as const, 'external' as const),
    targetStoreId: fc.constant(null),
    targetUrl: fc.constant('https://example.com'),
    startsAt: arbDateStr,
    endsAt: arbDateStr,
    isActive: fc.boolean(),
    sortOrder: fc.integer({ min: 0, max: 100 }),
  }) as fc.Arbitrary<BannerAd>

  const arbCurrentDate = fc.integer({ min: 1704067200000, max: 1798761600000 })
    .map(ts => new Date(ts))

  it('returns only banners whose date range includes current date', () => {
    fc.assert(
      fc.property(
        fc.array(arbBannerAd, { minLength: 0, maxLength: 15 }),
        arbCurrentDate,
        (banners, currentDate) => {
          const currentDateStr = currentDate.toISOString().split('T')[0]
          const results = getActiveBanners(banners, currentDate)

          for (const banner of results) {
            if (banner.startsAt > currentDateStr) return false
            if (banner.endsAt < currentDateStr) return false
            if (!banner.isActive) return false
          }
          return true
        }
      ),
      { numRuns: 200 }
    )
  })

  it('never returns more than 5 banners', () => {
    fc.assert(
      fc.property(
        fc.array(arbBannerAd, { minLength: 0, maxLength: 20 }),
        arbCurrentDate,
        (banners, currentDate) => {
          const results = getActiveBanners(banners, currentDate)
          return results.length <= 5
        }
      ),
      { numRuns: 200 }
    )
  })

  it('results are sorted by sort_order', () => {
    fc.assert(
      fc.property(
        fc.array(arbBannerAd, { minLength: 0, maxLength: 15 }),
        arbCurrentDate,
        (banners, currentDate) => {
          const results = getActiveBanners(banners, currentDate)
          for (let i = 1; i < results.length; i++) {
            if (results[i].sortOrder < results[i - 1].sortOrder) return false
          }
          return true
        }
      ),
      { numRuns: 200 }
    )
  })
})

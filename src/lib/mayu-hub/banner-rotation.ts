/**
 * Banner Rotation Logic
 * 
 * Filters active banners by date range and limits to max 5.
 * 
 * Requirements: 8.1, 8.5
 */

import type { BannerAd } from './types'

/**
 * Returns active banners for the current date.
 * Filters by date range (starts_at ≤ current ≤ ends_at),
 * sorts by sort_order, and limits to 5.
 * 
 * @param banners - All banner ads
 * @param currentDate - Current date
 * @returns Active banners, max 5, sorted by sort_order
 */
export function getActiveBanners(
  banners: BannerAd[],
  currentDate: Date
): BannerAd[] {
  const currentDateStr = currentDate.toISOString().split('T')[0] // YYYY-MM-DD

  const active = banners.filter(banner => {
    if (!banner.isActive) return false
    return banner.startsAt <= currentDateStr && banner.endsAt >= currentDateStr
  })

  // Sort by sort_order ascending
  active.sort((a, b) => a.sortOrder - b.sortOrder)

  // Limit to 5
  return active.slice(0, 5)
}

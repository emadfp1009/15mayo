/**
 * Store Status Computation
 * 
 * Determines whether a store is currently open or closed based on
 * working hours and manual override.
 * 
 * Requirements: 5.2, 5.3, 5.5
 */

import type { WorkingHours, StoreStatusOverride } from './types'

/**
 * Computes the current status of a store.
 * 
 * Priority:
 * 1. Manual override (if not expired) takes precedence
 * 2. Working hours for current day determine status
 * 3. Default to 'closed' if no working hours configured
 * 
 * @param workingHours - Array of working hours for each day
 * @param currentTime - The current date/time
 * @param manualOverride - Optional manual status override
 * @returns 'open' or 'closed'
 */
export function computeStoreStatus(
  workingHours: WorkingHours[],
  currentTime: Date,
  manualOverride: StoreStatusOverride | null
): 'open' | 'closed' {
  // Check manual override first
  if (manualOverride) {
    const isOverrideActive = manualOverride.until === null || manualOverride.until > currentTime
    if (isOverrideActive) {
      return manualOverride.status
    }
  }

  // No working hours configured = closed
  if (workingHours.length === 0) {
    return 'closed'
  }

  // Get current day of week (0 = Sunday)
  const currentDay = currentTime.getDay()

  // Find working hours for today
  const todayHours = workingHours.find(wh => wh.dayOfWeek === currentDay)

  // No hours for today or marked as closed
  if (!todayHours || todayHours.isClosed) {
    return 'closed'
  }

  // Parse open and close times
  const [openHour, openMin] = todayHours.openTime.split(':').map(Number)
  const [closeHour, closeMin] = todayHours.closeTime.split(':').map(Number)

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
  const openMinutes = openHour * 60 + openMin
  const closeMinutes = closeHour * 60 + closeMin

  // Check if current time is within working hours
  if (closeMinutes > openMinutes) {
    // Normal case: open 09:00, close 22:00
    return (currentMinutes >= openMinutes && currentMinutes < closeMinutes) ? 'open' : 'closed'
  } else if (closeMinutes < openMinutes) {
    // Overnight case: open 20:00, close 02:00
    return (currentMinutes >= openMinutes || currentMinutes < closeMinutes) ? 'open' : 'closed'
  } else {
    // Open and close are the same = closed
    return 'closed'
  }
}

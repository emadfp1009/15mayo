/**
 * Community Service Filtering
 * 
 * Filters community services by neighborhood and type using AND logic.
 * Formats display output omitting empty fields.
 * 
 * Requirements: 6.3, 6.5, 6.6, 6.8
 */

import type { CommunityService, CommunityServiceType } from './types'

/**
 * Filters community services using AND logic for neighborhood and type.
 * 
 * @param services - All community services
 * @param neighborhoodId - Filter by neighborhood (null = no filter)
 * @param typeFilter - Filter by service type (null = no filter)
 * @returns Filtered services matching all active filters
 */
export function filterCommunityServices(
  services: CommunityService[],
  neighborhoodId: string | null,
  typeFilter: CommunityServiceType | null
): CommunityService[] {
  return services.filter(service => {
    // Neighborhood filter
    if (neighborhoodId && service.neighborhoodId !== neighborhoodId) {
      return false
    }

    // Type filter
    if (typeFilter && service.type !== typeFilter) {
      return false
    }

    return true
  })
}

/**
 * Formats a community service for display, omitting null/empty fields.
 * Always includes name and neighborhood ID.
 * 
 * @param service - Community service to format
 * @returns Object with only non-empty fields
 */
export function formatCommunityServiceDisplay(
  service: CommunityService
): Record<string, string> {
  const display: Record<string, string> = {
    nameAr: service.nameAr,
    neighborhoodId: service.neighborhoodId,
    type: service.type,
  }

  if (service.address && service.address.trim().length > 0) {
    display.address = service.address
  }

  if (service.phone && service.phone.trim().length > 0) {
    display.phone = service.phone
  }

  if (service.type === 'school' && service.schoolType) {
    display.schoolType = service.schoolType
  }

  return display
}

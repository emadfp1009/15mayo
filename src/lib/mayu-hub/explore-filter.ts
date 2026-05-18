import type { StoreProfile } from './types';

export interface ExploreFilters {
  neighborhoodId: string | null;
  categoryId: string | null;
  deliveryOnly: boolean;
}

export function applyExploreFilters(
  stores: StoreProfile[],
  filters: ExploreFilters
): StoreProfile[] {
  return stores.filter(store => {
    if (filters.neighborhoodId && store.neighborhoodId !== filters.neighborhoodId) return false;
    if (filters.categoryId && store.categoryId !== filters.categoryId) return false;
    if (filters.deliveryOnly && !store.delivers) return false;
    return true;
  });
}

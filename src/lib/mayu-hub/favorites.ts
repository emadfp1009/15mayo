import type { UserFavorites } from './types';

export function toggleFavorite(favorites: string[], storeId: string): string[] {
  if (favorites.includes(storeId)) {
    return favorites.filter(id => id !== storeId);
  }
  return [...favorites, storeId];
}

export function isFavorited(favorites: string[], storeId: string): boolean {
  return favorites.includes(storeId);
}

export function getFavoritesCount(allFavorites: UserFavorites, storeId: string): number {
  let count = 0;
  for (const userFavs of Object.values(allFavorites)) {
    if (userFavs.includes(storeId)) {
      count++;
    }
  }
  return count;
}

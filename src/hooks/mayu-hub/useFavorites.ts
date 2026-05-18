import { useState, useCallback } from 'react';
import { getFavorites, setFavorites } from '@/lib/mayu-hub/local-storage';
import { toggleFavorite as toggleFav, isFavorited as isFav, getFavoritesCount as getCount } from '@/lib/mayu-hub/favorites';
import { getCurrentUser, isGuestUser } from '@/lib/mayu-hub/auth';

/**
 * Hook for managing user favorites.
 * Reads/writes favorites from localStorage keyed by userId,
 * and blocks toggle for guest users.
 *
 * Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 1.6
 */
export function useFavorites() {
  const [allFavorites, setAllFavorites] = useState(getFavorites());
  const user = getCurrentUser();
  const userId = user?.id ?? '';
  const userFavorites = allFavorites[userId] || [];

  const isFavorited = useCallback((storeId: string): boolean => {
    return isFav(userFavorites, storeId);
  }, [userFavorites]);

  const toggleFavorite = useCallback((storeId: string): { success: boolean; needsLogin: boolean } => {
    if (!user || isGuestUser(user)) {
      return { success: false, needsLogin: true };
    }
    const updated = { ...allFavorites };
    updated[user.id] = toggleFav(updated[user.id] || [], storeId);
    setFavorites(updated);
    setAllFavorites(updated);
    return { success: true, needsLogin: false };
  }, [user, allFavorites]);

  const getFavoritesCount = useCallback((storeId: string): number => {
    return getCount(allFavorites, storeId);
  }, [allFavorites]);

  return {
    favorites: userFavorites,
    isFavorited,
    toggleFavorite,
    getFavoritesCount,
  };
}

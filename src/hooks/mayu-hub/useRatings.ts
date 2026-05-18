import { useState, useCallback } from 'react';
import { getRatings, setRatings } from '@/lib/mayu-hub/local-storage';
import { computeAverageRating } from '@/lib/mayu-hub/ratings';
import { getCurrentUser, isGuestUser } from '@/lib/mayu-hub/auth';

/**
 * Hook for managing store ratings.
 * Reads/writes ratings from localStorage, computes averages,
 * and blocks submission for guest users.
 */
export function useRatings(storeId: string) {
  const [allRatings, setAllRatings] = useState(getRatings());
  const user = getCurrentUser();

  const storeRatings = allRatings[storeId] || {};
  const { average, total } = computeAverageRating(storeRatings);
  const userRating = user ? (storeRatings[user.id] ?? null) : null;

  const submitRating = useCallback((rating: number): { success: boolean; needsLogin: boolean } => {
    if (!user || isGuestUser(user)) {
      return { success: false, needsLogin: true };
    }
    const updated = { ...allRatings };
    if (!updated[storeId]) updated[storeId] = {};
    updated[storeId] = { ...updated[storeId], [user.id]: rating };
    setRatings(updated);
    setAllRatings(updated);
    return { success: true, needsLogin: false };
  }, [user, storeId, allRatings]);

  return {
    averageRating: average,
    totalRatings: total,
    userRating,
    submitRating,
  };
}

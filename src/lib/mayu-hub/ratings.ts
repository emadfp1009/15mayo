// Ratings computation module
// Pure functions for computing store rating averages

/**
 * Computes the average rating from a set of user ratings.
 * @param ratings - A record mapping userId to their rating (1-5)
 * @returns An object with `average` (rounded to 1 decimal) and `total` (number of ratings)
 */
export function computeAverageRating(ratings: Record<string, number>): {
  average: number;
  total: number;
} {
  const values = Object.values(ratings);
  if (values.length === 0) return { average: 0, total: 0 };
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    average: Math.round((sum / values.length) * 10) / 10,
    total: values.length,
  };
}

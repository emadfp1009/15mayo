/**
 * Neighborhood Circle Computation
 * 
 * Computes the set of neighborhoods visible to a resident based on their
 * primary neighborhood and the city's adjacency graph.
 * 
 * Requirements: 2.2, 10.2, 10.4
 */

/**
 * Computes the neighborhood circle for a given primary neighborhood.
 * Returns the primary neighborhood plus all active adjacent neighborhoods.
 * 
 * @param primaryId - The resident's primary neighborhood ID
 * @param adjacencyMap - Map of neighborhood ID to array of adjacent neighborhood IDs
 * @param activeNeighborhoods - Set of currently active neighborhood IDs
 * @returns Array of neighborhood IDs in the circle (primary first)
 */
export function computeNeighborhoodCircle(
  primaryId: string,
  adjacencyMap: Map<string, string[]>,
  activeNeighborhoods: Set<string>
): string[] {
  // If primary is not active, return empty circle
  if (!activeNeighborhoods.has(primaryId)) {
    return []
  }

  const circle: string[] = [primaryId]

  // Get adjacent neighborhoods
  const adjacent = adjacencyMap.get(primaryId) ?? []

  // Add only active adjacent neighborhoods
  for (const neighborId of adjacent) {
    if (activeNeighborhoods.has(neighborId) && neighborId !== primaryId) {
      circle.push(neighborId)
    }
  }

  return circle
}

// Feature: mayu-hub, Property 1: Neighborhood circle respects adjacency and active status
import { describe, it } from 'vitest'
import fc from 'fast-check'
import { computeNeighborhoodCircle } from '@/lib/mayu-hub/neighborhood-circle'

describe('Property 1: Neighborhood circle computation', () => {
  // Generate a valid adjacency map with active neighborhoods
  const arbNeighborhoodIds = fc.array(fc.uuid(), { minLength: 2, maxLength: 36 })
    .map(ids => [...new Set(ids)])
    .filter(ids => ids.length >= 2)

  it('circle contains only primary + active adjacent, never inactive or non-adjacent', () => {
    fc.assert(
      fc.property(
        arbNeighborhoodIds,
        fc.nat({ max: 100 }),
        (ids, seed) => {
          // Pick a primary
          const primaryId = ids[0]

          // Create random adjacency (some neighbors for primary)
          const adjacencyMap = new Map<string, string[]>()
          const adjacentCount = Math.min(seed % 6 + 1, ids.length - 1)
          const adjacent = ids.slice(1, 1 + adjacentCount)
          adjacencyMap.set(primaryId, adjacent)

          // Create active set (primary always active, some adjacent active)
          const activeNeighborhoods = new Set<string>([primaryId])
          const activeAdjacent: string[] = []
          const inactiveAdjacent: string[] = []

          for (let i = 0; i < adjacent.length; i++) {
            if (i % 2 === 0) {
              activeNeighborhoods.add(adjacent[i])
              activeAdjacent.push(adjacent[i])
            } else {
              inactiveAdjacent.push(adjacent[i])
            }
          }

          const circle = computeNeighborhoodCircle(primaryId, adjacencyMap, activeNeighborhoods)

          // Circle must contain primary
          if (!circle.includes(primaryId)) return false

          // Circle must contain all active adjacent
          for (const id of activeAdjacent) {
            if (!circle.includes(id)) return false
          }

          // Circle must NOT contain inactive adjacent
          for (const id of inactiveAdjacent) {
            if (circle.includes(id)) return false
          }

          // Circle must NOT contain non-adjacent neighborhoods
          const nonAdjacent = ids.filter(id => id !== primaryId && !adjacent.includes(id))
          for (const id of nonAdjacent) {
            if (circle.includes(id)) return false
          }

          return true
        }
      ),
      { numRuns: 200 }
    )
  })

  it('returns empty array when primary is inactive', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        arbNeighborhoodIds,
        (primaryId, otherIds) => {
          const adjacencyMap = new Map<string, string[]>()
          adjacencyMap.set(primaryId, otherIds)
          const activeNeighborhoods = new Set(otherIds) // primary NOT in active set

          const circle = computeNeighborhoodCircle(primaryId, adjacencyMap, activeNeighborhoods)
          return circle.length === 0
        }
      ),
      { numRuns: 200 }
    )
  })

  it('returns only primary when no active neighbors exist', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (primaryId) => {
          const adjacencyMap = new Map<string, string[]>()
          adjacencyMap.set(primaryId, [])
          const activeNeighborhoods = new Set([primaryId])

          const circle = computeNeighborhoodCircle(primaryId, adjacencyMap, activeNeighborhoods)
          return circle.length === 1 && circle[0] === primaryId
        }
      ),
      { numRuns: 200 }
    )
  })
})

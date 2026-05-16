# Implementation Plan: Mayu Hub

## Overview

Mayu Hub is a neighborhood-based local services directory for 15 May City. Implementation follows a bottom-up approach: database schema and types first, then pure logic modules, custom hooks, UI components, and finally the admin panel. Property-based tests validate correctness properties alongside implementation.

## Tasks

- [ ] 1. Set up database schema and TypeScript types
  - [ ] 1.1 Create Supabase migration for all Mayu Hub tables
    - Create migration file with tables: `neighborhoods`, `neighborhood_adjacency`, `store_profiles`, `store_working_hours`, `store_delivery_neighborhoods`, `service_categories`, `special_offers`, `banner_ads`, `community_services`, `resident_profiles`
    - Include all constraints, checks, and indexes as defined in the design
    - Add database trigger for bidirectional adjacency insertion
    - _Requirements: 1.1, 2.2, 4.6, 4.7, 6.2, 8.2, 9.2, 10.1_

  - [ ] 1.2 Create TypeScript type definitions and Zod schemas
    - Create `src/lib/mayu-hub/types.ts` with all interfaces: `Neighborhood`, `StoreProfile`, `WorkingHours`, `StoreStatusOverride`, `SearchFilters`, `BannerAd`, `CommunityService`, `SpecialOffer`, `StoreProfileInput`, `ValidationResult`
    - Create `src/lib/mayu-hub/schemas.ts` with Zod validation schemas for store profile input, working hours, and WhatsApp message
    - _Requirements: 4.7, 4.3_

- [ ] 2. Implement pure logic modules
  - [ ] 2.1 Implement neighborhood circle computation
    - Create `src/lib/mayu-hub/neighborhood-circle.ts`
    - Implement `computeNeighborhoodCircle(primaryId, adjacencyMap, activeNeighborhoods)` that returns the primary neighborhood plus all active adjacent neighborhoods
    - Handle edge cases: inactive primary (return empty), no active neighbors (return only primary)
    - _Requirements: 2.2, 10.2, 10.4_

  - [ ]* 2.2 Write property test for neighborhood circle (Property 1)
    - **Property 1: Neighborhood circle respects adjacency and active status**
    - Create `tests/properties/mayu-hub/neighborhood-circle.property.test.ts`
    - Generate arbitrary adjacency maps and active sets; verify circle contains only primary + active adjacent, never inactive or non-adjacent
    - **Validates: Requirements 2.2, 10.2, 10.4**

  - [ ] 2.3 Implement store status computation
    - Create `src/lib/mayu-hub/store-status.ts`
    - Implement `computeStoreStatus(workingHours, currentTime, manualOverride)` with logic: manual override takes priority if not expired; otherwise compare current time against day's working hours; default to 'closed' if no hours configured
    - _Requirements: 5.2, 5.3, 5.5_

  - [ ]* 2.4 Write property test for store status (Property 6)
    - **Property 6: Store status computation with manual override priority**
    - Create `tests/properties/mayu-hub/store-status.property.test.ts`
    - Generate arbitrary working hours, times, and overrides; verify override priority, time-based computation, and default closed behavior
    - **Validates: Requirements 5.2, 5.3, 5.5**

  - [ ] 2.5 Implement search ranking and filtering
    - Create `src/lib/mayu-hub/search.ts`
    - Implement `rankSearchResults(stores, query, primaryNeighborhoodId)` — exact match first, then partial, max 20 results
    - Implement `filterStores(stores, filters)` — AND logic combining query, category, and neighborhood filters
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [ ]* 2.6 Write property tests for search (Properties 2, 3)
    - **Property 2: Search results ranked exact-first then partial, max 20**
    - **Property 3: Combined filters use AND logic**
    - Create `tests/properties/mayu-hub/search.property.test.ts`
    - Generate arbitrary store lists and queries; verify ordering invariant and max count; verify AND filter semantics
    - **Validates: Requirements 3.1, 3.5, 3.2, 3.3, 2.1**

  - [ ] 2.7 Implement banner filtering logic
    - Create `src/lib/mayu-hub/banner-rotation.ts`
    - Implement `getActiveBanners(banners, currentDate)` — filter by date range (starts_at ≤ current ≤ ends_at), sort by sort_order, limit to 5
    - _Requirements: 8.1, 8.5_

  - [ ]* 2.8 Write property test for banner filtering (Property 12)
    - **Property 12: Active banner filtering by date with max limit**
    - Create `tests/properties/mayu-hub/banners.property.test.ts`
    - Generate arbitrary banner sets and dates; verify only date-valid banners returned, max 5, sorted by sort_order
    - **Validates: Requirements 8.1, 8.5**

  - [ ] 2.9 Implement validation module
    - Create `src/lib/mayu-hub/validation.ts`
    - Implement `validateStoreProfile(input)` — enforce mandatory fields (name, phone, neighborhood, working hours), return errors map
    - Implement `validateWhatsAppMessage(message)` — reject if > 256 characters
    - Implement `validateRejectionReason(reason)` — reject if < 10 characters
    - _Requirements: 4.7, 4.3, 9.5_

  - [ ]* 2.10 Write property tests for validation (Properties 4, 5, 13)
    - **Property 4: WhatsApp link construction and message validation**
    - **Property 5: Store profile validation enforces mandatory fields**
    - **Property 13: Rejection reason minimum length validation**
    - Create `tests/properties/mayu-hub/validation.property.test.ts`
    - Generate arbitrary inputs; verify mandatory field enforcement, WhatsApp 256 char limit, rejection reason 10 char minimum
    - **Validates: Requirements 4.3, 4.7, 9.5**

  - [ ] 2.11 Implement premium ranking and offer constraints
    - Add to `src/lib/mayu-hub/search.ts` or create `src/lib/mayu-hub/premium.ts`
    - Implement premium sorting: premium stores first (ordered by `premiumStartedAt` ascending), then non-premium
    - Implement `canAddSpecialOffer(activeOfferCount)` — max 5 active offers
    - Implement `isOfferDurationValid(startsAt, expiresAt)` — max 30 days
    - Implement `isPremiumExpired(premiumExpiresAt, currentDate)` — check expiration
    - _Requirements: 7.2, 7.3, 7.5_

  - [ ]* 2.12 Write property tests for premium logic (Properties 9, 10, 11)
    - **Property 9: Premium stores ranked before non-premium**
    - **Property 10: Premium offer constraints (max 5, max 30 days)**
    - **Property 11: Expired premium reverts to basic tier**
    - Create `tests/properties/mayu-hub/premium.property.test.ts`
    - Generate arbitrary store lists with mixed premium status; verify ordering, offer limits, and expiration behavior
    - **Validates: Requirements 7.2, 7.3, 7.5**

  - [ ] 2.13 Implement community service filtering
    - Create `src/lib/mayu-hub/community-filter.ts`
    - Implement `filterCommunityServices(services, neighborhoodId, typeFilter)` — AND logic for neighborhood + type filters
    - Implement `formatCommunityServiceDisplay(service)` — omit null/empty fields, always include name and neighborhood
    - _Requirements: 6.3, 6.5, 6.6, 6.8_

  - [ ]* 2.14 Write property tests for community filtering (Properties 7, 8)
    - **Property 7: Community service display omits empty fields**
    - **Property 8: Combined community service filtering uses AND logic**
    - Create `tests/properties/mayu-hub/filtering.property.test.ts`
    - Generate arbitrary community services with optional fields; verify display omission and AND filter semantics
    - **Validates: Requirements 6.3, 6.5, 6.6, 6.8**

- [ ] 3. Checkpoint - Core logic verification
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement Supabase client and custom hooks
  - [ ] 4.1 Create Supabase client configuration for Mayu Hub
    - Create `src/lib/mayu-hub/supabase.ts` with typed Supabase client helpers
    - Add RPC function calls for neighborhood circle queries
    - _Requirements: 2.2, 3.1_

  - [ ] 4.2 Implement useNeighborhoodCircle hook
    - Create `src/hooks/mayu-hub/useNeighborhoodCircle.ts`
    - Fetch adjacency data from Supabase, compute circle using pure logic module
    - Return `{ circle, isLoading }` with TanStack Query caching
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 4.3 Implement useStoreStatus hook
    - Create `src/hooks/mayu-hub/useStoreStatus.ts`
    - Use `computeStoreStatus` from pure module with current time
    - Set up interval to refresh status near transition times (within 60 seconds)
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 4.4 Implement useServiceSearch hook
    - Create `src/hooks/mayu-hub/useServiceSearch.ts`
    - Query approved stores within circle neighborhood IDs from Supabase
    - Apply `rankSearchResults` and `filterStores` from pure modules
    - Return `{ results, isLoading, isEmpty }` with debounced query
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 4.5 Implement useActiveBanners hook
    - Create `src/hooks/mayu-hub/useActiveBanners.ts`
    - Fetch banners from Supabase, apply `getActiveBanners` filter
    - Return `{ banners, hasActiveBanners }`
    - _Requirements: 8.1, 8.4, 8.5_

  - [ ] 4.6 Implement useApprovalQueue hook
    - Create `src/hooks/mayu-hub/useApprovalQueue.ts`
    - Fetch pending store profiles sorted by `created_at` ascending
    - Implement `approve(id)` and `reject(id, reason)` mutations with validation
    - _Requirements: 9.3, 9.4, 9.5, 9.6_

  - [ ]* 4.7 Write property test for approval queue sorting (Property 14)
    - **Property 14: Approval queue sorted by submission date**
    - Create `tests/properties/mayu-hub/admin.property.test.ts`
    - Generate arbitrary pending submissions; verify ascending date sort
    - **Validates: Requirements 9.6**

- [ ] 5. Checkpoint - Hooks verification
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement resident-facing UI components
  - [ ] 6.1 Create NeighborhoodSelector component
    - Create `src/components/mayu-hub/NeighborhoodSelector.tsx`
    - Display all 36 neighborhoods in Arabic, allow single selection
    - Show validation error if no selection on submit
    - Use shadcn/ui Select or RadioGroup with RTL layout
    - _Requirements: 1.1, 1.5_

  - [ ] 6.2 Create ServicesView component with neighborhood circle filters
    - Create `src/components/mayu-hub/ServicesView.tsx`
    - Display scrollable list of services from neighborhood circle
    - Show quick-access neighborhood filter chips at top with "All" option
    - Sort by proximity (primary first, then adjacent)
    - Show empty state when no services available
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6_

  - [ ] 6.3 Create StoreCard component
    - Create `src/components/mayu-hub/StoreCard.tsx`
    - Display store name, category, neighborhood, status indicator (open/closed)
    - Show "Premium" badge for premium stores
    - Show "Closed" label when status is closed
    - _Requirements: 5.1, 5.4, 7.4_

  - [ ] 6.4 Create StoreDetail page component
    - Create `src/components/mayu-hub/StoreDetail.tsx`
    - Display logo (or placeholder), storefront photo, store name, working hours per day
    - Phone call button and WhatsApp button with deep link
    - Delivery info section (cost, duration, neighborhoods) if applicable
    - Special offers section for premium stores
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.8, 7.3_

  - [ ] 6.5 Create SearchBar and search results components
    - Create `src/components/mayu-hub/SearchBar.tsx` and `src/components/mayu-hub/SearchResults.tsx`
    - Text input (min 2 chars to trigger), category dropdown, neighborhood filter
    - Display results with premium stores first, max 20
    - Show "no results" message with suggestion to remove filters
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 6.6 Create BannerCarousel component
    - Create `src/components/mayu-hub/BannerCarousel.tsx`
    - Display up to 5 banners, rotate every 5 seconds
    - Navigate to store profile or open external link on tap
    - Hide entirely when no active banners
    - Use embla-carousel-react for carousel behavior
    - _Requirements: 8.1, 8.3, 8.4_

  - [ ] 6.7 Create CommunityDirectory component
    - Create `src/components/mayu-hub/CommunityDirectory.tsx`
    - Display services grouped by neighborhood
    - Filter by neighborhood and/or service type
    - Show school type label for school entries
    - Omit empty fields from display
    - Show empty state for no-match filters
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [ ] 7. Checkpoint - UI components verification
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement admin panel
  - [ ] 8.1 Create admin layout and store management page
    - Create `src/components/mayu-hub/admin/AdminLayout.tsx` with navigation
    - Create `src/components/mayu-hub/admin/StoreManagement.tsx`
    - List all stores with ability to add, edit, deactivate
    - Deactivated stores removed from resident-facing views
    - _Requirements: 9.1_

  - [ ] 8.2 Create approval queue page
    - Create `src/components/mayu-hub/admin/ApprovalQueue.tsx`
    - Display pending submissions sorted by date (oldest first)
    - Show store name, neighborhood, submission timestamp
    - Approve button and reject button (with reason input, min 10 chars)
    - _Requirements: 9.3, 9.4, 9.5, 9.6_

  - [ ] 8.3 Create neighborhood management page
    - Create `src/components/mayu-hub/admin/NeighborhoodManagement.tsx`
    - Add/edit neighborhoods with name and adjacency relationships
    - Toggle active/inactive status for phased rollout
    - Show which neighborhoods are currently active
    - _Requirements: 9.2, 10.1, 10.3, 10.4_

  - [ ] 8.4 Create banner management page
    - Create `src/components/mayu-hub/admin/BannerManagement.tsx`
    - Create, schedule, and remove banner ads
    - Require: banner image, target link, start date, end date
    - Auto-remove expired banners from active rotation
    - _Requirements: 8.2, 8.5_

- [ ] 9. Wire routes and integrate all components
  - [ ] 9.1 Set up TanStack Router routes for Mayu Hub
    - Create route files for: `/hub`, `/hub/store/$id`, `/hub/community`, `/hub/search`, `/admin/hub`, `/admin/hub/approvals`, `/admin/hub/neighborhoods`, `/admin/hub/banners`
    - Wire components to routes with proper data loading
    - Add neighborhood selection prompt on landing if not set
    - _Requirements: 1.1, 2.5_

  - [ ] 9.2 Implement registration flow with neighborhood selection
    - Integrate NeighborhoodSelector into registration flow
    - Store selected neighborhood in `resident_profiles` table
    - Allow changing neighborhood from profile settings
    - Refresh services on neighborhood change within 3 seconds
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 9.3 Implement store profile submission flow
    - Create store registration form with mandatory/optional fields
    - Upload logo and storefront photo to Supabase Storage (max 5MB each)
    - Submit to pending approval queue
    - Show pending status to service provider
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 9.3_

  - [ ]* 9.4 Write integration tests for key flows
    - Test store submission → approval queue → approval → visible in search
    - Test neighborhood activation → circle recomputation
    - Test banner scheduling → auto-expiration
    - _Requirements: 9.3, 9.4, 10.4, 8.5_

- [ ] 10. Final checkpoint - Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties defined in the design document
- Unit tests validate specific examples and edge cases
- The project uses Vitest + fast-check (already configured) for property-based testing
- All UI components should use RTL layout with Arabic-first text
- Supabase RLS policies should be configured alongside table creation for security

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.3", "2.5", "2.7", "2.9", "2.11", "2.13"] },
    { "id": 2, "tasks": ["2.2", "2.4", "2.6", "2.8", "2.10", "2.12", "2.14"] },
    { "id": 3, "tasks": ["4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "4.5", "4.6"] },
    { "id": 5, "tasks": ["4.7"] },
    { "id": 6, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7"] },
    { "id": 7, "tasks": ["8.1", "8.2", "8.3", "8.4"] },
    { "id": 8, "tasks": ["9.1"] },
    { "id": 9, "tasks": ["9.2", "9.3"] },
    { "id": 10, "tasks": ["9.4"] }
  ]
}
```

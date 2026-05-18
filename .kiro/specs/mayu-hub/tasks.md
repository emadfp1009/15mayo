# Implementation Plan: Mayu Hub Upgrade

## Overview

This plan upgrades Mayu Hub from demo-data with Supabase to a localStorage-only PWA with real data. Implementation follows a bottom-up approach: data layer and types first, then pure logic modules with property tests, then custom hooks, UI components, and finally integration/wiring. All new features (ratings, favorites, marketplace, messaging, dashboard, side drawer) are built incrementally.

## Tasks

- [x] 1. Data layer and types
  - [x] 1.1 Extend TypeScript types for new features
    - Add to `src/lib/mayu-hub/types.ts`: `StoreRatings`, `UserFavorites`, `ClassifiedAd`, `ClassifiedAdInput`, `MarketplaceCategory`, `ChatMessage`, `ChatThread`, `StoreViews`, `StoreSocialLinks`, `GuestSession`
    - Add `ValidationResult` type if not already present
    - _Requirements: 5.3, 6.6, 7.2, 7.5, 8.1, 8.5, 9.1, 11.3_

  - [x] 1.2 Create localStorage data access module
    - Create `src/lib/mayu-hub/local-storage.ts` with typed read/write helpers for all new localStorage keys: `mayu_hub_ratings`, `mayu_hub_favorites`, `mayu_hub_marketplace`, `mayu_hub_messages`, `mayu_hub_threads`, `mayu_hub_store_views`, `mayu_hub_store_social`
    - Include safe JSON parse with fallback defaults
    - _Requirements: 5.3, 6.6, 7.5, 8.5_

  - [x] 1.3 Switch ServicesView and App.tsx to use real-data.ts
    - Replace all `demoStores` imports with `realStores` from `real-data.ts` in `ServicesView.tsx` and `App.tsx`
    - Update `StoreDetail` references to use real-data
    - Remove dependency on `demo-data.ts` for store listings (keep for neighborhoods/categories/working hours if still needed)
    - _Requirements: 2.2, 2.3, 13.1, 13.2, 13.3_

- [x] 2. Login screen
  - [x] 2.1 Create LoginScreen component replacing OnboardingScreen
    - Create `src/components/mayu-hub/LoginScreen.tsx`
    - Phone input with +20 prefix, OTP simulation (any 4-digit code = "1234" for demo)
    - Guest mode button creating temporary session with `isGuest: true`
    - 3-attempt OTP failure with resend option
    - Navigate to services view on success (no neighborhood modal)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1_

  - [x] 2.2 Update auth module for guest sessions
    - Add `isGuest` field to `UserProfile` interface in `auth.ts`
    - Add `createGuestSession()` function that creates a temporary user with restricted permissions
    - Add `isGuestUser(user)` helper to check guest status
    - _Requirements: 1.5, 1.6_

- [x] 3. Pure logic modules for new features
  - [x] 3.1 Implement ratings computation module
    - Create `src/lib/mayu-hub/ratings.ts`
    - Implement `computeAverageRating(ratings: Record<string, number>)` returning `{ average, total }`
    - Average = arithmetic mean rounded to 1 decimal; empty set returns `{ average: 0, total: 0 }`
    - _Requirements: 5.3, 5.5_

  - [ ]* 3.2 Write property test for rating computation (Property 3)
    - **Property 3: Rating average computation**
    - Create `tests/properties/mayu-hub/ratings.property.test.ts`
    - Generate arbitrary sets of ratings (1-5), verify average equals arithmetic mean rounded to 1 decimal
    - **Validates: Requirements 5.3, 5.5**

  - [x] 3.3 Implement explore filter module
    - Create `src/lib/mayu-hub/explore-filter.ts`
    - Implement `applyExploreFilters(stores, { neighborhoodId, categoryId, deliveryOnly })` with AND logic
    - All filters optional; when active, results must satisfy all
    - _Requirements: 3.3, 3.4, 3.5, 3.6_

  - [ ]* 3.4 Write property test for explore filters (Property 2)
    - **Property 2: Explore filters use AND logic**
    - Create `tests/properties/mayu-hub/explore-filter.property.test.ts`
    - Generate arbitrary store lists and filter combinations; verify AND semantics and completeness
    - **Validates: Requirements 3.3, 3.4, 3.5, 3.6**

  - [x] 3.5 Implement favorites logic module
    - Create `src/lib/mayu-hub/favorites.ts`
    - Implement `toggleFavorite(favorites: string[], storeId: string): string[]`
    - Implement `isFavorited(favorites: string[], storeId: string): boolean`
    - Implement `getFavoritesCount(allFavorites: UserFavorites, storeId: string): number`
    - _Requirements: 6.2, 6.4, 6.5_

  - [ ]* 3.6 Write property tests for favorites (Properties 4, 5, 6)
    - **Property 4: Favorite toggle is its own inverse**
    - **Property 5: Favorites view shows exactly favorited stores**
    - **Property 6: Favorites persistence round-trip**
    - Create `tests/properties/mayu-hub/favorites.property.test.ts`
    - Generate arbitrary favorites lists; verify toggle idempotence, view filtering, and persistence round-trip
    - **Validates: Requirements 6.2, 6.5, 6.6**

  - [x] 3.7 Implement marketplace validation module
    - Create `src/lib/mayu-hub/marketplace.ts`
    - Implement `validateClassifiedAd(input: ClassifiedAdInput): ValidationResult`
    - Reject if title empty/whitespace, price ≤ 0, or phone empty
    - Implement `filterAdsByCategory(ads: ClassifiedAd[], category: MarketplaceCategory | null): ClassifiedAd[]`
    - _Requirements: 7.4, 7.7_

  - [ ]* 3.8 Write property tests for marketplace (Properties 7, 8, 9)
    - **Property 7: Marketplace ad persistence round-trip**
    - **Property 8: Marketplace category filter**
    - **Property 9: Marketplace validation rejects invalid ads**
    - Create `tests/properties/mayu-hub/marketplace.property.test.ts`
    - Generate arbitrary ads and inputs; verify persistence, filtering, and validation
    - **Validates: Requirements 7.3, 7.4, 7.5, 7.7**

  - [x] 3.9 Implement messaging logic module
    - Create `src/lib/mayu-hub/messaging.ts`
    - Implement `sortMessagesByTimestamp(messages: ChatMessage[]): ChatMessage[]`
    - Implement `createThreadId(userId: string, storeId: string): string`
    - Implement `getUnreadCount(threads: ChatThread[]): number`
    - _Requirements: 8.3, 8.5_

  - [ ]* 3.10 Write property tests for messaging (Properties 10, 11)
    - **Property 10: Messages displayed in chronological order**
    - **Property 11: Message persistence round-trip**
    - Create `tests/properties/mayu-hub/messaging.property.test.ts`
    - Generate arbitrary message sets; verify chronological ordering and persistence round-trip
    - **Validates: Requirements 8.3, 8.5**

- [x] 4. Checkpoint - Core logic verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Custom hooks
  - [x] 5.1 Implement useRatings hook
    - Create `src/hooks/mayu-hub/useRatings.ts`
    - Read/write ratings from localStorage using `local-storage.ts` helpers
    - Expose `averageRating`, `totalRatings`, `userRating`, `submitRating`
    - Block submission for guest users (return login prompt flag)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 1.6_

  - [x] 5.2 Implement useFavorites hook
    - Create `src/hooks/mayu-hub/useFavorites.ts`
    - Read/write favorites from localStorage keyed by userId
    - Expose `favorites`, `isFavorited`, `toggleFavorite`, `getFavoritesCount`
    - Block toggle for guest users
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 1.6_

  - [x] 5.3 Implement useMarketplace hook
    - Create `src/hooks/mayu-hub/useMarketplace.ts`
    - Read/write marketplace ads from localStorage
    - Expose `ads`, `addAd`, `removeAd`, `filterByCategory`
    - Validate before adding; block for guest users
    - _Requirements: 7.1, 7.3, 7.4, 7.5, 7.7, 1.6_

  - [x] 5.4 Implement useMessaging hook
    - Create `src/hooks/mayu-hub/useMessaging.ts`
    - Read/write messages and threads from localStorage
    - Expose `threads`, `getThread`, `sendMessage`, `getUnreadCount`
    - Block sending for guest users
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 1.6_

  - [x] 5.5 Implement useStoreViews hook
    - Create `src/hooks/mayu-hub/useStoreViews.ts`
    - Read/write view counts from localStorage
    - Expose `viewCount`, `incrementView`
    - _Requirements: 9.1_

  - [ ]* 5.6 Write property test for guest mode restrictions (Property 1)
    - **Property 1: Guest mode restricts all write operations**
    - Create `tests/properties/mayu-hub/guest-mode.property.test.ts`
    - Test that all write hooks (rating, favorite, marketplace, messaging) block operations for guest users
    - **Validates: Requirements 1.6**

- [x] 6. Side drawer and navigation
  - [x] 6.1 Create SideDrawer component
    - Create `src/components/mayu-hub/SideDrawer.tsx`
    - Use shadcn Sheet component, opening from right (RTL)
    - Display user name and phone at top
    - Navigation links: الرئيسية, المفضلة, بيع واشتري, رسائل, متجري, الإعدادات, تسجيل خروج
    - Social media icons at bottom (Facebook, Instagram, WhatsApp)
    - Close on outside tap or swipe
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2_

  - [x] 6.2 Update App.tsx with new navigation structure
    - Replace bottom nav with hamburger menu icon in header triggering SideDrawer
    - Add new view states: 'favorites', 'marketplace', 'messages', 'chat-thread', 'my-store'
    - Replace `OnboardingScreen` with `LoginScreen`
    - Remove `NeighborhoodModal` import and usage
    - Remove `showNeighborhoodModal` state
    - Wire all new views to SideDrawer navigation
    - _Requirements: 2.1, 10.1, 10.2, 10.3_

- [x] 7. Explore filter and banner carousel
  - [x] 7.1 Create ExploreFilter component
    - Create `src/components/mayu-hub/ExploreFilter.tsx`
    - Dropdown labeled "استكشف" with three filter sections: المجاورة, التصنيف, يوصل
    - Neighborhood dropdown from real neighborhoods data
    - Category dropdown from categories data
    - Delivery toggle switch
    - Clear all button
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 7.2 Update BannerCarousel for new requirements
    - Modify `src/components/mayu-hub/BannerCarousel.tsx`
    - Set auto-rotation to 4 seconds (was 5)
    - Add dot indicators for current slide position
    - Ensure swipe navigation works with embla-carousel-react
    - Handle tap on store-linked banners to navigate to store detail
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 7.3 Update ServicesView with ExploreFilter integration
    - Add ExploreFilter above store listings (below banner)
    - Apply `applyExploreFilters` from explore-filter module
    - Remove old neighborhood circle filter chips (replaced by ExploreFilter)
    - Show all 30 stores by default when no filters active
    - _Requirements: 3.1, 3.6, 3.7, 2.2_

- [x] 8. Star rating system
  - [x] 8.1 Create StarRating component
    - Create `src/components/mayu-hub/StarRating.tsx`
    - Display 1-5 stars (filled/empty based on rating)
    - Readonly mode for store cards (display average + count)
    - Interactive mode for store detail (tap to rate)
    - Use lucide-react Star icon
    - Show "سجل دخول للتقييم" for guest users
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 1.6_

  - [x] 8.2 Integrate StarRating into StoreCard and StoreDetail
    - Add StarRating (readonly) to StoreCard showing average and count
    - Add StarRating (interactive) to StoreDetail page
    - Wire useRatings hook for data
    - _Requirements: 5.1, 5.2_

- [x] 9. Favorites/heart system
  - [x] 9.1 Create FavoriteButton component
    - Create `src/components/mayu-hub/FavoriteButton.tsx`
    - Heart icon (lucide-react Heart) - outline when not favorited, filled when favorited
    - Show favorites count below/beside icon
    - Toggle on tap; show login prompt for guests
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 1.6_

  - [x] 9.2 Integrate FavoriteButton into StoreCard
    - Add FavoriteButton to each StoreCard
    - Wire useFavorites hook
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 9.3 Create FavoritesView
    - Create `src/components/mayu-hub/FavoritesView.tsx`
    - Display only stores the user has favorited using StoreCard components
    - Show empty state when no favorites
    - _Requirements: 6.5_

- [x] 10. Marketplace (buy & sell)
  - [x] 10.1 Create MarketplaceView component
    - Create `src/components/mayu-hub/MarketplaceView.tsx`
    - Display list of classified ad cards (title, price, photo thumbnail, date)
    - Category filter dropdown
    - "إضافة إعلان" button (blocked for guests)
    - _Requirements: 7.1, 7.4, 7.6_

  - [x] 10.2 Create MarketplaceForm component
    - Create `src/components/mayu-hub/MarketplaceForm.tsx`
    - Form fields: title, description, price, photo upload (base64), phone, category dropdown
    - Validation: require title, price > 0, phone
    - Show inline errors on invalid submission
    - _Requirements: 7.2, 7.3, 7.7_

- [x] 11. Messaging system
  - [x] 11.1 Create ChatView component (thread list)
    - Create `src/components/mayu-hub/ChatView.tsx`
    - Display all active chat threads with store name, last message preview, timestamp
    - Unread indicator badge on threads with unread messages
    - Empty state when no threads
    - _Requirements: 8.4, 8.6_

  - [x] 11.2 Create ChatThread component
    - Create `src/components/mayu-hub/ChatThread.tsx`
    - Display messages as bubbles (sent = right/blue, received = left/gray)
    - Messages in chronological order with timestamps
    - Text input at bottom for sending new messages
    - Block sending for guest users
    - _Requirements: 8.1, 8.2, 8.3, 1.6_

  - [x] 11.3 Add message button to StoreDetail
    - Add "مراسلة" button to StoreDetail page
    - On tap, navigate to ChatThread for that store
    - _Requirements: 8.1_

- [x] 12. Checkpoint - Features verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Store owner dashboard
  - [x] 13.1 Create StoreDashboard component
    - Create `src/components/mayu-hub/StoreDashboard.tsx`
    - Display stats: total views, favorites count, average rating
    - Display recent activity list (from activity logs)
    - Allow editing store basic info (phone, address, delivery settings)
    - Show "سجل محلك" prompt for non-owners
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 14. Social media links
  - [x] 14.1 Create SocialLinks component
    - Create `src/components/mayu-hub/SocialLinks.tsx`
    - Display Facebook, Instagram, WhatsApp icons as clickable links
    - Open in external browser (target="_blank")
    - Used in StoreDetail for store-specific links
    - _Requirements: 11.2, 11.4_

  - [x] 14.2 Add social link fields to store registration/edit
    - Add optional Facebook, Instagram, WhatsApp URL fields to StoreRegistration form
    - Persist in localStorage under `mayu_hub_store_social`
    - _Requirements: 11.3_

- [x] 15. Enhanced admin panel
  - [x] 15.1 Add new tabs to AdminPanel
    - Add tabs: المتاجر (stores), المستخدمين (users), الإحصائيات (analytics), البانرات (banners), إدارة السوق (marketplace moderation)
    - Use shadcn Tabs component
    - _Requirements: 12.1_

  - [x] 15.2 Implement stores management tab
    - Display pending stores with approve/reject actions
    - Approve changes status to "approved"
    - Reject prompts for reason, changes status to "rejected"
    - _Requirements: 12.2, 12.3, 12.4_

  - [x] 15.3 Implement analytics tab
    - Display total stores count, total users count, average ratings across all stores
    - Compute from localStorage data
    - _Requirements: 12.5_

  - [x] 15.4 Implement banners management tab
    - Add, edit, remove promotional banners
    - Store in localStorage under existing `mayu_hub_banners` key
    - _Requirements: 12.6_

  - [x] 15.5 Implement marketplace moderation tab
    - Display all ads with remove action
    - Admin can remove inappropriate ads
    - _Requirements: 12.7_

- [x] 16. Final integration and cleanup
  - [x] 16.1 Wire all views in App.tsx
    - Ensure all new views (favorites, marketplace, messages, chat-thread, my-store) are rendered based on currentView state
    - Wire SideDrawer navigation to all views
    - Ensure back navigation works from all views
    - Remove old unused imports (demo-data for stores, NeighborhoodModal, PromoPopup if replaced)
    - _Requirements: 10.3, 2.1_

  - [x] 16.2 Update header with hamburger menu
    - Replace current header buttons with hamburger menu icon (Menu from lucide-react)
    - Keep "سجل محلك" button in header
    - Hamburger opens SideDrawer
    - _Requirements: 10.1_

- [x] 17. Final checkpoint - Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties defined in the design document
- The project uses Vitest + fast-check (already configured) for property-based testing
- All UI components use RTL layout with Arabic-first text
- All data persistence uses localStorage (no backend/Supabase needed for new features)
- Guest mode blocks: rating, favoriting, messaging, posting ads
- Real data source: `src/lib/mayu-hub/real-data.ts` with 30 stores


## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2", "3.1", "3.3", "3.5", "3.7", "3.9"] },
    { "id": 2, "tasks": ["3.2", "3.4", "3.6", "3.8", "3.10"] },
    { "id": 3, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6"] },
    { "id": 4, "tasks": ["6.1", "6.2"] },
    { "id": 5, "tasks": ["7.1", "7.2", "7.3"] },
    { "id": 6, "tasks": ["8.1", "8.2", "9.1", "9.2", "9.3"] },
    { "id": 7, "tasks": ["10.1", "10.2", "11.1", "11.2", "11.3"] },
    { "id": 8, "tasks": ["13.1", "14.1", "14.2"] },
    { "id": 9, "tasks": ["15.1", "15.2", "15.3", "15.4", "15.5"] },
    { "id": 10, "tasks": ["16.1", "16.2"] }
  ]
}
```

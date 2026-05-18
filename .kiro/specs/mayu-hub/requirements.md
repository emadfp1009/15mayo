# Requirements Document

## Introduction

مايو هب (Mayu Hub) is a neighborhood services directory PWA serving 15 May City in Egypt. This requirements document covers a comprehensive upgrade: replacing the onboarding flow with phone/OTP login, removing the neighborhood selection modal, adding explore filters, promotional banners, star ratings, favorites, a buy-and-sell marketplace, in-app messaging, store owner dashboards, a side navigation drawer, social media integration, and an enhanced admin panel — all while switching to the real 30-store dataset.

## Glossary

- **App**: The Mayu Hub PWA application
- **User**: Any person using the App, either authenticated or in guest mode
- **Store_Owner**: A User who has registered a store listing in the App
- **Admin**: A User with administrative privileges to manage stores, users, and content
- **Store**: A business listing in the directory with profile information
- **Rating_System**: The component responsible for collecting and computing star ratings
- **Favorites_System**: The component responsible for managing user favorite stores
- **Marketplace**: The buy-and-sell classified ads section of the App
- **Messaging_System**: The in-app messaging component for user-to-store communication
- **Store_Dashboard**: The store owner's management and analytics view
- **Side_Drawer**: The hamburger menu navigation component
- **Banner_Carousel**: The auto-rotating promotional banner component at the top of the services view
- **Explore_Filter**: The dropdown filter component for neighborhood, category, and delivery filtering
- **Login_Screen**: The authentication screen with phone/OTP and guest mode
- **Data_Source**: The real-data.ts file containing 30 real store profiles

## Requirements

### Requirement 1: Phone/OTP Login Screen

**User Story:** As a user, I want to log in with my phone number and OTP verification or continue as a guest, so that I can access the app securely without complex registration.

#### Acceptance Criteria

1. WHEN a user opens the App for the first time, THE Login_Screen SHALL display a phone number input field with Egyptian country code (+20) pre-filled
2. WHEN a user enters a valid Egyptian phone number and submits, THE Login_Screen SHALL send a simulated OTP and display an OTP input field
3. WHEN a user enters the correct OTP, THE Login_Screen SHALL authenticate the user and navigate to the services view
4. WHEN a user enters an incorrect OTP three times, THE Login_Screen SHALL display an error message and allow re-sending the OTP
5. WHEN a user taps the guest mode button, THE Login_Screen SHALL create a temporary guest session and navigate to the services view
6. WHILE a user is in guest mode, THE App SHALL restrict write operations (rating, favoriting, messaging, posting ads) and prompt login

### Requirement 2: Remove Neighborhood Selection Modal

**User Story:** As a user, I want to see all available stores immediately after login, so that I can browse the full directory without an extra selection step.

#### Acceptance Criteria

1. WHEN a user completes login or enters guest mode, THE App SHALL navigate directly to the services view without showing a neighborhood selection modal
2. THE App SHALL display all 30 stores from the Data_Source on the services view by default
3. WHEN the App loads store data, THE App SHALL use real-data.ts as the primary Data_Source instead of demo-data.ts

### Requirement 3: Explore Filter

**User Story:** As a user, I want to filter stores by neighborhood, category, or delivery availability, so that I can quickly find relevant services.

#### Acceptance Criteria

1. THE Explore_Filter SHALL appear at the top of the services view as a dropdown labeled "استكشف"
2. WHEN a user opens the Explore_Filter, THE Explore_Filter SHALL display three filter options: المجاورة (neighborhood), التصنيف (category), يوصل (delivers)
3. WHEN a user selects a neighborhood filter, THE App SHALL display only stores belonging to that neighborhood
4. WHEN a user selects a category filter, THE App SHALL display only stores matching that category
5. WHEN a user toggles the delivery filter, THE App SHALL display only stores that offer delivery
6. WHEN multiple filters are active simultaneously, THE App SHALL display stores matching all active filter criteria (AND logic)
7. WHEN a user clears all filters, THE App SHALL display all 30 stores from the Data_Source

### Requirement 4: Banner Carousel

**User Story:** As a user, I want to see promotional banners for featured stores and offers, so that I can discover deals and new services.

#### Acceptance Criteria

1. THE Banner_Carousel SHALL appear at the top of the services view above the store listings
2. THE Banner_Carousel SHALL auto-rotate between banner slides every 4 seconds
3. WHEN a user swipes the Banner_Carousel, THE Banner_Carousel SHALL navigate to the next or previous slide
4. WHEN a user taps a banner linked to a store, THE App SHALL navigate to that store's detail page
5. THE Banner_Carousel SHALL display dot indicators showing the current slide position
6. THE Banner_Carousel SHALL use embla-carousel-react for carousel functionality

### Requirement 5: Star Rating

**User Story:** As a user, I want to rate stores with 1-5 stars and see average ratings, so that I can share my experience and make informed choices.

#### Acceptance Criteria

1. WHEN a user views a store card, THE App SHALL display the store's average star rating (1-5) and total number of ratings
2. WHEN a user views a store detail page, THE App SHALL display the average rating and allow the user to submit a rating
3. WHEN a user submits a star rating, THE Rating_System SHALL persist the rating in localStorage and recalculate the store's average
4. WHEN a user has already rated a store, THE Rating_System SHALL display the user's previous rating and allow updating it
5. THE Rating_System SHALL compute the average rating as the arithmetic mean of all ratings for that store, rounded to one decimal place

### Requirement 6: Heart/Favorite

**User Story:** As a user, I want to favorite stores and view my favorites, so that I can quickly access stores I prefer.

#### Acceptance Criteria

1. WHEN a user views a store card, THE App SHALL display a heart icon button for favoriting
2. WHEN a user taps the heart icon, THE Favorites_System SHALL toggle the favorite state and persist it in localStorage
3. WHEN a store is favorited, THE App SHALL display a filled heart icon on that store's card
4. THE App SHALL display the total favorites count on each store card
5. WHEN a user navigates to the favorites section, THE App SHALL display only stores the user has favorited
6. THE Favorites_System SHALL persist all favorite data in localStorage keyed by user ID

### Requirement 7: Buy and Sell Marketplace

**User Story:** As a user, I want to post items for sale and browse classified ads, so that I can buy and sell within my community.

#### Acceptance Criteria

1. WHEN a user navigates to the Marketplace section, THE App SHALL display a list of classified ad cards
2. WHEN a user taps "إضافة إعلان" (Add Ad), THE Marketplace SHALL display a form with fields: title, description, price, photo upload, phone number, and category
3. WHEN a user submits a valid ad form, THE Marketplace SHALL create the ad and add it to the listings
4. WHEN a user selects a category filter in the Marketplace, THE Marketplace SHALL display only ads matching that category
5. THE Marketplace SHALL persist all ad data in localStorage
6. WHEN a user views an ad card, THE Marketplace SHALL display the title, price, photo thumbnail, and posting date
7. IF a user attempts to post an ad without a title or price, THEN THE Marketplace SHALL display validation errors and prevent submission

### Requirement 8: In-App Messaging

**User Story:** As a user, I want to send messages to store owners, so that I can inquire about products or services directly within the app.

#### Acceptance Criteria

1. WHEN a user taps "مراسلة" (Message) on a store detail page, THE Messaging_System SHALL open a chat thread with that store
2. WHEN a user sends a message, THE Messaging_System SHALL display it as a sent bubble in the chat thread
3. THE Messaging_System SHALL display messages in chronological order with timestamps
4. WHEN a user navigates to the messages section, THE Messaging_System SHALL display a list of all active chat threads
5. THE Messaging_System SHALL persist all message data in localStorage
6. WHEN a new message is received in a thread, THE Messaging_System SHALL display an unread indicator on the messages section

### Requirement 9: Store Owner Dashboard

**User Story:** As a store owner, I want to see my store's performance stats and manage my listing, so that I can understand my reach and keep my information current.

#### Acceptance Criteria

1. WHEN a Store_Owner navigates to "متجري" (My Store), THE Store_Dashboard SHALL display the store's total views, favorites count, and average rating
2. WHEN a Store_Owner views the dashboard, THE Store_Dashboard SHALL display a list of recent activity (views, ratings) for their store
3. THE Store_Dashboard SHALL allow the Store_Owner to edit their store's basic information (phone, address, delivery settings)
4. IF a user who is not a Store_Owner navigates to "متجري", THEN THE App SHALL display a prompt to register a store

### Requirement 10: Side Navigation Drawer

**User Story:** As a user, I want a side menu with all navigation options, so that I can access all app sections from one place.

#### Acceptance Criteria

1. WHEN a user taps the hamburger menu icon, THE Side_Drawer SHALL slide in from the right side (RTL layout)
2. THE Side_Drawer SHALL display navigation links: الرئيسية, المفضلة, بيع واشتري, رسائل, متجري, الإعدادات, تسجيل خروج
3. WHEN a user taps a navigation link in the Side_Drawer, THE App SHALL navigate to the corresponding section and close the drawer
4. WHEN a user taps outside the Side_Drawer or swipes it closed, THE Side_Drawer SHALL close with an animation
5. THE Side_Drawer SHALL display the user's name and phone number at the top

### Requirement 11: Social Media Links

**User Story:** As a user, I want to access the app's social media pages and see store social links, so that I can stay connected with the community and individual stores.

#### Acceptance Criteria

1. THE Side_Drawer SHALL display social media icons (Facebook, Instagram, WhatsApp) linking to the app's official pages
2. WHEN a user taps a social media icon, THE App SHALL open the corresponding social media page in an external browser
3. WHEN a Store_Owner registers or edits a store, THE App SHALL provide optional fields for Facebook, Instagram, and WhatsApp links
4. WHEN a user views a store detail page with social links, THE App SHALL display clickable social media icons for that store

### Requirement 12: Enhanced Admin Panel

**User Story:** As an admin, I want comprehensive management tools, so that I can approve stores, manage users, view analytics, manage banners, and moderate marketplace content.

#### Acceptance Criteria

1. WHEN an Admin navigates to the admin panel, THE App SHALL display tabs for: stores, users, analytics, banners, and marketplace moderation
2. WHEN an Admin views the stores tab, THE App SHALL display pending store registrations with approve/reject actions
3. WHEN an Admin approves a store, THE App SHALL change the store status to "approved" and make it visible in the directory
4. WHEN an Admin rejects a store, THE App SHALL prompt for a rejection reason and change the store status to "rejected"
5. WHEN an Admin views the analytics tab, THE App SHALL display total stores count, total users count, and average ratings across all stores
6. WHEN an Admin views the banners tab, THE App SHALL allow adding, editing, and removing promotional banners
7. WHEN an Admin views the marketplace moderation tab, THE App SHALL display reported or flagged ads with remove actions

### Requirement 13: Use Real Data Source

**User Story:** As a developer, I want the app to use real-data.ts as the primary data source, so that the app displays actual store information for 15 May City.

#### Acceptance Criteria

1. THE App SHALL import and use the realStores array from real-data.ts as the primary store data source
2. THE App SHALL display all 30 stores from real-data.ts in the services view
3. WHEN the App references store data for any feature (ratings, favorites, search, filters), THE App SHALL operate on the real-data.ts dataset

# Requirements Document

## Introduction

Mayu Hub is a service-oriented, geographic, and commercial application dedicated to 15 May City (مدينة 15 مايو). The application connects residents with commercial and community services based on their residential neighborhood (مجاورة سكنية). The city is divided into 36 neighborhoods, and the app provides two main service categories: dynamic commercial services (shops, pharmacies, supermarkets, etc.) and static community/government services (schools, hospitals, post offices, etc.). The goal is to facilitate access to local information, enable direct ordering, and support local commerce.

## Glossary

- **Mayu_Hub**: The main application system that serves as a local services directory for 15 May City
- **Neighborhood**: One of the 36 residential areas (مجاورات) that divide 15 May City geographically
- **Neighborhood_Circle**: The set of neighborhoods consisting of a resident's primary neighborhood plus 4-6 geographically surrounding neighborhoods that share a boundary
- **Resident**: A registered user of the application who lives in 15 May City
- **Store_Profile**: A commercial service provider's page containing business information, contact details, and operational status
- **Service_Provider**: A business or shop owner who registers their commercial service on the platform
- **Community_Service**: A static government or community facility (school, hospital, post office, etc.)
- **Status_Indicator**: A visual element showing whether a store is currently open or closed
- **Admin_Panel**: The administrative control interface for managing stores, neighborhoods, and approvals
- **Premium_Listing**: A paid subscription tier that provides enhanced visibility in search results
- **Banner_Ad**: A paid advertising space displayed at the top of the application interface
- **Search_Engine**: The filtered search component that allows finding services by name or neighborhood

## Requirements

### Requirement 1: Neighborhood Selection on Registration

**User Story:** As a Resident, I want to select my primary neighborhood during registration, so that the app can show me relevant nearby services.

#### Acceptance Criteria

1. WHEN a Resident registers for the first time, THE Mayu_Hub SHALL display a list of all 36 neighborhoods in Arabic, allowing exactly one neighborhood to be selected as the primary neighborhood
2. WHEN a Resident selects a primary neighborhood and confirms registration, THE Mayu_Hub SHALL store the selected neighborhood as the Resident's home neighborhood and display a confirmation indicating the neighborhood was saved successfully
3. THE Mayu_Hub SHALL allow a Resident to change their primary neighborhood from their profile settings at any time
4. WHEN a Resident changes their primary neighborhood from profile settings, THE Mayu_Hub SHALL update the stored home neighborhood and refresh the displayed services to reflect the newly selected neighborhood within 3 seconds
5. IF a Resident attempts to register without selecting a neighborhood, THEN THE Mayu_Hub SHALL display a validation error indicating that neighborhood selection is required and SHALL prevent registration from completing

### Requirement 2: Neighborhood Circle Display

**User Story:** As a Resident, I want to see services from my neighborhood and surrounding neighborhoods automatically, so that I can discover all accessible services near me.

#### Acceptance Criteria

1. WHEN a Resident opens the app and has a primary neighborhood assigned, THE Mayu_Hub SHALL display a scrollable list of services from the Resident's Neighborhood_Circle, sorted by neighborhood proximity (primary neighborhood first, then adjacent neighborhoods)
2. THE Mayu_Hub SHALL compute the Neighborhood_Circle as the Resident's primary neighborhood plus all neighborhoods that share a geographic boundary with it in the city's 36-neighborhood adjacency map, resulting in 4 to 6 adjacent neighborhoods depending on the Resident's location
3. THE Mayu_Hub SHALL display the neighborhoods in the Neighborhood_Circle as quick-access filter options at the top of the services view, including an "All" option that shows services from the entire Neighborhood_Circle
4. WHEN a Resident selects a specific neighborhood from the quick-access options, THE Mayu_Hub SHALL filter the displayed services to show only services from that selected neighborhood
5. IF a Resident has no primary neighborhood assigned, THEN THE Mayu_Hub SHALL prompt the Resident to select their neighborhood before displaying services
6. IF no services are available in the selected neighborhood filter, THEN THE Mayu_Hub SHALL display an empty-state message indicating that no services are currently available in that neighborhood

### Requirement 3: Service Search and Filtering

**User Story:** As a Resident, I want to search for services by name or filter by neighborhood, so that I can quickly find what I need.

#### Acceptance Criteria

1. WHEN a Resident enters at least 2 characters in the Search_Engine, THE Mayu_Hub SHALL return up to 20 matching services within the Neighborhood_Circle, sorted by exact name match first, then partial name match, within 2 seconds
2. WHEN a Resident applies a neighborhood filter, THE Mayu_Hub SHALL restrict search results to the selected neighborhood
3. WHEN a Resident selects a service category, THE Search_Engine SHALL filter results to display only services belonging to that category
4. WHEN no results match the search query, THE Mayu_Hub SHALL display a message indicating no services were found and suggest removing active filters or searching in adjacent neighborhoods
5. WHEN a Resident applies multiple filters (text query, category, and neighborhood), THE Mayu_Hub SHALL combine all active filters using AND logic, returning only services that satisfy every active filter simultaneously

### Requirement 4: Store Profile Creation and Display

**User Story:** As a Service_Provider, I want to create a store profile with my business details, so that residents can find and contact me.

#### Acceptance Criteria

1. THE Store_Profile SHALL display the store logo (maximum file size 5 MB) and storefront photo (maximum file size 5 MB) as visual identity
2. THE Store_Profile SHALL provide a direct phone call button that initiates a phone call to the store's registered phone number
3. THE Store_Profile SHALL provide a direct WhatsApp button that opens WhatsApp using a deep link with a pre-filled welcome message configured by the Service_Provider (maximum 256 characters)
4. THE Store_Profile SHALL display working hours as opening and closing times for each day of the week
5. IF a Service_Provider indicates that the store offers delivery, THEN THE Store_Profile SHALL display delivery specifications including delivery cost in Egyptian Pounds, available delivery neighborhoods selected from the 36 neighborhoods list, and estimated delivery duration in minutes
6. WHEN a Service_Provider registers a new store, THE Mayu_Hub SHALL require the Service_Provider to specify the neighborhood where the store is located
7. WHEN a Service_Provider submits a new Store_Profile, THE Mayu_Hub SHALL require the store name, phone number, neighborhood, and working hours as mandatory fields, and treat logo, storefront photo, WhatsApp number, and delivery specifications as optional fields
8. IF a Service_Provider does not upload a store logo, THEN THE Store_Profile SHALL display a default placeholder image in place of the logo

### Requirement 5: Store Status Indicator

**User Story:** As a Resident, I want to see whether a store is currently open or closed, so that I know if I can visit or order now.

#### Acceptance Criteria

1. THE Status_Indicator SHALL display "open" or "closed" status for each Store_Profile
2. THE Mayu_Hub SHALL compute the Status_Indicator by comparing the store's configured working hours against the current time in the store's configured timezone, and SHALL update the displayed status within 60 seconds of a scheduled opening or closing time
3. WHEN a Service_Provider manually overrides the status, THE Mayu_Hub SHALL display the manually set status instead of the computed status until the Service_Provider removes the override or until the next scheduled opening or closing transition, whichever comes first
4. WHILE the Status_Indicator shows "closed", THE Store_Profile SHALL remain visible and SHALL display a "Closed" label distinguishable from the open state
5. IF a Store_Profile has no configured working hours, THEN THE Status_Indicator SHALL display "closed" by default until the Service_Provider sets working hours or manually overrides the status to "open"

### Requirement 6: Community and Government Services Directory

**User Story:** As a Resident, I want to browse a directory of community and government services in my area, so that I can find schools, hospitals, and public offices.

#### Acceptance Criteria

1. THE Mayu_Hub SHALL display a directory of Community_Service entries organized by neighborhood, showing a list of entries grouped under their respective neighborhood name
2. THE Mayu_Hub SHALL categorize Community_Service entries by type (schools, post offices, youth centers, mosques, churches, hospitals, police stations, civil registry, gas offices, electricity offices)
3. WHEN a Resident views a Community_Service entry, THE Mayu_Hub SHALL display the service name, address, phone number, and neighborhood, omitting any field that has no value rather than showing empty or placeholder text
4. THE Mayu_Hub SHALL label each school entry with its school type (government, experimental, or private) as a visible text indicator within the schools category listing
5. WHEN a Resident filters Community_Service entries by neighborhood, THE Mayu_Hub SHALL display only services located in the selected neighborhood
6. WHEN a Resident filters Community_Service entries by service type, THE Mayu_Hub SHALL display only services matching the selected type
7. IF a Resident applies a filter that matches no Community_Service entries, THEN THE Mayu_Hub SHALL display a message indicating that no services were found for the selected filter criteria
8. WHEN a Resident selects a neighborhood filter, THE Mayu_Hub SHALL also allow filtering by service type within that neighborhood, and vice versa

### Requirement 7: Premium Listing Subscription

**User Story:** As a Service_Provider, I want to subscribe to a premium listing, so that my store appears at the top of search results and I can post special offers.

#### Acceptance Criteria

1. THE Mayu_Hub SHALL offer a free basic registration tier for all Service_Provider accounts
2. WHERE a Service_Provider subscribes to a Premium_Listing, THE Mayu_Hub SHALL display the store above all non-premium stores in search results, ordered by subscription start date among multiple premium stores
3. WHERE a Service_Provider subscribes to a Premium_Listing, THE Mayu_Hub SHALL allow the Service_Provider to publish up to 5 active special offers at a time, each visible to Residents for a duration specified by the Service_Provider up to a maximum of 30 days
4. THE Mayu_Hub SHALL distinguish promoted results from organic results by displaying a visible "Premium" label on each promoted store listing in the search interface
5. IF a Premium_Listing subscription expires or is cancelled, THEN THE Mayu_Hub SHALL revert the store to the free basic tier within 24 hours, removing promoted positioning and hiding any active special offers from Residents

### Requirement 8: Banner Advertising

**User Story:** As an advertiser, I want to place banner ads in the app, so that I can promote my business to local residents.

#### Acceptance Criteria

1. THE Mayu_Hub SHALL display a maximum of 5 Banner_Ad slots at the top of the main services view, rotating between active banners every 5 seconds if more than one active Banner_Ad exists
2. THE Admin_Panel SHALL allow administrators to create, schedule, and remove Banner_Ad placements, requiring at minimum a banner image, a target link (Store_Profile or external URL), a start date, and an end date for each placement
3. WHEN a Resident taps on a Banner_Ad, THE Mayu_Hub SHALL navigate to the advertiser's Store_Profile or open the configured external link in the device's default browser
4. IF no active Banner_Ad placements exist for the current date, THEN THE Mayu_Hub SHALL hide the banner section entirely from the main services view
5. IF a Banner_Ad's scheduled end date has passed, THEN THE Admin_Panel SHALL automatically remove the Banner_Ad from the active rotation without requiring manual administrator action

### Requirement 9: Admin Panel for Store and Neighborhood Management

**User Story:** As an administrator, I want to manage stores and neighborhoods through a control panel, so that I can maintain data quality and approve new registrations.

#### Acceptance Criteria

1. THE Admin_Panel SHALL allow administrators to add, edit, and deactivate Store_Profile entries, where deactivating a Store_Profile removes it from Resident-facing search results and directory views
2. THE Admin_Panel SHALL allow administrators to add and edit neighborhood data including name and geographic adjacency relationships for each of the 36 neighborhoods
3. WHEN a Service_Provider submits a new Store_Profile, THE Admin_Panel SHALL place the submission in a pending approval queue and THE Mayu_Hub SHALL display a pending status indicator to the Service_Provider
4. WHEN an administrator approves a pending Store_Profile submission, THE Mayu_Hub SHALL make the Store_Profile visible to Residents in search results and notify the Service_Provider that their submission has been approved
5. IF an administrator rejects a Store_Profile submission, THEN THE Admin_Panel SHALL require the administrator to provide a rejection reason of at least 10 characters, and THE Mayu_Hub SHALL notify the Service_Provider with the rejection reason
6. THE Admin_Panel SHALL display the pending approval queue sorted by submission date, showing the store name, neighborhood, and submission timestamp for each entry

### Requirement 10: Phased Neighborhood Rollout

**User Story:** As an administrator, I want to launch the app with a subset of neighborhoods and expand gradually, so that I can validate the concept before full deployment.

#### Acceptance Criteria

1. THE Admin_Panel SHALL allow administrators to mark neighborhoods as active or inactive
2. WHILE a neighborhood is marked as inactive, THE Mayu_Hub SHALL exclude that neighborhood from search results and the Neighborhood_Circle computation
3. THE Mayu_Hub SHALL launch with 5 to 6 active neighborhoods as the initial deployment
4. WHEN an administrator activates a new neighborhood, THE Mayu_Hub SHALL immediately include that neighborhood in relevant Neighborhood_Circle computations for adjacent active neighborhoods

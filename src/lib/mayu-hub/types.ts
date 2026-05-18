// Mayu Hub Type Definitions
// Placeholder - will be fully implemented in Task 1.2

export interface Neighborhood {
  id: string;
  nameAr: string;
  number: number;
  isActive: boolean;
}

export interface StoreProfile {
  id: string;
  ownerId: string;
  neighborhoodId: string;
  nameAr: string;
  phone: string;
  whatsappNumber: string | null;
  whatsappMessage: string | null;
  logoUrl: string | null;
  storefrontPhotoUrl: string | null;
  categoryId: string | null;
  address: string | null;
  isPremium: boolean;
  premiumStartedAt: string | null;
  premiumExpiresAt: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'deactivated';
  rejectionReason: string | null;
  delivers: boolean;
  deliveryCostEgp: number | null;
  deliveryDurationMinutes: number | null;
  manualStatusOverride: 'open' | 'closed' | null;
  manualStatusOverrideUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHours {
  id: string;
  storeId: string;
  dayOfWeek: number; // 0-6
  openTime: string;  // "HH:mm"
  closeTime: string; // "HH:mm"
  isClosed: boolean;
}

export interface StoreStatusOverride {
  status: 'open' | 'closed';
  until: Date | null;
}

export interface SearchFilters {
  query: string;
  circleNeighborhoodIds: string[];
  categoryId: string | null;
  neighborhoodId: string | null;
}

export interface BannerAd {
  id: string;
  imageUrl: string;
  targetType: 'store' | 'external';
  targetStoreId: string | null;
  targetUrl: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CommunityService {
  id: string;
  neighborhoodId: string;
  nameAr: string;
  type: CommunityServiceType;
  schoolType: 'government' | 'experimental' | 'private' | null;
  address: string | null;
  phone: string | null;
}

export type CommunityServiceType =
  | 'school' | 'post_office' | 'youth_center' | 'mosque' | 'church'
  | 'hospital' | 'police_station' | 'civil_registry' | 'gas_office'
  | 'electricity_office';

export interface SpecialOffer {
  id: string;
  storeId: string;
  titleAr: string;
  descriptionAr: string | null;
  imageUrl: string | null;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface WorkingHoursInput {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface StoreProfileInput {
  nameAr: string;
  phone: string;
  neighborhoodId: string;
  workingHours: WorkingHoursInput[];
  whatsappNumber?: string;
  whatsappMessage?: string;
  logoFile?: File;
  storefrontPhotoFile?: File;
  categoryId?: string;
  delivers?: boolean;
  deliveryCostEgp?: number;
  deliveryDurationMinutes?: number;
  deliveryNeighborhoodIds?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface ServiceCategory {
  id: string;
  nameAr: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

// === Ratings ===
export interface StoreRatings {
  [storeId: string]: {
    [userId: string]: number; // 1-5
  };
}

// === Favorites ===
export interface UserFavorites {
  [userId: string]: string[]; // array of storeId
}

// === Marketplace ===
export type MarketplaceCategory =
  | 'electronics' | 'furniture' | 'vehicles' | 'clothing'
  | 'home_appliances' | 'sports' | 'books' | 'other';

export interface ClassifiedAd {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  price: number;
  photoUrl: string | null;
  phone: string;
  category: MarketplaceCategory;
  createdAt: string;
  isActive: boolean;
}

export interface ClassifiedAdInput {
  title: string;
  description: string;
  price: number;
  photoUrl: string | null;
  phone: string;
  category: MarketplaceCategory;
}

// === Messaging ===
export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatThread {
  id: string;
  userId: string;
  storeId: string;
  storeName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

// === Store Views ===
export interface StoreViews {
  [storeId: string]: number;
}

// === Social Links ===
export interface StoreSocialLinks {
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
}

// === Guest User ===
export interface GuestSession {
  id: string;
  isGuest: true;
  createdAt: string;
}

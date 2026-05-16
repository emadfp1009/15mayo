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

/**
 * localStorage Data Access Module
 * Typed read/write helpers for all Mayu Hub localStorage keys.
 * Includes safe JSON parsing with fallback defaults.
 */

import type {
  StoreRatings,
  UserFavorites,
  ClassifiedAd,
  ChatMessage,
  ChatThread,
  StoreViews,
  StoreSocialLinks,
} from './types';

// === localStorage Keys ===
export const STORAGE_KEYS = {
  RATINGS: 'mayu_hub_ratings',
  FAVORITES: 'mayu_hub_favorites',
  MARKETPLACE: 'mayu_hub_marketplace',
  MESSAGES: 'mayu_hub_messages',
  THREADS: 'mayu_hub_threads',
  STORE_VIEWS: 'mayu_hub_store_views',
  STORE_SOCIAL: 'mayu_hub_store_social',
} as const;

// === Generic Safe Get/Set Helpers ===

/**
 * Safely read and parse JSON from localStorage.
 * Returns the fallback value if the key doesn't exist or parsing fails.
 */
export function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely write a value as JSON to localStorage.
 */
export function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[mayu-hub] Failed to write to localStorage key "${key}":`, error);
  }
}

// === Ratings ===

export function getRatings(): StoreRatings {
  return safeGet<StoreRatings>(STORAGE_KEYS.RATINGS, {});
}

export function setRatings(data: StoreRatings): void {
  safeSet(STORAGE_KEYS.RATINGS, data);
}

// === Favorites ===

export function getFavorites(): UserFavorites {
  return safeGet<UserFavorites>(STORAGE_KEYS.FAVORITES, {});
}

export function setFavorites(data: UserFavorites): void {
  safeSet(STORAGE_KEYS.FAVORITES, data);
}

// === Marketplace ===

export function getMarketplace(): ClassifiedAd[] {
  return safeGet<ClassifiedAd[]>(STORAGE_KEYS.MARKETPLACE, []);
}

export function setMarketplace(data: ClassifiedAd[]): void {
  safeSet(STORAGE_KEYS.MARKETPLACE, data);
}

// === Messages ===

export function getMessages(): Record<string, ChatMessage[]> {
  return safeGet<Record<string, ChatMessage[]>>(STORAGE_KEYS.MESSAGES, {});
}

export function setMessages(data: Record<string, ChatMessage[]>): void {
  safeSet(STORAGE_KEYS.MESSAGES, data);
}

// === Threads ===

export function getThreads(): ChatThread[] {
  return safeGet<ChatThread[]>(STORAGE_KEYS.THREADS, []);
}

export function setThreads(data: ChatThread[]): void {
  safeSet(STORAGE_KEYS.THREADS, data);
}

// === Store Views ===

export function getStoreViews(): StoreViews {
  return safeGet<StoreViews>(STORAGE_KEYS.STORE_VIEWS, {});
}

export function setStoreViews(data: StoreViews): void {
  safeSet(STORAGE_KEYS.STORE_VIEWS, data);
}

// === Store Social Links ===

export function getStoreSocial(): Record<string, StoreSocialLinks> {
  return safeGet<Record<string, StoreSocialLinks>>(STORAGE_KEYS.STORE_SOCIAL, {});
}

export function setStoreSocial(data: Record<string, StoreSocialLinks>): void {
  safeSet(STORAGE_KEYS.STORE_SOCIAL, data);
}

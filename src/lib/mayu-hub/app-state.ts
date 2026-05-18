/**
 * App State Management
 * Central state for the app using localStorage
 */

import type { StoreProfile } from './types'

// ============================================
// Favorites (Hearts)
// ============================================
const FAVORITES_KEY = 'mayu_hub_favorites'

export function getFavorites(): string[] {
  const data = localStorage.getItem(FAVORITES_KEY)
  return data ? JSON.parse(data) : []
}

export function toggleFavorite(storeId: string): boolean {
  const favs = getFavorites()
  const idx = favs.indexOf(storeId)
  if (idx >= 0) {
    favs.splice(idx, 1)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
    return false // removed
  } else {
    favs.push(storeId)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
    return true // added
  }
}

export function isFavorite(storeId: string): boolean {
  return getFavorites().includes(storeId)
}

// ============================================
// Ratings
// ============================================
const RATINGS_KEY = 'mayu_hub_ratings'

interface RatingEntry {
  storeId: string
  userId: string
  rating: number
}

export function getRatings(): RatingEntry[] {
  const data = localStorage.getItem(RATINGS_KEY)
  return data ? JSON.parse(data) : []
}

export function rateStore(storeId: string, userId: string, rating: number): void {
  const ratings = getRatings()
  const existing = ratings.findIndex(r => r.storeId === storeId && r.userId === userId)
  if (existing >= 0) {
    ratings[existing].rating = rating
  } else {
    ratings.push({ storeId, userId, rating })
  }
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings))
}

export function getStoreRating(storeId: string): { average: number; count: number } {
  const ratings = getRatings().filter(r => r.storeId === storeId)
  if (ratings.length === 0) return { average: 0, count: 0 }
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0)
  return { average: sum / ratings.length, count: ratings.length }
}

// ============================================
// Marketplace (Buy & Sell)
// ============================================
const MARKETPLACE_KEY = 'mayu_hub_marketplace'

export interface MarketplaceItem {
  id: string
  sellerId: string
  sellerName: string
  title: string
  description: string
  price: number
  condition: 'new' | 'used' | 'like_new'
  images: string[]
  status: 'pending' | 'approved' | 'sold' | 'deleted'
  soldTo?: string
  soldPrice?: number
  deleteReason?: string
  createdAt: string
}

export function getMarketplaceItems(): MarketplaceItem[] {
  const data = localStorage.getItem(MARKETPLACE_KEY)
  return data ? JSON.parse(data) : []
}

export function addMarketplaceItem(item: Omit<MarketplaceItem, 'id' | 'status' | 'createdAt'>): MarketplaceItem {
  const items = getMarketplaceItems()
  const newItem: MarketplaceItem = {
    ...item,
    id: `item-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  items.push(newItem)
  localStorage.setItem(MARKETPLACE_KEY, JSON.stringify(items))
  return newItem
}

export function updateMarketplaceItem(id: string, updates: Partial<MarketplaceItem>): void {
  const items = getMarketplaceItems()
  const idx = items.findIndex(i => i.id === id)
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...updates }
    localStorage.setItem(MARKETPLACE_KEY, JSON.stringify(items))
  }
}

// ============================================
// Messages
// ============================================
const MESSAGES_KEY = 'mayu_hub_messages'

export interface Message {
  id: string
  itemId: string
  senderId: string
  senderName: string
  receiverId: string
  text: string
  timestamp: string
}

export function getMessages(itemId: string): Message[] {
  const data = localStorage.getItem(MESSAGES_KEY)
  const all: Message[] = data ? JSON.parse(data) : []
  return all.filter(m => m.itemId === itemId)
}

export function sendMessage(msg: Omit<Message, 'id' | 'timestamp'>): Message {
  const data = localStorage.getItem(MESSAGES_KEY)
  const all: Message[] = data ? JSON.parse(data) : []
  const newMsg: Message = {
    ...msg,
    id: `msg-${Date.now()}`,
    timestamp: new Date().toISOString(),
  }
  all.push(newMsg)
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(all))
  return newMsg
}

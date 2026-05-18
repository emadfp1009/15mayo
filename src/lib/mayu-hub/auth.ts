/**
 * Local Authentication System
 * PIN-based auth with localStorage persistence
 */

export interface UserProfile {
  id: string
  name: string
  username: string
  phone: string
  pin: string
  neighborhoodId: string
  isAdmin: boolean
  isGuest?: boolean
  createdAt: string
}

export interface ActivityLog {
  id: string
  userId: string
  userName: string
  action: string // 'call_store' | 'whatsapp_store' | 'view_store' | 'register_store'
  targetId?: string
  targetName?: string
  timestamp: string
}

const USERS_KEY = 'mayu_hub_users'
const CURRENT_USER_KEY = 'mayu_hub_current_user'
const ACTIVITY_LOG_KEY = 'mayu_hub_activity_log'
const ADMIN_PHONE = '01206777762'
const ADMIN_PIN = '1009'

// ============================================
// User Management
// ============================================

export function getUsers(): UserProfile[] {
  const data = localStorage.getItem(USERS_KEY)
  if (!data) {
    // Seed admin user
    const admin: UserProfile = {
      id: 'admin-1',
      name: 'Admin',
      username: 'admin',
      phone: ADMIN_PHONE,
      pin: ADMIN_PIN,
      neighborhoodId: 'neighborhood-1',
      isAdmin: true,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(USERS_KEY, JSON.stringify([admin]))
    return [admin]
  }
  return JSON.parse(data)
}

export function findUserByPhone(phone: string): UserProfile | null {
  const users = getUsers()
  return users.find(u => u.phone === phone) ?? null
}

export function findUserByUsername(username: string): UserProfile | null {
  const users = getUsers()
  return users.find(u => u.username?.toLowerCase() === username.toLowerCase()) ?? null
}

export function findUserByPhoneOrUsername(identifier: string): UserProfile | null {
  return findUserByPhone(identifier) ?? findUserByUsername(identifier) ?? null
}

export function registerUser(data: { name: string; username: string; phone: string; pin: string; neighborhoodId: string }): UserProfile {
  const users = getUsers()

  // Check if phone already exists
  if (users.find(u => u.phone === data.phone)) {
    throw new Error('رقم الهاتف مسجل بالفعل')
  }

  // Check if username already exists
  if (users.find(u => u.username?.toLowerCase() === data.username.toLowerCase())) {
    throw new Error('اسم المستخدم مسجل بالفعل')
  }

  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    name: data.name,
    username: data.username,
    phone: data.phone,
    pin: data.pin,
    neighborhoodId: data.neighborhoodId,
    isAdmin: data.phone === ADMIN_PHONE,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  return newUser
}

export function verifyPin(phone: string, pin: string): UserProfile | null {
  const user = findUserByPhoneOrUsername(phone)
  if (!user) return null
  if (user.pin !== pin) return null
  return user
}

export function changePin(userId: string, newPin: string): boolean {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return false
  users[idx].pin = newPin
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  return true
}

export function updateUserNeighborhood(userId: string, neighborhoodId: string): boolean {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return false
  users[idx].neighborhoodId = neighborhoodId
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  return true
}

// ============================================
// Session Management
// ============================================

export function setCurrentUser(user: UserProfile): void {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

export function getCurrentUser(): UserProfile | null {
  const data = localStorage.getItem(CURRENT_USER_KEY)
  if (!data) return null
  return JSON.parse(data)
}

export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY)
}

// ============================================
// Guest Sessions
// ============================================

export function createGuestSession(): UserProfile {
  const guest: UserProfile = {
    id: `guest-${Date.now()}`,
    name: 'زائر',
    username: '',
    phone: '',
    pin: '',
    neighborhoodId: '',
    isAdmin: false,
    isGuest: true,
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(guest))
  return guest
}

export function isGuestUser(user: UserProfile): boolean {
  return user.isGuest === true
}

// ============================================
// Activity Log
// ============================================

export function logActivity(entry: Omit<ActivityLog, 'id' | 'timestamp'>): void {
  const logs = getActivityLogs()
  logs.push({
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  })
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs))
}

export function getActivityLogs(): ActivityLog[] {
  const data = localStorage.getItem(ACTIVITY_LOG_KEY)
  if (!data) return []
  return JSON.parse(data)
}

export function getUserActivityLogs(userId: string): ActivityLog[] {
  return getActivityLogs().filter(log => log.userId === userId)
}

export function getStoreActivityLogs(storeId: string): ActivityLog[] {
  return getActivityLogs().filter(log => log.targetId === storeId)
}

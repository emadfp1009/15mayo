/**
 * App Settings - Admin configurable
 * Stored in localStorage, editable from admin panel
 */

export interface AppSettings {
  // Colors
  primaryColor: string
  accentColor: string

  // Login screen
  loginBackgroundUrl: string
  loginLogoUrl: string

  // Banner
  bannerRotationSeconds: number
  maxBanners: number
}

const SETTINGS_KEY = 'mayu_hub_settings'

const defaultSettings: AppSettings = {
  primaryColor: '#2563eb',
  accentColor: '#1e40af',
  loginBackgroundUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80',
  loginLogoUrl: '',
  bannerRotationSeconds: 3,
  maxBanners: 6,
}

export function getSettings(): AppSettings {
  const data = localStorage.getItem(SETTINGS_KEY)
  if (!data) return defaultSettings
  return { ...defaultSettings, ...JSON.parse(data) }
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  const current = getSettings()
  const updated = { ...current, ...partial }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
  return updated
}

export function resetSettings(): AppSettings {
  localStorage.removeItem(SETTINGS_KEY)
  return defaultSettings
}

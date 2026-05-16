/**
 * Supabase Client Configuration
 * 
 * Add your Supabase credentials in .env:
 * VITE_SUPABASE_URL=https://your-project.supabase.co
 * VITE_SUPABASE_ANON_KEY=your-anon-key
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return (
    import.meta.env.VITE_SUPABASE_URL !== undefined &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== undefined &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== 'placeholder-key'
  )
}

// ============================================
// Database Queries
// ============================================

export async function fetchNeighborhoods() {
  const { data, error } = await supabase
    .from('neighborhoods')
    .select('*')
    .order('number')
  if (error) throw error
  return data
}

export async function fetchActiveNeighborhoods() {
  const { data, error } = await supabase
    .from('neighborhoods')
    .select('*')
    .eq('is_active', true)
    .order('number')
  if (error) throw error
  return data
}

export async function fetchNeighborhoodCircle(primaryId: string) {
  const { data, error } = await supabase
    .rpc('get_neighborhood_circle', { primary_id: primaryId })
  if (error) throw error
  return data as string[]
}

export async function fetchStoresByNeighborhoods(neighborhoodIds: string[]) {
  const { data, error } = await supabase
    .from('store_profiles')
    .select('*')
    .in('neighborhood_id', neighborhoodIds)
    .eq('status', 'approved')
    .order('is_premium', { ascending: false })
    .order('premium_started_at', { ascending: true })
    .order('name_ar')
  if (error) throw error
  return data
}

export async function fetchStoreById(storeId: string) {
  const { data, error } = await supabase
    .from('store_profiles')
    .select('*')
    .eq('id', storeId)
    .single()
  if (error) throw error
  return data
}

export async function fetchStoreWorkingHours(storeId: string) {
  const { data, error } = await supabase
    .from('store_working_hours')
    .select('*')
    .eq('store_id', storeId)
    .order('day_of_week')
  if (error) throw error
  return data
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  if (error) throw error
  return data
}

export async function fetchActiveBanners() {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('banner_ads')
    .select('*')
    .eq('is_active', true)
    .lte('starts_at', today)
    .gte('ends_at', today)
    .order('sort_order')
    .limit(5)
  if (error) throw error
  return data
}

export async function fetchCommunityServices(neighborhoodId?: string, type?: string) {
  let query = supabase.from('community_services').select('*')
  if (neighborhoodId) query = query.eq('neighborhood_id', neighborhoodId)
  if (type) query = query.eq('type', type)
  const { data, error } = await query.order('name_ar')
  if (error) throw error
  return data
}

export async function fetchPendingStores() {
  const { data, error } = await supabase
    .from('store_profiles')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function approveStore(storeId: string) {
  const { error } = await supabase
    .from('store_profiles')
    .update({ status: 'approved' })
    .eq('id', storeId)
  if (error) throw error
}

export async function rejectStore(storeId: string, reason: string) {
  const { error } = await supabase
    .from('store_profiles')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', storeId)
  if (error) throw error
}

export async function submitStoreProfile(data: {
  name_ar: string
  phone: string
  neighborhood_id: string
  whatsapp_number?: string
  whatsapp_message?: string
  category_id?: string
  delivers?: boolean
  delivery_cost_egp?: number
  delivery_duration_minutes?: number
}) {
  const user = await supabase.auth.getUser()
  if (!user.data.user) throw new Error('Not authenticated')

  const { data: store, error } = await supabase
    .from('store_profiles')
    .insert({
      ...data,
      owner_id: user.data.user.id,
      status: 'pending',
    })
    .select()
    .single()
  if (error) throw error
  return store
}

// ============================================
// Auth
// ============================================

export async function signInWithPhone(phone: string) {
  const { error } = await supabase.auth.signInWithOtp({ phone })
  if (error) throw error
}

export async function verifyOtp(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function updateResidentNeighborhood(neighborhoodId: string) {
  const user = await supabase.auth.getUser()
  if (!user.data.user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('resident_profiles')
    .upsert({
      id: user.data.user.id,
      primary_neighborhood_id: neighborhoodId,
    })
  if (error) throw error
}

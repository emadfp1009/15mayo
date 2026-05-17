/**
 * Supabase Storage - Image Upload
 * Bucket: "mayu Hup" (public)
 */

import { supabase } from './supabase'

const BUCKET_NAME = 'mayu Hup'

/**
 * Upload an image file to Supabase Storage
 * @param file - The file to upload
 * @param folder - Folder path (e.g., 'banners', 'stores', 'promos')
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`فشل رفع الصورة: ${error.message}`)
  }

  // Get public URL
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName)

  return data.publicUrl
}

/**
 * Upload a banner image
 */
export async function uploadBannerImage(file: File): Promise<string> {
  return uploadImage(file, 'banners')
}

/**
 * Upload a store image (storefront photo)
 */
export async function uploadStoreImage(file: File): Promise<string> {
  return uploadImage(file, 'stores')
}

/**
 * Upload a promo popup image
 */
export async function uploadPromoImage(file: File): Promise<string> {
  return uploadImage(file, 'promos')
}

/**
 * Delete an image from storage
 */
export async function deleteImage(url: string): Promise<void> {
  // Extract path from URL
  const path = url.split(`${BUCKET_NAME}/`)[1]
  if (!path) return

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path])

  if (error) {
    console.error('Failed to delete image:', error)
  }
}

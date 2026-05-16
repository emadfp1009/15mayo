/**
 * Validation Module
 * 
 * Validates store profile inputs, WhatsApp messages, and rejection reasons.
 * 
 * Requirements: 4.3, 4.7, 9.5
 */

import type { StoreProfileInput, ValidationResult } from './types'

/**
 * Validates a store profile input.
 * Mandatory fields: nameAr, phone, neighborhoodId, workingHours (at least 1)
 * 
 * @param input - Store profile input to validate
 * @returns ValidationResult with valid flag and errors map
 */
export function validateStoreProfile(input: StoreProfileInput): ValidationResult {
  const errors: Record<string, string> = {}

  // Name validation
  if (!input.nameAr || input.nameAr.trim().length === 0) {
    errors.nameAr = 'اسم المتجر مطلوب'
  }

  // Phone validation
  if (!input.phone || input.phone.trim().length === 0) {
    errors.phone = 'رقم الهاتف مطلوب'
  }

  // Neighborhood validation
  if (!input.neighborhoodId || input.neighborhoodId.trim().length === 0) {
    errors.neighborhoodId = 'يجب اختيار المجاورة'
  }

  // Working hours validation
  if (!input.workingHours || input.workingHours.length === 0) {
    errors.workingHours = 'ساعات العمل مطلوبة'
  }

  // WhatsApp message validation (optional but max 256 chars)
  if (input.whatsappMessage && input.whatsappMessage.length > 256) {
    errors.whatsappMessage = 'الرسالة يجب ألا تتجاوز 256 حرف'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validates a WhatsApp message.
 * Must be 256 characters or less.
 * 
 * @param message - Message text to validate
 * @returns true if valid, false if exceeds 256 characters
 */
export function validateWhatsAppMessage(message: string): boolean {
  return message.length <= 256
}

/**
 * Validates a rejection reason.
 * Must be at least 10 characters.
 * 
 * @param reason - Rejection reason text
 * @returns true if valid (>= 10 chars), false otherwise
 */
export function validateRejectionReason(reason: string): boolean {
  return reason.length >= 10
}

/**
 * Builds a WhatsApp deep link URL.
 * 
 * @param phoneNumber - Phone number with country code (e.g., +201234567890)
 * @param message - Optional pre-filled message
 * @returns WhatsApp deep link URL
 */
export function buildWhatsAppLink(phoneNumber: string, message?: string): string {
  // Remove + and any spaces/dashes from phone number
  const cleanNumber = phoneNumber.replace(/[+\s-]/g, '')
  
  let url = `https://wa.me/${cleanNumber}`
  if (message) {
    url += `?text=${encodeURIComponent(message)}`
  }
  return url
}

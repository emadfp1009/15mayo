// Feature: mayu-hub, Property 4: WhatsApp link construction and message validation
// Feature: mayu-hub, Property 5: Store profile validation enforces mandatory fields
// Feature: mayu-hub, Property 13: Rejection reason minimum length validation
import { describe, it } from 'vitest'
import fc from 'fast-check'
import { validateStoreProfile, validateWhatsAppMessage, validateRejectionReason } from '@/lib/mayu-hub/validation'
import type { StoreProfileInput, WorkingHoursInput } from '@/lib/mayu-hub/types'

describe('Property 4: WhatsApp message validation', () => {
  it('rejects messages longer than 256 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 257, maxLength: 500 }),
        (message) => {
          return validateWhatsAppMessage(message) === false
        }
      ),
      { numRuns: 200 }
    )
  })

  it('accepts messages of 256 characters or less', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 256 }),
        (message) => {
          return validateWhatsAppMessage(message) === true
        }
      ),
      { numRuns: 200 }
    )
  })
})

describe('Property 5: Store profile validation enforces mandatory fields', () => {
  const validWorkingHours: WorkingHoursInput[] = [
    { dayOfWeek: 0, openTime: '09:00', closeTime: '17:00', isClosed: false }
  ]

  it('returns invalid when any mandatory field is missing', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('nameAr', 'phone', 'neighborhoodId', 'workingHours'),
        (missingField) => {
          const input: StoreProfileInput = {
            nameAr: 'متجر تجريبي',
            phone: '+201234567890',
            neighborhoodId: '123e4567-e89b-12d3-a456-426614174000',
            workingHours: validWorkingHours,
          }

          // Remove the field
          if (missingField === 'nameAr') input.nameAr = ''
          if (missingField === 'phone') input.phone = ''
          if (missingField === 'neighborhoodId') input.neighborhoodId = ''
          if (missingField === 'workingHours') input.workingHours = []

          const result = validateStoreProfile(input)
          return result.valid === false && missingField in result.errors
        }
      ),
      { numRuns: 200 }
    )
  })

  it('returns valid when all mandatory fields are present', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 15 }).filter(s => s.trim().length > 0),
        fc.uuid(),
        (name, phone, neighborhoodId) => {
          const input: StoreProfileInput = {
            nameAr: name,
            phone,
            neighborhoodId,
            workingHours: validWorkingHours,
          }

          const result = validateStoreProfile(input)
          return result.valid === true
        }
      ),
      { numRuns: 200 }
    )
  })
})

describe('Property 13: Rejection reason minimum length', () => {
  it('rejects reasons shorter than 10 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 9 }),
        (reason) => {
          return validateRejectionReason(reason) === false
        }
      ),
      { numRuns: 200 }
    )
  })

  it('accepts reasons of 10 characters or more', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 500 }),
        (reason) => {
          return validateRejectionReason(reason) === true
        }
      ),
      { numRuns: 200 }
    )
  })
})

import { z } from 'zod'

// Working hours for a single day
export const workingHoursInputSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, 'يجب أن يكون بتنسيق HH:mm'),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'يجب أن يكون بتنسيق HH:mm'),
  isClosed: z.boolean(),
})

// Store profile submission
export const storeProfileInputSchema = z.object({
  nameAr: z.string().min(1, 'اسم المتجر مطلوب'),
  phone: z.string().min(1, 'رقم الهاتف مطلوب').regex(
    /^\+?[0-9]{10,15}$/,
    'رقم هاتف غير صالح'
  ),
  neighborhoodId: z.string().uuid('يجب اختيار المجاورة'),
  workingHours: z.array(workingHoursInputSchema).min(1, 'ساعات العمل مطلوبة'),
  whatsappNumber: z.string().regex(/^\+20[0-9]{10}$/, 'رقم واتساب غير صالح - يجب أن يبدأ بـ +20').optional(),
  whatsappMessage: z.string().max(256, 'الرسالة يجب ألا تتجاوز 256 حرف').optional(),
  categoryId: z.string().uuid().optional(),
  delivers: z.boolean().optional(),
  deliveryCostEgp: z.number().min(0, 'تكلفة التوصيل يجب أن تكون 0 أو أكثر').optional(),
  deliveryDurationMinutes: z.number().int().min(1, 'مدة التوصيل يجب أن تكون دقيقة واحدة على الأقل').optional(),
  deliveryNeighborhoodIds: z.array(z.string().uuid()).optional(),
})

// WhatsApp message validation
export const whatsappMessageSchema = z.string().max(256, 'الرسالة يجب ألا تتجاوز 256 حرف')

// Rejection reason validation
export const rejectionReasonSchema = z.string().min(10, 'سبب الرفض يجب أن يكون 10 أحرف على الأقل')

// Banner ad creation
export const bannerAdInputSchema = z.object({
  imageUrl: z.string().url('رابط الصورة غير صالح'),
  targetType: z.enum(['store', 'external']),
  targetStoreId: z.string().uuid().optional(),
  targetUrl: z.string().url('الرابط غير صالح').optional(),
  startsAt: z.string().date('تاريخ البداية غير صالح'),
  endsAt: z.string().date('تاريخ النهاية غير صالح'),
  sortOrder: z.number().int().min(0).optional(),
}).refine(
  (data) => new Date(data.endsAt) >= new Date(data.startsAt),
  { message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية', path: ['endsAt'] }
)

// Special offer creation
export const specialOfferInputSchema = z.object({
  titleAr: z.string().min(1, 'عنوان العرض مطلوب'),
  descriptionAr: z.string().optional(),
  imageUrl: z.string().url().optional(),
  startsAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
}).refine(
  (data) => {
    const start = new Date(data.startsAt)
    const end = new Date(data.expiresAt)
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    return end > start && diffDays <= 30
  },
  { message: 'مدة العرض يجب ألا تتجاوز 30 يوم', path: ['expiresAt'] }
)

// Neighborhood input
export const neighborhoodInputSchema = z.object({
  nameAr: z.string().min(1, 'اسم المجاورة مطلوب'),
  number: z.number().int().min(1).max(36),
  isActive: z.boolean(),
  adjacentIds: z.array(z.string().uuid()).optional(),
})

// Community service input
export const communityServiceInputSchema = z.object({
  neighborhoodId: z.string().uuid('يجب اختيار المجاورة'),
  nameAr: z.string().min(1, 'اسم الخدمة مطلوب'),
  type: z.enum([
    'school', 'post_office', 'youth_center', 'mosque', 'church',
    'hospital', 'police_station', 'civil_registry', 'gas_office', 'electricity_office'
  ]),
  schoolType: z.enum(['government', 'experimental', 'private']).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
})

export type StoreProfileInputSchema = z.infer<typeof storeProfileInputSchema>
export type WorkingHoursInputSchema = z.infer<typeof workingHoursInputSchema>
export type BannerAdInputSchema = z.infer<typeof bannerAdInputSchema>
export type SpecialOfferInputSchema = z.infer<typeof specialOfferInputSchema>
export type NeighborhoodInputSchema = z.infer<typeof neighborhoodInputSchema>
export type CommunityServiceInputSchema = z.infer<typeof communityServiceInputSchema>

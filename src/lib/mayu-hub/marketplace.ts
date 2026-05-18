import type { ClassifiedAdInput, ClassifiedAd, MarketplaceCategory, ValidationResult } from './types';

export function validateClassifiedAd(input: ClassifiedAdInput): ValidationResult {
  const errors: Record<string, string> = {};
  if (!input.title || input.title.trim().length === 0) {
    errors.title = 'العنوان مطلوب';
  }
  if (!input.price || input.price <= 0) {
    errors.price = 'السعر مطلوب ويجب أن يكون أكبر من صفر';
  }
  if (!input.phone || input.phone.trim().length === 0) {
    errors.phone = 'رقم الهاتف مطلوب';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function filterAdsByCategory(
  ads: ClassifiedAd[],
  category: MarketplaceCategory | null
): ClassifiedAd[] {
  if (!category) return ads;
  return ads.filter(ad => ad.category === category);
}

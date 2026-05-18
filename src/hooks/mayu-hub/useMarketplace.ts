import { useState, useCallback } from 'react';
import { getMarketplace, setMarketplace } from '@/lib/mayu-hub/local-storage';
import { validateClassifiedAd, filterAdsByCategory } from '@/lib/mayu-hub/marketplace';
import { getCurrentUser, isGuestUser } from '@/lib/mayu-hub/auth';
import type { ClassifiedAdInput, ClassifiedAd, MarketplaceCategory, ValidationResult } from '@/lib/mayu-hub/types';

/**
 * Hook for managing the buy-and-sell marketplace.
 * Reads/writes classified ads from localStorage,
 * validates before adding, and blocks guest users.
 */
export function useMarketplace() {
  const [ads, setAds] = useState<ClassifiedAd[]>(getMarketplace());
  const user = getCurrentUser();

  const addAd = useCallback((input: ClassifiedAdInput): { success: boolean; needsLogin: boolean; validation: ValidationResult } => {
    if (!user || isGuestUser(user)) {
      return { success: false, needsLogin: true, validation: { valid: true, errors: {} } };
    }
    const validation = validateClassifiedAd(input);
    if (!validation.valid) {
      return { success: false, needsLogin: false, validation };
    }
    const newAd: ClassifiedAd = {
      id: `ad-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: user.id,
      userName: user.name,
      title: input.title,
      description: input.description,
      price: input.price,
      photoUrl: input.photoUrl,
      phone: input.phone,
      category: input.category,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    const updated = [newAd, ...ads];
    setMarketplace(updated);
    setAds(updated);
    return { success: true, needsLogin: false, validation };
  }, [user, ads]);

  const removeAd = useCallback((adId: string): void => {
    const updated = ads.filter(ad => ad.id !== adId);
    setMarketplace(updated);
    setAds(updated);
  }, [ads]);

  const filterByCategory = useCallback((category: MarketplaceCategory | null): ClassifiedAd[] => {
    return filterAdsByCategory(ads, category);
  }, [ads]);

  return { ads, addAd, removeAd, filterByCategory };
}

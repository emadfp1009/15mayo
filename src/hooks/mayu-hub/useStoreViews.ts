import { useState, useCallback } from 'react';
import { getStoreViews, setStoreViews } from '@/lib/mayu-hub/local-storage';

export function useStoreViews(storeId: string) {
  const [views, setViews] = useState(getStoreViews());
  const viewCount = views[storeId] || 0;

  const incrementView = useCallback(() => {
    const updated = { ...views };
    updated[storeId] = (updated[storeId] || 0) + 1;
    setStoreViews(updated);
    setViews(updated);
  }, [storeId, views]);

  return { viewCount, incrementView };
}

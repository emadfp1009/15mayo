import { useFavorites } from '@/hooks/mayu-hub/useFavorites'
import { StoreCard } from './StoreCard'
import { realStores } from '@/lib/mayu-hub/real-data'
import { demoCategories, demoNeighborhoods, demoWorkingHours } from '@/lib/mayu-hub/demo-data'
import { computeStoreStatus } from '@/lib/mayu-hub/store-status'
import { Heart } from 'lucide-react'

interface FavoritesViewProps {
  onBack: () => void
  onStoreClick?: (storeId: string) => void
}

export function FavoritesView({ onBack, onStoreClick }: FavoritesViewProps) {
  const { favorites } = useFavorites()

  const favoritedStores = realStores.filter(s => favorites.includes(s.id))

  const getStoreStatus = (storeId: string): 'open' | 'closed' => {
    const store = realStores.find(s => s.id === storeId)
    if (!store) return 'closed'
    const hours = demoWorkingHours.filter(wh => wh.storeId === storeId)
    const override = store.manualStatusOverride
      ? { status: store.manualStatusOverride as 'open' | 'closed', until: store.manualStatusOverrideUntil ? new Date(store.manualStatusOverrideUntil) : null }
      : null
    return computeStoreStatus(hours, new Date(), override)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">❤️ المفضلة</h2>
        <button onClick={onBack} className="text-sm text-primary">← رجوع</button>
      </div>

      {favoritedStores.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-base font-semibold text-muted-foreground">لم تضف مفضلات بعد</h3>
          <p className="text-sm text-muted-foreground mt-1">اضغط على القلب في أي متجر لإضافته هنا</p>
        </div>
      ) : (
        <div className="space-y-3">
          {favoritedStores.map(store => (
            <StoreCard
              key={store.id}
              store={store}
              status={getStoreStatus(store.id)}
              categoryName={demoCategories.find(c => c.id === store.categoryId)?.nameAr}
              neighborhoodName={demoNeighborhoods.find(n => n.id === store.neighborhoodId)?.nameAr}
              onClick={() => onStoreClick?.(store.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

import { useState, useMemo } from 'react'
import { StoreCard } from './StoreCard'
import { SearchBar } from './SearchBar'
import { BannerCarousel } from './BannerCarousel'
import { ExploreFilter } from './ExploreFilter'
import { applyExploreFilters } from '@/lib/mayu-hub/explore-filter'
import { computeStoreStatus } from '@/lib/mayu-hub/store-status'
import { rankSearchResults, sortWithPremiumFirst } from '@/lib/mayu-hub/search'
import { getActiveBanners } from '@/lib/mayu-hub/banner-rotation'
import { demoNeighborhoods, demoCategories, demoBanners, demoWorkingHours } from '@/lib/mayu-hub/demo-data'
import { realStores } from '@/lib/mayu-hub/real-data'

interface ServicesViewProps {
  primaryNeighborhoodId?: string
  onBack?: () => void
  onStoreClick?: (storeId: string) => void
}

export function ServicesView({ primaryNeighborhoodId, onBack, onStoreClick }: ServicesViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [deliveryOnly, setDeliveryOnly] = useState(false)

  // Get active banners - from localStorage (admin managed) or demo
  const activeBanners = useMemo(() => {
    const saved = localStorage.getItem('mayu_hub_banners')
    const bannerList = saved ? JSON.parse(saved) : demoBanners
    return getActiveBanners(bannerList, new Date())
  }, [])

  // Filter stores using ExploreFilter logic
  const filteredStores = useMemo(() => {
    const approved = realStores.filter(s => s.status === 'approved')

    // Apply explore filters (neighborhood, category, delivery)
    const explored = applyExploreFilters(approved, {
      neighborhoodId: selectedNeighborhood,
      categoryId: selectedCategory,
      deliveryOnly,
    })

    // If search query exists, rank by search relevance
    if (searchQuery.length >= 2) {
      return rankSearchResults(explored, searchQuery, primaryNeighborhoodId ?? '')
    }

    // Sort with premium first
    return sortWithPremiumFirst(explored, new Date())
  }, [selectedNeighborhood, selectedCategory, deliveryOnly, searchQuery, primaryNeighborhoodId])

  // Get store status
  const getStoreStatus = (storeId: string): 'open' | 'closed' => {
    const store = realStores.find(s => s.id === storeId)
    if (!store) return 'closed'

    const hours = demoWorkingHours.filter(wh => wh.storeId === storeId)
    const override = store.manualStatusOverride
      ? { status: store.manualStatusOverride as 'open' | 'closed', until: store.manualStatusOverrideUntil ? new Date(store.manualStatusOverrideUntil) : null }
      : null

    return computeStoreStatus(hours, new Date(), override)
  }

  const handleClearFilters = () => {
    setSelectedNeighborhood(null)
    setSelectedCategory(null)
    setDeliveryOnly(false)
  }

  const primaryNeighborhood = primaryNeighborhoodId
    ? demoNeighborhoods.find(n => n.id === primaryNeighborhoodId)
    : null

  return (
    <div className="space-y-4">
      {/* Header */}
      {onBack && primaryNeighborhood && (
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm text-primary hover:underline">
            ← تغيير المجاورة
          </button>
          <span className="text-sm text-muted-foreground">
            📍 {primaryNeighborhood.nameAr}
          </span>
        </div>
      )}

      {/* Banner carousel */}
      <BannerCarousel banners={activeBanners} onStoreClick={onStoreClick} />

      {/* Search */}
      <SearchBar
        query={searchQuery}
        onQueryChange={setSearchQuery}
        categories={demoCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Explore Filter (replaces old neighborhood circle chips) */}
      <ExploreFilter
        selectedNeighborhood={selectedNeighborhood}
        selectedCategory={selectedCategory}
        deliveryOnly={deliveryOnly}
        onNeighborhoodChange={setSelectedNeighborhood}
        onCategoryChange={setSelectedCategory}
        onDeliveryToggle={setDeliveryOnly}
        onClear={handleClearFilters}
      />

      {/* Results */}
      <div className="space-y-3">
        {filteredStores.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد نتائج</p>
            <p className="text-sm text-muted-foreground mt-1">
              جرب إزالة الفلاتر أو البحث بكلمات أخرى
            </p>
          </div>
        ) : (
          filteredStores.map(store => (
            <StoreCard
              key={store.id}
              store={store}
              status={getStoreStatus(store.id)}
              categoryName={demoCategories.find(c => c.id === store.categoryId)?.nameAr}
              neighborhoodName={demoNeighborhoods.find(n => n.id === store.neighborhoodId)?.nameAr}
              onClick={() => onStoreClick?.(store.id)}
            />
          ))
        )}
      </div>

      {/* Results count */}
      {filteredStores.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {filteredStores.length} نتيجة
        </p>
      )}
    </div>
  )
}

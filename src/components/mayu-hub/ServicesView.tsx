import { useState, useMemo } from 'react'
import { StoreCard } from './StoreCard'
import { SearchBar } from './SearchBar'
import { BannerCarousel } from './BannerCarousel'
import { CategoryScroller } from './CategoryScroller'
import { computeNeighborhoodCircle } from '@/lib/mayu-hub/neighborhood-circle'
import { computeStoreStatus } from '@/lib/mayu-hub/store-status'
import { filterStores, rankSearchResults, sortWithPremiumFirst } from '@/lib/mayu-hub/search'
import { getActiveBanners } from '@/lib/mayu-hub/banner-rotation'
import { demoNeighborhoods, demoAdjacencyMap, demoStores, demoCategories, demoBanners, demoWorkingHours } from '@/lib/mayu-hub/demo-data'
import type { Neighborhood } from '@/lib/mayu-hub/types'

interface ServicesViewProps {
  primaryNeighborhoodId: string
  onBack: () => void
  onStoreClick?: (storeId: string) => void
}

export function ServicesView({ primaryNeighborhoodId, onBack, onStoreClick }: ServicesViewProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Compute neighborhood circle
  const activeSet = useMemo(
    () => new Set(demoNeighborhoods.filter(n => n.isActive).map(n => n.id)),
    []
  )

  const circleIds = useMemo(
    () => computeNeighborhoodCircle(primaryNeighborhoodId, demoAdjacencyMap, activeSet),
    [primaryNeighborhoodId, activeSet]
  )

  const circleNeighborhoods: Neighborhood[] = useMemo(
    () => circleIds.map(id => demoNeighborhoods.find(n => n.id === id)!).filter(Boolean),
    [circleIds]
  )

  // Get active banners
  const activeBanners = useMemo(
    () => getActiveBanners(demoBanners, new Date()),
    []
  )

  // Filter and rank stores
  const filteredStores = useMemo(() => {
    const approvedStores = demoStores.filter(s => s.status === 'approved')

    // Apply filters
    const filtered = filterStores(approvedStores, {
      query: searchQuery,
      circleNeighborhoodIds: circleIds,
      categoryId: selectedCategory,
      neighborhoodId: activeFilter,
    })

    // Rank by search if query exists
    if (searchQuery.length >= 2) {
      return rankSearchResults(filtered, searchQuery, primaryNeighborhoodId)
    }

    // Sort with premium first
    return sortWithPremiumFirst(filtered, new Date())
  }, [searchQuery, selectedCategory, activeFilter, circleIds, primaryNeighborhoodId])

  // Get store status
  const getStoreStatus = (storeId: string): 'open' | 'closed' => {
    const store = demoStores.find(s => s.id === storeId)
    if (!store) return 'closed'

    const hours = demoWorkingHours.filter(wh => wh.storeId === storeId)
    const override = store.manualStatusOverride
      ? { status: store.manualStatusOverride as 'open' | 'closed', until: store.manualStatusOverrideUntil ? new Date(store.manualStatusOverrideUntil) : null }
      : null

    return computeStoreStatus(hours, new Date(), override)
  }

  const primaryNeighborhood = demoNeighborhoods.find(n => n.id === primaryNeighborhoodId)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-primary hover:underline">
          ← تغيير المجاورة
        </button>
        <span className="text-sm text-muted-foreground">
          📍 {primaryNeighborhood?.nameAr}
        </span>
      </div>

      {/* Banner carousel */}
      <BannerCarousel banners={activeBanners} />

      {/* Categories - circular scrollable */}
      <CategoryScroller
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Search */}
      <SearchBar
        query={searchQuery}
        onQueryChange={setSearchQuery}
        categories={demoCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Neighborhood circle filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveFilter(null)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            activeFilter === null
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/50'
          }`}
        >
          الكل
        </button>
        {circleNeighborhoods.map(n => (
          <button
            key={n.id}
            onClick={() => setActiveFilter(n.id === activeFilter ? null : n.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeFilter === n.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            {n.nameAr}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filteredStores.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد نتائج</p>
            <p className="text-sm text-muted-foreground mt-1">
              جرب إزالة الفلاتر أو البحث في مجاورات أخرى
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

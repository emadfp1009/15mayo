import { useState } from 'react'
import { useMarketplace } from '@/hooks/mayu-hub/useMarketplace'
import { getCurrentUser, isGuestUser } from '@/lib/mayu-hub/auth'
import { toast } from 'sonner'
import { ShoppingBag, Plus, ArrowRight } from 'lucide-react'
import type { MarketplaceCategory } from '@/lib/mayu-hub/types'

interface MarketplaceViewProps {
  onBack: () => void
}

const CATEGORY_LABELS: Record<MarketplaceCategory, string> = {
  electronics: 'إلكترونيات',
  furniture: 'أثاث',
  vehicles: 'سيارات',
  clothing: 'ملابس',
  home_appliances: 'أجهزة منزلية',
  sports: 'رياضة',
  books: 'كتب',
  other: 'أخرى',
}

export function MarketplaceView({ onBack }: MarketplaceViewProps) {
  const { ads, filterByCategory } = useMarketplace()
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | null>(null)
  const [showForm, setShowForm] = useState(false)

  const user = getCurrentUser()
  const isGuest = !user || isGuestUser(user)

  const displayedAds = selectedCategory ? filterByCategory(selectedCategory) : ads

  const handleAddAd = () => {
    if (isGuest) {
      toast.error('سجل دخول أولاً', {
        description: 'يجب تسجيل الدخول لإضافة إعلان',
      })
      return
    }
    setShowForm(true)
  }

  const handleFormCancel = () => {
    setShowForm(false)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Show form view (MarketplaceForm will be implemented in task 10.2)
  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">📝 إضافة إعلان</h2>
          <button onClick={handleFormCancel} className="text-sm text-primary">
            ← رجوع
          </button>
        </div>
        <p className="text-center text-muted-foreground py-8">
          نموذج الإعلان قيد التطوير
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">🛒 بيع واشتري</h2>
        <button onClick={onBack} className="text-sm text-primary flex items-center gap-1">
          رجوع <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Category filter and Add button */}
      <div className="flex items-center gap-2">
        <select
          value={selectedCategory ?? ''}
          onChange={(e) =>
            setSelectedCategory(
              e.target.value ? (e.target.value as MarketplaceCategory) : null
            )
          }
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="تصفية حسب التصنيف"
        >
          <option value="">كل التصنيفات</option>
          {(Object.keys(CATEGORY_LABELS) as MarketplaceCategory[]).map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>

        <button
          onClick={handleAddAd}
          className="flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground font-medium whitespace-nowrap"
          aria-label="إضافة إعلان"
        >
          <Plus className="w-4 h-4" />
          إضافة إعلان
        </button>
      </div>

      {/* Ad listings */}
      {displayedAds.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-base font-semibold text-muted-foreground">لا توجد إعلانات</h3>
          <p className="text-sm text-muted-foreground mt-1">
            كن أول من يضيف إعلان في هذا القسم
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedAds.map((ad) => (
            <div
              key={ad.id}
              className="flex gap-3 rounded-lg border border-border bg-card p-3 shadow-sm"
            >
              {/* Photo thumbnail */}
              <div className="w-20 h-20 flex-shrink-0 rounded-md bg-muted overflow-hidden">
                {ad.photoUrl ? (
                  <img
                    src={ad.photoUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Ad details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{ad.title}</h4>
                <p className="text-primary font-bold text-sm mt-1">
                  {ad.price.toLocaleString('ar-EG')} ج.م
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {CATEGORY_LABELS[ad.category]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(ad.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

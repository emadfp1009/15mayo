import { useState, useRef, useEffect } from 'react'
import { demoNeighborhoods, demoCategories } from '@/lib/mayu-hub/demo-data'

interface ExploreFilterProps {
  selectedNeighborhood: string | null
  selectedCategory: string | null
  deliveryOnly: boolean
  onNeighborhoodChange: (id: string | null) => void
  onCategoryChange: (id: string | null) => void
  onDeliveryToggle: (value: boolean) => void
  onClear: () => void
}

export function ExploreFilter({
  selectedNeighborhood,
  selectedCategory,
  deliveryOnly,
  onNeighborhoodChange,
  onCategoryChange,
  onDeliveryToggle,
  onClear,
}: ExploreFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Count active filters for badge
  const activeCount = [
    selectedNeighborhood !== null,
    selectedCategory !== null,
    deliveryOnly,
  ].filter(Boolean).length

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative" ref={panelRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
          activeCount > 0
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border bg-white text-foreground hover:border-primary/50'
        }`}
      >
        <span>استكشف 🔍</span>
        {activeCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-border p-4 space-y-4 z-50">
          {/* المجاورة - Neighborhood */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">المجاورة</label>
            <select
              value={selectedNeighborhood ?? ''}
              onChange={(e) => onNeighborhoodChange(e.target.value || null)}
              className="w-full h-9 rounded-lg border border-border bg-white px-3 text-sm text-right appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">الكل</option>
              {demoNeighborhoods.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* التصنيف - Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">التصنيف</label>
            <select
              value={selectedCategory ?? ''}
              onChange={(e) => onCategoryChange(e.target.value || null)}
              className="w-full h-9 rounded-lg border border-border bg-white px-3 text-sm text-right appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">الكل</option>
              {demoCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* يوصل - Delivery Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">يوصل</label>
            <button
              onClick={() => onDeliveryToggle(!deliveryOnly)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                deliveryOnly ? 'bg-primary' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={deliveryOnly}
              aria-label="فلتر التوصيل"
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  deliveryOnly ? 'right-0.5' : 'right-[22px]'
                }`}
              />
            </button>
          </div>

          {/* مسح الكل - Clear All */}
          {activeCount > 0 && (
            <button
              onClick={() => {
                onClear()
                setIsOpen(false)
              }}
              className="w-full py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
            >
              مسح الكل
            </button>
          )}
        </div>
      )}
    </div>
  )
}

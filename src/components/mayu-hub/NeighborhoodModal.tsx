import { useMemo } from 'react'
import { demoNeighborhoods } from '@/lib/mayu-hub/demo-data'

interface NeighborhoodModalProps {
  primaryNeighborhoodId: string
  onClose: () => void
  onAddNeighborhood?: (id: string) => void
}

export function NeighborhoodModal({ primaryNeighborhoodId, onClose }: NeighborhoodModalProps) {
  const primaryNumber = demoNeighborhoods.find(n => n.id === primaryNeighborhoodId)?.number ?? 1

  // Show 2 before and 2 after (or up to 4 if at edge)
  const nearbyNeighborhoods = useMemo(() => {
    const allActive = demoNeighborhoods.filter(n => n.isActive)
    let start = primaryNumber - 2
    let end = primaryNumber + 2

    // Edge cases
    if (start < 1) {
      end = Math.min(end + (1 - start), allActive.length)
      start = 1
    }
    if (end > allActive.length) {
      start = Math.max(start - (end - allActive.length), 1)
      end = allActive.length
    }

    return allActive.filter(n => n.number >= start && n.number <= end && n.number !== primaryNumber)
  }, [primaryNumber])

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg glass rounded-t-3xl p-6 pb-10 safe-bottom animate-slide-up shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6" />

        <h3 className="text-xl font-bold text-center mb-2">هتشوف كمان 👀</h3>
        <p className="text-sm text-muted-foreground text-center mb-6">
          المجاورات القريبة منك — اضغط على أي واحدة لاستكشافها
        </p>

        {/* Primary */}
        <div className="mb-4">
          <div className="gradient-primary text-white rounded-2xl p-4 text-center shadow-lg shadow-blue-500/20">
            <p className="text-xs text-blue-100 mb-1">مجاورتك</p>
            <p className="text-2xl font-bold">المجاورة {primaryNumber}</p>
          </div>
        </div>

        {/* Nearby */}
        <div className="grid grid-cols-2 gap-3">
          {nearbyNeighborhoods.map(n => (
            <button
              key={n.id}
              className="bg-secondary hover:bg-secondary/80 rounded-2xl p-4 text-center transition-all hover:scale-105 active:scale-95"
            >
              <p className="text-xs text-muted-foreground mb-1">مجاورة</p>
              <p className="text-lg font-bold">{n.number}</p>
            </button>
          ))}
        </div>

        {/* Add button */}
        <button className="btn-modern w-full h-12 mt-6 bg-secondary text-foreground font-medium">
          + إضافة مجاورة أخرى
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          تم، أغلق
        </button>
      </div>
    </div>
  )
}

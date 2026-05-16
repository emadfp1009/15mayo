import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Neighborhood } from '@/lib/mayu-hub/types'

interface NeighborhoodSelectorProps {
  neighborhoods: Neighborhood[]
  selectedId: string | null
  onSelect: (id: string) => void
  disabled?: boolean
}

export function NeighborhoodSelector({ neighborhoods, selectedId, onSelect, disabled }: NeighborhoodSelectorProps) {
  const [error, setError] = useState<string | null>(null)
  const activeNeighborhoods = neighborhoods.filter(n => n.isActive)

  const handleSelect = (id: string) => {
    setError(null)
    onSelect(id)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center">اختر مجاورتك</h2>
      <p className="text-sm text-muted-foreground text-center">
        اختر المجاورة اللي ساكن فيها عشان نعرض لك الخدمات القريبة منك
      </p>
      
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        {activeNeighborhoods.map(neighborhood => (
          <button
            key={neighborhood.id}
            onClick={() => handleSelect(neighborhood.id)}
            disabled={disabled}
            className={`
              p-3 rounded-lg border-2 text-center transition-all
              ${selectedId === neighborhood.id 
                ? 'border-primary bg-primary/10 text-primary font-semibold' 
                : 'border-border hover:border-primary/50 hover:bg-accent'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="text-sm">{neighborhood.nameAr}</span>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {!activeNeighborhoods.length && (
        <p className="text-sm text-muted-foreground text-center">
          لا توجد مجاورات متاحة حالياً
        </p>
      )}
    </div>
  )
}

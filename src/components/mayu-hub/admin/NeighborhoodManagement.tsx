import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { demoNeighborhoods } from '@/lib/mayu-hub/demo-data'
import type { Neighborhood } from '@/lib/mayu-hub/types'
import { MapPin } from 'lucide-react'

export function NeighborhoodManagement() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>(demoNeighborhoods)

  const handleToggleActive = (id: string) => {
    setNeighborhoods(prev => prev.map(n => {
      if (n.id !== id) return n
      return { ...n, isActive: !n.isActive }
    }))
  }

  const activeCount = neighborhoods.filter(n => n.isActive).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">إدارة المجاورات</h3>
        <Badge variant="secondary">{activeCount}/36 نشطة</Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        فعّل المجاورات اللي عايز تظهر في التطبيق. المجاورات الغير نشطة مش هتظهر للمستخدمين.
      </p>

      <div className="grid grid-cols-1 gap-2">
        {neighborhoods.map(neighborhood => (
          <Card
            key={neighborhood.id}
            className={`p-3 cursor-pointer transition-all ${
              neighborhood.isActive
                ? 'border-green-300 bg-green-50'
                : 'border-border opacity-60'
            }`}
            onClick={() => handleToggleActive(neighborhood.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${neighborhood.isActive ? 'text-green-600' : 'text-muted-foreground'}`} />
                <span className="text-sm font-medium">{neighborhood.nameAr}</span>
                <span className="text-xs text-muted-foreground">#{neighborhood.number}</span>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors relative ${
                neighborhood.isActive ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  neighborhood.isActive ? 'right-0.5' : 'left-0.5'
                }`} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

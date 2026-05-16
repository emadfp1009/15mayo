import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { demoStores, demoNeighborhoods, demoCategories } from '@/lib/mayu-hub/demo-data'
import type { StoreProfile } from '@/lib/mayu-hub/types'
import { Store, Ban, RotateCcw } from 'lucide-react'

export function StoreManagement() {
  const [stores, setStores] = useState<StoreProfile[]>(demoStores)

  const handleToggleStatus = (storeId: string) => {
    setStores(prev => prev.map(s => {
      if (s.id !== storeId) return s
      return {
        ...s,
        status: s.status === 'deactivated' ? 'approved' : 'deactivated'
      }
    }))
  }

  const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    approved: { label: 'نشط', variant: 'default' },
    pending: { label: 'معلق', variant: 'outline' },
    rejected: { label: 'مرفوض', variant: 'destructive' },
    deactivated: { label: 'معطل', variant: 'secondary' },
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">إدارة المتاجر</h3>
        <Badge variant="secondary">{stores.length} متجر</Badge>
      </div>

      {stores.map(store => {
        const neighborhood = demoNeighborhoods.find(n => n.id === store.neighborhoodId)
        const category = demoCategories.find(c => c.id === store.categoryId)
        const statusInfo = statusLabels[store.status] ?? statusLabels.approved

        return (
          <Card key={store.id} className={`p-4 ${store.status === 'deactivated' ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Store className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-semibold text-sm">{store.nameAr}</h4>
                  {store.isPremium && <Badge className="text-xs">مميز</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {category?.icon} {category?.nameAr} • 📍 {neighborhood?.nameAr}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  📞 {store.phone}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge variant={statusInfo.variant} className="text-xs">
                  {statusInfo.label}
                </Badge>
                <Button
                  size="sm"
                  variant={store.status === 'deactivated' ? 'outline' : 'destructive'}
                  className="text-xs"
                  onClick={() => handleToggleStatus(store.id)}
                >
                  {store.status === 'deactivated' ? (
                    <>
                      <RotateCcw className="w-3 h-3 ml-1" />
                      تفعيل
                    </>
                  ) : (
                    <>
                      <Ban className="w-3 h-3 ml-1" />
                      تعطيل
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

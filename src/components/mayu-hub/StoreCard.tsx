import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { StoreProfile } from '@/lib/mayu-hub/types'
import { Phone, MessageCircle, Truck } from 'lucide-react'

interface StoreCardProps {
  store: StoreProfile
  status: 'open' | 'closed'
  categoryName?: string
  neighborhoodName?: string
  onClick?: () => void
}

export function StoreCard({ store, status, categoryName, neighborhoodName, onClick }: StoreCardProps) {
  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Store info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base truncate">{store.nameAr}</h3>
            {store.isPremium && (
              <Badge variant="default" className="text-xs shrink-0">مميز</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            {categoryName && <span>{categoryName}</span>}
            {categoryName && neighborhoodName && <span>•</span>}
            {neighborhoodName && <span>{neighborhoodName}</span>}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${store.phone}`}
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-md hover:bg-primary/20"
            >
              <Phone className="w-3 h-3" />
              اتصل
            </a>
            {store.whatsappNumber && (
              <a
                href={`https://wa.me/${store.whatsappNumber.replace(/[+\s-]/g, '')}${store.whatsappMessage ? `?text=${encodeURIComponent(store.whatsappMessage)}` : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-700 px-2 py-1 rounded-md hover:bg-green-500/20"
              >
                <MessageCircle className="w-3 h-3" />
                واتساب
              </a>
            )}
            {store.delivers && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Truck className="w-3 h-3" />
                توصيل {store.deliveryCostEgp} ج.م
              </span>
            )}
          </div>
        </div>

        {/* Status indicator */}
        <div className={`
          shrink-0 px-2 py-1 rounded-full text-xs font-medium
          ${status === 'open' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
          }
        `}>
          {status === 'open' ? 'مفتوح' : 'مغلق'}
        </div>
      </div>
    </Card>
  )
}

import { Badge } from '@/components/ui/badge'
import type { StoreProfile } from '@/lib/mayu-hub/types'
import { Phone, MessageCircle, Truck, Clock, MapPin } from 'lucide-react'

interface StoreCardProps {
  store: StoreProfile
  status: 'open' | 'closed'
  categoryName?: string
  neighborhoodName?: string
  onClick?: () => void
}

export function StoreCard({ store, status, categoryName, neighborhoodName, onClick }: StoreCardProps) {
  const hasImage = store.storefrontPhotoUrl

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
    >
      {/* Image Header */}
      <div
        className="card-bg-image h-36 flex items-end p-4"
        style={{
          background: hasImage
            ? `url(${store.storefrontPhotoUrl}) center/cover`
            : `linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)`
        }}
      >
        <div className="flex items-end justify-between w-full">
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg leading-tight">{store.nameAr}</h3>
            <div className="flex items-center gap-2 mt-1">
              {categoryName && <span className="text-white/80 text-xs">{categoryName}</span>}
              {neighborhoodName && <span className="text-white/60 text-xs">• {neighborhoodName}</span>}
            </div>
            {store.address && (
              <p className="text-white/70 text-[11px] mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="line-clamp-1">{store.address}</span>
              </p>
            )}
          </div>

          {/* Status */}
          <div className={`
            px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shrink-0 mr-2
            ${status === 'open' ? 'bg-green-500/90 text-white' : 'bg-red-500/80 text-white'}
          `}>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {status === 'open' ? 'مفتوح' : 'مغلق'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="bg-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a
              href={`tel:${store.phone}`}
              onClick={e => e.stopPropagation()}
              className="btn-modern inline-flex items-center gap-1.5 text-xs gradient-primary text-white px-3 py-1.5"
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
                className="btn-modern inline-flex items-center gap-1.5 text-xs bg-green-500 text-white px-3 py-1.5"
              >
                <MessageCircle className="w-3 h-3" />
                واتساب
              </a>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {store.isPremium && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-bold">⭐ مميز</Badge>
            )}
            {store.delivers && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-lg">
                <Truck className="w-3 h-3" />
                {store.deliveryCostEgp}ج
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

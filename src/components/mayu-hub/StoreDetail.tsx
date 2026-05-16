import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { StoreProfile, WorkingHours } from '@/lib/mayu-hub/types'
import { computeStoreStatus } from '@/lib/mayu-hub/store-status'
import { buildWhatsAppLink } from '@/lib/mayu-hub/validation'
import { Phone, MessageCircle, Truck, Clock, MapPin, ArrowRight } from 'lucide-react'

interface StoreDetailProps {
  store: StoreProfile
  workingHours: WorkingHours[]
  neighborhoodName: string
  categoryName?: string
  deliveryNeighborhoods?: string[]
  onBack: () => void
}

const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

export function StoreDetail({ store, workingHours, neighborhoodName, categoryName, deliveryNeighborhoods, onBack }: StoreDetailProps) {
  const override = store.manualStatusOverride
    ? { status: store.manualStatusOverride as 'open' | 'closed', until: store.manualStatusOverrideUntil ? new Date(store.manualStatusOverrideUntil) : null }
    : null

  const status = computeStoreStatus(workingHours, new Date(), override)

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowRight className="w-4 h-4" />
        رجوع
      </button>

      {/* Store header */}
      <div className="text-center space-y-2">
        {/* Logo placeholder */}
        <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center text-3xl">
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.nameAr} className="w-full h-full rounded-full object-cover" />
          ) : (
            '🏪'
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-bold">{store.nameAr}</h2>
            {store.isPremium && <Badge>مميز</Badge>}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {categoryName && <span>{categoryName}</span>}
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {neighborhoodName}
            </span>
          </div>

          {/* Status */}
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${status === 'open' ? 'bg-green-500' : 'bg-red-500'}`} />
            {status === 'open' ? 'مفتوح الآن' : 'مغلق'}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <a
          href={`tel:${store.phone}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
        >
          <Phone className="w-4 h-4" />
          اتصل
        </a>
        {store.whatsappNumber && (
          <a
            href={buildWhatsAppLink(store.whatsappNumber, store.whatsappMessage ?? undefined)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            <MessageCircle className="w-4 h-4" />
            واتساب
          </a>
        )}
      </div>

      {/* Working hours */}
      <Card className="p-4">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4" />
          مواعيد العمل
        </h3>
        <div className="space-y-2">
          {workingHours.length === 0 ? (
            <p className="text-sm text-muted-foreground">لم يتم تحديد مواعيد العمل</p>
          ) : (
            dayNames.map((dayName, dayIndex) => {
              const hours = workingHours.find(wh => wh.dayOfWeek === dayIndex)
              const isToday = new Date().getDay() === dayIndex
              return (
                <div key={dayIndex} className={`flex justify-between text-sm ${isToday ? 'font-semibold text-primary' : ''}`}>
                  <span>{dayName}</span>
                  <span>
                    {hours && !hours.isClosed
                      ? `${hours.openTime} - ${hours.closeTime}`
                      : 'مغلق'
                    }
                  </span>
                </div>
              )
            })
          )}
        </div>
      </Card>

      {/* Delivery info */}
      {store.delivers && (
        <Card className="p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Truck className="w-4 h-4" />
            معلومات التوصيل
          </h3>
          <div className="space-y-2 text-sm">
            {store.deliveryCostEgp !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">تكلفة التوصيل</span>
                <span className="font-medium">{store.deliveryCostEgp} ج.م</span>
              </div>
            )}
            {store.deliveryDurationMinutes !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">الوقت المتوقع</span>
                <span className="font-medium">{store.deliveryDurationMinutes} دقيقة</span>
              </div>
            )}
            {deliveryNeighborhoods && deliveryNeighborhoods.length > 0 && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground">التوصيل متاح لـ:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {deliveryNeighborhoods.map(name => (
                      <Badge key={name} variant="secondary" className="text-xs">{name}</Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { emergencyServices, emergencyTypeLabels } from '@/lib/mayu-hub/emergency-data'
import type { EmergencyService } from '@/lib/mayu-hub/emergency-data'
import { Phone, MapPin, AlertTriangle } from 'lucide-react'

interface EmergencyViewProps {
  onBack: () => void
}

type FilterType = EmergencyService['type'] | 'all' | 'national'

export function EmergencyView({ onBack }: EmergencyViewProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredServices = emergencyServices.filter(service => {
    if (filter === 'all') return true
    if (filter === 'national') return service.isNational
    return service.type === filter
  })

  // Separate national (hotlines) from local services
  const nationalServices = filteredServices.filter(s => s.isNational)
  const localServices = filteredServices.filter(s => !s.isNational)

  const filterOptions: { key: FilterType; label: string; icon: string }[] = [
    { key: 'all', label: 'الكل', icon: '🆘' },
    { key: 'national', label: 'أرقام طوارئ', icon: '📞' },
    { key: 'pharmacy_24h', label: 'صيدليات 24h', icon: '💊' },
    { key: 'hospital', label: 'مستشفيات', icon: '🏥' },
    { key: 'medical_center', label: 'مراكز طبية', icon: '🩺' },
    { key: 'police', label: 'شرطة', icon: '🚔' },
    { key: 'civil_registry', label: 'سجل مدني', icon: '📋' },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h2 className="text-xl font-bold">الطوارئ</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        أرقام الطوارئ، صيدليات 24 ساعة، مستشفيات، ومراكز طبية
      </p>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setFilter(opt.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === opt.key
                ? 'border-red-500 bg-red-500/10 text-red-700'
                : 'border-border text-muted-foreground hover:border-red-500/50'
            }`}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>

      {/* National emergency numbers */}
      {nationalServices.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-red-600 flex items-center gap-1">
            📞 أرقام الطوارئ الوطنية
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {nationalServices.map(service => {
              const typeInfo = emergencyTypeLabels[service.type]
              return (
                <a
                  key={service.id}
                  href={`tel:${service.phone}`}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                >
                  <span className="text-2xl">{typeInfo.icon}</span>
                  <span className="text-xs font-medium text-center">{service.nameAr}</span>
                  <span className="text-lg font-bold text-red-600">{service.phone}</span>
                </a>
              )
            })}
          </div>
        </div>
      )}

      {/* Local services */}
      {localServices.length > 0 && (
        <div className="space-y-3">
          {nationalServices.length > 0 && (
            <h3 className="text-sm font-semibold text-muted-foreground mt-4">
              الخدمات المحلية
            </h3>
          )}
          {localServices.map(service => {
            const typeInfo = emergencyTypeLabels[service.type]
            return (
              <Card key={service.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span>{typeInfo.icon}</span>
                      <h4 className="font-semibold text-sm">{service.nameAr}</h4>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {typeInfo.label}
                    </Badge>
                    {service.address && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {service.address}
                      </p>
                    )}
                  </div>

                  {/* Call button */}
                  <a
                    href={`tel:${service.phone}`}
                    className="shrink-0 flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    اتصل
                  </a>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {filteredServices.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">لا توجد نتائج لهذا الفلتر</p>
        </div>
      )}
    </div>
  )
}

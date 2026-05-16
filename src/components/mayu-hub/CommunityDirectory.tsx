import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { filterCommunityServices, formatCommunityServiceDisplay } from '@/lib/mayu-hub/community-filter'
import { demoCommunityServices, demoNeighborhoods } from '@/lib/mayu-hub/demo-data'
import type { CommunityServiceType } from '@/lib/mayu-hub/types'
import { Phone, MapPin, ArrowRight } from 'lucide-react'

interface CommunityDirectoryProps {
  onBack: () => void
}

const serviceTypeLabels: Record<CommunityServiceType, string> = {
  school: '🏫 مدارس',
  post_office: '📮 مكاتب بريد',
  youth_center: '⚽ مراكز شباب',
  mosque: '🕌 مساجد',
  church: '⛪ كنائس',
  hospital: '🏥 مستشفيات',
  police_station: '🚔 أقسام شرطة',
  civil_registry: '📋 سجل مدني',
  gas_office: '🔥 مكاتب غاز',
  electricity_office: '⚡ مكاتب كهرباء',
}

const schoolTypeLabels: Record<string, string> = {
  government: 'حكومي',
  experimental: 'تجريبي',
  private: 'خاص',
}

const allTypes: CommunityServiceType[] = [
  'school', 'hospital', 'post_office', 'youth_center',
  'mosque', 'church', 'police_station', 'civil_registry',
  'gas_office', 'electricity_office'
]

export function CommunityDirectory({ onBack }: CommunityDirectoryProps) {
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<CommunityServiceType | null>(null)

  const activeNeighborhoods = demoNeighborhoods.filter(n => n.isActive)

  const filteredServices = useMemo(
    () => filterCommunityServices(demoCommunityServices, neighborhoodFilter, typeFilter),
    [neighborhoodFilter, typeFilter]
  )

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowRight className="w-4 h-4" />
        رجوع للخدمات
      </button>

      <h2 className="text-xl font-bold">الدليل المجتمعي</h2>
      <p className="text-sm text-muted-foreground">
        المدارس، المستشفيات، مكاتب البريد، والخدمات الحكومية
      </p>

      {/* Neighborhood filter */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">فلتر المجاورة:</label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setNeighborhoodFilter(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              neighborhoodFilter === null
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            الكل
          </button>
          {activeNeighborhoods.map(n => (
            <button
              key={n.id}
              onClick={() => setNeighborhoodFilter(n.id === neighborhoodFilter ? null : n.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                neighborhoodFilter === n.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {n.nameAr}
            </button>
          ))}
        </div>
      </div>

      {/* Type filter */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">نوع الخدمة:</label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setTypeFilter(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              typeFilter === null
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            الكل
          </button>
          {allTypes.map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type === typeFilter ? null : type)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                typeFilter === type
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {serviceTypeLabels[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filteredServices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد خدمات مطابقة</p>
            <p className="text-sm text-muted-foreground mt-1">
              جرب تغيير الفلاتر
            </p>
          </div>
        ) : (
          filteredServices.map(service => {
            const display = formatCommunityServiceDisplay(service)
            const neighborhood = demoNeighborhoods.find(n => n.id === service.neighborhoodId)

            return (
              <Card key={service.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{service.nameAr}</h3>
                      <span className="text-xs text-muted-foreground">
                        {serviceTypeLabels[service.type]}
                      </span>
                    </div>
                    {service.type === 'school' && service.schoolType && (
                      <Badge variant="secondary" className="text-xs">
                        {schoolTypeLabels[service.schoolType]}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {display.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {display.address}
                      </span>
                    )}
                    {display.phone && (
                      <a href={`tel:${service.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                        <Phone className="w-3 h-3" />
                        {display.phone}
                      </a>
                    )}
                    {neighborhood && (
                      <span className="text-muted-foreground">
                        📍 {neighborhood.nameAr}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {filteredServices.length} نتيجة
      </p>
    </div>
  )
}

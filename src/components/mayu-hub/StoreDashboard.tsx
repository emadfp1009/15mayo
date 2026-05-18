import { getCurrentUser, getStoreActivityLogs } from '@/lib/mayu-hub/auth'
import { realStores } from '@/lib/mayu-hub/real-data'
import { useStoreViews } from '@/hooks/mayu-hub/useStoreViews'
import { useRatings } from '@/hooks/mayu-hub/useRatings'
import { useFavorites } from '@/hooks/mayu-hub/useFavorites'
import { Eye, Heart, Star, Activity, Store, Phone, MapPin, Truck } from 'lucide-react'
import type { ActivityLog } from '@/lib/mayu-hub/auth'

interface StoreDashboardProps {
  onBack: () => void
  onRegisterStore?: () => void
}

export function StoreDashboard({ onBack, onRegisterStore }: StoreDashboardProps) {
  const user = getCurrentUser()

  // Find the store owned by the current user
  const userStore = user ? realStores.find(s => s.ownerId === user.id) : null

  if (!userStore) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">🏪 متجري</h2>
          <button onClick={onBack} className="text-sm text-primary">← رجوع</button>
        </div>

        <div className="text-center py-16">
          <Store className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-base font-semibold text-muted-foreground">ليس لديك متجر مسجل</h3>
          <p className="text-sm text-muted-foreground mt-1">سجل محلك وابدأ في الوصول لعملاء جدد</p>
          {onRegisterStore && (
            <button
              onClick={onRegisterStore}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              سجل محلك
            </button>
          )}
        </div>
      </div>
    )
  }

  return <OwnerDashboard store={userStore} onBack={onBack} />
}

function OwnerDashboard({ store, onBack }: { store: typeof realStores[number]; onBack: () => void }) {
  const { viewCount } = useStoreViews(store.id)
  const { averageRating, totalRatings } = useRatings(store.id)
  const { getFavoritesCount } = useFavorites()
  const favoritesCount = getFavoritesCount(store.id)
  const activityLogs = getStoreActivityLogs(store.id)

  // Recent activity (last 10)
  const recentActivity = [...activityLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">🏪 {store.nameAr}</h2>
        <button onClick={onBack} className="text-sm text-primary">← رجوع</button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Eye className="w-5 h-5 text-blue-500" />} label="المشاهدات" value={viewCount} />
        <StatCard icon={<Heart className="w-5 h-5 text-red-500" />} label="المفضلة" value={favoritesCount} />
        <StatCard icon={<Star className="w-5 h-5 text-yellow-500" />} label="التقييم" value={averageRating > 0 ? `${averageRating} (${totalRatings})` : '—'} />
      </div>

      {/* Store Info */}
      <StoreInfoSection store={store} />

      {/* Recent Activity */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-1">
          <Activity className="w-4 h-4" /> النشاط الأخير
        </h3>
        {recentActivity.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">لا يوجد نشاط بعد</p>
        ) : (
          <div className="space-y-1">
            {recentActivity.map(log => (
              <ActivityItem key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="p-3 rounded-lg border bg-card text-center space-y-1">
      <div className="flex justify-center">{icon}</div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function StoreInfoSection({ store }: { store: typeof realStores[number] }) {
  return (
    <div className="p-3 rounded-lg border bg-card space-y-2">
      <h3 className="text-sm font-semibold">معلومات المتجر</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="w-4 h-4 shrink-0" />
          <span>{store.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4 shrink-0" />
          <span>{store.address || 'لم يتم تحديد العنوان'}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Truck className="w-4 h-4 shrink-0" />
          <span>{store.delivers ? `يوصل (${store.deliveryCostEgp} ج.م - ${store.deliveryDurationMinutes} دقيقة)` : 'لا يوصل'}</span>
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ log }: { log: ActivityLog }) {
  const actionLabels: Record<string, string> = {
    view_store: '👁️ مشاهدة',
    call_store: '📞 اتصال',
    whatsapp_store: '💬 واتساب',
    register_store: '🏪 تسجيل',
  }

  const label = actionLabels[log.action] || log.action
  const time = formatRelativeTime(log.timestamp)

  return (
    <div className="flex items-center justify-between p-2 rounded bg-muted/50 text-xs">
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <span className="text-muted-foreground">— {log.userName}</span>
      </div>
      <span className="text-muted-foreground">{time}</span>
    </div>
  )
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return 'الآن'
  if (diffMinutes < 60) return `منذ ${diffMinutes} د`
  if (diffHours < 24) return `منذ ${diffHours} س`
  if (diffDays < 7) return `منذ ${diffDays} ي`

  return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
}

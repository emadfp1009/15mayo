import { useState, useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { realStores } from '@/lib/mayu-hub/real-data'
import { getUsers } from '@/lib/mayu-hub/auth'
import { getRatings, getMarketplace, setMarketplace } from '@/lib/mayu-hub/local-storage'
import { computeAverageRating } from '@/lib/mayu-hub/ratings'
import { ArrowRight, Store, Users, BarChart3, Image, ShieldCheck, Trash2, CheckCircle, XCircle, Plus } from 'lucide-react'
import type { BannerAd, ClassifiedAd } from '@/lib/mayu-hub/types'

interface AdminPanelProps {
  onBack: () => void
}

const BANNERS_KEY = 'mayu_hub_banners'

function getSavedBanners(): BannerAd[] {
  try {
    const raw = localStorage.getItem(BANNERS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as BannerAd[]
  } catch {
    return []
  }
}

function saveBanners(banners: BannerAd[]): void {
  localStorage.setItem(BANNERS_KEY, JSON.stringify(banners))
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  return (
    <div className="space-y-4">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowRight className="w-4 h-4" />
          رجوع
        </button>
        <h2 className="text-lg font-bold">⚙️ لوحة الإدارة</h2>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stores" className="w-full">
        <TabsList className="w-full grid grid-cols-5 h-10 mb-4">
          <TabsTrigger value="stores" className="text-xs font-medium gap-1">
            <Store className="w-3.5 h-3.5" />
            المتاجر
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs font-medium gap-1">
            <Users className="w-3.5 h-3.5" />
            المستخدمين
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs font-medium gap-1">
            <BarChart3 className="w-3.5 h-3.5" />
            الإحصائيات
          </TabsTrigger>
          <TabsTrigger value="banners" className="text-xs font-medium gap-1">
            <Image className="w-3.5 h-3.5" />
            البانرات
          </TabsTrigger>
          <TabsTrigger value="moderation" className="text-xs font-medium gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            إدارة السوق
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stores">
          <StoresTab />
        </TabsContent>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
        <TabsContent value="banners">
          <BannersTab />
        </TabsContent>
        <TabsContent value="moderation">
          <ModerationTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================
// Tab 1: Stores Management
// ============================================

function StoresTab() {
  const [stores, setStores] = useState(realStores)

  const pendingStores = stores.filter(s => s.status === 'pending')
  const approvedStores = stores.filter(s => s.status === 'approved')
  const rejectedStores = stores.filter(s => s.status === 'rejected')

  function handleApprove(storeId: string) {
    setStores(prev => prev.map(s => s.id === storeId ? { ...s, status: 'approved' as const } : s))
  }

  function handleReject(storeId: string) {
    const reason = prompt('سبب الرفض:')
    if (!reason) return
    setStores(prev => prev.map(s => s.id === storeId ? { ...s, status: 'rejected' as const, rejectionReason: reason } : s))
  }

  return (
    <div className="space-y-4">
      {/* Pending stores */}
      <div>
        <h3 className="text-sm font-bold mb-2">⏳ في انتظار الموافقة ({pendingStores.length})</h3>
        {pendingStores.length === 0 ? (
          <p className="text-xs text-muted-foreground">لا توجد متاجر معلقة</p>
        ) : (
          <div className="space-y-2">
            {pendingStores.map(store => (
              <div key={store.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div>
                  <p className="text-sm font-medium">{store.nameAr}</p>
                  <p className="text-xs text-muted-foreground">{store.address}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(store.id)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    <CheckCircle className="w-3 h-3" />
                    قبول
                  </button>
                  <button
                    onClick={() => handleReject(store.id)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <XCircle className="w-3 h-3" />
                    رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved stores */}
      <div>
        <h3 className="text-sm font-bold mb-2">✅ متاجر مقبولة ({approvedStores.length})</h3>
        <div className="space-y-1">
          {approvedStores.map(store => (
            <div key={store.id} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
              <p className="text-sm">{store.nameAr}</p>
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">مقبول</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rejected stores */}
      {rejectedStores.length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-2">❌ متاجر مرفوضة ({rejectedStores.length})</h3>
          <div className="space-y-1">
            {rejectedStores.map(store => (
              <div key={store.id} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                <div>
                  <p className="text-sm">{store.nameAr}</p>
                  {store.rejectionReason && <p className="text-xs text-red-500">{store.rejectionReason}</p>}
                </div>
                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">مرفوض</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// Tab 2: Users Management
// ============================================

function UsersTab() {
  const users = useMemo(() => getUsers(), [])

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold">👥 المستخدمين ({users.length})</h3>
      <div className="space-y-2">
        {users.map(user => (
          <div key={user.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.phone || 'بدون رقم'}</p>
            </div>
            <div className="flex items-center gap-2">
              {user.isAdmin && (
                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">مدير</span>
              )}
              {user.isGuest && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 rounded-full">زائر</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Tab 3: Analytics
// ============================================

function AnalyticsTab() {
  const stats = useMemo(() => {
    const users = getUsers()
    const ratings = getRatings()

    // Compute average rating across ALL stores
    let totalRatingSum = 0
    let totalRatingCount = 0
    for (const storeId of Object.keys(ratings)) {
      const storeRatings = ratings[storeId]
      const { average, total } = computeAverageRating(storeRatings)
      if (total > 0) {
        totalRatingSum += average * total
        totalRatingCount += total
      }
    }
    const overallAverage = totalRatingCount > 0
      ? Math.round((totalRatingSum / totalRatingCount) * 10) / 10
      : 0

    return {
      totalStores: realStores.length,
      totalUsers: users.length,
      averageRating: overallAverage,
      totalRatings: totalRatingCount,
    }
  }, [])

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold">📊 الإحصائيات</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.totalStores}</p>
          <p className="text-xs text-muted-foreground mt-1">إجمالي المتاجر</p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.totalUsers}</p>
          <p className="text-xs text-muted-foreground mt-1">إجمالي المستخدمين</p>
        </div>
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 text-center col-span-2">
          <p className="text-2xl font-bold text-yellow-600">⭐ {stats.averageRating}</p>
          <p className="text-xs text-muted-foreground mt-1">متوسط التقييم ({stats.totalRatings} تقييم)</p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Tab 4: Banners Management
// ============================================

function BannersTab() {
  const [banners, setBanners] = useState<BannerAd[]>(getSavedBanners)
  const [showForm, setShowForm] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [targetType, setTargetType] = useState<'store' | 'external'>('store')
  const [targetStoreId, setTargetStoreId] = useState('')

  function handleAdd() {
    if (!imageUrl.trim()) return
    const newBanner: BannerAd = {
      id: `banner-${Date.now()}`,
      imageUrl: imageUrl.trim(),
      targetType,
      targetStoreId: targetType === 'store' ? targetStoreId : null,
      targetUrl: null,
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      sortOrder: banners.length,
    }
    const updated = [...banners, newBanner]
    setBanners(updated)
    saveBanners(updated)
    setImageUrl('')
    setTargetStoreId('')
    setShowForm(false)
  }

  function handleRemove(bannerId: string) {
    const updated = banners.filter(b => b.id !== bannerId)
    setBanners(updated)
    saveBanners(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">🖼️ البانرات ({banners.length})</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-3 h-3" />
          إضافة بانر
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="p-3 bg-secondary rounded-lg space-y-3">
          <div>
            <label className="text-xs font-medium block mb-1">رابط الصورة</label>
            <input
              type="text"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">نوع الهدف</label>
            <select
              value={targetType}
              onChange={e => setTargetType(e.target.value as 'store' | 'external')}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
            >
              <option value="store">متجر</option>
              <option value="external">رابط خارجي</option>
            </select>
          </div>
          {targetType === 'store' && (
            <div>
              <label className="text-xs font-medium block mb-1">المتجر المستهدف</label>
              <select
                value={targetStoreId}
                onChange={e => setTargetStoreId(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
              >
                <option value="">اختر متجر</option>
                {realStores.map(s => (
                  <option key={s.id} value={s.id}>{s.nameAr}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="px-3 py-1.5 text-xs bg-green-500 text-white rounded hover:bg-green-600"
            >
              حفظ
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Banners list */}
      {banners.length === 0 ? (
        <p className="text-xs text-muted-foreground">لا توجد بانرات</p>
      ) : (
        <div className="space-y-2">
          {banners.map(banner => (
            <div key={banner.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src={banner.imageUrl}
                  alt="banner"
                  className="w-16 h-10 object-cover rounded"
                  onError={e => { (e.target as HTMLImageElement).src = '' }}
                />
                <div>
                  <p className="text-xs font-medium">
                    {banner.targetType === 'store' ? `متجر: ${realStores.find(s => s.id === banner.targetStoreId)?.nameAr || 'غير محدد'}` : 'رابط خارجي'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {banner.isActive ? '🟢 نشط' : '🔴 غير نشط'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(banner.id)}
                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// Tab 5: Marketplace Moderation
// ============================================

function ModerationTab() {
  const [ads, setAds] = useState<ClassifiedAd[]>(getMarketplace)

  function handleRemoveAd(adId: string) {
    const updated = ads.filter(a => a.id !== adId)
    setAds(updated)
    setMarketplace(updated)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold">🛡️ إدارة السوق ({ads.length} إعلان)</h3>

      {ads.length === 0 ? (
        <p className="text-xs text-muted-foreground">لا توجد إعلانات في السوق</p>
      ) : (
        <div className="space-y-2">
          {ads.map(ad => (
            <div key={ad.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <p className="text-sm font-medium">{ad.title}</p>
                <p className="text-xs text-muted-foreground">
                  {ad.userName} • {ad.price} ج.م • {new Date(ad.createdAt).toLocaleDateString('ar-EG')}
                </p>
              </div>
              <button
                onClick={() => handleRemoveAd(ad.id)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              >
                <Trash2 className="w-3 h-3" />
                حذف
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

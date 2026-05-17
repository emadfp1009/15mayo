import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { demoBanners } from '@/lib/mayu-hub/demo-data'
import type { BannerAd } from '@/lib/mayu-hub/types'
import { Image, Plus, Trash2 } from 'lucide-react'

export function BannerManagement() {
  const [banners, setBanners] = useState<BannerAd[]>(demoBanners)
  const [newUrl, setNewUrl] = useState('')

  const handleAdd = () => {
    if (!newUrl.trim()) return
    const newBanner: BannerAd = {
      id: `banner-${Date.now()}`,
      imageUrl: newUrl,
      targetType: 'external',
      targetStoreId: null,
      targetUrl: '#',
      startsAt: new Date().toISOString().split('T')[0],
      endsAt: '2026-12-31',
      isActive: true,
      sortOrder: banners.length + 1,
    }
    setBanners(prev => [...prev, newBanner])
    setNewUrl('')
  }

  const handleDelete = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id))
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">🖼️ إدارة البانرات ({banners.length}/6)</h3>
      <p className="text-xs text-muted-foreground">أضف حتى 6 صور بانر — بتدور تلقائي كل 3 ثواني</p>

      {/* Current banners */}
      <div className="grid grid-cols-2 gap-2">
        {banners.map((banner, idx) => (
          <Card key={banner.id} className="overflow-hidden relative group">
            <img src={banner.imageUrl} alt={`بانر ${idx + 1}`} className="w-full h-20 object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <Button
                size="sm"
                variant="destructive"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs"
                onClick={() => handleDelete(banner.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
              {idx + 1}
            </div>
          </Card>
        ))}
      </div>

      {/* Add new */}
      {banners.length < 6 && (
        <Card className="p-4 space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            إضافة بانر جديد
          </h4>
          <div className="space-y-2">
            <Label className="text-xs">رابط الصورة</Label>
            <Input
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="https://..."
              dir="ltr"
              className="text-xs"
            />
            {newUrl && (
              <img src={newUrl} alt="preview" className="w-full h-20 object-cover rounded-lg" />
            )}
          </div>
          <Button onClick={handleAdd} className="w-full" disabled={!newUrl.trim()}>
            <Image className="w-4 h-4 ml-2" />
            إضافة
          </Button>
        </Card>
      )}
    </div>
  )
}

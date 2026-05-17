import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { uploadBannerImage } from '@/lib/mayu-hub/storage'
import { demoBanners } from '@/lib/mayu-hub/demo-data'
import type { BannerAd } from '@/lib/mayu-hub/types'
import { Upload, Trash2, Loader2 } from 'lucide-react'

export function BannerManagement() {
  const [banners, setBanners] = useState<BannerAd[]>(demoBanners)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (banners.length >= 6) { setError('الحد الأقصى 6 بانرات'); return }

    setUploading(true)
    setError('')

    try {
      const imageUrl = await uploadBannerImage(file)
      const newBanner: BannerAd = {
        id: `banner-${Date.now()}`,
        imageUrl,
        targetType: 'external',
        targetStoreId: null,
        targetUrl: '#',
        startsAt: new Date().toISOString().split('T')[0],
        endsAt: '2026-12-31',
        isActive: true,
        sortOrder: banners.length + 1,
      }
      setBanners(prev => [...prev, newBanner])
    } catch (err: any) {
      setError(err.message || 'فشل رفع الصورة')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id))
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">🖼️ إدارة البانرات ({banners.length}/6)</h3>
      <p className="text-xs text-muted-foreground">ارفع حتى 6 صور بانر — بتدور تلقائي كل 3 ثواني</p>

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

      {/* Upload new */}
      {banners.length < 6 && (
        <Card className="p-6">
          <label className="flex flex-col items-center gap-3 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <>
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">جاري الرفع...</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm font-medium">اضغط لرفع صورة بانر</p>
                <p className="text-xs text-muted-foreground">JPG, PNG — حتى 5MB</p>
              </>
            )}
          </label>
        </Card>
      )}

      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </div>
  )
}

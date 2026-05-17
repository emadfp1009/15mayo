import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Megaphone } from 'lucide-react'

interface PromoConfig {
  imageUrl: string
  title: string
  description: string
  buttonText: string
  enabled: boolean
}

const PROMO_CONFIG_KEY = 'mayu_hub_promo_config'

function getPromoConfig(): PromoConfig {
  const data = localStorage.getItem(PROMO_CONFIG_KEY)
  if (!data) return {
    imageUrl: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=400&fit=crop&q=80',
    title: '🎉 عروض افتتاح مايو هب!',
    description: 'سجل محلك مجاناً واحصل على شهر مميز هدية — العرض لفترة محدودة',
    buttonText: 'سجل محلك الآن',
    enabled: true,
  }
  return JSON.parse(data)
}

export function PromoManagement() {
  const [config, setConfig] = useState<PromoConfig>(getPromoConfig())
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    localStorage.setItem(PROMO_CONFIG_KEY, JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Megaphone className="w-5 h-5" />
        إدارة الإعلان المنبثق
      </h3>
      <p className="text-xs text-muted-foreground">الإعلان اللي بيظهر أول ما العميل يفتح التطبيق</p>

      {/* Enable/Disable */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">تفعيل الإعلان</span>
          <button
            onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`w-12 h-6 rounded-full transition-colors relative ${config.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${config.enabled ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>
      </Card>

      {config.enabled && (
        <Card className="p-4 space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">صورة الإعلان (رابط)</Label>
            <Input
              value={config.imageUrl}
              onChange={e => setConfig(prev => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://..."
              dir="ltr"
              className="text-xs"
            />
            {config.imageUrl && (
              <img src={config.imageUrl} alt="preview" className="w-full h-32 object-cover rounded-lg" />
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs">عنوان الإعلان</Label>
            <Input
              value={config.title}
              onChange={e => setConfig(prev => ({ ...prev, title: e.target.value }))}
              placeholder="عنوان الإعلان..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">وصف الإعلان</Label>
            <Textarea
              value={config.description}
              onChange={e => setConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="تفاصيل العرض..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">نص الزر</Label>
            <Input
              value={config.buttonText}
              onChange={e => setConfig(prev => ({ ...prev, buttonText: e.target.value }))}
              placeholder="اضغط هنا..."
            />
          </div>
        </Card>
      )}

      <button onClick={handleSave} className="btn-modern w-full py-3 gradient-primary text-white font-medium">
        {saved ? '✓ تم الحفظ' : 'حفظ الإعلان'}
      </button>
    </div>
  )
}

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSettings, updateSettings } from '@/lib/mayu-hub/settings'
import { Palette, Image, Clock } from 'lucide-react'

export function SettingsPanel() {
  const [settings, setSettings] = useState(getSettings())
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    updateSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">⚙️ إعدادات التطبيق</h3>

      {/* Colors */}
      <Card className="p-4 space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Palette className="w-4 h-4" />
          الألوان
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">اللون الأساسي</Label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={e => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <Input
                value={settings.primaryColor}
                onChange={e => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">اللون الثانوي</Label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={settings.accentColor}
                onChange={e => setSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <Input
                value={settings.accentColor}
                onChange={e => setSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Login Background */}
      <Card className="p-4 space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Image className="w-4 h-4" />
          خلفية شاشة الدخول
        </h4>
        <Input
          value={settings.loginBackgroundUrl}
          onChange={e => setSettings(prev => ({ ...prev, loginBackgroundUrl: e.target.value }))}
          placeholder="رابط الصورة..."
          dir="ltr"
          className="text-xs"
        />
        {settings.loginBackgroundUrl && (
          <img src={settings.loginBackgroundUrl} alt="preview" className="w-full h-24 object-cover rounded-lg" />
        )}
      </Card>

      {/* Banner Settings */}
      <Card className="p-4 space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Clock className="w-4 h-4" />
          إعدادات البانر
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">وقت الدوران (ثواني)</Label>
            <Input
              type="number"
              value={settings.bannerRotationSeconds}
              onChange={e => setSettings(prev => ({ ...prev, bannerRotationSeconds: Number(e.target.value) || 3 }))}
              min={1}
              max={30}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">أقصى عدد بانرات</Label>
            <Input
              type="number"
              value={settings.maxBanners}
              onChange={e => setSettings(prev => ({ ...prev, maxBanners: Number(e.target.value) || 6 }))}
              min={1}
              max={10}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Save */}
      <button onClick={handleSave} className="btn-modern w-full py-3 gradient-primary text-white font-medium">
        {saved ? '✓ تم الحفظ' : 'حفظ الإعدادات'}
      </button>
    </div>
  )
}

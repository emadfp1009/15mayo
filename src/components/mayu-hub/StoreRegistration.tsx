import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { demoNeighborhoods, demoCategories } from '@/lib/mayu-hub/demo-data'
import { validateStoreProfile } from '@/lib/mayu-hub/validation'
import type { StoreProfileInput, WorkingHoursInput } from '@/lib/mayu-hub/types'
import { ArrowRight, Store, Check } from 'lucide-react'

interface StoreRegistrationProps {
  onBack: () => void
}

const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

export function StoreRegistration({ onBack }: StoreRegistrationProps) {
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    nameAr: '',
    phone: '',
    neighborhoodId: '',
    categoryId: '',
    whatsappNumber: '',
    whatsappMessage: '',
    delivers: false,
    deliveryCostEgp: '',
    deliveryDurationMinutes: '',
  })

  const [workingHours, setWorkingHours] = useState<WorkingHoursInput[]>(
    dayNames.map((_, i) => ({
      dayOfWeek: i,
      openTime: '09:00',
      closeTime: '22:00',
      isClosed: i === 5, // Friday closed by default
    }))
  )

  const handleSubmit = () => {
    const input: StoreProfileInput = {
      nameAr: formData.nameAr,
      phone: formData.phone,
      neighborhoodId: formData.neighborhoodId,
      workingHours: workingHours.filter(wh => !wh.isClosed),
      whatsappNumber: formData.whatsappNumber || undefined,
      whatsappMessage: formData.whatsappMessage || undefined,
      categoryId: formData.categoryId || undefined,
      delivers: formData.delivers,
      deliveryCostEgp: formData.deliveryCostEgp ? Number(formData.deliveryCostEgp) : undefined,
      deliveryDurationMinutes: formData.deliveryDurationMinutes ? Number(formData.deliveryDurationMinutes) : undefined,
    }

    const result = validateStoreProfile(input)
    if (!result.valid) {
      setErrors(result.errors)
      return
    }

    setErrors({})
    setSubmitted(true)
  }

  const toggleDayClosed = (dayIndex: number) => {
    setWorkingHours(prev => prev.map(wh =>
      wh.dayOfWeek === dayIndex ? { ...wh, isClosed: !wh.isClosed } : wh
    ))
  }

  const updateDayTime = (dayIndex: number, field: 'openTime' | 'closeTime', value: string) => {
    setWorkingHours(prev => prev.map(wh =>
      wh.dayOfWeek === dayIndex ? { ...wh, [field]: value } : wh
    ))
  }

  if (submitted) {
    return (
      <div className="space-y-4 py-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold">تم إرسال الطلب بنجاح!</h2>
        <p className="text-muted-foreground">
          طلبك في انتظار الموافقة من الإدارة. هنبلغك لما يتم الموافقة.
        </p>
        <Badge variant="outline" className="text-sm">⏳ في انتظار الموافقة</Badge>
        <div className="pt-4">
          <Button variant="outline" onClick={onBack}>
            رجوع للصفحة الرئيسية
          </Button>
        </div>
      </div>
    )
  }

  const activeNeighborhoods = demoNeighborhoods.filter(n => n.isActive)

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowRight className="w-4 h-4" />
        رجوع
      </button>

      <div className="flex items-center gap-2">
        <Store className="w-5 h-5" />
        <h2 className="text-xl font-bold">تسجيل متجر جديد</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        سجل محلك عشان يظهر لسكان مدينة 15 مايو
      </p>

      {/* Basic Info */}
      <Card className="p-4 space-y-4">
        <h3 className="font-semibold text-sm">البيانات الأساسية</h3>

        <div className="space-y-2">
          <Label htmlFor="nameAr">اسم المتجر *</Label>
          <Input
            id="nameAr"
            value={formData.nameAr}
            onChange={e => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
            placeholder="مثال: صيدلية الشفاء"
          />
          {errors.nameAr && <p className="text-xs text-destructive">{errors.nameAr}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+201012345678"
            dir="ltr"
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <Label>المجاورة *</Label>
          <div className="grid grid-cols-3 gap-2">
            {activeNeighborhoods.map(n => (
              <button
                key={n.id}
                onClick={() => setFormData(prev => ({ ...prev, neighborhoodId: n.id }))}
                className={`p-2 rounded border text-xs text-center transition-colors ${
                  formData.neighborhoodId === n.id
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {n.nameAr}
              </button>
            ))}
          </div>
          {errors.neighborhoodId && <p className="text-xs text-destructive">{errors.neighborhoodId}</p>}
        </div>

        <div className="space-y-2">
          <Label>الفئة</Label>
          <div className="flex flex-wrap gap-2">
            {demoCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFormData(prev => ({ ...prev, categoryId: cat.id }))}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  formData.categoryId === cat.id
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {cat.icon} {cat.nameAr}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* WhatsApp */}
      <Card className="p-4 space-y-4">
        <h3 className="font-semibold text-sm">واتساب (اختياري)</h3>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">رقم الواتساب</Label>
          <Input
            id="whatsapp"
            value={formData.whatsappNumber}
            onChange={e => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
            placeholder="+201012345678"
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsappMsg">رسالة الترحيب (256 حرف كحد أقصى)</Label>
          <Textarea
            id="whatsappMsg"
            value={formData.whatsappMessage}
            onChange={e => setFormData(prev => ({ ...prev, whatsappMessage: e.target.value }))}
            placeholder="مرحباً، أريد الاستفسار عن..."
            maxLength={256}
            rows={2}
          />
          <p className="text-xs text-muted-foreground text-left" dir="ltr">
            {formData.whatsappMessage.length}/256
          </p>
        </div>
      </Card>

      {/* Working Hours */}
      <Card className="p-4 space-y-4">
        <h3 className="font-semibold text-sm">مواعيد العمل *</h3>
        {errors.workingHours && <p className="text-xs text-destructive">{errors.workingHours}</p>}

        <div className="space-y-2">
          {workingHours.map((wh, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <button
                onClick={() => toggleDayClosed(idx)}
                className={`w-16 text-xs py-1 rounded ${
                  wh.isClosed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}
              >
                {wh.isClosed ? 'مغلق' : 'مفتوح'}
              </button>
              <span className="w-16 text-xs">{dayNames[idx]}</span>
              {!wh.isClosed && (
                <>
                  <Input
                    type="time"
                    value={wh.openTime}
                    onChange={e => updateDayTime(idx, 'openTime', e.target.value)}
                    className="w-24 text-xs h-8"
                  />
                  <span className="text-xs">-</span>
                  <Input
                    type="time"
                    value={wh.closeTime}
                    onChange={e => updateDayTime(idx, 'closeTime', e.target.value)}
                    className="w-24 text-xs h-8"
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Delivery */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">التوصيل</h3>
          <button
            onClick={() => setFormData(prev => ({ ...prev, delivers: !prev.delivers }))}
            className={`w-10 h-5 rounded-full transition-colors relative ${
              formData.delivers ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
              formData.delivers ? 'right-0.5' : 'left-0.5'
            }`} />
          </button>
        </div>

        {formData.delivers && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">التكلفة (ج.م)</Label>
              <Input
                type="number"
                value={formData.deliveryCostEgp}
                onChange={e => setFormData(prev => ({ ...prev, deliveryCostEgp: e.target.value }))}
                placeholder="15"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">المدة (دقيقة)</Label>
              <Input
                type="number"
                value={formData.deliveryDurationMinutes}
                onChange={e => setFormData(prev => ({ ...prev, deliveryDurationMinutes: e.target.value }))}
                placeholder="30"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Submit */}
      <Button onClick={handleSubmit} className="w-full" size="lg">
        إرسال الطلب
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        بعد الإرسال، هيتم مراجعة طلبك من الإدارة والموافقة عليه
      </p>
    </div>
  )
}

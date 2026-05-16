import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { demoNeighborhoods } from '@/lib/mayu-hub/demo-data'

interface OnboardingScreenProps {
  onComplete: (data: { name: string; phone: string; neighborhoodId: string }) => void
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [neighborhoodId, setNeighborhoodId] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const activeNeighborhoods = demoNeighborhoods.filter(n => n.isActive)

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'الاسم مطلوب'
    if (!phone.trim()) newErrors.phone = 'رقم الهاتف مطلوب'
    if (!neighborhoodId) newErrors.neighborhood = 'اختر مجاورتك'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onComplete({ name, phone, neighborhoodId })
  }

  return (
    <div className="min-h-screen gradient-dark flex flex-col items-center justify-center px-6 py-12">
      {/* Logo & Welcome */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-24 h-24 mx-auto mb-4 rounded-3xl gradient-primary flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-float">
          <span className="text-5xl">🏘️</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">مايو هب</h1>
        <p className="text-blue-200/80 text-sm">دليل خدمات مدينة 15 مايو</p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-sm glass rounded-3xl p-6 shadow-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-lg font-bold text-center mb-6">سجل عشان تبدأ</h2>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">الاسم</Label>
            <Input
              value={name}
              onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })) }}
              placeholder="اسمك..."
              className="h-12 rounded-xl bg-secondary/50 border-0 text-base placeholder:text-muted-foreground/50"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">رقم الموبايل</Label>
            <Input
              value={phone}
              onChange={e => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: '' })) }}
              placeholder="01012345678"
              dir="ltr"
              className="h-12 rounded-xl bg-secondary/50 border-0 text-base text-right placeholder:text-muted-foreground/50"
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          {/* Neighborhood */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">المجاورة</Label>
            <div className="grid grid-cols-3 gap-2">
              {activeNeighborhoods.map(n => (
                <button
                  key={n.id}
                  onClick={() => { setNeighborhoodId(n.id); setErrors(prev => ({ ...prev, neighborhood: '' })) }}
                  className={`
                    h-12 rounded-xl text-sm font-medium transition-all duration-200
                    ${neighborhoodId === n.id
                      ? 'gradient-primary text-white shadow-lg shadow-blue-500/30 scale-105'
                      : 'bg-secondary/50 text-foreground hover:bg-secondary'
                    }
                  `}
                >
                  {n.number}
                </button>
              ))}
            </div>
            {errors.neighborhood && <p className="text-xs text-destructive">{errors.neighborhood}</p>}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="btn-modern w-full h-14 mt-6 gradient-primary text-white text-lg shadow-xl shadow-blue-500/25"
        >
          يلا نبدأ 🚀
        </button>
      </div>

      <p className="text-blue-300/50 text-xs mt-6">مايو هب © 2025</p>
    </div>
  )
}

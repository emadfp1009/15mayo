import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { demoNeighborhoods } from '@/lib/mayu-hub/demo-data'
import { ChevronDown, MapPin } from 'lucide-react'

interface OnboardingScreenProps {
  onComplete: (data: { name: string; phone: string; neighborhoodId: string }) => void
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [neighborhoodId, setNeighborhoodId] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const allNeighborhoods = demoNeighborhoods
  const selectedNeighborhood = allNeighborhoods.find(n => n.id === neighborhoodId)

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

          {/* Neighborhood Dropdown */}
          <div className="space-y-1.5 relative">
            <Label className="text-sm font-medium text-muted-foreground">المجاورة</Label>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`
                w-full h-12 rounded-xl bg-secondary/50 px-4 flex items-center justify-between
                text-base transition-all
                ${neighborhoodId ? 'text-foreground' : 'text-muted-foreground/50'}
                ${showDropdown ? 'ring-2 ring-primary/50' : ''}
              `}
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {selectedNeighborhood ? selectedNeighborhood.nameAr : 'اختر مجاورتك...'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-border/50 max-h-48 overflow-y-auto z-50 animate-slide-down">
                {allNeighborhoods.map(n => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setNeighborhoodId(n.id)
                      setShowDropdown(false)
                      setErrors(prev => ({ ...prev, neighborhood: '' }))
                    }}
                    className={`
                      w-full px-4 py-3 text-right text-sm flex items-center justify-between
                      transition-colors hover:bg-primary/5
                      ${neighborhoodId === n.id ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}
                      ${!n.isActive ? 'opacity-50' : ''}
                    `}
                  >
                    <span>{n.nameAr}</span>
                    <span className="flex items-center gap-2">
                      {n.isActive && (
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                      {neighborhoodId === n.id && <span className="text-primary">✓</span>}
                    </span>
                  </button>
                ))}
              </div>
            )}
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

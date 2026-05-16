import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { demoNeighborhoods } from '@/lib/mayu-hub/demo-data'
import { findUserByPhone, registerUser, verifyPin, setCurrentUser } from '@/lib/mayu-hub/auth'
import type { UserProfile } from '@/lib/mayu-hub/auth'
import { ChevronDown, MapPin, Lock } from 'lucide-react'

interface OnboardingScreenProps {
  onComplete: (user: UserProfile) => void
}

type Step = 'phone' | 'pin' | 'register'

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [name, setName] = useState('')
  const [newPin, setNewPin] = useState('')
  const [neighborhoodId, setNeighborhoodId] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState('')

  const allNeighborhoods = demoNeighborhoods
  const selectedNeighborhood = allNeighborhoods.find(n => n.id === neighborhoodId)

  // Step 1: Enter phone
  const handlePhoneSubmit = () => {
    if (!phone.trim()) { setError('ادخل رقم الموبايل'); return }
    setError('')

    const existingUser = findUserByPhone(phone)
    if (existingUser) {
      setStep('pin') // User exists, ask for PIN
    } else {
      setStep('register') // New user, register
    }
  }

  // Step 2a: Verify PIN (existing user)
  const handlePinSubmit = () => {
    if (pin.length !== 4) { setError('الرقم السري 4 أرقام'); return }

    const user = verifyPin(phone, pin)
    if (!user) { setError('الرقم السري غلط'); return }

    setCurrentUser(user)
    onComplete(user)
  }

  // Step 2b: Register (new user)
  const handleRegister = () => {
    const errors: string[] = []
    if (!name.trim()) errors.push('الاسم مطلوب')
    if (newPin.length !== 4) errors.push('الرقم السري لازم 4 أرقام')
    if (!neighborhoodId) errors.push('اختر مجاورتك')

    if (errors.length > 0) { setError(errors[0]); return }

    try {
      const user = registerUser({ name, phone, pin: newPin, neighborhoodId })
      setCurrentUser(user)
      onComplete(user)
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen gradient-dark flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-24 h-24 mx-auto mb-4 rounded-3xl gradient-primary flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-float">
          <span className="text-5xl">🏘️</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">مايو هب</h1>
        <p className="text-blue-200/80 text-sm">دليل خدمات مدينة 15 مايو</p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-sm glass rounded-3xl p-6 shadow-2xl animate-slide-up">

        {/* STEP: Phone */}
        {step === 'phone' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-center">ادخل رقم موبايلك</h2>
            <p className="text-xs text-muted-foreground text-center">لو مسجل قبل كده هندخلك، لو جديد هنسجلك</p>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-muted-foreground">رقم الموبايل</Label>
              <Input
                value={phone}
                onChange={e => { setPhone(e.target.value); setError('') }}
                placeholder="01012345678"
                dir="ltr"
                className="h-14 rounded-xl bg-secondary/50 border-0 text-lg text-center tracking-wider placeholder:text-muted-foreground/50"
                maxLength={11}
              />
            </div>

            {error && <p className="text-xs text-destructive text-center">{error}</p>}

            <button onClick={handlePhoneSubmit} className="btn-modern w-full h-14 gradient-primary text-white text-lg shadow-xl shadow-blue-500/25">
              التالي ←
            </button>
          </div>
        )}

        {/* STEP: PIN (existing user) */}
        {step === 'pin' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-center">ادخل الرقم السري</h2>
            <p className="text-xs text-muted-foreground text-center">الرقم السري بتاعك (4 أرقام)</p>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <Input
                type="password"
                value={pin}
                onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError('') }}
                placeholder="• • • •"
                className="h-16 rounded-xl bg-secondary/50 border-0 text-3xl text-center tracking-[1rem] placeholder:text-muted-foreground/30"
                maxLength={4}
              />
            </div>

            {error && <p className="text-xs text-destructive text-center">{error}</p>}

            <button onClick={handlePinSubmit} className="btn-modern w-full h-14 gradient-primary text-white text-lg shadow-xl shadow-blue-500/25">
              دخول 🚀
            </button>

            <button onClick={() => { setStep('phone'); setPin(''); setError('') }} className="w-full text-sm text-muted-foreground hover:text-foreground text-center py-2">
              ← رجوع
            </button>
          </div>
        )}

        {/* STEP: Register (new user) */}
        {step === 'register' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-center">تسجيل حساب جديد</h2>
            <p className="text-xs text-muted-foreground text-center">أول مرة؟ سجل بياناتك</p>

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-muted-foreground">الاسم</Label>
              <Input
                value={name}
                onChange={e => { setName(e.target.value); setError('') }}
                placeholder="اسمك..."
                className="h-12 rounded-xl bg-secondary/50 border-0 text-base placeholder:text-muted-foreground/50"
              />
            </div>

            {/* PIN */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-muted-foreground">اختار رقم سري (4 أرقام)</Label>
              <Input
                type="password"
                value={newPin}
                onChange={e => { setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError('') }}
                placeholder="• • • •"
                className="h-12 rounded-xl bg-secondary/50 border-0 text-xl text-center tracking-[0.5rem] placeholder:text-muted-foreground/30"
                maxLength={4}
              />
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

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-border/50 max-h-40 overflow-y-auto z-50 animate-slide-down">
                  {allNeighborhoods.map(n => (
                    <button
                      key={n.id}
                      onClick={() => { setNeighborhoodId(n.id); setShowDropdown(false); setError('') }}
                      className={`
                        w-full px-4 py-2.5 text-right text-sm flex items-center justify-between
                        transition-colors hover:bg-primary/5
                        ${neighborhoodId === n.id ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}
                      `}
                    >
                      <span>{n.nameAr}</span>
                      {neighborhoodId === n.id && <span className="text-primary text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-xs text-destructive text-center">{error}</p>}

            <button onClick={handleRegister} className="btn-modern w-full h-14 gradient-primary text-white text-lg shadow-xl shadow-blue-500/25">
              تسجيل 🚀
            </button>

            <button onClick={() => { setStep('phone'); setError('') }} className="w-full text-sm text-muted-foreground hover:text-foreground text-center py-2">
              ← رجوع
            </button>
          </div>
        )}
      </div>

      <p className="text-blue-300/50 text-xs mt-6">مايو هب © 2025</p>
    </div>
  )
}

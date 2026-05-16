import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { demoNeighborhoods } from '@/lib/mayu-hub/demo-data'
import { findUserByPhone, registerUser, verifyPin, setCurrentUser } from '@/lib/mayu-hub/auth'
import type { UserProfile } from '@/lib/mayu-hub/auth'
import { ChevronDown, MapPin, User, Lock, Phone } from 'lucide-react'

interface OnboardingScreenProps {
  onComplete: (user: UserProfile) => void
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState('')

  // Login fields
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPin, setLoginPin] = useState('')

  // Register fields
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPin, setRegPin] = useState('')
  const [regNeighborhood, setRegNeighborhood] = useState('')

  const allNeighborhoods = demoNeighborhoods
  const selectedNeighborhood = allNeighborhoods.find(n => n.id === regNeighborhood)

  const handleLogin = () => {
    if (!loginPhone.trim()) { setError('ادخل رقم الموبايل'); return }
    if (!loginPin.trim()) { setError('ادخل كلمة السر'); return }

    const user = verifyPin(loginPhone, loginPin)
    if (!user) { setError('رقم الموبايل أو كلمة السر غلط'); return }

    setCurrentUser(user)
    onComplete(user)
  }

  const handleRegister = () => {
    if (!regName.trim()) { setError('ادخل اسمك'); return }
    if (!regPhone.trim()) { setError('ادخل رقم الموبايل'); return }
    if (regPin.length < 4) { setError('كلمة السر لازم 4 أرقام على الأقل'); return }
    if (!regNeighborhood) { setError('اختر مجاورتك'); return }

    try {
      const user = registerUser({ name: regName, phone: regPhone, pin: regPin, neighborhoodId: regNeighborhood })
      setCurrentUser(user)
      onComplete(user)
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen gradient-dark flex flex-col items-center justify-center px-6 py-8">
      {/* Logo */}
      <div className="text-center mb-6 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-3 rounded-3xl gradient-primary flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-float">
          <span className="text-4xl">🏘️</span>
        </div>
        <h1 className="text-2xl font-bold text-white">مايو هب</h1>
        <p className="text-blue-200/70 text-xs mt-1">دليل خدمات مدينة 15 مايو</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm glass rounded-3xl p-6 shadow-2xl animate-slide-up">
        {/* Tabs */}
        <div className="flex bg-secondary/50 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setIsLogin(true); setError('') }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isLogin ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            تسجيل دخول
          </button>
          <button
            onClick={() => { setIsLogin(false); setError('') }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              !isLogin ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
          >
            حساب جديد
          </button>
        </div>

        {/* LOGIN */}
        {isLogin && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">رقم الموبايل</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={loginPhone}
                  onChange={e => { setLoginPhone(e.target.value); setError('') }}
                  placeholder="01012345678"
                  dir="ltr"
                  className="h-12 rounded-xl bg-secondary/50 border-0 pr-10 text-right"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">كلمة السر</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={loginPin}
                  onChange={e => { setLoginPin(e.target.value); setError('') }}
                  placeholder="••••"
                  className="h-12 rounded-xl bg-secondary/50 border-0 pr-10 text-center tracking-widest"
                />
              </div>
            </div>

            {error && <p className="text-xs text-destructive text-center">{error}</p>}

            <button onClick={handleLogin} className="btn-modern w-full h-13 py-3.5 gradient-primary text-white text-base shadow-lg shadow-blue-500/25">
              دخول
            </button>
          </div>
        )}

        {/* REGISTER */}
        {!isLogin && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">الاسم</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={regName}
                  onChange={e => { setRegName(e.target.value); setError('') }}
                  placeholder="اسمك..."
                  className="h-11 rounded-xl bg-secondary/50 border-0 pr-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">رقم الموبايل</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={regPhone}
                  onChange={e => { setRegPhone(e.target.value); setError('') }}
                  placeholder="01012345678"
                  dir="ltr"
                  className="h-11 rounded-xl bg-secondary/50 border-0 pr-10 text-right"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">كلمة السر (4 أرقام)</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={regPin}
                  onChange={e => { setRegPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError('') }}
                  placeholder="••••"
                  maxLength={4}
                  className="h-11 rounded-xl bg-secondary/50 border-0 pr-10 text-center tracking-widest"
                />
              </div>
            </div>

            {/* Neighborhood Dropdown */}
            <div className="space-y-1.5 relative">
              <Label className="text-xs text-muted-foreground">المجاورة</Label>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`
                  w-full h-11 rounded-xl bg-secondary/50 px-4 flex items-center justify-between text-sm
                  ${regNeighborhood ? 'text-foreground' : 'text-muted-foreground/60'}
                  ${showDropdown ? 'ring-2 ring-primary/40' : ''}
                `}
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  {selectedNeighborhood ? selectedNeighborhood.nameAr : 'اختر مجاورتك...'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-border/50 max-h-36 overflow-y-auto z-50 animate-slide-down">
                  {allNeighborhoods.map(n => (
                    <button
                      key={n.id}
                      onClick={() => { setRegNeighborhood(n.id); setShowDropdown(false); setError('') }}
                      className={`
                        w-full px-4 py-2 text-right text-sm flex items-center justify-between
                        hover:bg-primary/5 transition-colors
                        ${regNeighborhood === n.id ? 'bg-primary/10 text-primary font-medium' : ''}
                      `}
                    >
                      <span>{n.nameAr}</span>
                      {regNeighborhood === n.id && <span className="text-primary text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-xs text-destructive text-center">{error}</p>}

            <button onClick={handleRegister} className="btn-modern w-full h-13 py-3.5 gradient-primary text-white text-base shadow-lg shadow-blue-500/25 mt-2">
              تسجيل
            </button>
          </div>
        )}
      </div>

      <p className="text-blue-300/40 text-[10px] mt-6">مايو هب © 2025</p>
    </div>
  )
}

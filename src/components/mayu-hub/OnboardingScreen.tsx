import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { demoNeighborhoods } from '@/lib/mayu-hub/demo-data'
import { registerUser, verifyPin, setCurrentUser } from '@/lib/mayu-hub/auth'
import { getSettings } from '@/lib/mayu-hub/settings'
import type { UserProfile } from '@/lib/mayu-hub/auth'
import { ChevronDown, MapPin, User, Lock, AtSign } from 'lucide-react'

interface OnboardingScreenProps {
  onComplete: (user: UserProfile) => void
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState('')
  const settings = getSettings()

  // Login fields
  const [loginId, setLoginId] = useState('')
  const [loginPin, setLoginPin] = useState('')

  // Register fields
  const [regName, setRegName] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPin, setRegPin] = useState('')
  const [regNeighborhood, setRegNeighborhood] = useState('')

  const allNeighborhoods = demoNeighborhoods
  const selectedNeighborhood = allNeighborhoods.find(n => n.id === regNeighborhood)

  const handleLogin = () => {
    if (!loginId.trim()) { setError('ادخل رقم الموبايل أو اسم المستخدم'); return }
    if (!loginPin.trim()) { setError('ادخل كلمة السر'); return }

    const user = verifyPin(loginId, loginPin)
    if (!user) { setError('البيانات غلط — تأكد من رقم الموبايل/اليوزر وكلمة السر'); return }

    setCurrentUser(user)
    onComplete(user)
  }

  const handleRegister = () => {
    if (!regName.trim()) { setError('ادخل اسمك'); return }
    if (!regUsername.trim()) { setError('اختار يوزر نيم'); return }
    if (!regPhone.trim()) { setError('ادخل رقم الموبايل'); return }
    if (regPin.length < 4) { setError('كلمة السر لازم 4 أرقام'); return }
    if (!regNeighborhood) { setError('اختر مجاورتك'); return }

    try {
      const user = registerUser({
        name: regName,
        username: regUsername,
        phone: regPhone,
        pin: regPin,
        neighborhoodId: regNeighborhood,
      })
      setCurrentUser(user)
      onComplete(user)
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-8 relative"
      style={{
        backgroundImage: `url(${settings.loginBackgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Logo */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-3 rounded-3xl gradient-primary flex items-center justify-center shadow-2xl shadow-blue-500/40 animate-float">
            <span className="text-4xl">🏘️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">مايو هب</h1>
          <p className="text-white/60 text-xs mt-1">دليل خدمات مدينة 15 مايو</p>
        </div>

        {/* Glass Card */}
        <div className="w-full rounded-3xl p-6 shadow-2xl animate-slide-up"
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-5" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => { setIsLogin(true); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isLogin ? 'bg-white/90 text-gray-900 shadow-sm' : 'text-white/70'
              }`}
            >
              تسجيل دخول
            </button>
            <button
              onClick={() => { setIsLogin(false); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                !isLogin ? 'bg-white/90 text-gray-900 shadow-sm' : 'text-white/70'
              }`}
            >
              حساب جديد
            </button>
          </div>

          {/* LOGIN */}
          {isLogin && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-white/70">رقم الموبايل أو اليوزر نيم</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    value={loginId}
                    onChange={e => { setLoginId(e.target.value); setError('') }}
                    placeholder="الموبايل أو اليوزر نيم"
                    className="h-12 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/30 pr-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-white/70">كلمة السر</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    type="password"
                    value={loginPin}
                    onChange={e => { setLoginPin(e.target.value); setError('') }}
                    placeholder="••••"
                    className="h-12 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/30 pr-10 text-center tracking-widest"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-300 text-center bg-red-500/10 rounded-lg py-2">{error}</p>}

              <button onClick={handleLogin} className="btn-modern w-full h-13 py-3.5 gradient-primary text-white text-base shadow-lg shadow-blue-500/30">
                دخول
              </button>
            </div>
          )}

          {/* REGISTER */}
          {!isLogin && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[11px] text-white/70">الاسم</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    value={regName}
                    onChange={e => { setRegName(e.target.value); setError('') }}
                    placeholder="اسمك الكامل"
                    className="h-11 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/30 pr-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-white/70">يوزر نيم (اسم المستخدم)</Label>
                <div className="relative">
                  <AtSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    value={regUsername}
                    onChange={e => { setRegUsername(e.target.value.replace(/\s/g, '').toLowerCase()); setError('') }}
                    placeholder="username"
                    dir="ltr"
                    className="h-11 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/30 pr-10 text-sm text-right"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-white/70">رقم الموبايل</Label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">📱</span>
                  <Input
                    value={regPhone}
                    onChange={e => { setRegPhone(e.target.value); setError('') }}
                    placeholder="01012345678"
                    dir="ltr"
                    className="h-11 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/30 pr-10 text-sm text-right"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-white/70">كلمة السر (4 أرقام)</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    type="password"
                    value={regPin}
                    onChange={e => { setRegPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError('') }}
                    placeholder="••••"
                    maxLength={4}
                    className="h-11 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/30 pr-10 text-center tracking-widest text-sm"
                  />
                </div>
              </div>

              {/* Neighborhood Dropdown */}
              <div className="space-y-1 relative">
                <Label className="text-[11px] text-white/70">المجاورة</Label>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={`
                    w-full h-11 rounded-xl px-4 flex items-center justify-between text-sm
                    border border-white/20 bg-white/10
                    ${regNeighborhood ? 'text-white' : 'text-white/30'}
                    ${showDropdown ? 'ring-2 ring-blue-400/50' : ''}
                  `}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-300" />
                    {selectedNeighborhood ? selectedNeighborhood.nameAr : 'اختر مجاورتك...'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl max-h-36 overflow-y-auto z-50 animate-slide-down">
                    {allNeighborhoods.map(n => (
                      <button
                        key={n.id}
                        onClick={() => { setRegNeighborhood(n.id); setShowDropdown(false); setError('') }}
                        className={`
                          w-full px-4 py-2 text-right text-sm flex items-center justify-between
                          hover:bg-blue-50 transition-colors text-gray-800
                          ${regNeighborhood === n.id ? 'bg-blue-50 text-blue-600 font-medium' : ''}
                        `}
                      >
                        <span>{n.nameAr}</span>
                        {regNeighborhood === n.id && <span className="text-blue-500 text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {error && <p className="text-xs text-red-300 text-center bg-red-500/10 rounded-lg py-2">{error}</p>}

              <button onClick={handleRegister} className="btn-modern w-full h-13 py-3.5 gradient-primary text-white text-base shadow-lg shadow-blue-500/30 mt-1">
                تسجيل
              </button>
            </div>
          )}
        </div>

        <p className="text-white/30 text-[10px] mt-6">مايو هب © 2025</p>
      </div>
    </div>
  )
}

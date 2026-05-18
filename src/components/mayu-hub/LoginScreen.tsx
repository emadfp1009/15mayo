import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createGuestSession, setCurrentUser, findUserByPhone, registerUser } from '@/lib/mayu-hub/auth'
import { getSettings } from '@/lib/mayu-hub/settings'
import type { UserProfile } from '@/lib/mayu-hub/auth'
import { Phone, KeyRound, UserCircle } from 'lucide-react'

interface LoginScreenProps {
  onComplete: (user: UserProfile) => void
}

type Step = 'phone' | 'otp'

const VALID_OTP = '1234'
const MAX_OTP_ATTEMPTS = 3

export function LoginScreen({ onComplete }: LoginScreenProps) {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpAttempts, setOtpAttempts] = useState(0)
  const [otpLocked, setOtpLocked] = useState(false)
  const [error, setError] = useState('')
  const settings = getSettings()

  const handlePhoneSubmit = () => {
    const cleaned = phone.replace(/\s/g, '')
    if (!cleaned || cleaned.length < 10) {
      setError('ادخل رقم هاتف صحيح')
      return
    }
    setError('')
    setStep('otp')
  }

  const handleOtpSubmit = () => {
    if (otp.length !== 4) {
      setError('ادخل كود التحقق المكون من 4 أرقام')
      return
    }

    if (otp !== VALID_OTP) {
      const newAttempts = otpAttempts + 1
      setOtpAttempts(newAttempts)

      if (newAttempts >= MAX_OTP_ATTEMPTS) {
        setOtpLocked(true)
        setError('تم تجاوز عدد المحاولات المسموح بها')
      } else {
        setError(`كود خاطئ — متبقي ${MAX_OTP_ATTEMPTS - newAttempts} محاولات`)
      }
      setOtp('')
      return
    }

    // OTP correct — find or create user
    const fullPhone = phone.replace(/\s/g, '')
    let user = findUserByPhone(fullPhone)

    if (!user) {
      // Auto-register new user with phone
      user = registerUser({
        name: `مستخدم ${fullPhone.slice(-4)}`,
        username: `user_${fullPhone.slice(-6)}`,
        phone: fullPhone,
        pin: VALID_OTP,
        neighborhoodId: '',
      })
    }

    setCurrentUser(user)
    onComplete(user)
  }

  const handleResendOtp = () => {
    setOtpAttempts(0)
    setOtpLocked(false)
    setOtp('')
    setError('')
  }

  const handleGuestMode = () => {
    const guest = createGuestSession()
    setCurrentUser(guest)
    onComplete(guest)
  }

  const handleBackToPhone = () => {
    setStep('phone')
    setOtp('')
    setOtpAttempts(0)
    setOtpLocked(false)
    setError('')
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-8 relative"
      dir="rtl"
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
        <div
          className="w-full rounded-3xl p-6 shadow-2xl animate-slide-up"
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Phone Step */}
          {step === 'phone' && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-lg font-semibold text-white">تسجيل الدخول</h2>
                <p className="text-white/50 text-xs mt-1">ادخل رقم هاتفك لاستلام كود التحقق</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-white/70">رقم الهاتف</Label>
                <div className="relative flex gap-2">
                  {/* Country code prefix */}
                  <div className="flex items-center justify-center h-12 px-3 rounded-xl border border-white/20 bg-white/10 text-white text-sm font-medium shrink-0">
                    <span dir="ltr">+20</span>
                  </div>
                  {/* Phone input */}
                  <div className="relative flex-1">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      value={phone}
                      onChange={e => {
                        setPhone(e.target.value.replace(/[^\d\s]/g, ''))
                        setError('')
                      }}
                      placeholder="1012345678"
                      dir="ltr"
                      inputMode="tel"
                      className="h-12 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/30 pr-10 text-left"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-300 text-center bg-red-500/10 rounded-lg py-2">
                  {error}
                </p>
              )}

              <button
                onClick={handlePhoneSubmit}
                className="btn-modern w-full h-13 py-3.5 gradient-primary text-white text-base shadow-lg shadow-blue-500/30"
              >
                إرسال كود التحقق
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-white/40 text-xs">أو</span>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              {/* Guest Mode */}
              <button
                onClick={handleGuestMode}
                className="w-full h-12 py-3 rounded-xl border border-white/20 bg-white/5 text-white/80 text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                الدخول كزائر
              </button>
            </div>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-lg font-semibold text-white">كود التحقق</h2>
                <p className="text-white/50 text-xs mt-1">
                  تم إرسال كود إلى <span dir="ltr" className="text-white/70">+20{phone.replace(/\s/g, '')}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-white/70">كود التحقق (4 أرقام)</Label>
                <div className="relative">
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    value={otp}
                    onChange={e => {
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))
                      setError('')
                    }}
                    placeholder="••••"
                    maxLength={4}
                    inputMode="numeric"
                    disabled={otpLocked}
                    dir="ltr"
                    className="h-12 rounded-xl border-white/20 bg-white/10 text-white placeholder:text-white/30 pr-10 text-center tracking-[0.5em] text-lg font-mono"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-300 text-center bg-red-500/10 rounded-lg py-2">
                  {error}
                </p>
              )}

              {!otpLocked ? (
                <button
                  onClick={handleOtpSubmit}
                  className="btn-modern w-full h-13 py-3.5 gradient-primary text-white text-base shadow-lg shadow-blue-500/30"
                >
                  تأكيد
                </button>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="btn-modern w-full h-13 py-3.5 bg-amber-500 hover:bg-amber-600 text-white text-base shadow-lg shadow-amber-500/30 rounded-xl"
                >
                  إعادة إرسال الكود
                </button>
              )}

              {/* Back to phone */}
              <button
                onClick={handleBackToPhone}
                className="w-full py-2 text-white/50 text-xs hover:text-white/70 transition-colors"
              >
                ← تغيير رقم الهاتف
              </button>
            </div>
          )}
        </div>

        <p className="text-white/30 text-[10px] mt-6">مايو هب © 2025</p>
      </div>
    </div>
  )
}

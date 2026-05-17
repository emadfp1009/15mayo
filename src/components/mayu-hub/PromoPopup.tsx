import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export interface PromoData {
  id: string
  imageUrl?: string
  title: string
  description?: string
  buttonText?: string
  buttonLink?: string
}

// Demo promo - admin can change this
const demoPromo: PromoData = {
  id: 'promo-1',
  imageUrl: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=400&fit=crop&q=80',
  title: '🎉 عروض افتتاح مايو هب!',
  description: 'صيدلية الشفاء — خصم 20% على كل الأدوية هذا الأسبوع',
  buttonText: 'شوف العرض',
  buttonLink: 'store-1',
}

const PROMO_DISMISSED_KEY = 'mayu_hub_promo_dismissed'

interface PromoPopupProps {
  onAction?: () => void
}

export function PromoPopup({ onAction }: PromoPopupProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check if already dismissed today
    const dismissed = localStorage.getItem(PROMO_DISMISSED_KEY)
    if (dismissed) {
      const dismissedDate = new Date(dismissed).toDateString()
      const today = new Date().toDateString()
      if (dismissedDate === today) return // Already dismissed today
    }

    // Show after 1 second delay
    const timer = setTimeout(() => setVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem(PROMO_DISMISSED_KEY, new Date().toISOString())
  }

  const handleAction = () => {
    handleDismiss()
    onAction?.()
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" onClick={handleDismiss}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Popup */}
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image */}
        {demoPromo.imageUrl && (
          <img
            src={demoPromo.imageUrl}
            alt={demoPromo.title}
            className="w-full h-48 object-cover"
          />
        )}

        {/* Content */}
        <div className="bg-white p-5 space-y-3">
          <h3 className="text-lg font-bold text-center">{demoPromo.title}</h3>
          {demoPromo.description && (
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              {demoPromo.description}
            </p>
          )}

          {demoPromo.buttonText && (
            <button
              onClick={handleAction}
              className="btn-modern w-full py-3 gradient-primary text-white font-medium text-sm"
            >
              {demoPromo.buttonText}
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="w-full text-xs text-muted-foreground hover:text-foreground text-center py-1"
          >
            لا شكراً
          </button>
        </div>
      </div>
    </div>
  )
}

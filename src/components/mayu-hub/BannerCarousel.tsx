import { useEffect, useState } from 'react'
import type { BannerAd } from '@/lib/mayu-hub/types'

interface BannerCarouselProps {
  banners: BannerAd[]
  rotationIntervalMs?: number
}

export function BannerCarousel({ banners, rotationIntervalMs = 5000 }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length)
    }, rotationIntervalMs)

    return () => clearInterval(interval)
  }, [banners.length, rotationIntervalMs])

  if (banners.length === 0) return null

  const currentBanner = banners[currentIndex]

  return (
    <div className="relative w-full overflow-hidden rounded-lg mb-4">
      <a
        href={currentBanner.targetType === 'external' ? currentBanner.targetUrl ?? '#' : `#store-${currentBanner.targetStoreId}`}
        target={currentBanner.targetType === 'external' ? '_blank' : undefined}
        rel={currentBanner.targetType === 'external' ? 'noopener noreferrer' : undefined}
      >
        <img
          src={currentBanner.imageUrl}
          alt="إعلان"
          className="w-full h-32 sm:h-40 object-cover rounded-lg"
        />
      </a>

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? 'bg-white w-4' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

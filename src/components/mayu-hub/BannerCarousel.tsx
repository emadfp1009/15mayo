import { useEffect, useState } from 'react'
import type { BannerAd } from '@/lib/mayu-hub/types'
import { getSettings } from '@/lib/mayu-hub/settings'

interface BannerCarouselProps {
  banners: BannerAd[]
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const settings = getSettings()
  const rotationMs = settings.bannerRotationSeconds * 1000

  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length)
    }, rotationMs)

    return () => clearInterval(interval)
  }, [banners.length, rotationMs])

  if (banners.length === 0) return null

  const currentBanner = banners[currentIndex]

  return (
    <div className="relative w-full overflow-hidden rounded-2xl mb-4 shadow-lg">
      <a
        href={currentBanner.targetType === 'external' ? currentBanner.targetUrl ?? '#' : `#store-${currentBanner.targetStoreId}`}
        target={currentBanner.targetType === 'external' ? '_blank' : undefined}
        rel={currentBanner.targetType === 'external' ? 'noopener noreferrer' : undefined}
      >
        <img
          src={currentBanner.imageUrl}
          alt="إعلان"
          className="w-full h-36 sm:h-44 object-cover transition-opacity duration-500"
        />
      </a>

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-white w-5' : 'bg-white/50 w-1.5'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

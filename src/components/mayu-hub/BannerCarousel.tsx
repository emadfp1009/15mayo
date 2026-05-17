import { useEffect, useState, useCallback } from 'react'
import type { BannerAd } from '@/lib/mayu-hub/types'
import { getSettings } from '@/lib/mayu-hub/settings'

interface BannerCarouselProps {
  banners: BannerAd[]
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const settings = getSettings()
  const rotationMs = (settings.bannerRotationSeconds || 3) * 1000

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % banners.length)
  }, [banners.length])

  useEffect(() => {
    if (banners.length <= 1) return

    const timer = setInterval(nextSlide, rotationMs)
    return () => clearInterval(timer)
  }, [banners.length, rotationMs, nextSlide])

  if (banners.length === 0) return null

  return (
    <div className="relative w-full overflow-hidden rounded-2xl mb-4 shadow-lg">
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <a
            key={banner.id}
            href={banner.targetType === 'external' ? banner.targetUrl ?? '#' : `#store-${banner.targetStoreId}`}
            target={banner.targetType === 'external' ? '_blank' : undefined}
            rel={banner.targetType === 'external' ? 'noopener noreferrer' : undefined}
            className="w-full flex-shrink-0"
          >
            <img
              src={banner.imageUrl}
              alt="إعلان"
              className="w-full h-36 sm:h-44 object-cover"
            />
          </a>
        ))}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-white w-5 shadow-sm' : 'bg-white/50 w-1.5'
              }`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
        {currentIndex + 1}/{banners.length}
      </div>
    </div>
  )
}

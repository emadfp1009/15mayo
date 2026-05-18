import { useEffect, useState, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import type { BannerAd } from '@/lib/mayu-hub/types'

interface BannerCarouselProps {
  banners: BannerAd[]
  onBannerClick?: (storeId: string) => void
}

const AUTO_ROTATION_MS = 4000

export function BannerCarousel({ banners, onBannerClick }: BannerCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: banners.length > 1,
    direction: 'rtl',
  })

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  // Subscribe to embla select events
  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  // Auto-rotation every 4 seconds (only when more than 1 banner)
  useEffect(() => {
    if (!emblaApi || banners.length <= 1) return

    const timer = setInterval(() => {
      emblaApi.scrollNext()
    }, AUTO_ROTATION_MS)

    return () => clearInterval(timer)
  }, [emblaApi, banners.length])

  // Edge case: 0 banners = hide component
  if (banners.length === 0) return null

  // Edge case: 1 banner = show static (no rotation, no dots)
  if (banners.length === 1) {
    const banner = banners[0]
    return (
      <div className="relative w-full overflow-hidden rounded-2xl mb-4 shadow-lg">
        <div
          className="cursor-pointer"
          onClick={() => {
            if (banner.targetType === 'store' && banner.targetStoreId && onBannerClick) {
              onBannerClick(banner.targetStoreId)
            }
          }}
        >
          {banner.targetType === 'external' ? (
            <a
              href={banner.targetUrl ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={banner.imageUrl}
                alt="إعلان"
                className="w-full h-36 sm:h-44 object-cover"
              />
            </a>
          ) : (
            <img
              src={banner.imageUrl}
              alt="إعلان"
              className="w-full h-36 sm:h-44 object-cover"
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl mb-4 shadow-lg">
      {/* Embla Carousel Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="flex-[0_0_100%] min-w-0"
            >
              {banner.targetType === 'external' ? (
                <a
                  href={banner.targetUrl ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block cursor-pointer"
                >
                  <img
                    src={banner.imageUrl}
                    alt="إعلان"
                    className="w-full h-36 sm:h-44 object-cover"
                  />
                </a>
              ) : (
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    if (banner.targetType === 'store' && banner.targetStoreId && onBannerClick) {
                      onBannerClick(banner.targetStoreId)
                    }
                  }}
                >
                  <img
                    src={banner.imageUrl}
                    alt="إعلان"
                    className="w-full h-36 sm:h-44 object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => emblaApi?.scrollTo(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === selectedIndex ? 'bg-white w-5 shadow-sm' : 'bg-white/50 w-1.5'
            }`}
            aria-label={`الانتقال للشريحة ${idx + 1}`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
        {selectedIndex + 1}/{banners.length}
      </div>
    </div>
  )
}

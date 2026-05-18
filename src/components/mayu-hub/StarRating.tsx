import { Star } from 'lucide-react'
import { useRatings } from '@/hooks/mayu-hub/useRatings'
import { toast } from 'sonner'

interface StarRatingProps {
  storeId: string
  readonly?: boolean
  size?: 'sm' | 'md'
}

export function StarRating({ storeId, readonly = false, size = 'md' }: StarRatingProps) {
  const { averageRating, totalRatings, userRating, submitRating } = useRatings(storeId)

  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-sm'

  const displayRating = readonly ? averageRating : (userRating ?? averageRating)

  const handleStarClick = (rating: number) => {
    if (readonly) return
    const result = submitRating(rating)
    if (result.needsLogin) {
      toast.error('سجل دخول للتقييم', {
        description: 'يجب تسجيل الدخول لتقييم المتاجر',
      })
    }
  }

  return (
    <div className="flex items-center gap-1" dir="ltr">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(displayRating)
          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              onClick={(e) => {
                e.stopPropagation()
                handleStarClick(star)
              }}
              className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
              aria-label={`${star} نجمة`}
            >
              <Star
                className={`${starSize} ${
                  filled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-none text-gray-300'
                }`}
              />
            </button>
          )
        })}
      </div>
      <span className={`${textSize} text-muted-foreground`}>
        {totalRatings > 0 ? (
          <>
            <span className="font-medium">{averageRating}</span>
            <span className="mx-0.5">({totalRatings})</span>
          </>
        ) : (
          <span>لا تقييمات</span>
        )}
      </span>
    </div>
  )
}

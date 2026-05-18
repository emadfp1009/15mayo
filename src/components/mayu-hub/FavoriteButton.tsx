import { Heart } from 'lucide-react'
import { useFavorites } from '@/hooks/mayu-hub/useFavorites'
import { toast } from 'sonner'

interface FavoriteButtonProps {
  storeId: string
  showCount?: boolean
}

export function FavoriteButton({ storeId, showCount = true }: FavoriteButtonProps) {
  const { isFavorited, toggleFavorite, getFavoritesCount } = useFavorites()

  const favorited = isFavorited(storeId)
  const count = getFavoritesCount(storeId)

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const result = toggleFavorite(storeId)
    if (result.needsLogin) {
      toast.error('سجل دخول أولاً', {
        description: 'يجب تسجيل الدخول لإضافة المتاجر للمفضلة',
      })
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex flex-col items-center gap-0.5 transition-transform hover:scale-110 active:scale-95"
      aria-label={favorited ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
    >
      <Heart
        className={`w-5 h-5 ${
          favorited
            ? 'fill-red-500 text-red-500'
            : 'fill-none text-white drop-shadow-md'
        }`}
      />
      {showCount && count > 0 && (
        <span className="text-[10px] text-white font-medium drop-shadow-md">{count}</span>
      )}
    </button>
  )
}

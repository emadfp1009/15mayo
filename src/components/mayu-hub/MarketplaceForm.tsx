import { useState, useRef } from 'react'
import { validateClassifiedAd } from '@/lib/mayu-hub/marketplace'
import type { ClassifiedAdInput, MarketplaceCategory } from '@/lib/mayu-hub/types'

interface MarketplaceFormProps {
  onSubmit: (ad: ClassifiedAdInput) => void
  onCancel: () => void
}

const CATEGORY_LABELS: Record<MarketplaceCategory, string> = {
  electronics: 'إلكترونيات',
  furniture: 'أثاث',
  vehicles: 'سيارات',
  clothing: 'ملابس',
  home_appliances: 'أجهزة منزلية',
  sports: 'رياضة',
  books: 'كتب',
  other: 'أخرى',
}

const MAX_PHOTO_SIZE = 500 * 1024 // 500KB

export function MarketplaceForm({ onSubmit, onCancel }: MarketplaceFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [phone, setPhone] = useState('')
  const [category, setCategory] = useState<MarketplaceCategory>('other')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError('حجم الصورة يجب أن يكون أقل من 500KB')
      setPhotoUrl(null)
      return
    }

    setPhotoError(null)
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const input: ClassifiedAdInput = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price) || 0,
      photoUrl,
      phone: phone.trim(),
      category,
    }

    const validation = validateClassifiedAd(input)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setErrors({})
    onSubmit(input)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">العنوان *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="عنوان الإعلان"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">الوصف</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="وصف الإعلان (اختياري)"
          rows={3}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium mb-1">السعر (ج.م) *</label>
        <input
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="0"
          min="0"
          step="any"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.price && (
          <p className="text-red-500 text-xs mt-1">{errors.price}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium mb-1">رقم الهاتف *</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="01xxxxxxxxx"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-1">التصنيف</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value as MarketplaceCategory)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        >
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium mb-1">صورة</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-gray-50 transition-colors"
        >
          {photoUrl ? '📷 تم اختيار صورة' : '📷 اختر صورة (حد أقصى 500KB)'}
        </button>
        {photoUrl && (
          <img
            src={photoUrl}
            alt="معاينة"
            className="mt-2 w-20 h-20 object-cover rounded-lg border"
          />
        )}
        {photoError && (
          <p className="text-red-500 text-xs mt-1">{photoError}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          نشر الإعلان
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  )
}

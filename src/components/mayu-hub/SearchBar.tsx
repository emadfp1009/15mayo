import { Input } from '@/components/ui/input'
import type { ServiceCategory } from '@/lib/mayu-hub/types'
import { Search } from 'lucide-react'

interface SearchBarProps {
  query: string
  onQueryChange: (q: string) => void
  categories: ServiceCategory[]
  selectedCategory: string | null
  onCategoryChange: (id: string | null) => void
}

export function SearchBar({ query, onQueryChange, categories, selectedCategory, onCategoryChange }: SearchBarProps) {
  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="ابحث عن خدمة... (صيدلية، سوبر ماركت، حلاق)"
          className="pr-10 text-right"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => onCategoryChange(null)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          الكل
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id === selectedCategory ? null : cat.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {cat.icon} {cat.nameAr}
          </button>
        ))}
      </div>
    </div>
  )
}

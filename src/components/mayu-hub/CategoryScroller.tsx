import { demoCategories } from '@/lib/mayu-hub/demo-data'

interface CategoryScrollerProps {
  selectedCategory: string | null
  onCategoryChange: (id: string | null) => void
}

export function CategoryScroller({ selectedCategory, onCategoryChange }: CategoryScrollerProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {/* All */}
      <button
        onClick={() => onCategoryChange(null)}
        className="flex flex-col items-center gap-1.5 shrink-0"
      >
        <div className={`
          w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all duration-200
          ${selectedCategory === null
            ? 'gradient-primary shadow-lg shadow-blue-500/30 scale-110'
            : 'bg-secondary hover:bg-secondary/80'
          }
        `}>
          <span>🏪</span>
        </div>
        <span className={`text-[10px] font-medium ${selectedCategory === null ? 'text-primary' : 'text-muted-foreground'}`}>
          الكل
        </span>
      </button>

      {demoCategories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id === selectedCategory ? null : cat.id)}
          className="flex flex-col items-center gap-1.5 shrink-0"
        >
          <div className={`
            w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all duration-200
            ${selectedCategory === cat.id
              ? 'gradient-primary shadow-lg shadow-blue-500/30 scale-110'
              : 'bg-secondary hover:bg-secondary/80'
            }
          `}>
            <span>{cat.icon}</span>
          </div>
          <span className={`text-[10px] font-medium ${selectedCategory === cat.id ? 'text-primary' : 'text-muted-foreground'}`}>
            {cat.nameAr}
          </span>
        </button>
      ))}
    </div>
  )
}

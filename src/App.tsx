import { useState } from 'react'
import { NeighborhoodSelector } from '@/components/mayu-hub/NeighborhoodSelector'
import { ServicesView } from '@/components/mayu-hub/ServicesView'
import { CommunityDirectory } from '@/components/mayu-hub/CommunityDirectory'
import { StoreDetail } from '@/components/mayu-hub/StoreDetail'
import { EmergencyView } from '@/components/mayu-hub/EmergencyView'
import { AdminPanel } from '@/components/mayu-hub/admin/AdminPanel'
import { StoreRegistration } from '@/components/mayu-hub/StoreRegistration'
import { demoNeighborhoods, demoStores, demoWorkingHours, demoCategories } from '@/lib/mayu-hub/demo-data'
import './index.css'

type View = 'select' | 'services' | 'community' | 'store-detail' | 'emergency' | 'admin' | 'register-store'

function App() {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<View>('select')
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)

  const handleConfirm = () => {
    if (selectedNeighborhood) {
      setCurrentView('services')
    }
  }

  const handleStoreClick = (storeId: string) => {
    setSelectedStoreId(storeId)
    setCurrentView('store-detail')
  }

  const selectedStore = demoStores.find(s => s.id === selectedStoreId)

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50 px-4 py-3 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">م</span>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-l from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              مايو هب
            </h1>
          </div>
          {currentView !== 'select' && currentView !== 'admin' && currentView !== 'register-store' && (
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('register-store')}
                className="text-xs font-medium text-primary hover:text-primary/80 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 transition-colors"
              >
                + سجل محلك
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className="text-xs text-muted-foreground hover:text-primary w-8 h-8 rounded-full border border-border flex items-center justify-center transition-colors"
              >
                ⚙️
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Select Neighborhood */}
        {currentView === 'select' && (
          <div className="space-y-6 py-6 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 mx-auto gradient-primary rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-4xl">🏘️</span>
              </div>
              <h2 className="text-2xl font-bold">أهلاً بيك في مايو هب</h2>
              <p className="text-muted-foreground leading-relaxed">
                دليل خدمات مدينة 15 مايو<br/>
                اختر مجاورتك عشان نعرض لك الخدمات القريبة
              </p>
            </div>

            <NeighborhoodSelector
              neighborhoods={demoNeighborhoods}
              selectedId={selectedNeighborhood}
              onSelect={setSelectedNeighborhood}
            />

            {selectedNeighborhood && (
              <div className="text-center animate-slide-up">
                <button
                  onClick={handleConfirm}
                  className="px-8 py-3 gradient-primary text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all active:scale-95"
                >
                  تأكيد واستمرار ←
                </button>
              </div>
            )}

            <footer className="pt-8 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                مايو هب © 2025 — دليل خدمات مدينة 15 مايو
              </p>
            </footer>
          </div>
        )}

        {/* Services */}
        {currentView === 'services' && selectedNeighborhood && (
          <div className="pb-20 animate-fade-in">
            <ServicesView
              primaryNeighborhoodId={selectedNeighborhood}
              onBack={() => setCurrentView('select')}
              onStoreClick={handleStoreClick}
            />
          </div>
        )}

        {/* Community */}
        {currentView === 'community' && (
          <div className="pb-20 animate-fade-in">
            <CommunityDirectory onBack={() => setCurrentView('services')} />
          </div>
        )}

        {/* Emergency */}
        {currentView === 'emergency' && (
          <div className="pb-20 animate-fade-in">
            <EmergencyView onBack={() => setCurrentView('services')} />
          </div>
        )}

        {/* Admin */}
        {currentView === 'admin' && (
          <div className="pb-4 animate-fade-in">
            <AdminPanel onBack={() => setCurrentView('services')} />
          </div>
        )}

        {/* Store Registration */}
        {currentView === 'register-store' && (
          <div className="pb-4 animate-fade-in">
            <StoreRegistration onBack={() => setCurrentView('services')} />
          </div>
        )}

        {/* Store Detail */}
        {currentView === 'store-detail' && selectedStore && (
          <div className="pb-4 animate-fade-in">
            <StoreDetail
              store={selectedStore}
              workingHours={demoWorkingHours.filter(wh => wh.storeId === selectedStore.id)}
              neighborhoodName={demoNeighborhoods.find(n => n.id === selectedStore.neighborhoodId)?.nameAr ?? ''}
              categoryName={demoCategories.find(c => c.id === selectedStore.categoryId)?.nameAr}
              deliveryNeighborhoods={
                selectedStore.delivers
                  ? demoNeighborhoods.filter(n => n.isActive).slice(0, 3).map(n => n.nameAr)
                  : undefined
              }
              onBack={() => setCurrentView('services')}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      {currentView !== 'select' && currentView !== 'store-detail' && currentView !== 'admin' && currentView !== 'register-store' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-border/50 px-4 py-2 safe-bottom z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-lg mx-auto flex justify-around">
            <button
              onClick={() => setCurrentView('services')}
              className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl transition-all ${
                currentView === 'services' ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
            >
              <span className="text-xl">🏪</span>
              <span className="text-[10px] font-medium">الخدمات</span>
            </button>
            <button
              onClick={() => setCurrentView('emergency')}
              className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl transition-all ${
                currentView === 'emergency' ? 'text-red-500 bg-red-50' : 'text-muted-foreground'
              }`}
            >
              <span className="text-xl">🆘</span>
              <span className="text-[10px] font-medium">طوارئ</span>
            </button>
            <button
              onClick={() => setCurrentView('community')}
              className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl transition-all ${
                currentView === 'community' ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
            >
              <span className="text-xl">🏛️</span>
              <span className="text-[10px] font-medium">الدليل</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

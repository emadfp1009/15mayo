import { useState, useEffect } from 'react'
import { OnboardingScreen } from '@/components/mayu-hub/OnboardingScreen'
import { ServicesView } from '@/components/mayu-hub/ServicesView'
import { CommunityDirectory } from '@/components/mayu-hub/CommunityDirectory'
import { StoreDetail } from '@/components/mayu-hub/StoreDetail'
import { EmergencyView } from '@/components/mayu-hub/EmergencyView'
import { AdminPanel } from '@/components/mayu-hub/admin/AdminPanel'
import { StoreRegistration } from '@/components/mayu-hub/StoreRegistration'
import { NeighborhoodModal } from '@/components/mayu-hub/NeighborhoodModal'
import { getCurrentUser, logout, logActivity } from '@/lib/mayu-hub/auth'
import type { UserProfile } from '@/lib/mayu-hub/auth'
import { demoNeighborhoods, demoStores, demoWorkingHours, demoCategories } from '@/lib/mayu-hub/demo-data'
import { LogOut } from 'lucide-react'
import './index.css'

type View = 'onboarding' | 'services' | 'community' | 'store-detail' | 'emergency' | 'admin' | 'register-store'

function App() {
  const [currentView, setCurrentView] = useState<View>('onboarding')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [showNeighborhoodModal, setShowNeighborhoodModal] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setCurrentUser(user)
      setCurrentView('services')
    }
  }, [])

  const handleLoginComplete = (user: UserProfile) => {
    setCurrentUser(user)
    setShowNeighborhoodModal(true)
    setCurrentView('services')
  }

  const handleLogout = () => {
    logout()
    setCurrentUser(null)
    setCurrentView('onboarding')
  }

  const handleStoreClick = (storeId: string) => {
    setSelectedStoreId(storeId)
    setCurrentView('store-detail')

    // Log activity
    if (currentUser) {
      const store = demoStores.find(s => s.id === storeId)
      logActivity({
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'view_store',
        targetId: storeId,
        targetName: store?.nameAr,
      })
    }
  }

  const selectedStore = demoStores.find(s => s.id === selectedStoreId)

  // Onboarding / Login
  if (currentView === 'onboarding' || !currentUser) {
    return <OnboardingScreen onComplete={handleLoginComplete} />
  }

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/30 px-4 py-3 safe-top">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white text-sm font-bold">م</span>
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">مايو هب</h1>
              <p className="text-[10px] text-muted-foreground">أهلاً {currentUser.name} 👋</p>
            </div>
          </div>

          {currentView !== 'admin' && currentView !== 'register-store' && (
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('register-store')}
                className="btn-modern text-[11px] font-medium gradient-primary text-white px-3 py-2"
              >
                + سجل محلك
              </button>
              {currentUser.isAdmin && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  ⚙️
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                title="تسجيل خروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {currentView === 'services' && (
          <div className="pb-24 animate-fade-in">
            <ServicesView
              primaryNeighborhoodId={currentUser.neighborhoodId}
              onBack={handleLogout}
              onStoreClick={handleStoreClick}
            />
          </div>
        )}

        {currentView === 'community' && (
          <div className="pb-24 animate-fade-in">
            <CommunityDirectory onBack={() => setCurrentView('services')} />
          </div>
        )}

        {currentView === 'emergency' && (
          <div className="pb-24 animate-fade-in">
            <EmergencyView onBack={() => setCurrentView('services')} />
          </div>
        )}

        {currentView === 'admin' && currentUser.isAdmin && (
          <div className="pb-4 animate-fade-in">
            <AdminPanel onBack={() => setCurrentView('services')} />
          </div>
        )}

        {currentView === 'register-store' && (
          <div className="pb-4 animate-fade-in">
            <StoreRegistration onBack={() => setCurrentView('services')} />
          </div>
        )}

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
      {!['store-detail', 'admin', 'register-store'].includes(currentView) && (
        <div className="fixed bottom-0 left-0 right-0 glass border-t border-border/30 px-4 pt-2 pb-3 safe-bottom z-50">
          <div className="max-w-lg mx-auto flex justify-around">
            {[
              { view: 'services' as View, icon: '🏪', label: 'الخدمات', color: 'text-primary' },
              { view: 'emergency' as View, icon: '🆘', label: 'طوارئ', color: 'text-red-500' },
              { view: 'community' as View, icon: '🏛️', label: 'الدليل', color: 'text-primary' },
            ].map(item => (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-5 rounded-2xl transition-all duration-200 ${
                  currentView === item.view
                    ? `${item.color} bg-primary/5 scale-105`
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`text-[10px] font-semibold ${currentView === item.view ? '' : 'font-normal'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Neighborhood Modal */}
      {showNeighborhoodModal && (
        <NeighborhoodModal
          primaryNeighborhoodId={currentUser.neighborhoodId}
          onClose={() => setShowNeighborhoodModal(false)}
        />
      )}
    </div>
  )
}

export default App

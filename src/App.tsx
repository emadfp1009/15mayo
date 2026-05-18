import { useState, useEffect } from 'react'
import { LoginScreen } from '@/components/mayu-hub/LoginScreen'
import { SideDrawer } from '@/components/mayu-hub/SideDrawer'
import { ServicesView } from '@/components/mayu-hub/ServicesView'
import { CommunityDirectory } from '@/components/mayu-hub/CommunityDirectory'
import { StoreDetail } from '@/components/mayu-hub/StoreDetail'
import { EmergencyView } from '@/components/mayu-hub/EmergencyView'
import { AdminPanel } from '@/components/mayu-hub/admin/AdminPanel'
import { StoreRegistration } from '@/components/mayu-hub/StoreRegistration'
import { ProfileScreen } from '@/components/mayu-hub/ProfileScreen'
import { FavoritesView } from '@/components/mayu-hub/FavoritesView'
import { MarketplaceView } from '@/components/mayu-hub/MarketplaceView'
import { ChatView } from '@/components/mayu-hub/ChatView'
import { ChatThread } from '@/components/mayu-hub/ChatThread'
import { StoreDashboard } from '@/components/mayu-hub/StoreDashboard'
import { getCurrentUser, logout, logActivity } from '@/lib/mayu-hub/auth'
import type { UserProfile } from '@/lib/mayu-hub/auth'
import { demoNeighborhoods, demoWorkingHours, demoCategories } from '@/lib/mayu-hub/demo-data'
import { realStores } from '@/lib/mayu-hub/real-data'
import { Menu } from 'lucide-react'
import './index.css'

type View = 'login' | 'services' | 'community' | 'store-detail' | 'emergency' | 'admin' | 'register-store' | 'profile' | 'favorites' | 'marketplace' | 'messages' | 'chat-thread' | 'my-store'

function App() {
  const [currentView, setCurrentView] = useState<View>('login')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [selectedChatStore, setSelectedChatStore] = useState<{ storeId: string; storeName: string } | null>(null)
  const [showSideDrawer, setShowSideDrawer] = useState(false)

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
    setCurrentView('services')
  }

  const handleLogout = () => {
    logout()
    setCurrentUser(null)
    setCurrentView('login')
    setShowSideDrawer(false)
  }

  const handleStoreClick = (storeId: string) => {
    setSelectedStoreId(storeId)
    setCurrentView('store-detail')

    // Log activity
    if (currentUser) {
      const store = realStores.find(s => s.id === storeId)
      logActivity({
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'view_store',
        targetId: storeId,
        targetName: store?.nameAr,
      })
    }
  }

  const handleSideNavigation = (view: string) => {
    setCurrentView(view as View)
    setShowSideDrawer(false)
  }

  const handleOpenThread = (storeId: string, storeName: string) => {
    setSelectedChatStore({ storeId, storeName })
    setCurrentView('chat-thread')
  }

  const selectedStore = realStores.find(s => s.id === selectedStoreId)

  // Login screen
  if (currentView === 'login' || !currentUser) {
    return <LoginScreen onComplete={handleLoginComplete} />
  }

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/30 px-4 py-3 safe-top">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu */}
            <button
              onClick={() => setShowSideDrawer(true)}
              className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>
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
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {currentView === 'services' && (
          <div className="pb-4 animate-fade-in">
            <ServicesView
              primaryNeighborhoodId={currentUser.neighborhoodId}
              onBack={handleLogout}
              onStoreClick={handleStoreClick}
            />
          </div>
        )}

        {currentView === 'community' && (
          <div className="pb-4 animate-fade-in">
            <CommunityDirectory onBack={() => setCurrentView('services')} />
          </div>
        )}

        {currentView === 'emergency' && (
          <div className="pb-4 animate-fade-in">
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

        {currentView === 'profile' && (
          <div className="pb-4 animate-fade-in">
            <ProfileScreen
              user={currentUser}
              onBack={() => setCurrentView('services')}
              onUserUpdate={(updated) => setCurrentUser(updated)}
            />
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
              onMessage={(storeId, storeName) => {
                setSelectedChatStore({ storeId, storeName })
                setCurrentView('chat-thread')
              }}
            />
          </div>
        )}

        {/* New views */}
        {currentView === 'favorites' && (
          <div className="pb-4 animate-fade-in">
            <FavoritesView
              onBack={() => setCurrentView('services')}
              onStoreClick={handleStoreClick}
            />
          </div>
        )}

        {currentView === 'marketplace' && (
          <div className="pb-4 animate-fade-in">
            <MarketplaceView onBack={() => setCurrentView('services')} />
          </div>
        )}

        {currentView === 'messages' && (
          <div className="pb-4 animate-fade-in">
            <ChatView
              onBack={() => setCurrentView('services')}
              onOpenThread={handleOpenThread}
            />
          </div>
        )}

        {currentView === 'chat-thread' && selectedChatStore && (
          <div className="pb-4 animate-fade-in">
            <ChatThread
              storeId={selectedChatStore.storeId}
              storeName={selectedChatStore.storeName}
              onBack={() => setCurrentView('messages')}
            />
          </div>
        )}

        {currentView === 'my-store' && (
          <div className="pb-4 animate-fade-in">
            <StoreDashboard
              onBack={() => setCurrentView('services')}
              onRegisterStore={() => setCurrentView('register-store')}
            />
          </div>
        )}
      </main>

      {/* Side Drawer */}
      <SideDrawer
        isOpen={showSideDrawer}
        onClose={() => setShowSideDrawer(false)}
        currentUser={currentUser}
        onNavigate={handleSideNavigation}
        onLogout={handleLogout}
      />
    </div>
  )
}

export default App

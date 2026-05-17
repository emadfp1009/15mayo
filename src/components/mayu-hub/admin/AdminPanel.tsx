import { useState } from 'react'
import { AdminDashboard } from './AdminDashboard'
import { StoreManagement } from './StoreManagement'
import { NeighborhoodManagement } from './NeighborhoodManagement'
import { ApprovalQueue } from './ApprovalQueue'
import { UserManagement } from './UserManagement'
import { SettingsPanel } from './SettingsPanel'
import { BannerManagement } from './BannerManagement'
import { PromoManagement } from './PromoManagement'
import { ExcelUpload } from './ExcelUpload'
import { ArrowRight, LayoutDashboard, Store, Users, MapPin, CheckCircle, Settings, Image, Megaphone, FileSpreadsheet } from 'lucide-react'

interface AdminPanelProps {
  onBack: () => void
}

type AdminTab = 'dashboard' | 'approvals' | 'stores' | 'users' | 'neighborhoods' | 'banners' | 'promo' | 'excel' | 'settings'

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'المراقبة', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'approvals', label: 'الموافقات', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'stores', label: 'المتاجر', icon: <Store className="w-4 h-4" /> },
    { id: 'users', label: 'المستخدمين', icon: <Users className="w-4 h-4" /> },
    { id: 'banners', label: 'البانرات', icon: <Image className="w-4 h-4" /> },
    { id: 'promo', label: 'الإعلان', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'excel', label: 'رفع Excel', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'neighborhoods', label: 'المجاورات', icon: <MapPin className="w-4 h-4" /> },
    { id: 'settings', label: 'الإعدادات', icon: <Settings className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowRight className="w-4 h-4" />
          رجوع
        </button>
        <h2 className="text-lg font-bold">⚙️ لوحة الإدارة</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all
              ${activeTab === tab.id
                ? 'gradient-primary text-white shadow-md shadow-blue-500/20'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'approvals' && <ApprovalQueue />}
        {activeTab === 'stores' && <StoreManagement />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'banners' && <BannerManagement />}
        {activeTab === 'promo' && <PromoManagement />}
        {activeTab === 'excel' && <ExcelUpload />}
        {activeTab === 'neighborhoods' && <NeighborhoodManagement />}
        {activeTab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { demoNeighborhoods } from '@/lib/mayu-hub/demo-data'
import { changePin, updateUserNeighborhood, setCurrentUser, getUserActivityLogs } from '@/lib/mayu-hub/auth'
import type { UserProfile } from '@/lib/mayu-hub/auth'
import { ArrowRight, Lock, MapPin, User, Clock, ChevronDown } from 'lucide-react'

interface ProfileScreenProps {
  user: UserProfile
  onBack: () => void
  onUserUpdate: (user: UserProfile) => void
  onLogout: () => void
}

export function ProfileScreen({ user, onBack, onUserUpdate, onLogout }: ProfileScreenProps) {
  const [newPin, setNewPin] = useState('')
  const [pinSuccess, setPinSuccess] = useState(false)
  const [showNeighborhoodChange, setShowNeighborhoodChange] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(user.neighborhoodId)

  const currentNeighborhood = demoNeighborhoods.find(n => n.id === user.neighborhoodId)
  const activityLogs = getUserActivityLogs(user.id)

  const handleChangePin = () => {
    if (newPin.length < 4) return
    changePin(user.id, newPin)
    const updated = { ...user, pin: newPin }
    setCurrentUser(updated)
    onUserUpdate(updated)
    setNewPin('')
    setPinSuccess(true)
    setTimeout(() => setPinSuccess(false), 3000)
  }

  const handleChangeNeighborhood = (permanent: boolean) => {
    if (permanent) {
      updateUserNeighborhood(user.id, selectedNeighborhood)
      const updated = { ...user, neighborhoodId: selectedNeighborhood }
      setCurrentUser(updated)
      onUserUpdate(updated)
    }
    setShowNeighborhoodChange(false)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowRight className="w-4 h-4" />
        رجوع
      </button>

      {/* Profile Header */}
      <div className="text-center py-4">
        <div className="w-20 h-20 mx-auto rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            <MapPin className="w-3 h-3 ml-1" />
            {currentNeighborhood?.nameAr}
          </Badge>
          {user.isAdmin && <Badge className="text-xs">أدمين</Badge>}
        </div>
      </div>

      {/* Change PIN */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Lock className="w-4 h-4" />
          تغيير كلمة السر
        </h3>
        <div className="flex gap-2">
          <Input
            type="password"
            value={newPin}
            onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="كلمة سر جديدة (4 أرقام)"
            maxLength={4}
            className="h-10 rounded-xl text-center tracking-widest"
          />
          <button
            onClick={handleChangePin}
            disabled={newPin.length < 4}
            className="btn-modern px-4 py-2 gradient-primary text-white text-xs shrink-0 disabled:opacity-50"
          >
            تغيير
          </button>
        </div>
        {pinSuccess && <p className="text-xs text-green-600 text-center">✓ تم تغيير كلمة السر</p>}
      </Card>

      {/* Change Neighborhood */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          تغيير المجاورة
        </h3>
        <p className="text-xs text-muted-foreground">مجاورتك الحالية: {currentNeighborhood?.nameAr}</p>

        {!showNeighborhoodChange ? (
          <button
            onClick={() => setShowNeighborhoodChange(true)}
            className="text-sm text-primary hover:underline"
          >
            تغيير المجاورة
          </button>
        ) : (
          <div className="space-y-3">
            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`w-full h-10 rounded-xl bg-secondary px-4 flex items-center justify-between text-sm ${showDropdown ? 'ring-2 ring-primary/40' : ''}`}
              >
                <span>{demoNeighborhoods.find(n => n.id === selectedNeighborhood)?.nameAr}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border max-h-32 overflow-y-auto z-50">
                  {demoNeighborhoods.map(n => (
                    <button
                      key={n.id}
                      onClick={() => { setSelectedNeighborhood(n.id); setShowDropdown(false) }}
                      className={`w-full px-4 py-2 text-right text-sm hover:bg-blue-50 ${selectedNeighborhood === n.id ? 'bg-blue-50 text-primary font-medium' : ''}`}
                    >
                      {n.nameAr}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Permanent or temporary */}
            {selectedNeighborhood !== user.neighborhoodId && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleChangeNeighborhood(false)}
                  className="flex-1 py-2 rounded-xl bg-secondary text-sm font-medium hover:bg-secondary/80"
                >
                  المرة دي بس
                </button>
                <button
                  onClick={() => handleChangeNeighborhood(true)}
                  className="flex-1 py-2 rounded-xl gradient-primary text-white text-sm font-medium"
                >
                  دائماً
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Activity Log */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          سجل النشاط
        </h3>
        {activityLogs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">لا يوجد نشاط بعد</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activityLogs.slice(-10).reverse().map(log => (
              <div key={log.id} className="flex items-center justify-between text-xs bg-secondary/50 rounded-lg p-2">
                <div>
                  <span className="font-medium">
                    {log.action === 'view_store' && '👁️ شاهد'}
                    {log.action === 'call_store' && '📞 اتصل بـ'}
                    {log.action === 'whatsapp_store' && '💬 واتساب'}
                  </span>
                  {' '}
                  <span className="text-muted-foreground">{log.targetName}</span>
                </div>
                <span className="text-muted-foreground text-[10px]">
                  {new Date(log.timestamp).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

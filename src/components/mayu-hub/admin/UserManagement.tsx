import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getUsers, registerUser } from '@/lib/mayu-hub/auth'
import { demoNeighborhoods } from '@/lib/mayu-hub/demo-data'
import type { UserProfile } from '@/lib/mayu-hub/auth'
import { User, Trash2, Plus, ChevronDown } from 'lucide-react'

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>(getUsers())
  const [showAdd, setShowAdd] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Add user form
  const [newName, setNewName] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newPin, setNewPin] = useState('')
  const [newNeighborhood, setNewNeighborhood] = useState('')
  const [error, setError] = useState('')

  const handleDelete = (userId: string) => {
    if (!confirm('متأكد تحذف المستخدم ده؟')) return
    setUsers(prev => {
      const updated = prev.filter(u => u.id !== userId)
      localStorage.setItem('mayu_hub_users', JSON.stringify(updated))
      return updated
    })
  }

  const handleAddUser = () => {
    if (!newName.trim()) { setError('الاسم مطلوب'); return }
    if (!newUsername.trim()) { setError('اليوزر نيم مطلوب'); return }
    if (!newPhone.trim()) { setError('رقم الموبايل مطلوب'); return }
    if (newPin.length < 4) { setError('كلمة السر 4 أرقام'); return }
    if (!newNeighborhood) { setError('اختر المجاورة'); return }

    try {
      const user = registerUser({
        name: newName,
        username: newUsername,
        phone: newPhone,
        pin: newPin,
        neighborhoodId: newNeighborhood,
      })
      setUsers(prev => [...prev, user])
      setShowAdd(false)
      setNewName(''); setNewUsername(''); setNewPhone(''); setNewPin(''); setNewNeighborhood('')
      setError('')
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">إدارة المستخدمين</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{users.length} مستخدم</Badge>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="h-8 text-xs">
            <Plus className="w-3 h-3 ml-1" />
            إضافة
          </Button>
        </div>
      </div>

      {/* Add User Form */}
      {showAdd && (
        <Card className="p-4 space-y-3 border-primary/30 bg-primary/5">
          <h4 className="text-sm font-medium">إضافة مستخدم جديد</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">الاسم</Label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="الاسم" className="h-9 text-xs" />
            </div>
            <div>
              <Label className="text-[10px]">يوزر نيم</Label>
              <Input value={newUsername} onChange={e => setNewUsername(e.target.value.replace(/\s/g, '').toLowerCase())} placeholder="username" dir="ltr" className="h-9 text-xs text-right" />
            </div>
            <div>
              <Label className="text-[10px]">الموبايل</Label>
              <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="0101..." dir="ltr" className="h-9 text-xs text-right" />
            </div>
            <div>
              <Label className="text-[10px]">كلمة السر</Label>
              <Input type="password" value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" maxLength={4} className="h-9 text-xs text-center" />
            </div>
          </div>

          {/* Neighborhood */}
          <div className="relative">
            <Label className="text-[10px]">المجاورة</Label>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`w-full h-9 rounded-lg bg-white border px-3 flex items-center justify-between text-xs ${showDropdown ? 'ring-1 ring-primary' : ''}`}
            >
              <span>{newNeighborhood ? demoNeighborhoods.find(n => n.id === newNeighborhood)?.nameAr : 'اختر...'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border max-h-28 overflow-y-auto z-50">
                {demoNeighborhoods.map(n => (
                  <button key={n.id} onClick={() => { setNewNeighborhood(n.id); setShowDropdown(false) }}
                    className={`w-full px-3 py-1.5 text-right text-xs hover:bg-blue-50 ${newNeighborhood === n.id ? 'bg-blue-50 text-primary' : ''}`}>
                    {n.nameAr}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddUser} className="text-xs">إضافة</Button>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)} className="text-xs">إلغاء</Button>
          </div>
        </Card>
      )}

      {/* Users List */}
      {users.map(user => {
        const neighborhood = demoNeighborhoods.find(n => n.id === user.neighborhoodId)
        return (
          <Card key={user.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    @{user.username} • {user.phone} • {neighborhood?.nameAr}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {user.isAdmin && <Badge className="text-[10px]">أدمين</Badge>}
                {user.id !== 'admin-1' && (
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDelete(user.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

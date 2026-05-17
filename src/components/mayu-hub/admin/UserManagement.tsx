import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getUsers } from '@/lib/mayu-hub/auth'
import { demoNeighborhoods } from '@/lib/mayu-hub/demo-data'
import type { UserProfile } from '@/lib/mayu-hub/auth'
import { User, Ban, RotateCcw, Trash2 } from 'lucide-react'

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>(getUsers())

  const handleToggle = (userId: string) => {
    setUsers(prev => {
      const updated = prev.map(u => u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u)
      localStorage.setItem('mayu_hub_users', JSON.stringify(updated))
      return updated
    })
  }

  const handleDelete = (userId: string) => {
    if (!confirm('متأكد تحذف المستخدم ده؟')) return
    setUsers(prev => {
      const updated = prev.filter(u => u.id !== userId)
      localStorage.setItem('mayu_hub_users', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">إدارة المستخدمين</h3>
        <Badge variant="secondary">{users.length} مستخدم</Badge>
      </div>

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

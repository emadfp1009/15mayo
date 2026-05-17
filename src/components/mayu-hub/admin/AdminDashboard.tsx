import { Card } from '@/components/ui/card'
import { getUsers, getActivityLogs } from '@/lib/mayu-hub/auth'
import { demoStores } from '@/lib/mayu-hub/demo-data'
import { Users, Store, Eye, Phone, MessageCircle, TrendingUp } from 'lucide-react'

export function AdminDashboard() {
  const users = getUsers()
  const logs = getActivityLogs()

  const totalUsers = users.length
  const totalStores = demoStores.length
  const totalViews = logs.filter(l => l.action === 'view_store').length
  const totalCalls = logs.filter(l => l.action === 'call_store').length
  const totalWhatsapp = logs.filter(l => l.action === 'whatsapp_store').length

  // Today's stats
  const today = new Date().toDateString()
  const todayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === today)
  const todayViews = todayLogs.filter(l => l.action === 'view_store').length

  const stats = [
    { label: 'المستخدمين', value: totalUsers, icon: Users, color: 'bg-blue-500', lightColor: 'bg-blue-50' },
    { label: 'المتاجر', value: totalStores, icon: Store, color: 'bg-green-500', lightColor: 'bg-green-50' },
    { label: 'المشاهدات', value: totalViews, icon: Eye, color: 'bg-purple-500', lightColor: 'bg-purple-50' },
    { label: 'المكالمات', value: totalCalls, icon: Phone, color: 'bg-orange-500', lightColor: 'bg-orange-50' },
    { label: 'واتساب', value: totalWhatsapp, icon: MessageCircle, color: 'bg-emerald-500', lightColor: 'bg-emerald-50' },
    { label: 'اليوم', value: todayViews, icon: TrendingUp, color: 'bg-pink-500', lightColor: 'bg-pink-50' },
  ]

  // Recent activity
  const recentLogs = logs.slice(-15).reverse()

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">📊 لوحة المراقبة</h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        {stats.map(stat => (
          <Card key={stat.label} className={`p-3 ${stat.lightColor} border-0`}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">{stat.value}</span>
              <span className="text-[10px] text-muted-foreground">{stat.label}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-4">
        <h4 className="font-semibold text-sm mb-3">آخر النشاطات</h4>
        {recentLogs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">لا يوجد نشاط بعد</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {recentLogs.map(log => (
              <div key={log.id} className="flex items-center justify-between text-xs bg-secondary/50 rounded-lg p-2.5">
                <div className="flex items-center gap-2">
                  <span>
                    {log.action === 'view_store' && '👁️'}
                    {log.action === 'call_store' && '📞'}
                    {log.action === 'whatsapp_store' && '💬'}
                    {log.action === 'register_store' && '🏪'}
                  </span>
                  <div>
                    <span className="font-medium">{log.userName}</span>
                    <span className="text-muted-foreground">
                      {log.action === 'view_store' && ' شاف '}
                      {log.action === 'call_store' && ' اتصل بـ '}
                      {log.action === 'whatsapp_store' && ' واتساب '}
                    </span>
                    <span className="font-medium">{log.targetName}</span>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

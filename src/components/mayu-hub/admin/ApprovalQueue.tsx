import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { demoNeighborhoods } from '@/lib/mayu-hub/demo-data'
import { validateRejectionReason } from '@/lib/mayu-hub/validation'
import { Check, X, Clock } from 'lucide-react'

interface PendingStore {
  id: string
  nameAr: string
  neighborhoodId: string
  phone: string
  createdAt: string
}

const initialPending: PendingStore[] = [
  { id: 'pending-1', nameAr: 'صيدلية المستقبل', neighborhoodId: 'neighborhood-2', phone: '+201555666777', createdAt: '2025-05-10T10:00:00Z' },
  { id: 'pending-2', nameAr: 'مطعم الشرق', neighborhoodId: 'neighborhood-1', phone: '+201888999000', createdAt: '2025-05-12T14:30:00Z' },
  { id: 'pending-3', nameAr: 'محل إلكترونيات النجم', neighborhoodId: 'neighborhood-3', phone: '+201222333444', createdAt: '2025-05-14T09:15:00Z' },
]

export function ApprovalQueue() {
  const [pending, setPending] = useState(initialPending)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionError, setRejectionError] = useState<string | null>(null)

  const handleApprove = (id: string) => {
    setPending(prev => prev.filter(s => s.id !== id))
  }

  const handleReject = (id: string) => {
    if (!validateRejectionReason(rejectionReason)) {
      setRejectionError('سبب الرفض يجب أن يكون 10 أحرف على الأقل')
      return
    }
    setPending(prev => prev.filter(s => s.id !== id))
    setRejectingId(null)
    setRejectionReason('')
    setRejectionError(null)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">طلبات الموافقة</h3>
        <Badge variant="secondary">{pending.length} معلق</Badge>
      </div>

      {pending.length === 0 ? (
        <div className="text-center py-8">
          <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-muted-foreground">لا توجد طلبات معلقة</p>
        </div>
      ) : (
        pending.map(store => {
          const neighborhood = demoNeighborhoods.find(n => n.id === store.neighborhoodId)
          return (
            <Card key={store.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm">{store.nameAr}</h4>
                  <p className="text-xs text-muted-foreground">
                    📍 {neighborhood?.nameAr} • 📞 {store.phone}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(store.createdAt)}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">معلق</Badge>
              </div>

              {rejectingId === store.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={rejectionReason}
                    onChange={e => {
                      setRejectionReason(e.target.value)
                      setRejectionError(null)
                    }}
                    placeholder="سبب الرفض (10 أحرف على الأقل)..."
                    className="text-sm"
                    rows={2}
                  />
                  {rejectionError && (
                    <p className="text-xs text-destructive">{rejectionError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => handleReject(store.id)}>
                      تأكيد الرفض
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setRejectingId(null); setRejectionReason(''); setRejectionError(null) }}>
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(store.id)}>
                    <Check className="w-3 h-3 ml-1" />
                    موافقة
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setRejectingId(store.id)}>
                    <X className="w-3 h-3 ml-1" />
                    رفض
                  </Button>
                </div>
              )}
            </Card>
          )
        })
      )}
    </div>
  )
}

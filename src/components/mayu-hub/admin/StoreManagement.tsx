import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { demoStores, demoNeighborhoods, demoCategories } from '@/lib/mayu-hub/demo-data'
import type { StoreProfile } from '@/lib/mayu-hub/types'
import { Store, Ban, RotateCcw, Plus, Edit, Download, ChevronDown } from 'lucide-react'

export function StoreManagement() {
  const [stores, setStores] = useState<StoreProfile[]>(demoStores)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formNeighborhood, setFormNeighborhood] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formAddress, setFormAddress] = useState('')

  const handleToggleStatus = (storeId: string) => {
    setStores(prev => prev.map(s => {
      if (s.id !== storeId) return s
      return { ...s, status: s.status === 'deactivated' ? 'approved' : 'deactivated' }
    }))
  }

  const handleAdd = () => {
    if (!formName.trim() || !formPhone.trim() || !formNeighborhood) return
    const newStore: StoreProfile = {
      id: `store-${Date.now()}`,
      ownerId: 'admin-1',
      neighborhoodId: formNeighborhood,
      nameAr: formName,
      phone: formPhone,
      whatsappNumber: null,
      whatsappMessage: null,
      logoUrl: null,
      storefrontPhotoUrl: null,
      categoryId: formCategory || null,
      address: formAddress || null,
      isPremium: false,
      premiumStartedAt: null,
      premiumExpiresAt: null,
      status: 'approved',
      rejectionReason: null,
      delivers: false,
      deliveryCostEgp: null,
      deliveryDurationMinutes: null,
      manualStatusOverride: null,
      manualStatusOverrideUntil: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setStores(prev => [...prev, newStore])
    resetForm()
  }

  const handleEdit = (store: StoreProfile) => {
    setEditingId(store.id)
    setFormName(store.nameAr)
    setFormPhone(store.phone)
    setFormNeighborhood(store.neighborhoodId)
    setFormCategory(store.categoryId || '')
    setFormAddress(store.address || '')
  }

  const handleSaveEdit = () => {
    if (!editingId) return
    setStores(prev => prev.map(s => {
      if (s.id !== editingId) return s
      return { ...s, nameAr: formName, phone: formPhone, neighborhoodId: formNeighborhood, categoryId: formCategory || null, address: formAddress || null, updatedAt: new Date().toISOString() }
    }))
    resetForm()
  }

  const resetForm = () => {
    setShowAdd(false)
    setEditingId(null)
    setFormName(''); setFormPhone(''); setFormNeighborhood(''); setFormCategory(''); setFormAddress('')
  }

  // Export to CSV
  const handleExport = () => {
    const headers = 'الاسم,الهاتف,المجاورة,الفئة,العنوان,الحالة\n'
    const rows = stores.map(s => {
      const n = demoNeighborhoods.find(n => n.id === s.neighborhoodId)
      const c = demoCategories.find(c => c.id === s.categoryId)
      return `${s.nameAr},${s.phone},${n?.nameAr || ''},${c?.nameAr || ''},${s.address || ''},${s.status}`
    }).join('\n')

    const blob = new Blob(['\ufeff' + headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mayu-hub-stores.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    approved: { label: 'نشط', variant: 'default' },
    pending: { label: 'معلق', variant: 'outline' },
    rejected: { label: 'مرفوض', variant: 'destructive' },
    deactivated: { label: 'معطل', variant: 'secondary' },
  }

  const isEditing = editingId !== null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">إدارة المتاجر</h3>
        <div className="flex gap-2">
          <Badge variant="secondary">{stores.length} متجر</Badge>
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleExport}>
            <Download className="w-3 h-3 ml-1" />
            تصدير
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={() => { resetForm(); setShowAdd(true) }}>
            <Plus className="w-3 h-3 ml-1" />
            إضافة
          </Button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showAdd || isEditing) && (
        <Card className="p-4 space-y-3 border-primary/30 bg-primary/5">
          <h4 className="text-sm font-medium">{isEditing ? 'تعديل متجر' : 'إضافة متجر جديد'}</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">اسم المتجر</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="الاسم" className="h-9 text-xs" />
            </div>
            <div>
              <Label className="text-[10px]">الهاتف</Label>
              <Input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="0101..." dir="ltr" className="h-9 text-xs text-right" />
            </div>
          </div>

          <div>
            <Label className="text-[10px]">العنوان</Label>
            <Input value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder="العنوان بالتفصيل..." className="h-9 text-xs" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Neighborhood */}
            <div className="relative">
              <Label className="text-[10px]">المجاورة</Label>
              <button onClick={() => setShowDropdown(!showDropdown)}
                className={`w-full h-9 rounded-lg bg-white border px-3 flex items-center justify-between text-xs ${showDropdown ? 'ring-1 ring-primary' : ''}`}>
                <span>{formNeighborhood ? demoNeighborhoods.find(n => n.id === formNeighborhood)?.nameAr : 'اختر...'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border max-h-28 overflow-y-auto z-50">
                  {demoNeighborhoods.map(n => (
                    <button key={n.id} onClick={() => { setFormNeighborhood(n.id); setShowDropdown(false) }}
                      className={`w-full px-3 py-1.5 text-right text-xs hover:bg-blue-50 ${formNeighborhood === n.id ? 'bg-blue-50 text-primary' : ''}`}>
                      {n.nameAr}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <Label className="text-[10px]">الفئة</Label>
              <select value={formCategory} onChange={e => setFormCategory(e.target.value)}
                className="w-full h-9 rounded-lg border px-2 text-xs bg-white">
                <option value="">بدون</option>
                {demoCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.nameAr}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={isEditing ? handleSaveEdit : handleAdd} className="text-xs">
              {isEditing ? 'حفظ التعديل' : 'إضافة'}
            </Button>
            <Button size="sm" variant="outline" onClick={resetForm} className="text-xs">إلغاء</Button>
          </div>
        </Card>
      )}

      {/* Stores List */}
      {stores.map(store => {
        const neighborhood = demoNeighborhoods.find(n => n.id === store.neighborhoodId)
        const category = demoCategories.find(c => c.id === store.categoryId)
        const statusInfo = statusLabels[store.status] ?? statusLabels.approved

        return (
          <Card key={store.id} className={`p-3 ${store.status === 'deactivated' ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Store className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-semibold text-sm">{store.nameAr}</h4>
                  {store.isPremium && <Badge className="text-[10px]">مميز</Badge>}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {category?.icon} {category?.nameAr} • 📍 {neighborhood?.nameAr}
                </p>
                {store.address && <p className="text-[10px] text-muted-foreground mt-0.5">📌 {store.address}</p>}
              </div>

              <div className="flex flex-col items-end gap-1">
                <Badge variant={statusInfo.variant} className="text-[10px]">{statusInfo.label}</Badge>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleEdit(store)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost"
                    className={`h-7 w-7 p-0 ${store.status === 'deactivated' ? 'text-green-600' : 'text-destructive'}`}
                    onClick={() => handleToggleStatus(store.id)}>
                    {store.status === 'deactivated' ? <RotateCcw className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

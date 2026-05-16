import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StoreManagement } from './StoreManagement'
import { NeighborhoodManagement } from './NeighborhoodManagement'
import { ApprovalQueue } from './ApprovalQueue'
import { ArrowRight } from 'lucide-react'

interface AdminPanelProps {
  onBack: () => void
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowRight className="w-4 h-4" />
          رجوع
        </button>
        <h2 className="text-lg font-bold">⚙️ لوحة الإدارة</h2>
      </div>

      <Tabs defaultValue="approvals" dir="rtl">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="approvals">الموافقات</TabsTrigger>
          <TabsTrigger value="stores">المتاجر</TabsTrigger>
          <TabsTrigger value="neighborhoods">المجاورات</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="mt-4">
          <ApprovalQueue />
        </TabsContent>

        <TabsContent value="stores" className="mt-4">
          <StoreManagement />
        </TabsContent>

        <TabsContent value="neighborhoods" className="mt-4">
          <NeighborhoodManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}

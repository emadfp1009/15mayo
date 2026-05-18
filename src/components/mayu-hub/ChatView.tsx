import { useMessaging } from '@/hooks/mayu-hub/useMessaging'
import { MessageCircle } from 'lucide-react'
import type { ChatThread } from '@/lib/mayu-hub/types'

interface ChatViewProps {
  onBack: () => void
  onOpenThread: (storeId: string, storeName: string) => void
}

export function ChatView({ onBack, onOpenThread }: ChatViewProps) {
  const { threads } = useMessaging()

  // Sort threads by lastMessageAt (most recent first)
  const sortedThreads = [...threads].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">💬 رسائل</h2>
        <button onClick={onBack} className="text-sm text-primary">← رجوع</button>
      </div>

      {sortedThreads.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-base font-semibold text-muted-foreground">لا توجد محادثات</h3>
          <p className="text-sm text-muted-foreground mt-1">
            ابدأ محادثة من صفحة أي متجر
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedThreads.map(thread => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onClick={() => onOpenThread(thread.storeId, thread.storeName)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ThreadCard({ thread, onClick }: { thread: ChatThread; onClick: () => void }) {
  const truncatedMessage =
    thread.lastMessage.length > 50
      ? thread.lastMessage.slice(0, 50) + '...'
      : thread.lastMessage

  const formattedTime = formatRelativeTime(thread.lastMessageAt)

  return (
    <button
      onClick={onClick}
      className="w-full text-right p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors flex items-start gap-3"
    >
      {/* Store avatar placeholder */}
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <MessageCircle className="w-5 h-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-sm truncate">{thread.storeName}</span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{formattedTime}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{truncatedMessage}</p>
      </div>

      {/* Unread badge */}
      {thread.unreadCount > 0 && (
        <span className="shrink-0 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
          {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
        </span>
      )}
    </button>
  )
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return 'الآن'
  if (diffMinutes < 60) return `منذ ${diffMinutes} د`
  if (diffHours < 24) return `منذ ${diffHours} س`
  if (diffDays < 7) return `منذ ${diffDays} ي`

  return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
}

import { useState, useRef, useEffect } from 'react'
import { ArrowRight, Send } from 'lucide-react'
import { useMessaging } from '@/hooks/mayu-hub/useMessaging'
import { getCurrentUser, isGuestUser } from '@/lib/mayu-hub/auth'
import { toast } from 'sonner'

interface ChatThreadProps {
  storeId: string
  storeName: string
  onBack: () => void
}

export function ChatThread({ storeId, storeName, onBack }: ChatThreadProps) {
  const { getThreadMessages, sendMessage } = useMessaging()
  const [text, setText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUser = getCurrentUser()

  const messages = getThreadMessages(storeId)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return

    if (!currentUser || isGuestUser(currentUser)) {
      toast.error('سجل دخول أولاً', {
        description: 'يجب تسجيل الدخول لإرسال الرسائل',
      })
      return
    }

    const result = sendMessage(storeId, storeName, trimmed)
    if (result.needsLogin) {
      toast.error('سجل دخول أولاً', {
        description: 'يجب تسجيل الدخول لإرسال الرسائل',
      })
      return
    }

    if (result.success) {
      setText('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isSentByMe = (senderId: string) => {
    return currentUser?.id === senderId
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b bg-white sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="رجوع"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold truncate">{storeName}</h2>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">ابدأ المحادثة</p>
          </div>
        ) : (
          messages.map((msg) => {
            const sent = isSentByMe(msg.senderId)
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${sent ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    sent
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t bg-white p-3 sticky bottom-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالة..."
            className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            dir="rtl"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="p-2.5 rounded-full bg-primary text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            aria-label="إرسال"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

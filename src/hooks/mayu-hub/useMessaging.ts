import { useState, useCallback } from 'react';
import { getMessages, setMessages, getThreads, setThreads } from '@/lib/mayu-hub/local-storage';
import { sortMessagesByTimestamp, createThreadId, getUnreadCount as computeUnread } from '@/lib/mayu-hub/messaging';
import { getCurrentUser, isGuestUser } from '@/lib/mayu-hub/auth';
import type { ChatMessage, ChatThread } from '@/lib/mayu-hub/types';

/**
 * Hook for managing in-app messaging.
 * Reads/writes messages and threads from localStorage,
 * and blocks sending for guest users.
 */
export function useMessaging() {
  const [allMessages, setAllMessages] = useState(getMessages());
  const [threads, setAllThreads] = useState<ChatThread[]>(getThreads());
  const user = getCurrentUser();

  const getThread = useCallback((storeId: string): ChatThread | null => {
    if (!user) return null;
    const threadId = createThreadId(user.id, storeId);
    return threads.find(t => t.id === threadId) ?? null;
  }, [user, threads]);

  const getThreadMessages = useCallback((storeId: string): ChatMessage[] => {
    if (!user) return [];
    const threadId = createThreadId(user.id, storeId);
    return sortMessagesByTimestamp(allMessages[threadId] || []);
  }, [user, allMessages]);

  const sendMessage = useCallback((storeId: string, storeName: string, text: string): { success: boolean; needsLogin: boolean } => {
    if (!user || isGuestUser(user)) {
      return { success: false, needsLogin: true };
    }
    const threadId = createThreadId(user.id, storeId);
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      threadId,
      senderId: user.id,
      senderName: user.name,
      text,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    // Update messages
    const updatedMessages = { ...allMessages };
    if (!updatedMessages[threadId]) updatedMessages[threadId] = [];
    updatedMessages[threadId] = [...updatedMessages[threadId], newMessage];
    setMessages(updatedMessages);
    setAllMessages(updatedMessages);

    // Update or create thread
    const existingIdx = threads.findIndex(t => t.id === threadId);
    const updatedThreads = [...threads];
    if (existingIdx >= 0) {
      updatedThreads[existingIdx] = {
        ...updatedThreads[existingIdx],
        lastMessage: text,
        lastMessageAt: newMessage.timestamp,
      };
    } else {
      updatedThreads.push({
        id: threadId,
        userId: user.id,
        storeId,
        storeName,
        lastMessage: text,
        lastMessageAt: newMessage.timestamp,
        unreadCount: 0,
      });
    }
    setThreads(updatedThreads);
    setAllThreads(updatedThreads);

    return { success: true, needsLogin: false };
  }, [user, allMessages, threads]);

  const unreadCount = computeUnread(threads);

  return {
    threads,
    getThread,
    getThreadMessages,
    sendMessage,
    getUnreadCount: () => unreadCount,
  };
}

import type { ChatMessage, ChatThread } from './types';

/**
 * Sorts messages by timestamp in ascending (chronological) order.
 * Returns a new array without mutating the original.
 */
export function sortMessagesByTimestamp(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

/**
 * Creates a deterministic thread ID from a user ID and store ID.
 * Format: `${userId}_${storeId}`
 */
export function createThreadId(userId: string, storeId: string): string {
  return `${userId}_${storeId}`;
}

/**
 * Computes the total unread message count across all threads.
 */
export function getUnreadCount(threads: ChatThread[]): number {
  return threads.reduce((total, thread) => total + thread.unreadCount, 0);
}

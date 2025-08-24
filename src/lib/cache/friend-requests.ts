import { getFriendRequestsByUserId } from "@/lib/hepper/get-friends";
import { UserData } from "@/types/user";

interface CacheEntry {
  data: UserData[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function getCachedFriendRequests(userId: string) {
  const cacheKey = `friend-requests:${userId}`;
  const now = Date.now();

  // Check if cache exists and is still valid
  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Fetch fresh data
  const friendRequests = await getFriendRequestsByUserId(userId);

  // Store in cache
  cache.set(cacheKey, {
    data: friendRequests,
    timestamp: now,
  });

  return friendRequests;
}

// Optional: Function to invalidate cache when friend requests change
export function invalidateFriendRequestsCache(userId: string) {
  const cacheKey = `friend-requests:${userId}`;
  cache.delete(cacheKey);
}

// Optional: Function to clear expired cache entries
export function clearExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp >= CACHE_DURATION) {
      cache.delete(key);
    }
  }
}

import { UserData } from "@/types/user";
import { fetchRedis } from "./redis";

export const getFriendsByUserId = async (userId: string) => {
  // retrieve friends for current user
  const friendIds = (await fetchRedis(
    "smembers",
    `user:${userId}:friends`
  )) as string[];

  const friends = await Promise.all(
    friendIds.map(async (friendId) => {
      const friend = (await fetchRedis("get", `user:${friendId}`)) as string;
      const parsedFriend = JSON.parse(friend) as UserData;
      return parsedFriend;
    })
  );
  return friends;
};

export const getFriendRequestsByUserId = async (userId: string) => {
  // retrieve friend requests for current user
  const friendRequestIds = (await fetchRedis(
    "smembers",
    `user:${userId}:incoming_friend_requests`
  )) as string[];

  const friendRequests = await Promise.all(
    friendRequestIds.map(async (requestId) => {
      const request = (await fetchRedis("get", `user:${requestId}`)) as string;
      const parsedRequest = JSON.parse(request) as UserData;
      return parsedRequest;
    })
  );

  return friendRequests;
};

/**
 * Lấy danh sách bạn chung giữa hai user
 * @param userId1 - ID của user thứ nhất
 * @param userId2 - ID của user thứ hai
 * @returns Promise<UserData[]> - Danh sách bạn chung
 */
export const getMutualFriends = async (
  userId1: string,
  userId2: string
): Promise<UserData[]> => {
  // Sử dụng Redis SINTER để tìm giao của hai set bạn bè
  const mutualFriendIds = (await fetchRedis(
    "sinter",
    `user:${userId1}:friends`,
    `user:${userId2}:friends`
  )) as string[];

  // Nếu không có bạn chung, trả về mảng rỗng
  if (!mutualFriendIds || mutualFriendIds.length === 0) {
    return [];
  }

  // Lấy thông tin chi tiết của các bạn chung
  const mutualFriends = await Promise.all(
    mutualFriendIds.map(async (friendId) => {
      const friend = (await fetchRedis("get", `user:${friendId}`)) as string;
      const parsedFriend = JSON.parse(friend) as UserData;
      return parsedFriend;
    })
  );

  return mutualFriends;
};

/**
 * Lấy danh sách bạn chung giữa current user và một friend request
 * @param currentUserId - ID của user hiện tại
 * @param requestUserId - ID của user gửi friend request
 * @returns Promise<UserData[]> - Danh sách bạn chung
 */
export const getMutualFriendsWithFriendRequest = async (
  currentUserId: string,
  requestUserId: string
): Promise<UserData[]> => {
  return await getMutualFriends(currentUserId, requestUserId);
};

/**
 * Lấy số lượng bạn chung giữa hai user (không cần lấy thông tin chi tiết)
 * @param userId1 - ID của user thứ nhất
 * @param userId2 - ID của user thứ hai
 * @returns Promise<number> - Số lượng bạn chung
 */
export const getMutualFriendsCount = async (
  userId1: string,
  userId2: string
): Promise<number> => {
  const mutualFriendIds = (await fetchRedis(
    "sinter",
    `user:${userId1}:friends`,
    `user:${userId2}:friends`
  )) as string[];

  return mutualFriendIds ? mutualFriendIds.length : 0;
};

/**
 * Lấy danh sách bạn chung cho tất cả friend requests của user
 * @param currentUserId - ID của user hiện tại
 * @returns Promise<{requestUser: UserData, mutualFriends: UserData[], mutualCount: number}[]>
 */
export const getFriendRequestsWithMutualFriends = async (
  currentUserId: string
) => {
  const friendRequests = await getFriendRequestsByUserId(currentUserId);

  const friendRequestsWithMutual = await Promise.all(
    friendRequests.map(async (requestUser) => {
      const mutualFriends = await getMutualFriends(
        currentUserId,
        requestUser.id
      );

      return {
        requestUser,
        mutualFriends,
        mutualCount: mutualFriends.length,
      };
    })
  );

  return friendRequestsWithMutual;
};

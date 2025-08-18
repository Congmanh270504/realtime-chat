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

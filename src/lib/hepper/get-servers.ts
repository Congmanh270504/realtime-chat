import { Servers } from "@/types/servers";
import { fetchRedis } from "./redis";

export async function getServersByUserId(userId: string) {
  const serverIds = (await fetchRedis(
    "smembers",
    `user:${userId}:servers`
  )) as string[];
  const servers = await Promise.all(
    serverIds.map(async (serverId) => {
      const serverData = (await fetchRedis(
        "get",
        `servers:${serverId}`
      )) as string;

      const parsedServerData = JSON.parse(serverData) as Servers;
      return {
        ...parsedServerData,
        id: serverId,
      };
    })
  );
  return servers;
}

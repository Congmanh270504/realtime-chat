const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL;
const authToken = process.env.UPSTASH_REDIS_REST_TOKEN;

type Command = "zrange" | "sismember" | "get" | "smembers";

export async function fetchRedis(
  command: Command,
  ...args: (string | number)[]
) {
  const commandUrl = `${upstashRedisRestUrl}/${command}/${args.join("/")}`;

  const response = await fetch(commandUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Error executing Redis command: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result;
}

// Helper function để lấy thông tin user từ Redis
export async function getUserFromRedis(userId: string) {
  try {
    const userData = await fetchRedis("get", `user:${userId}`);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error(`Error fetching user ${userId} from Redis:`, error);
    return null;
  }
}

// Helper function để kiểm tra user có tồn tại trong Redis không
export async function userExistsInRedis(userId: string): Promise<boolean> {
  try {
    const userData = await fetchRedis("get", `user:${userId}`);
    return !!userData;
  } catch (error) {
    console.error(`Error checking user ${userId} existence in Redis:`, error);
    return false;
  }
}

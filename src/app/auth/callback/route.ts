import { redis } from "@/lib/redis";
import { handleAuth } from "@workos-inc/authkit-nextjs";

export const GET = handleAuth({
  onSuccess: async ({ user }) => {
    await redis.get("user:" + user.id);
  },
});

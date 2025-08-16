import { redis } from "@/lib/redis";
import { handleAuth } from "@workos-inc/authkit-nextjs";

export const GET = handleAuth({
  onSuccess: async ({
    user,
    oauthTokens,
    authenticationMethod,
    organizationId,
  }) => {
    await redis.get("user:" + user.id);
  },
});

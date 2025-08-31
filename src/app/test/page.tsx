import { redis } from "@/lib/redis";
import React from "react";

const Page = async () => {
  const nicknames = (await redis.hgetall(
    `chat:user_31dlsNLyd3Xq95UloZjtmr8HkE0--user_31dm5f3aOsJJoZ5fLmZ3et6Vlpg:nicknames`
  )) as Record<string, string>;
  console.log(nicknames);
  return <div>Page</div>;
};

export default Page;

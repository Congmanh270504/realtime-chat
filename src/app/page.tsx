import { RedirectToSignIn } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";
import { getFriendsByUserId } from "@/lib/hepper/get-friends";
import { redirect } from "next/navigation";
import { getServersByUserId } from "@/lib/hepper/get-servers";
import About from "./about/page";

const Page = async () => {
  const user = await currentUser();
  if (!user) {
    return <RedirectToSignIn />;
  }

  var initialFriends = [];
  var servers = [];

  await Promise.all([
    (initialFriends = await getFriendsByUserId(user.id)),
    (servers = await getServersByUserId(user.id)),
  ]);

  if (initialFriends.length > 0 || servers.length > 0) {
    redirect("/messages");
  }

  return <About />;
};

export default Page;

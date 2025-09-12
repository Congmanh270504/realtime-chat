import { currentUser } from "@clerk/nextjs/server";
import React, { Suspense } from "react";
import Loading from "../add-friends/loading";
import Friends from "@/components/friends";
import { getFriendsByUserId } from "@/lib/hepper/get-friends";

const Page = async () => {
  const user = await currentUser();
  if (!user) {
    return (
      <div>
        <p>Please sign in</p>
      </div>
    );
  }
  const initialFriends = await getFriendsByUserId(user.id);

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen p-4">
        <div className="w-full mx-auto">
          <Friends initialFriends={initialFriends} userId={user.id} />
        </div>
      </div>
    </Suspense>
  );
};

export default Page;

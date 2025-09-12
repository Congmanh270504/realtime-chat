import { FriendSuggestions } from "@/components/friend-requests";
import { currentUser } from "@clerk/nextjs/server";
import React, { Suspense } from "react";
import Loading from "./loading";
import { redirect } from "next/navigation";
import { getFriendRequestsByUserId } from "@/lib/hepper/get-friends";

const Page = async () => {
  const user = await currentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const friendRequests = await getFriendRequestsByUserId(user.id);

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen p-4">
        <div className="w-full mx-auto">
          <FriendSuggestions
            initialFriendRequests={friendRequests}
            userId={user.id}
          />
        </div>
      </div>
    </Suspense>
  );
};

export default Page;

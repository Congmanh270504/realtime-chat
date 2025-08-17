import AddFriendsForm from "@/components/add-friends-form";
import { redis } from "@/lib/redis";
import React from "react";

const Page = async () => {
  return (
    <div className="flex justify-center items-start min-h-screen pt-20">
      <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <AddFriendsForm />
      </div>
    </div>
  );
};

export default Page;

"use server";
import { getFriendsByUserId } from "@/lib/hepper/get-friends";
import { chatHrefConstructor } from "@/lib/utils";
import React from "react";

const Page = async () => {
  const test = chatHrefConstructor("1", "2");
  return test;
};

export default Page;

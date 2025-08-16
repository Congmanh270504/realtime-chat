"use client";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="items-center justify-center flex h-full py-10">
      <SignIn />
    </div>
  );
}

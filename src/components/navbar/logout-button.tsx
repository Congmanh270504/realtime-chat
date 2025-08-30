"use client";

import { signOut } from "@workos-inc/authkit-nextjs";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const handleLogout = async () => {
    await signOut();
  };

  return <Button onClick={handleLogout}>Log out</Button>;
}

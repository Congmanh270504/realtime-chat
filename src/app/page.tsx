import Link from "next/link";
import { getSignUpUrl, withAuth } from "@workos-inc/authkit-nextjs";
import Image from "next/image";
import { LogoutButton } from "@/components/logout-button";

export default async function HomePage() {
  // Retrieves the user from the session or returns `null` if no user is signed in
  const { user } = await withAuth();

  // Get the URL to redirect the user to AuthKit to sign up
  const signUpUrl = await getSignUpUrl();

  if (!user) {
    return (
      <>
        <a href="/login">Sign in</a>
        <Link href={signUpUrl}>Sign up</Link>
      </>
    );
  }

  return (
    <>
      <Image
        src={
          user.profilePictureUrl
            ? user.profilePictureUrl
            : "/default-profile.png"
        }
        alt={`${user.firstName}'s profile picture`}
        width={100}
        height={100}
      />
      <p>
        Welcome back{user.firstName && `, ${user.firstName}`}. Your profile
        picture URL is {user.profilePictureUrl} and your ID is {user.id}.
      </p>
      <div className="flex flex-wrap items-start gap-2 md:flex-row">
        <LogoutButton />
      </div>
    </>
  );
}

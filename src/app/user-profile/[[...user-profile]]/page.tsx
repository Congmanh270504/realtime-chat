import { UserProfile } from "@clerk/nextjs";

const UserProfilePage = () => (
  <div className="h-full flex flex-col items-center justify-center py-4">
    <UserProfile />
  </div>
);

export default UserProfilePage;

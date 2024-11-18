import ProtectedNavBar from "~/components/ProtectedNavBar";
import NavBar from "~/components/NavBar";
import { getCurrentUser } from "~/actions/profile";
import { getAllUserOrganizations } from "~/server/db/calls/auth";
import { ProfileProvider } from "~/components/profile-provider";

const ProtectedHomeLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const user = await getCurrentUser();
  if (user) {
    const userOrgs = await getAllUserOrganizations(user.id);
    return (
      <div className="">
        <ProfileProvider initialValue={user}>
          <ProtectedNavBar userOrgs={userOrgs} />
          {children}
        </ProfileProvider>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <NavBar />
      {children}
    </div>
  );
};

export default ProtectedHomeLayout;

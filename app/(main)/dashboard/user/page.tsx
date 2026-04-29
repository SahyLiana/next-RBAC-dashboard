import { checkUserPermission, getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role, User } from "@/app/types";
import UserDashboard from "@/components/Dashboard/UserDashboard";
import { redirect } from "next/navigation";

async function UserPage() {
  const user = await getCurrentUser();
  if (!user || !checkUserPermission(user, Role.USER)) {
    redirect("/login");
  }

  //Fetch user specific data
  const teamMembers = user.teamId
    ? await prisma.user.findMany({
        where: { teamId: user.teamId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      })
    : [];

  return (
    <UserDashboard teamMembers={teamMembers as User[]} currentUser={user} />
  );
}

export default UserPage;

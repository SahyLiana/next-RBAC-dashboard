import { checkUserPermission, getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { transformTeams, transformUsers } from "@/app/lib/util";
import { Role, User } from "@/app/types";
import ManagerDashboard from "@/components/Dashboard/ManagerDashboard";
import { redirect } from "next/navigation";

async function ManagerPage() {
  const user = await getCurrentUser();
  if (!user || !checkUserPermission(user, Role.MANAGER)) {
    redirect("/unauthorized");
  }

  //Fetch manager's own team members
  const prismaMyTeamMembers = user.teamId
    ? await prisma.user.findMany({
        where: { teamId: user.teamId, role: { not: Role.ADMIN } },
        include: { team: true },
      })
    : [];

  //Fecth all team members cross-team view -exclude sensitive fields
  const prismaAllTeamMembers = await prisma.user.findMany({
    where: { role: { not: Role.ADMIN } },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
        },
      },
    },
    orderBy: { teamId: "desc" },
  });

  const myTeamMembers = transformUsers(prismaMyTeamMembers);
  const allTeamMembers = transformUsers(prismaAllTeamMembers);

  return (
    <ManagerDashboard
      myTeamMembers={myTeamMembers as User[]}
      allTeamMembers={allTeamMembers as User[]}
      currentUser={user}
    />
  );
}

export default ManagerPage;

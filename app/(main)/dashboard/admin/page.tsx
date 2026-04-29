import { checkUserPermission, getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { transformTeams, transformUsers } from "@/app/lib/util";
import { Role } from "@/app/types";
import AdminDashboard from "@/components/Dashboard/AdminDashboard";
import { redirect } from "next/navigation";

async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || !checkUserPermission(user, Role.ADMIN)) {
    redirect("/unauthorized");
  }

  //Fetch data for admin dashboard
  const [prismaUsers, prismaTeams] = await Promise.all([
    prisma.user.findMany({
      include: { team: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.team.findMany({
      include: {
        members: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const users = transformUsers(prismaUsers);
  const teams = transformTeams(prismaTeams);

  return <AdminDashboard users={users} teams={teams} currentUser={user} />;
}

export default AdminPage;

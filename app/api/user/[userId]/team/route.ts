import { checkUserPermission, getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@/app/types";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await context.params;
    const user = await getCurrentUser();

    if (!user || !checkUserPermission(user, Role.ADMIN)) {
      return NextResponse.json(
        {
          error: "You are not authorized to perform this action",
        },
        { status: 401 },
      );
    }

    const { teamId } = await request.json();

    if (teamId) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });
      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 409 });
      }
    }

    //UPDATE THE USER'S TEAM ASSIGNMENT
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { teamId },
      include: { team: true },
    });

    return NextResponse.json(
      {
        user: updatedUser,
        message: teamId
          ? "User assigned to team successfully"
          : "User removed from team successfully",
      },
      { status: 200 },
    );
  } catch (e) {
    console.error("Team assignment error:", e);
    if (
      e instanceof Error &&
      e.message.includes("Record to update not found")
    ) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal server, please try again" },
      { status: 500 },
    );
  }
}

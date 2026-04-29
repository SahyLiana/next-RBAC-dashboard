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
    const currentUser = await getCurrentUser();

    if (!currentUser || !checkUserPermission(currentUser, Role.ADMIN)) {
      return NextResponse.json(
        {
          error: "You are not authorized to perform this action",
        },
        { status: 401 },
      );
    }

    //PREVENT USERS FROM CHANGING THEIR OWN ROLE
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 401 },
      );
    }

    const { role } = await request.json();
    //Validate role
    const validateRoles = [Role.MANAGER, Role.USER];
    if (!validateRoles.includes(role)) {
      return NextResponse.json(
        {
          error:
            "Invalid role or you cannot have more than one Admin role user",
        },
        { status: 400 },
      );
    }

    //UPDATE THE USER'S TEAM ASSIGNMENT
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      include: { team: true },
    });

    return NextResponse.json(
      {
        user: updatedUser,
        message: `User role updated to ${role} successfully`,
      },
      { status: 200 },
    );
  } catch (e) {
    console.error("Role assignment error:", e);
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

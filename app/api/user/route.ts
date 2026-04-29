import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@/app/types";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          status: "error",
          message: "You are not authorized to access user information",
        },
        { status: 404 },
      );
    }

    //QUERY PARAMS
    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get("teamId");
    const role = searchParams.get("role");

    //BUILD WHERE CLAUSE BASED ON USER ROLE
    const where: Prisma.UserWhereInput = {};
    if (user.role === Role.ADMIN) {
      // ADMIN CAN SEE ALL USERS
    } else if (user.role === Role.MANAGER) {
      // MANAGER CAN SEE ALL USERS IN THEIR TEAM OR CROSS TEAM USERS BUT NOT CROSS TEAM MANAGERS
      where.OR = [{ teamId: user.teamId }, { role: Role.USER }]; //user in their team and users in cross team only
    } else {
      //Regular users can view only their team
      where.teamId = user.teamId;
      where.role = { not: Role.ADMIN }; //Can see their manager but not their admin
    }

    //Additional filters
    if (teamId) {
      where.teamId = teamId;
    }
    if (role) {
      where.role = role as Role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.log("Error getting current user:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}

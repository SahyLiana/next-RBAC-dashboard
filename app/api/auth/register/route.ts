import { generateToken, hashPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@/app/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, teamCode } = await request.json();
    //Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields(email or name or password)" },
        { status: 400 },
      );
    }

    //Find existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    let teamId: string | undefined;
    if (teamCode) {
      const team = await prisma.team.findUnique({
        where: { code: teamCode },
      });
      if (!team) {
        return NextResponse.json(
          { error: "PLease enter a valid team code" },
          { status: 409 },
        );
      }
      teamId = team.id;
    }

    const hashedPassword = await hashPassword(password);

    //First user become ADMIN, Other become USER
    //This is for the first registered user or not
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? Role.ADMIN : Role.USER;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        teamId,
      },
      include: {
        team: true,
      },
    });

    //Generate Token
    const token = generateToken(user.id);

    //Create response
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        teamId: user.teamId,
        team: user.team,
        token,
      },
    });

    //Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.log("Error registering user:", error);
    return NextResponse.json(
      { error: "Error registering user" },
      { status: 500 },
    );
  }
}

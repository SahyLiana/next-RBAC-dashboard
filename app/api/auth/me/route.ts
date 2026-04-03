import { getCurrentUser } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          status: "error",
          message: "You are not authenticated",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(user);
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

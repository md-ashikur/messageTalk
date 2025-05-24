import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export async function GET(request) {
  try {
    const session = request.cookies.get("session");
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    const currentUserId = Number(session.value);

    // Fetch all users except the current user
    const [rows] = await db.query(
      "SELECT id, username FROM users WHERE id != ?",
      [currentUserId]
    );

    return NextResponse.json({ users: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
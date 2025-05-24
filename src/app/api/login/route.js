import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { hashPassword } from "../../../../lib/crypto";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Fetch user by username
    const [rows] = await db.query("SELECT id, password_hash, salt FROM users WHERE username = ?", [username]);
    if (rows.length === 0) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const user = rows[0];
    const salt = user.salt;
    const passwordHash = hashPassword(password, salt);

    if (!Buffer.from(user.password_hash).equals(passwordHash)) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Set session cookie
    // You can use a JWT or a custom session value. For demo, we'll use a simple cookie.
    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set("session", String(user.id), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      // secure: true, // uncomment if using HTTPS
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
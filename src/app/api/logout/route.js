import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  // Set the session cookie to expire immediately
  response.cookies.set("session", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
    sameSite: "lax",
    // secure: true, // Uncomment if using HTTPS
  });
  return response;
}
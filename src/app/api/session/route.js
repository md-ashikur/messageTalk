import { NextResponse } from "next/server";

export async function GET(request) {
  // Example: check for "session" cookie
  const hasSession = request.cookies.get("session");
  return NextResponse.json({ loggedIn: !!hasSession });
}
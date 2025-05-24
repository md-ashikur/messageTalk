import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";// Adjust the path as necessary
import { generateSalt, hashPassword } from "../../../../lib/crypto";


export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: "Missing username or password" }, { status: 400 });
    }

    // Check if user exists 
    const [rows] = await db.query("SELECT id FROM users WHERE username = ?", [username]);
    if (rows.length > 0) {
      return NextResponse.json({ message: "Username already exists" }, { status: 409 });
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    await db.query(
      "INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)",
      [username, passwordHash, salt]
    );

    return NextResponse.json({ message: "Registration successful" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
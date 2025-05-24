import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
// import your encryption function if you have it

export async function POST(request) {
  try {
    const { receiverId, content } = await request.json();

    // Get senderId from session cookie
    const session = request.cookies.get("session");
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    const senderId = Number(session.value);

    // If you have AES encryption, encrypt content here, e.g.:
    // const encryptedContent = encrypt(content);

    await db.query(
      "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
      [senderId, receiverId, content] // use encryptedContent if encrypting
    );

    return NextResponse.json({ message: "Message sent" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const otherUserId = url.searchParams.get("userId");
    const session = request.cookies.get("session");
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    const userId = Number(session.value);

    // Fetch messages between these two users
    const [rows] = await db.query(
      `SELECT sender_id, receiver_id, content, created_at
       FROM messages
       WHERE (sender_id = ? AND receiver_id = ?)
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [userId, otherUserId, otherUserId, userId]
    );

   const messages = rows.map(msg => ({
  ...msg,
  content: typeof msg.content === "object" && msg.content !== null && Buffer.isBuffer(msg.content)
    ? msg.content.toString("utf8")
    : msg.content,
}));

return NextResponse.json({ messages, currentUserId: userId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
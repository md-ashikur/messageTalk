import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export async function GET(request) {
  try {
    const session = request.cookies.get("session");
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    const userId = Number(session.value);

    // Find all users who've had a conversation with the current user
    const [rows] = await db.query(
      `
      SELECT u.id, u.username,
        (SELECT content FROM messages WHERE (sender_id = u.id AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as lastMessage,
        (SELECT COUNT(*) FROM messages m WHERE m.sender_id = u.id AND m.receiver_id = ? AND m.created_at > (SELECT IFNULL(MAX(created_at), '1970-01-01') FROM messages WHERE sender_id = ? AND receiver_id = u.id))
          as unread
      FROM users u
      WHERE u.id != ?
      `,
      [userId, userId, userId, userId, userId]
    );

    // Convert Buffer to string if needed for lastMessage
    const conversations = rows.map(conv => ({
      ...conv,
      lastMessage: conv.lastMessage
        ? (typeof conv.lastMessage === "object" && conv.lastMessage !== null && Buffer.isBuffer(conv.lastMessage)
            ? conv.lastMessage.toString("utf8")
            : conv.lastMessage)
        : ""
    }));

    return NextResponse.json({ conversations });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
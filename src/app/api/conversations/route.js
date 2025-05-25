import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { decrypt } from "../../../../lib/crypto";

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

    const conversations = rows.map(conv => {
      let lastMessage = conv.lastMessage;
      if (lastMessage) {
        if (typeof lastMessage === "object" && lastMessage !== null && Buffer.isBuffer(lastMessage)) {
          lastMessage = lastMessage.toString("utf8");
        }
        lastMessage = decrypt(lastMessage);
      } else {
        lastMessage = "";
      }
      return {
        ...conv,
        lastMessage,
      };
    });

    return NextResponse.json({ conversations });
  } catch (err) {
    console.error("GET /api/conversations error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
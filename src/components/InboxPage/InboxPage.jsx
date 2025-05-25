"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function InboxPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const chatEndRef = useRef(null);
  const router = useRouter();

  // Fetch conversations on mount
  useEffect(() => {
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => {
        setConversations(data.conversations || []);
        // Select the first conversation by default
        if (data.conversations && data.conversations.length > 0) {
          setSelectedId(data.conversations[0].id);
        }
      });
  }, []);

  // Real-time polling for messages
  useEffect(() => {
    if (!selectedId) return;
    setLoadingMessages(true);

    // Initial fetch
    fetch(`/api/messages?userId=${selectedId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(
          (data.messages || []).map((msg) => ({
            fromMe: msg.sender_id === data.currentUserId,
            text: msg.content,
            time: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }))
        );
        setLoadingMessages(false);
      });

    // Polling
    const interval = setInterval(() => {
      fetch(`/api/messages?userId=${selectedId}`)
        .then((res) => res.json())
        .then((data) => {
          setMessages(
            (data.messages || []).map((msg) => ({
              fromMe: msg.sender_id === data.currentUserId,
              text: msg.content,
              time: new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }))
          );
        });
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedId]);

  // users-----------------
  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setAllUsers(data.users || []));
  }, []);

  // Scroll to end on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Logout handler
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  // Send message to backend
  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedId) return;

    // Send message to backend
    await fetch("/api/messages", {
      method: "POST",
      body: JSON.stringify({ receiverId: selectedId, content: message }),
      headers: { "Content-Type": "application/json" },
    });

    setMessage("");
  };

  return (
    <div className="flex h-screen bg-gradient-to-tr from-blue-50 via-purple-50 to-indigo-100">
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden absolute top-4 right-4 z-20 bg-indigo-600 text-white px-3 py-2 rounded-full focus:outline-none shadow"
        onClick={() => setSidebarOpen((s) => !s)}
        aria-label="Open sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed z-30 inset-y-0 left-0 w-72 bg-white shadow-lg border-r flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 md:flex md:w-80
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h1 className="text-2xl font-bold text-indigo-700">Inbox</h1>
          <button
            onClick={handleLogout}
            className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-1 rounded transition text-sm"
          >
            Logout
          </button>
        </div>
        <div className="px-6 py-3 border-b">
          <div className="font-semibold text-indigo-600 mb-2">Start new chat</div>
          <div className="space-y-1">
            {allUsers.map((user) => (
              <button
                key={user.id}
                className="block w-full text-left px-2 py-1 hover:bg-indigo-50 rounded transition text-gray-700"
                onClick={() => {
                  // Check if conversation exists; if not, create/start one
                  let conv = conversations.find((c) => c.id === user.id);
                  if (!conv) {
                    conv = { id: user.id, username: user.username, lastMessage: "", unread: 0 };
                    setConversations((prev) => [conv, ...prev]);
                  }
                  setSelectedId(user.id);
                  setSidebarOpen(false);
                }}
              >
                {user.username}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 border-t text-sm text-gray-500">
          <span className="font-semibold">You</span>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col md:ml-0 ml-0 md:pl-0 pl-0">
        {/* Chat Header */}
        <div className="px-4 md:px-8 py-4 border-b bg-white flex items-center sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">
            {conversations.find((c) => c.id === selectedId)?.username || ""}
          </h2>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-2 md:px-8 py-4 md:py-6 space-y-2 bg-gradient-to-b from-indigo-50/50 to-white">
          {loadingMessages ? (
            <div className="text-center text-gray-400 py-10">Loading messages...</div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80vw] md:max-w-md px-4 py-2 rounded-2xl shadow ${
                    msg.fromMe
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none border"
                  }`}
                >
                  <div>{msg.text}</div>
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {msg.time}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
        {/* Input */}
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 md:gap-4 px-2 md:px-8 py-4 bg-white border-t"
        >
          <input
            type="text"
            className="flex-1 bg-gray-100 text-gray-800 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 md:px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 transition"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
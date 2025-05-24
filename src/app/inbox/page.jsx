"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../../lib/auth";
// Dummy data for demo. Replace with API calls!
const demoConversations = [
  {
    id: 2,
    username: "johndoe",
    lastMessage: "Hey, how are you?",
    unread: 1,
  },
  {
    id: 3,
    username: "janedoe",
    lastMessage: "Let's catch up tomorrow.",
    unread: 0,
  },
];

const demoMessages = {
  2: [
    { fromMe: false, text: "Hey, how are you?", time: "09:01" },
    { fromMe: true, text: "I am good! You?", time: "09:02" },
    { fromMe: false, text: "Doing well!", time: "09:03" },
  ],
  3: [
    { fromMe: true, text: "Let's catch up tomorrow.", time: "10:00" },
    { fromMe: false, text: "Sure! See you.", time: "10:01" },
  ],
};

export default function InboxPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState(demoConversations);
  const [selectedId, setSelectedId] = useState(conversations[0]?.id || null);
  const [messages, setMessages] = useState(
    demoMessages[conversations[0]?.id] || []
  );
  const [message, setMessage] = useState("");
  const chatEndRef = useRef(null);
  const router = useRouter();





  useEffect(() => {
    setMessages(demoMessages[selectedId] || []);
  }, [selectedId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Logout handler
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/login');
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessages((msgs) => [
      ...msgs,
      { fromMe: true, text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setMessage("");
    setConversations((convs) =>
      convs.map((c) =>
        c.id === selectedId ? { ...c, lastMessage: message } : c
      )
    );
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
        <nav className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`flex items-center px-6 py-4 cursor-pointer transition ${
                selectedId === conv.id
                  ? "bg-indigo-100"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => {
                setSelectedId(conv.id);
                setSidebarOpen(false);
              }}
            >
              <div className="flex-1">
                <div className="font-semibold text-gray-800">
                  {conv.username}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {conv.lastMessage}
                </div>
              </div>
              {conv.unread > 0 && (
                <span className="ml-2 inline-block bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {conv.unread}
                </span>
              )}
            </div>
          ))}
        </nav>
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
          {messages.map((msg, idx) => (
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
          ))}
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
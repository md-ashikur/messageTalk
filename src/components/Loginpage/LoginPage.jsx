'use client';

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      // Redirect or set session here
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-500 via-purple-500 to-indigo-600">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Sign In
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5 text-black">
          <div>
            <label className="block font-medium mb-1">Username</label>
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <div className="text-center text-sm mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
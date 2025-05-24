'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedPage({ children }) {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/session")
      .then((res) => res.json())
      .then((data) => {
        setLoggedIn(data.loggedIn);
        setLoading(false);
        if (!data.loggedIn) router.replace("/login");
      });
  }, [router]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!loggedIn) return null; // Will redirect

  return <>{children}</>;
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    hydrate();
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (isAuthenticated) {
      router.push("/home");
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, mounted, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Spinning Wheel Game
        </h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import InvitationNotifications from "@/components/room/InvitationNotifications";
import { initSocket, getSocket } from "@/lib/socket";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, hydrate, user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    hydrate();
    setIsHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [isHydrated, isAuthenticated, router]);

  // Initialize Socket.IO as soon as user is authenticated
  // Listeners are already attached in lib/socket.ts
  useEffect(() => {
    if (isHydrated && isAuthenticated && user?.userId) {
      console.log(
        `🔌 Protected layout: Initializing Socket.IO for user ${user.userId}`,
      );
      initSocket(user.userId);

      // Start keep-alive ping mechanism
      const pingInterval = setInterval(() => {
        const socket = getSocket();
        if (socket?.connected) {
          socket.emit("ping");
          console.log("🔔 Sent keep-alive ping");
        }
      }, 20000); // Every 20 seconds

      // Cleanup on unmount
      return () => {
        clearInterval(pingInterval);
      };
    }
    return undefined;
  }, [isHydrated, isAuthenticated, user?.userId]);

  if (!isHydrated || !isAuthenticated) {
    return null;
  }

  return (
    <>
      <InvitationNotifications />
      {children}
    </>
  );
}

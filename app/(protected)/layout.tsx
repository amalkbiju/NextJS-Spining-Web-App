"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import InvitationNotifications from "@/components/room/InvitationNotifications";
import { initSocket } from "@/lib/socket";

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
  // This ensures we're ready to receive invitation alerts immediately
  useEffect(() => {
    if (isHydrated && isAuthenticated && user?.userId) {
      console.log(
        `🔌 Protected layout: Initializing Socket.IO for user ${user.userId}`,
      );
      initSocket(user.userId);
    }
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

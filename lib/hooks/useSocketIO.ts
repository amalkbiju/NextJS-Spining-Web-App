import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { initSocket } from "@/lib/socket";

/**
 * Hook to initialize Socket.IO when component mounts
 * Ensures Socket.IO is properly initialized before any emissions
 */
export function useSocketIO() {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      return;
    }

    // Initialize Socket.IO connection
    const socket = initSocket(user.userId);

    // Log for debugging
    console.log("Socket.IO hook initialized for user:", user.userId);

    // Cleanup is handled by socket.ts (socket persists across page navigations)
    return () => {
      // Don't disconnect socket here as it's needed across pages
      console.log("Socket.IO hook cleanup (keeping connection alive)");
    };
  }, [isAuthenticated, user?.userId]);
}

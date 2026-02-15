import { getIOInstance, getGlobalIO } from "./getIO";
import { addNotification } from "./notificationStore";

// This utility provides access to Socket.IO on the server side
// It needs to be called from within Next.js API routes

let globalIOCache: any = null;

export function getIO(req?: any) {
  // First try to get from globals
  let io = getGlobalIO();

  if (io) {
    console.log("✅ Retrieved Socket.IO instance from global storage");
    globalIOCache = io;
    return io;
  }

  // Try to get from request
  if (req) {
    io = getIOInstance(req);
    if (io) {
      globalIOCache = io;
      return io;
    }
  }

  // Use cached version if available
  if (globalIOCache) {
    console.log("✅ Using previously cached Socket.IO instance");
    return globalIOCache;
  }

  // Socket.IO not available - this is expected in App Router without external server
  return null;
}

export async function emitToUser(
  userId: string,
  eventName: string,
  data: any,
  retries = 5,
  req?: any,
) {
  let io = getIO(req);

  // If not available on first try, wait a moment and retry
  if (!io && retries === 5) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    io = getIO(req);
  }

  // If still not available, try retrying with delays
  if (!io && retries > 0) {
    const retryDelay = 300 * (6 - retries);
    // Wait a bit and try again (silently)
    await new Promise((resolve) => setTimeout(resolve, retryDelay));
    return emitToUser(userId, eventName, data, retries - 1, req);
  }

  if (!io) {
    // Socket.IO not available - store notification as fallback for polling
    try {
      addNotification(userId, eventName, data);
      console.log(
        `📱 Notification stored in queue for user ${userId}: ${eventName}`,
      );
    } catch (err) {
      console.error(`Failed to store notification for user ${userId}:`, err);
    }
    return false;
  }

  try {
    const targetRoom = `user-${userId}`;
    const socketsInRoom = io.sockets.adapter.rooms.get(targetRoom);
    const socketsCount = socketsInRoom ? socketsInRoom.size : 0;

    if (socketsCount === 0) {
      console.warn(
        `⚠️  No sockets connected to room '${targetRoom}' - user ${userId} may not be online`,
      );
    }

    io.to(targetRoom).emit(eventName, data);
    return true;
  } catch (error) {
    console.error(`❌ Failed to emit '${eventName}' to user ${userId}:`, error);
    return false;
  }
}

export function broadcastToRoom(roomId: string, eventName: string, data: any) {
  const io = getIO();
  if (!io) {
    // Socket.IO not available - this is expected in App Router without external server
    return false;
  }

  try {
    io.to(`room-${roomId}`).emit(eventName, data);
    return true;
  } catch (error) {
    console.error(`❌ Failed to broadcast to room ${roomId}:`, error);
    return false;
  }
}

export function broadcastToAll(eventName: string, data: any) {
  const io = getIO();
  if (!io) {
    // Socket.IO not available - this is expected in App Router without external server
    return false;
  }

  try {
    io.emit(eventName, data);
    return true;
  } catch (error) {
    console.error(`❌ Failed to broadcast event '${eventName}' to all:`, error);
    return false;
  }
}

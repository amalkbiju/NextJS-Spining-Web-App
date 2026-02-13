import { getIOInstance, getGlobalIO } from "./getIO";

// This utility provides access to Socket.IO on the server side
// It needs to be called from within Next.js API routes

let globalIOCache: any = null;

export function getIO(req?: any) {
  // First try to get from globals
  console.log("🔍 Attempting to retrieve Socket.IO instance");

  let io = getGlobalIO();

  if (io) {
    console.log("✅ Retrieved Socket.IO instance from global storage");
    globalIOCache = io;
    return io;
  }

  console.log("⚠️  Socket.IO not in global storage, checking cache");

  // Try to get from request
  if (req) {
    console.log("🔍 Checking request object for Socket.IO");
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

  console.warn("❌ Socket.IO instance not available");
  return null;
}

export async function emitToUser(
  userId: string,
  eventName: string,
  data: any,
  retries = 5,
  req?: any,
) {
  console.log(
    `📨 Attempting to emit '${eventName}' to user ${userId}, retries left: ${retries}`,
  );

  let io = getIO(req);

  // If not available on first try, wait a moment and retry
  if (!io && retries === 5) {
    console.log(`🔌 Socket.IO not found on first attempt, retrying...`);
    await new Promise((resolve) => setTimeout(resolve, 150));
    io = getIO(req);
  }

  // If still not available, try retrying with delays
  if (!io && retries > 0) {
    const retryDelay = 300 * (6 - retries); // Increasing delay: 300ms, 600ms, 900ms, 1200ms, 1500ms
    console.warn(
      `⚠️  Socket.IO not ready for '${eventName}', retrying in ${retryDelay}ms (${retries} left)`,
    );
    // Wait a bit and try again
    await new Promise((resolve) => setTimeout(resolve, retryDelay));
    return emitToUser(userId, eventName, data, retries - 1, req);
  }

  if (!io) {
    console.error(
      `❌ Socket.IO unavailable - event '${eventName}' NOT delivered to user: ${userId}`,
    );
    return false;
  }

  try {
    const targetRoom = `user-${userId}`;
    const socketsInRoom = io.sockets.adapter.rooms.get(targetRoom);
    const socketsCount = socketsInRoom ? socketsInRoom.size : 0;

    console.log(
      `📤 Emitting '${eventName}' to room '${targetRoom}' for user ${userId} (${socketsCount} socket(s) connected)`,
    );

    if (socketsCount === 0) {
      console.warn(
        `⚠️  No sockets connected to room '${targetRoom}' - user ${userId} may not be online`,
      );
    }

    io.to(targetRoom).emit(eventName, data);
    console.log(
      `✅ Event '${eventName}' successfully emitted to ${targetRoom}`,
    );
    return true;
  } catch (error) {
    console.error(`❌ Failed to emit '${eventName}' to user ${userId}:`, error);
    return false;
  }
}

export function broadcastToRoom(roomId: string, eventName: string, data: any) {
  const io = getIO();
  if (!io) {
    console.warn(
      `❌ Socket.IO unavailable, broadcast skipped for room ${roomId}`,
    );
    return false;
  }

  try {
    io.to(`room-${roomId}`).emit(eventName, data);
    console.log(`✅ Event '${eventName}' broadcast to room ${roomId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to broadcast to room ${roomId}:`, error);
    return false;
  }
}

export function broadcastToAll(eventName: string, data: any) {
  const io = getIO();
  if (!io) {
    console.warn(
      `❌ Socket.IO unavailable, broadcast skipped for event: ${eventName}`,
    );
    return false;
  }

  try {
    io.emit(eventName, data);
    console.log(`✅ Event '${eventName}' broadcast to all connected clients`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to broadcast event '${eventName}' to all:`, error);
    return false;
  }
}

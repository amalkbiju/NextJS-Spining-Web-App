// Store pending notifications in memory (for this server instance)
// In production, use a database or message queue
export const pendingNotifications: Map<
  string,
  Array<{ type: string; data: any; timestamp: number }>
> = new Map();

// Helper function to add a notification for a user
export function addNotification(userId: string, type: string, data: any) {
  if (!pendingNotifications.has(userId)) {
    pendingNotifications.set(userId, []);
  }

  const notifications = pendingNotifications.get(userId);
  if (notifications) {
    notifications.push({
      type,
      data,
      timestamp: Date.now(),
    });
  }
}

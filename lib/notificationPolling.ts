import axios from "axios";

interface Notification {
  type: "user-invited" | "user-joined-room";
  data: any;
}

let pollInterval: NodeJS.Timeout | null = null;
let lastCheckTime = Date.now();
const notificationCallbacks: Map<string, Set<(data: any) => void>> = new Map();

export function subscribeToNotifications(
  eventName: string,
  callback: (data: any) => void,
) {
  if (!notificationCallbacks.has(eventName)) {
    notificationCallbacks.set(eventName, new Set());
  }
  notificationCallbacks.get(eventName)?.add(callback);
}

export function unsubscribeFromNotifications(
  eventName: string,
  callback: (data: any) => void,
) {
  notificationCallbacks.get(eventName)?.delete(callback);
}

function emitNotification(eventName: string, data: any) {
  const callbacks = notificationCallbacks.get(eventName);
  if (callbacks) {
    callbacks.forEach((cb) => cb(data));
  }
}

export function startNotificationPolling(userId: string, token: string) {
  if (pollInterval) {
    return; // Already polling
  }

  console.log("📱 Starting notification polling for user:", userId);

  pollInterval = setInterval(async () => {
    try {
      const response = await axios.get("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
        params: { since: lastCheckTime },
      });

      if (response.data.success && response.data.notifications) {
        const notifications = response.data.notifications;

        notifications.forEach((notification: Notification) => {
          console.log(
            `📨 Received notification: ${notification.type}`,
            notification.data,
          );
          emitNotification(notification.type, notification.data);
        });

        if (notifications.length > 0) {
          lastCheckTime = Date.now();
        }
      }
    } catch (error) {
      // Silently fail - polling is a fallback
    }
  }, 3000); // Poll every 3 seconds
}

export function stopNotificationPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
    console.log("📱 Stopped notification polling");
  }
}

export function onPolledEvent(
  eventName: string,
  callback: (data: any) => void,
) {
  subscribeToNotifications(eventName, callback);
}

export function offPolledEvent(
  eventName: string,
  callback: (data: any) => void,
) {
  unsubscribeFromNotifications(eventName, callback);
}

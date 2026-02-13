"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { onEvent, offEvent, getSocket } from "@/lib/socket";
import { useAuthStore } from "@/lib/store/authStore";

interface Invitation {
  roomId: string;
  creatorName: string;
  creatorEmail: string;
  timestamp: string;
}

interface NotificationsProps {
  onInvitationReceived?: (invitation: Invitation) => void;
}

export default function InvitationNotifications({
  onInvitationReceived,
}: NotificationsProps) {
  const { user, token } = useAuthStore();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const handleUserInvited = (data: any) => {
      console.log("📨 Received user-invited event:", {
        invitedUserEmail: data.invitedUser?.email,
        currentUserEmail: user?.email,
        eventData: data,
      });

      // Check if this notification is for the current user
      if (data.invitedUser.email === user?.email) {
        console.log("✅ Email match! Displaying invitation popup");
        const invitation: Invitation = {
          roomId: data.roomId,
          creatorName: data.creator.name,
          creatorEmail: data.creator.email,
          timestamp: new Date().toISOString(),
        };

        setInvitations((prev) => [invitation, ...prev]);

        // Show browser notification if available
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`Room Invitation from ${data.creator.name}`, {
            body: `${data.creator.name} invited you to join a spinning wheel game!`,
            icon: "/wheel-icon.png",
          });
        }

        if (onInvitationReceived) {
          onInvitationReceived(invitation);
        }
      } else {
        console.warn("❌ Email mismatch - invitation not for this user", {
          invitedUserEmail: data.invitedUser?.email,
          currentUserEmail: user?.email,
        });
      }
    };

    const handleUserJoinedRoom = (data: any) => {
      console.log("📨 Received user-joined-room event:", {
        roomId: data.roomId,
        joinedUser: data.joinedUser,
        eventData: data,
      });

      // Show notification to room creator when user joins
      if (data.joinedUser?.email) {
        console.log("✅ User joined! Displaying join notification");
        const invitation: Invitation = {
          roomId: data.roomId,
          creatorName: data.joinedUser.name || "User",
          creatorEmail: data.joinedUser.email,
          timestamp: new Date().toISOString(),
        };

        setInvitations((prev) => [invitation, ...prev]);

        // Show browser notification if available
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`User Joined Your Room!`, {
            body: `${data.joinedUser.name || "Someone"} has joined your spinning wheel game!`,
            icon: "/wheel-icon.png",
          });
        }
      }
    };

    onEvent("user-invited", handleUserInvited);
    onEvent("user-joined-room", handleUserJoinedRoom);

    return () => {
      offEvent("user-invited", handleUserInvited);
      offEvent("user-joined-room", handleUserJoinedRoom);
    };
  }, [user?.email, onInvitationReceived]);

  const handleAcceptInvitation = async (roomId: string) => {
    try {
      setLoading(roomId);
      const response = await axios.post(
        `/api/rooms/${roomId}/accept-invite`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        // Remove invitation from list
        setInvitations((prev) => prev.filter((inv) => inv.roomId !== roomId));

        // Emit event to notify room creator
        const socket = getSocket();
        socket?.emit("invitation-accepted", {
          roomId,
          userId: user?.userId,
          userName: user?.name,
          userEmail: user?.email,
        });

        // Navigate to room
        window.location.href = `/room/${roomId}`;
      }
    } catch (error: any) {
      console.error("Failed to accept invitation:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleDeclineInvitation = (roomId: string) => {
    setInvitations((prev) => prev.filter((inv) => inv.roomId !== roomId));
  };

  if (invitations.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 space-y-3 z-40 max-w-sm">
      {invitations.map((invitation) => (
        <div
          key={invitation.roomId}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 shadow-2xl border border-white/20 backdrop-blur-md animate-in slide-in-from-bottom"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-white font-bold text-sm">🎮 Game Invitation</p>
              <p className="text-white/90 text-xs mt-1">
                <span className="font-semibold">{invitation.creatorName}</span>{" "}
                invited you to a spinning wheel game!
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleAcceptInvitation(invitation.roomId)}
              disabled={loading === invitation.roomId}
              className="flex-1 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-colors disabled:opacity-50"
            >
              {loading === invitation.roomId ? "Joining..." : "Accept"}
            </button>
            <button
              onClick={() => handleDeclineInvitation(invitation.roomId)}
              disabled={loading === invitation.roomId}
              className="flex-1 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-bold transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

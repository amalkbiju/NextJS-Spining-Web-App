"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/lib/store/authStore";
import { initSocket, onEvent, offEvent } from "@/lib/socket";
import { Room } from "@/types";
import {
  LogOut,
  Copy,
  Plus,
  Users,
  Zap,
  Search,
  LogIn,
  User,
  AlertCircle,
} from "lucide-react";

interface Invitation {
  roomId: string;
  creatorName: string;
  creatorEmail: string;
}

export default function HomePage() {
  const router = useRouter();
  const { user, token, isAuthenticated, clearAuth } = useAuthStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchRooms();
    console.log("🔌 Home page: Initializing socket with userId:", user?.userId);
    const socketInstance = initSocket(user?.userId);

    // Only attach listeners if Socket.IO is available
    if (!socketInstance) {
      console.warn("⚠️  Socket.IO not available - real-time features disabled");
      return;
    }

    const handleConnect = () => {
      console.log("✅ Home page: Socket connected successfully");
    };

    const handleDisconnect = () => {
      console.log("❌ Home page: Socket disconnected");
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);

    const handleUserInvited = (data: any) => {
      console.log("📨 Home page received 'user-invited' event:", data);
      console.log("📨 Current user email:", user?.email);
      console.log("📨 Invited user email:", data.invitedUser?.email);
      console.log("📨 Creator info:", data.creator);

      if (data.invitedUser && data.invitedUser.email === user?.email) {
        const invitation: Invitation = {
          roomId: data.roomId,
          creatorName: data.creator.name,
          creatorEmail: data.creator.email,
        };
        console.log(
          "✓ Invitation matches current user, adding to state:",
          invitation,
        );
        setInvitations((prev) => [invitation, ...prev]);

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`Room Invitation from ${data.creator.name}`, {
            body: `${data.creator.name} invited you to join a spinning wheel game!`,
            icon: "/wheel-icon.png",
          });
        }
      } else {
        console.log(
          "✗ Invitation is for different user. Expected:",
          user?.email,
          "Got:",
          data.invitedUser?.email,
        );
      }
    };

    const handleRoomCreated = (data: any) => {
      console.log("🎮 Home page received 'room-created' event:", data);
      if (data.creatorId !== user?.userId) {
        console.log(`✓ New room available from ${data.creatorName}`);
        setRooms((prev) => {
          // Check if room already exists to avoid duplicates
          const roomExists = prev.some((room) => room.roomId === data.roomId);
          if (roomExists) {
            console.log(
              `⚠️  Room ${data.roomId} already exists, skipping duplicate`,
            );
            return prev;
          }
          return [
            {
              roomId: data.roomId,
              creatorId: data.creatorId,
              creatorName: data.creatorName,
              creatorEmail: data.creatorEmail,
              status: data.status,
              oppositeUserId: null,
              oppositeUserName: null,
              oppositeUserEmail: null,
            } as Room,
            ...prev,
          ];
        });
      }
    };

    onEvent("user-invited", handleUserInvited);
    onEvent("room-created", handleRoomCreated);

    return () => {
      offEvent("user-invited", handleUserInvited);
      offEvent("room-created", handleRoomCreated);
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
    };
  }, [isAuthenticated, user?.email, user?.userId]);

  useEffect(() => {
    const filtered = rooms.filter((room) =>
      room.creatorName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredRooms(filtered);
  }, [searchQuery, rooms]);

  const fetchRooms = async () => {
    try {
      const response = await axios.get("/api/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let roomList = response.data.rooms || [];

      // Deduplicate rooms by roomId to avoid duplicate key errors
      const uniqueRoomsMap = new Map<string, Room>();
      roomList.forEach((room: Room) => {
        if (!uniqueRoomsMap.has(room.roomId)) {
          uniqueRoomsMap.set(room.roomId, room);
        }
      });
      const uniqueRooms = Array.from(uniqueRoomsMap.values());

      setRooms(uniqueRooms);
      setFilteredRooms(uniqueRooms);
    } catch (err: any) {
      setError("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    try {
      setCreatingRoom(true);
      const response = await axios.post(
        "/api/rooms",
        { creatorName: user?.name },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        router.push(`/room/${response.data.room.roomId}`);
      }
    } catch (err: any) {
      setError("Failed to create room");
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleSelectRoom = (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  const handleAcceptInvitation = async (roomId: string) => {
    try {
      setAcceptingId(roomId);
      const response = await axios.post(
        `/api/rooms/${roomId}/accept-invite`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setInvitations((prev) => prev.filter((inv) => inv.roomId !== roomId));
        router.push(`/room/${roomId}`);
      }
    } catch (error: any) {
      console.error("Failed to accept invitation:", error);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDeclineInvitation = (roomId: string) => {
    setInvitations((prev) => prev.filter((inv) => inv.roomId !== roomId));
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  const totalActivePlayers = Math.max(rooms.length * 2, 1);
  const activePlayersText = `${totalActivePlayers} ${totalActivePlayers === 1 ? "player" : "players"}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right, #111827, #1f2937, #111827)",
        position: "relative",
      }}
    >
      {/* Animated Background Blobs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "5%",
            left: "10%",
            width: "300px",
            height: "300px",
            background: "rgba(59, 130, 246, 0.1)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "5%",
            width: "300px",
            height: "300px",
            background: "rgba(34, 197, 94, 0.1)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite 2s",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "300px",
            height: "300px",
            background: "rgba(59, 130, 246, 0.1)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite 4s",
          }}
        />
      </div>

      {/* Invitations Popup */}
      {invitations.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            zIndex: 50,
            maxWidth: "28rem",
          }}
        >
          {invitations.map((invitation) => (
            <div
              key={invitation.roomId}
              style={{
                background:
                  "linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(34, 197, 94, 0.2))",
                backdropFilter: "blur(40px)",
                borderRadius: "1rem",
                padding: "1.5rem",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
                animation: "slideIn 0.5s ease-out",
              }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <p
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  🎮 Game Invitation
                </p>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "0.875rem",
                    lineHeight: "1.5",
                  }}
                >
                  <span style={{ fontWeight: "600" }}>
                    {invitation.creatorName}
                  </span>{" "}
                  invited you to a spinning wheel game!
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => handleAcceptInvitation(invitation.roomId)}
                  disabled={acceptingId === invitation.roomId}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    background: "#22c55e",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                    border: "none",
                    cursor:
                      acceptingId === invitation.roomId
                        ? "not-allowed"
                        : "pointer",
                    opacity: acceptingId === invitation.roomId ? 0.5 : 1,
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  {acceptingId === invitation.roomId ? (
                    <>
                      <div
                        style={{
                          width: "0.75rem",
                          height: "0.75rem",
                          border: "2px solid rgba(255, 255, 255, 0.3)",
                          borderTop: "2px solid white",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      Joining...
                    </>
                  ) : (
                    "Accept"
                  )}
                </button>
                <button
                  onClick={() => handleDeclineInvitation(invitation.roomId)}
                  disabled={acceptingId === invitation.roomId}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    cursor:
                      acceptingId === invitation.roomId
                        ? "not-allowed"
                        : "pointer",
                    opacity: acceptingId === invitation.roomId ? 0.5 : 1,
                    transition: "all 0.3s ease",
                  }}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <header
          style={{
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            padding: "2rem 1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: "80rem",
              margin: "0 auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "2rem",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "2.25rem",
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                🎡 Spin & Win
              </h1>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "0.95rem",
                }}
              >
                Welcome back,{" "}
                <span style={{ fontWeight: "600", color: "white" }}>
                  {user?.name}
                </span>
                !
              </p>
            </div>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              {/* User Profile Section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1.25rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <User
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                />
                <span
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "0.875rem",
                  }}
                >
                  {user?.email}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.25rem",
                  background: "linear-gradient(to right, #ef4444, #dc2626)",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "0.75rem",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background =
                    "linear-gradient(to right, #dc2626, #991b1b)";
                  (e.target as HTMLButtonElement).style.transform =
                    "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background =
                    "linear-gradient(to right, #ef4444, #dc2626)";
                  (e.target as HTMLButtonElement).style.transform = "scale(1)";
                }}
              >
                <LogOut style={{ width: "1.125rem", height: "1.125rem" }} />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "3rem 1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: "80rem",
              margin: "0 auto",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "3rem",
            }}
          >
            {/* Error Message */}
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.5)",
                  borderRadius: "0.75rem",
                  padding: "1rem 1.25rem",
                  backdropFilter: "blur(20px)",
                  animation: "shake 0.5s ease-in-out",
                }}
              >
                <AlertCircle
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    color: "#ef4444",
                    flexShrink: 0,
                    marginTop: "0.125rem",
                  }}
                />
                <p style={{ color: "#fca5a5", fontWeight: "500" }}>{error}</p>
              </div>
            )}

            {/* User ID Card */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))",
                backdropFilter: "blur(40px)",
                borderRadius: "1rem",
                padding: "1.5rem",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                animation: "fadeIn 0.8s ease-out 0.1s both",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1.5rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "rgba(96, 165, 250, 0.8)",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                    }}
                  >
                    📋 Your User ID
                  </p>
                  <p
                    style={{
                      color: "white",
                      fontSize: "1.125rem",
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      wordBreak: "break-all",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {user?.userId}
                  </p>
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.75rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    Share this ID with others to be invited to their rooms
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (user?.userId) {
                      navigator.clipboard.writeText(user.userId);
                      setCopiedMessage(true);
                      setTimeout(() => setCopiedMessage(false), 2000);
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.25rem",
                    background: "linear-gradient(to right, #3b82f6, #2563eb)",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "0.5rem",
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.background =
                      "linear-gradient(to right, #2563eb, #1d4ed8)";
                    (e.target as HTMLButtonElement).style.transform =
                      "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.background =
                      "linear-gradient(to right, #3b82f6, #2563eb)";
                    (e.target as HTMLButtonElement).style.transform =
                      "scale(1)";
                  }}
                >
                  <Copy style={{ width: "1rem", height: "1rem" }} />
                  {copiedMessage ? "✅ Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Stats Section */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {/* Total Rooms Card */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(40px)",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "all 0.3s ease",
                  cursor: "default",
                  animation: "fadeIn 0.8s ease-out 0.2s both",
                }}
              >
                <div style={{ marginBottom: "1rem" }}>
                  <span style={{ fontSize: "2.25rem" }}>🏆</span>
                </div>
                <h3
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.125rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  Total Rooms
                </h3>
                <p
                  style={{
                    fontSize: "2.25rem",
                    fontWeight: "bold",
                    background: "linear-gradient(to right, #60a5fa, #06b6d4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {rooms.length}
                </p>
              </div>

              {/* Active Players Card */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(40px)",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "all 0.3s ease",
                  cursor: "default",
                  animation: "fadeIn 0.8s ease-out 0.3s both",
                }}
              >
                <div style={{ marginBottom: "1rem" }}>
                  <span style={{ fontSize: "2.25rem" }}>👥</span>
                </div>
                <h3
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.125rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  Active Players
                </h3>
                <p
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    background: "linear-gradient(to right, #a855f7, #ec4899)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {activePlayersText}
                </p>
              </div>

              {/* Your Status Card */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(40px)",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "all 0.3s ease",
                  cursor: "default",
                  animation: "fadeIn 0.8s ease-out 0.4s both",
                }}
              >
                <div style={{ marginBottom: "1rem" }}>
                  <span style={{ fontSize: "2.25rem" }}>⚡</span>
                </div>
                <h3
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.125rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  Your Status
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "0.75rem",
                      height: "0.75rem",
                      background: "#22c55e",
                      borderRadius: "50%",
                      boxShadow: "0 0 10px rgba(34, 197, 94, 0.8)",
                      animation:
                        "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    }}
                  />
                  <p style={{ color: "#22c55e", fontWeight: "600" }}>
                    Ready to Play
                  </p>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "2rem",
              }}
            >
              {/* Create Room Card */}
              <button
                onClick={handleCreateRoom}
                disabled={creatingRoom}
                style={{
                  position: "relative",
                  padding: "1px",
                  borderRadius: "1rem",
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  border: "none",
                  cursor: creatingRoom ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  animation: "fadeIn 0.8s ease-out 0.5s both",
                  transform: creatingRoom ? "scale(0.98)" : "scale(1)",
                  opacity: creatingRoom ? 0.8 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!creatingRoom) {
                    (e.target as HTMLButtonElement).style.transform =
                      "scale(1.02)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!creatingRoom) {
                    (e.target as HTMLButtonElement).style.transform =
                      "scale(1)";
                  }
                }}
              >
                <div
                  style={{
                    background: "#111827",
                    borderRadius: "1rem",
                    padding: "2rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "250px",
                    position: "relative",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "3.5rem", marginBottom: "1.5rem" }}>
                      🎯
                    </div>
                    <h2
                      style={{
                        fontSize: "1.875rem",
                        fontWeight: "bold",
                        color: "white",
                        marginBottom: "0.75rem",
                      }}
                    >
                      Create Room
                    </h2>
                    <p
                      style={{
                        color: "#d1d5db",
                        fontSize: "1rem",
                        lineHeight: "1.5",
                      }}
                    >
                      Start a new spinning wheel game and invite your friends
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginTop: "1.5rem",
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    <Plus style={{ width: "1.25rem", height: "1.25rem" }} />
                    {creatingRoom ? "Creating..." : "Create Now"}
                  </div>
                </div>
              </button>

              {/* Join Room Card */}
              <div
                style={{
                  position: "relative",
                  padding: "1px",
                  borderRadius: "1rem",
                  background: "linear-gradient(135deg, #a855f7, #7e22ce)",
                  animation: "fadeIn 0.8s ease-out 0.6s both",
                }}
              >
                <div
                  style={{
                    background: "#111827",
                    borderRadius: "1rem",
                    padding: "2rem",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "250px",
                  }}
                >
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "3.5rem", marginBottom: "1.5rem" }}>
                      🎲
                    </div>
                    <h2
                      style={{
                        fontSize: "1.875rem",
                        fontWeight: "bold",
                        color: "white",
                        marginBottom: "0.75rem",
                      }}
                    >
                      Join Room
                    </h2>
                    <p
                      style={{
                        color: "#d1d5db",
                        fontSize: "1rem",
                        lineHeight: "1.5",
                        marginBottom: "1.5rem",
                      }}
                    >
                      Jump into an active game and challenge other players
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div
                    style={{
                      position: "relative",
                      marginBottom: "1rem",
                    }}
                  >
                    <Search
                      style={{
                        position: "absolute",
                        left: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "1.25rem",
                        height: "1.25rem",
                        color: "rgba(255, 255, 255, 0.5)",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search by player name..."
                      value={searchQuery}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setSearchQuery(e.target.value)
                      }
                      style={{
                        width: "100%",
                        paddingLeft: "2.5rem",
                        paddingRight: "0.75rem",
                        paddingTop: "0.75rem",
                        paddingBottom: "0.75rem",
                        background: "rgba(31, 41, 55, 0.5)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "0.5rem",
                        color: "white",
                        fontSize: "0.875rem",
                        transition: "all 0.3s ease",
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLInputElement).style.borderColor =
                          "rgba(59, 130, 246, 0.5)";
                        (e.target as HTMLInputElement).style.background =
                          "rgba(31, 41, 55, 0.8)";
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLInputElement).style.borderColor =
                          "rgba(255, 255, 255, 0.1)";
                        (e.target as HTMLInputElement).style.background =
                          "rgba(31, 41, 55, 0.5)";
                      }}
                    />
                  </div>

                  {/* Rooms List */}
                  {loading ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "#9ca3af",
                        padding: "1.5rem 0",
                      }}
                    >
                      <div
                        style={{
                          width: "0.75rem",
                          height: "0.75rem",
                          background: "#3b82f6",
                          borderRadius: "50%",
                          animation:
                            "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                        }}
                      />
                      Loading rooms...
                    </div>
                  ) : filteredRooms.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                      <p style={{ color: "#9ca3af", fontSize: "1rem" }}>
                        {searchQuery
                          ? "No rooms match your search"
                          : "No available rooms yet"}
                      </p>
                      <p
                        style={{
                          color: "#6b7280",
                          fontSize: "0.875rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        {searchQuery
                          ? "Try searching with a different name"
                          : "Create one to get started!"}
                      </p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      {filteredRooms.map((room) => (
                        <button
                          key={room.roomId}
                          onClick={() => handleSelectRoom(room.roomId)}
                          style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            background:
                              "linear-gradient(to right, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "0.5rem",
                            color: "white",
                            fontWeight: "600",
                            fontSize: "0.875rem",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            textAlign: "left",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                          onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.background =
                              "linear-gradient(to right, rgba(168, 85, 247, 0.4), rgba(236, 72, 153, 0.4))";
                            (e.target as HTMLButtonElement).style.transform =
                              "translateX(4px)";
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.background =
                              "linear-gradient(to right, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))";
                            (e.target as HTMLButtonElement).style.transform =
                              "translateX(0)";
                          }}
                        >
                          <span>🎮 {room.creatorName}'s Room</span>
                          <LogIn
                            style={{
                              width: "1rem",
                              height: "1rem",
                              opacity: 0.75,
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

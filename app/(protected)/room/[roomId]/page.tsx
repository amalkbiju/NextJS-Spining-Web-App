"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/lib/store/authStore";
import { initSocket, onEvent, offEvent, emitEvent } from "@/lib/socket";
import { Room } from "@/types";
import SpinningWheel from "@/components/room/SpinningWheel";
import InviteModal from "@/components/room/InviteModal";
import {
  ArrowLeft,
  Copy,
  Users,
  Mail,
  User,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

interface InvitedPlayer {
  userId: string;
  name: string;
  email: string;
  status: "accepted" | "invited" | "declined" | "waiting";
}

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = (params?.roomId || "") as string;

  const { user, token, isAuthenticated } = useAuthStore();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userIdInput, setUserIdInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [finalRotation, setFinalRotation] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"userid" | "email">("userid");
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [invitedPlayers, setInvitedPlayers] = useState<InvitedPlayer[]>([]);
  const [addingUser, setAddingUser] = useState(false);
  const [invitingEmail, setInvitingEmail] = useState(false);
  const [leavingRoom, setLeavingRoom] = useState(false);
  const [userJoinAlert, setUserJoinAlert] = useState<{
    name: string;
    visible: boolean;
  }>({ name: "", visible: false });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchRoom();
    initSocket(user?.userId);

    const handleRoomUpdate = (updatedRoom: Room) => setRoom(updatedRoom);
    const handleSpinStart = () => setIsSpinning(true);
    const handleSpinBothReady = (data: any) => {
      setSelectedWinner(data.winnerName);
      setFinalRotation(data.finalRotation);
      setIsSpinning(true);
    };
    const handleUserSpinReady = (data: any) => setRoom(data.room);
    const handleGameReset = (data: any) => {
      setRoom(data.room);
      setIsSpinning(false);
      setWinner(null);
      setHasStarted(false);
      setSelectedWinner(null);
      setFinalRotation(null);
    };
    const handleUserJoinedRoom = (data: any) => {
      console.log("👤 User joined room event received:", data);
      setRoom(data.room);
      // Show join alert
      if (data.joinedUser?.name) {
        setUserJoinAlert({ name: data.joinedUser.name, visible: true });
        // Auto-hide alert after 4 seconds
        setTimeout(() => {
          setUserJoinAlert({ name: "", visible: false });
        }, 4000);
      }
    };

    onEvent("room-updated", handleRoomUpdate);
    onEvent("spin-start", handleSpinStart);
    onEvent("spin-both-ready", handleSpinBothReady);
    onEvent("user-spin-ready", handleUserSpinReady);
    onEvent("game-reset", handleGameReset);
    onEvent("user-joined-room", handleUserJoinedRoom);

    return () => {
      offEvent("room-updated", handleRoomUpdate);
      offEvent("spin-start", handleSpinStart);
      offEvent("spin-both-ready", handleSpinBothReady);
      offEvent("user-spin-ready", handleUserSpinReady);
      offEvent("game-reset", handleGameReset);
      offEvent("user-joined-room", handleUserJoinedRoom);
    };
  }, [isAuthenticated]);

  const fetchRoom = async () => {
    try {
      const res = await axios.get(`/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoom(res.data.room);
      if (res.data.room.oppositeUserId) {
        setInvitedPlayers([
          {
            userId: res.data.room.oppositeUserId,
            name: res.data.room.oppositeUserName || "Unknown",
            email: res.data.room.oppositeUserEmail || "",
            status: "accepted",
          },
        ]);
      }
    } catch {
      setError("Failed to fetch room");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!userIdInput.trim()) {
      setError("Enter a user ID");
      return;
    }
    try {
      setAddingUser(true);
      const res = await axios.put(
        `/api/rooms/${roomId}`,
        { oppositeUserId: userIdInput },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        setRoom(res.data.room);
        setUserIdInput("");
        setInvitedPlayers([
          {
            userId: userIdInput,
            name: res.data.room.oppositeUserName || "User",
            email: res.data.room.oppositeUserEmail || "",
            status: "accepted",
          },
        ]);
      } else setError(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed");
    } finally {
      setAddingUser(false);
    }
  };

  const handleInviteByEmail = async () => {
    if (!emailInput.trim()) {
      setError("Enter email");
      return;
    }
    try {
      setInvitingEmail(true);
      const res = await axios.post(
        `/api/rooms/${roomId}/invite`,
        { email: emailInput },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        setEmailInput("");
        setInvitedPlayers((p) => [
          ...p,
          {
            userId: "",
            name: emailInput.split("@")[0],
            email: emailInput,
            status: "invited",
          },
        ]);
      } else setError(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed");
    } finally {
      setInvitingEmail(false);
    }
  };

  const handleStartSpin = async () => {
    if (!room) return;
    try {
      const res = await axios.post(
        "/api/wheel/spin",
        { roomId: room.roomId, userId: user?.userId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        setRoom(res.data.room);
        setHasStarted(true);
        if (res.data.bothStarted) {
          setSelectedWinner(res.data.winnerName);
          setIsSpinning(true);
        } else {
          emitEvent("user-ready", { roomId, room: res.data.room });
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed");
    }
  };

  const handleSpinComplete = (winnerName: string) => {
    setWinner(winnerName);
    setIsSpinning(false);
    emitEvent("spin-complete", { roomId, winner: winnerName });
  };

  const resetGame = async () => {
    try {
      const res = await axios.put(
        "/api/wheel/spin",
        { roomId: room?.roomId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        setRoom(res.data.room);
        setIsSpinning(false);
        setWinner(null);
        setHasStarted(false);
        setSelectedWinner(null);
        setFinalRotation(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed");
    }
  };

  const handleLeaveRoom = async () => {
    try {
      setLeavingRoom(true);
      await axios.delete(`/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/home");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed");
      setLeavingRoom(false);
    }
  };

  const isCreator = user?.userId === room?.creatorId;
  const canShowStartButton =
    room?.oppositeUserId &&
    !hasStarted &&
    !isSpinning &&
    (isCreator ? !room?.creatorStarted : !room?.oppositeUserStarted);
  const oppositeUserReady = isCreator
    ? room?.oppositeUserStarted
    : room?.creatorStarted;

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(to bottom right, #111827, #1f2937, #111827)",
        }}
      >
        <div>
          <div
            style={{
              width: "3rem",
              height: "3rem",
              border: "3px solid rgba(59, 130, 246, 0.3)",
              borderTop: "3px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "white" }}>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!room) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(to bottom right, #111827, #1f2937, #111827)",
          color: "white",
        }}
      >
        Room not found
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right, #111827, #1f2937, #111827)",
        position: "relative",
      }}
    >
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
            animation: "pulse 4s infinite",
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
            animation: "pulse 4s infinite 2s",
          }}
        />
      </div>

      {userJoinAlert.visible && (
        <div
          style={{
            position: "fixed",
            top: "2rem",
            right: "2rem",
            zIndex: 50,
            backgroundColor: "rgba(34, 197, 94, 0.9)",
            color: "white",
            padding: "1rem 1.5rem",
            borderRadius: "0.5rem",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <CheckCircle2 size={20} />
          <span style={{ fontWeight: 500 }}>
            {userJoinAlert.name} joined the room!
          </span>
        </div>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <button
            onClick={() => router.push("/home")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.25rem",
              background: "rgba(107, 114, 128, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "white",
              fontWeight: "bold",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.target as any).style.background = "rgba(107, 114, 128, 0.4)";
              (e.target as any).style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              (e.target as any).style.background = "rgba(107, 114, 128, 0.2)";
              (e.target as any).style.transform = "scale(1)";
            }}
          >
            <ArrowLeft style={{ width: "1.25rem", height: "1.25rem" }} />
            Back
          </button>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            🎡 {room?.roomId?.slice(0, 8).toUpperCase()}
            <div
              style={{
                width: "0.75rem",
                height: "0.75rem",
                background: room?.oppositeUserId ? "#22c55e" : "#f59e0b",
                borderRadius: "50%",
                animation: "pulse 2s infinite",
              }}
            />
          </h1>
          <button
            onClick={handleLeaveRoom}
            disabled={leavingRoom}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.25rem",
              background: leavingRoom
                ? "rgba(239, 68, 68, 0.3)"
                : "linear-gradient(to right, #ef4444, #dc2626)",
              color: "white",
              fontWeight: "bold",
              borderRadius: "0.5rem",
              border: "none",
              cursor: leavingRoom ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!leavingRoom)
                (e.target as any).style.background =
                  "linear-gradient(to right, #dc2626, #991b1b)";
            }}
            onMouseLeave={(e) => {
              if (!leavingRoom)
                (e.target as any).style.background =
                  "linear-gradient(to right, #ef4444, #dc2626)";
            }}
          >
            <LogOut style={{ width: "1.125rem", height: "1.125rem" }} />
            {leavingRoom ? "..." : "Leave"}
          </button>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              gap: "1rem",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.5)",
              borderRadius: "0.75rem",
              padding: "1rem",
              marginBottom: "2rem",
              animation: "shake 0.5s",
            }}
          >
            <AlertCircle
              style={{
                width: "1.25rem",
                height: "1.25rem",
                color: "#ef4444",
                flexShrink: 0,
              }}
            />
            <p style={{ color: "#fca5a5" }}>{error}</p>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(40px)",
              borderRadius: "1rem",
              padding: "1.5rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              animation: "fadeIn 0.8s",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "white",
                marginBottom: "1.5rem",
              }}
            >
              📋 Room
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "0.875rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  ID
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    background: "rgba(31, 41, 55, 0.5)",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                  }}
                >
                  <p
                    style={{
                      color: "white",
                      fontSize: "0.875rem",
                      fontFamily: "monospace",
                      flex: 1,
                    }}
                  >
                    {room?.roomId}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(room?.roomId || "");
                      setCopiedMessage(true);
                      setTimeout(() => setCopiedMessage(false), 2000);
                    }}
                    style={{
                      padding: "0.5rem",
                      background: "rgba(59, 130, 246, 0.2)",
                      border: "1px solid rgba(59, 130, 246, 0.5)",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as any).style.background =
                        "rgba(59, 130, 246, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as any).style.background =
                        "rgba(59, 130, 246, 0.2)";
                    }}
                  >
                    <Copy
                      style={{
                        width: "1rem",
                        height: "1rem",
                        color: "#3b82f6",
                      }}
                    />
                  </button>
                </div>
                {copiedMessage && (
                  <p
                    style={{
                      color: "#22c55e",
                      fontSize: "0.75rem",
                      marginTop: "0.375rem",
                    }}
                  >
                    ✅ Copied!
                  </p>
                )}
              </div>
              <div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "0.875rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  Creator
                </p>
                <p style={{ color: "white", fontWeight: "600" }}>
                  {room?.creatorName}
                </p>
              </div>
              <div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "0.875rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  Players
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Users
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      color: "#3b82f6",
                    }}
                  />
                  <p style={{ color: "white" }}>
                    {room?.oppositeUserId ? "2" : "1"}/2
                  </p>
                </div>
              </div>
              <div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "0.875rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  Status
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    background: room?.oppositeUserId
                      ? "rgba(34, 197, 94, 0.1)"
                      : "rgba(245, 158, 11, 0.1)",
                    border: room?.oppositeUserId
                      ? "1px solid rgba(34, 197, 94, 0.5)"
                      : "1px solid rgba(245, 158, 11, 0.5)",
                    borderRadius: "0.375rem",
                  }}
                >
                  <div
                    style={{
                      width: "0.5rem",
                      height: "0.5rem",
                      borderRadius: "50%",
                      background: room?.oppositeUserId ? "#22c55e" : "#f59e0b",
                    }}
                  />
                  <p
                    style={{
                      color: room?.oppositeUserId ? "#86efac" : "#fcd34d",
                      fontWeight: "600",
                      fontSize: "0.875rem",
                    }}
                  >
                    {room?.oppositeUserId ? "Ready" : "Waiting"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isCreator && !room?.oppositeUserId && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(40px)",
                borderRadius: "1rem",
                padding: "1.5rem",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                animation: "fadeIn 0.8s 0.1s both",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "1.5rem",
                }}
              >
                👥 Invite
              </h2>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginBottom: "1.5rem",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  paddingBottom: "1rem",
                }}
              >
                <button
                  onClick={() => setActiveTab("userid")}
                  style={{
                    padding: "0.75rem 1rem",
                    background:
                      activeTab === "userid"
                        ? "rgba(59, 130, 246, 0.2)"
                        : "transparent",
                    color:
                      activeTab === "userid"
                        ? "#3b82f6"
                        : "rgba(255, 255, 255, 0.6)",
                    border:
                      activeTab === "userid"
                        ? "1px solid rgba(59, 130, 246, 0.5)"
                        : "none",
                    borderRadius: "0.375rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== "userid")
                      (e.target as any).style.background =
                        "rgba(255, 255, 255, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "userid")
                      (e.target as any).style.background = "transparent";
                  }}
                >
                  <User style={{ width: "1rem", height: "1rem" }} />
                  ID
                </button>
                <button
                  onClick={() => setActiveTab("email")}
                  style={{
                    padding: "0.75rem 1rem",
                    background:
                      activeTab === "email"
                        ? "rgba(59, 130, 246, 0.2)"
                        : "transparent",
                    color:
                      activeTab === "email"
                        ? "#3b82f6"
                        : "rgba(255, 255, 255, 0.6)",
                    border:
                      activeTab === "email"
                        ? "1px solid rgba(59, 130, 246, 0.5)"
                        : "none",
                    borderRadius: "0.375rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== "email")
                      (e.target as any).style.background =
                        "rgba(255, 255, 255, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "email")
                      (e.target as any).style.background = "transparent";
                  }}
                >
                  <Mail style={{ width: "1rem", height: "1rem" }} />
                  Email
                </button>
              </div>
              {activeTab === "userid" ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <input
                    type="text"
                    value={userIdInput}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setUserIdInput(e.target.value)
                    }
                    placeholder="User ID..."
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "rgba(31, 41, 55, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "0.5rem",
                      color: "white",
                      fontSize: "0.875rem",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      (e.target as any).style.borderColor =
                        "rgba(59, 130, 246, 0.5)";
                    }}
                    onBlur={(e) => {
                      (e.target as any).style.borderColor =
                        "rgba(255, 255, 255, 0.1)";
                    }}
                  />
                  <button
                    onClick={handleAddUser}
                    disabled={addingUser}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: addingUser
                        ? "rgba(59, 130, 246, 0.3)"
                        : "linear-gradient(to right, #3b82f6, #2563eb)",
                      color: "white",
                      fontWeight: "bold",
                      borderRadius: "0.5rem",
                      border: "none",
                      cursor: addingUser ? "not-allowed" : "pointer",
                      fontSize: "0.875rem",
                    }}
                    onMouseEnter={(e) => {
                      if (!addingUser)
                        (e.target as any).style.background =
                          "linear-gradient(to right, #2563eb, #1d4ed8)";
                    }}
                    onMouseLeave={(e) => {
                      if (!addingUser)
                        (e.target as any).style.background =
                          "linear-gradient(to right, #3b82f6, #2563eb)";
                    }}
                  >
                    {addingUser ? "..." : "Add"}
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setEmailInput(e.target.value)
                    }
                    placeholder="Email..."
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "rgba(31, 41, 55, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "0.5rem",
                      color: "white",
                      fontSize: "0.875rem",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      (e.target as any).style.borderColor =
                        "rgba(59, 130, 246, 0.5)";
                    }}
                    onBlur={(e) => {
                      (e.target as any).style.borderColor =
                        "rgba(255, 255, 255, 0.1)";
                    }}
                  />
                  <button
                    onClick={handleInviteByEmail}
                    disabled={invitingEmail}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: invitingEmail
                        ? "rgba(59, 130, 246, 0.3)"
                        : "linear-gradient(to right, #3b82f6, #2563eb)",
                      color: "white",
                      fontWeight: "bold",
                      borderRadius: "0.5rem",
                      border: "none",
                      cursor: invitingEmail ? "not-allowed" : "pointer",
                      fontSize: "0.875rem",
                    }}
                    onMouseEnter={(e) => {
                      if (!invitingEmail)
                        (e.target as any).style.background =
                          "linear-gradient(to right, #2563eb, #1d4ed8)";
                    }}
                    onMouseLeave={(e) => {
                      if (!invitingEmail)
                        (e.target as any).style.background =
                          "linear-gradient(to right, #3b82f6, #2563eb)";
                    }}
                  >
                    {invitingEmail ? "..." : "Invite"}
                  </button>
                </div>
              )}
            </div>
          )}

          {invitedPlayers.length > 0 && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(40px)",
                borderRadius: "1rem",
                padding: "1.5rem",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                animation: "fadeIn 0.8s 0.2s both",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "1.5rem",
                }}
              >
                👥 Players
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {invitedPlayers.map((p) => (
                  <div
                    key={p.userId || p.email}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "0.75rem 1rem",
                      background: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "0.5rem",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <div
                      style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "1.125rem",
                        flexShrink: 0,
                      }}
                    >
                      {p.name[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          color: "white",
                          fontWeight: "600",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {p.name}
                      </p>
                      <p
                        style={{
                          color: "rgba(255, 255, 255, 0.6)",
                          fontSize: "0.75rem",
                        }}
                      >
                        {p.email}
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        padding: "0.375rem 0.75rem",
                        borderRadius: "9999px",
                        background:
                          p.status === "accepted"
                            ? "rgba(34, 197, 94, 0.2)"
                            : "rgba(245, 158, 11, 0.2)",
                        border:
                          p.status === "accepted"
                            ? "1px solid rgba(34, 197, 94, 0.5)"
                            : "1px solid rgba(245, 158, 11, 0.5)",
                      }}
                    >
                      {p.status === "accepted" ? (
                        <CheckCircle2
                          style={{
                            width: "0.875rem",
                            height: "0.875rem",
                            color: "#22c55e",
                          }}
                        />
                      ) : (
                        <Clock
                          style={{
                            width: "0.875rem",
                            height: "0.875rem",
                            color: "#f59e0b",
                          }}
                        />
                      )}
                      <span
                        style={{
                          color:
                            p.status === "accepted" ? "#86efac" : "#fcd34d",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                        }}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {room?.oppositeUserId ? (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(40px)",
              borderRadius: "1rem",
              padding: "2rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              animation: "fadeIn 0.8s 0.3s both",
            }}
          >
            <SpinningWheel
              player1Name={room?.creatorName || "Player 1"}
              player2Name={room?.oppositeUserName || "Player 2"}
              isSpinning={isSpinning}
              onSpinComplete={handleSpinComplete}
              winner={winner}
              selectedWinner={selectedWinner}
              finalRotation={finalRotation}
              onStartSpin={handleStartSpin}
              onResetGame={resetGame}
              canShowStartButton={!!canShowStartButton}
              isWaitingForOpponent={hasStarted && !oppositeUserReady}
              oppositeUserReady={!!oppositeUserReady}
            />
          </div>
        ) : (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(40px)",
              borderRadius: "1rem",
              padding: "3rem 2rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              textAlign: "center",
              animation: "fadeIn 0.8s 0.3s both",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>🎮</div>
            <h2
              style={{
                fontSize: "1.875rem",
                fontWeight: "bold",
                color: "white",
                marginBottom: "0.75rem",
              }}
            >
              Waiting...
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.7)" }}>Invite someone</p>
          </div>
        )}
      </div>

      <InviteModal
        isOpen={false}
        roomId={roomId}
        token={token || ""}
        onClose={() => {}}
        onSuccess={() => fetchRoom()}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

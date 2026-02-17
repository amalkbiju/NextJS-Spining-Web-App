"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  RotateCcw,
  LogOut,
  Trophy,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SpinningWheelProps {
  player1Name: string;
  player2Name: string;
  isSpinning: boolean;
  onSpinComplete?: (winner: string) => void;
  winner?: string | null;
  selectedWinner?: string | null;
  finalRotation?: number | null;
  spinStartTime?: number | null;
  spinStartTimeRef?: React.MutableRefObject<number | null>;
  onStartSpin?: () => void;
  onResetGame?: () => void;
  canShowStartButton?: boolean;
  isWaitingForOpponent?: boolean;
  oppositeUserReady?: boolean;
  playerCount?: number;
  roomId?: string;
}

const WHEEL_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
];

export default function SpinningWheel({
  player1Name,
  player2Name,
  isSpinning,
  onSpinComplete,
  winner,
  selectedWinner,
  finalRotation,
  spinStartTime,
  spinStartTimeRef,
  onStartSpin,
  onResetGame,
  canShowStartButton = false,
  isWaitingForOpponent = false,
  oppositeUserReady = false,
  playerCount = 2,
  roomId = "Room",
}: SpinningWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const spinStartedRef = useRef(false);
  const [canvasSize, setCanvasSize] = useState(500);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        if (width < 640) {
          setCanvasSize(Math.min(280, width - 40));
        } else if (width < 1024) {
          setCanvasSize(380);
        } else {
          setCanvasSize(500);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    drawWheel();
  }, [rotation, canvasSize]);

  useEffect(() => {
    if (isSpinning && !spinStartedRef.current && selectedWinner) {
      spinStartedRef.current = true;
      spinWheel();
    } else if (!isSpinning) {
      spinStartedRef.current = false;
    }
  }, [isSpinning]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvasSize * 0.35;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const segmentCount = 2;
    const segmentAngle = 360 / segmentCount;

    // Save state before any transformations
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);

    // Draw wheel segments
    for (let i = 0; i < segmentCount; i++) {
      const startAngle = (i * segmentAngle * Math.PI) / 180;
      const endAngle = ((i + 1) * segmentAngle * Math.PI) / 180;
      const colorIndex = i % WHEEL_COLORS.length;

      ctx.fillStyle = WHEEL_COLORS[colorIndex];
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Draw player names
    ctx.font = `bold ${canvasSize > 400 ? 24 : 18}px "Segoe UI", system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";

    ctx.save();
    ctx.translate(0, -radius * 0.6);
    ctx.fillText(player1Name, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(0, radius * 0.6);
    ctx.fillText(player2Name, 0, 0);
    ctx.restore();

    // Draw center circle
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFA500";
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Restore to non-rotated state
    ctx.restore();

    // Draw outer circle border (after restore)
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw arrow pointer at top center - COMPLETELY SEPARATE FROM ROTATION
    // This ensures the arrow is ALWAYS straight
    ctx.save(); // Save clean state
    ctx.resetTransform(); // Reset all transforms

    const pointerX = centerX;
    const pointerY = 12;
    const arrowSize = 16;
    const arrowHeight = 24;

    // Arrow glow/shadow
    ctx.fillStyle = "rgba(255, 215, 0, 0.5)";
    ctx.shadowColor = "rgba(255, 215, 0, 0.8)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.beginPath();
    ctx.moveTo(pointerX, pointerY);
    ctx.lineTo(pointerX - arrowSize, pointerY + arrowHeight);
    ctx.lineTo(pointerX - arrowSize * 0.35, pointerY + arrowHeight);
    ctx.lineTo(pointerX - arrowSize * 0.35, pointerY + arrowHeight + 6);
    ctx.lineTo(pointerX + arrowSize * 0.35, pointerY + arrowHeight + 6);
    ctx.lineTo(pointerX + arrowSize * 0.35, pointerY + arrowHeight);
    ctx.lineTo(pointerX + arrowSize, pointerY + arrowHeight);
    ctx.closePath();
    ctx.fill();

    // Arrow border
    ctx.strokeStyle = "#FF6500";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    // Arrow inner gradient highlight
    const arrowGradient = ctx.createLinearGradient(
      pointerX,
      pointerY,
      pointerX,
      pointerY + arrowHeight,
    );
    arrowGradient.addColorStop(0, "#FFED4E");
    arrowGradient.addColorStop(1, "#FFD700");

    ctx.fillStyle = arrowGradient;
    ctx.shadowColor = "transparent";
    ctx.beginPath();
    ctx.moveTo(pointerX, pointerY + 2);
    ctx.lineTo(pointerX - arrowSize + 2, pointerY + arrowHeight - 2);
    ctx.lineTo(pointerX - arrowSize * 0.35 + 1, pointerY + arrowHeight - 2);
    ctx.lineTo(pointerX - arrowSize * 0.35 + 1, pointerY + arrowHeight - 2);
    ctx.lineTo(pointerX + arrowSize * 0.35 - 1, pointerY + arrowHeight - 2);
    ctx.lineTo(pointerX + arrowSize - 2, pointerY + arrowHeight - 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore(); // Restore to original state
  };

  const spinWheel = useCallback(() => {
    const spinDuration = 5000;
    const spins = 5;

    let finalRotationValue: number;

    if (finalRotation !== null && finalRotation !== undefined) {
      finalRotationValue = spins * 360 + finalRotation;
    } else {
      // The arrow points UP at 0° rotation
      // To determine which segment is under the arrow, we check what angle has the arrow pointing at it
      // When rotation = 0°, the arrow points at 90° of the wheel
      // When rotation = 45°, the arrow points at 45° of the wheel
      // When rotation = 90°, the arrow points at 0° (or 360°) of the wheel

      // Player 1 (text at top, segment 0-180°): To point arrow here, we need rotation that brings their segment to 90°
      // Player 2 (text at bottom, segment 180-360°): To point arrow here, we need rotation that brings their segment to 90°

      if (selectedWinner === player1Name) {
        // Point arrow to Player 1 (upper half)
        // Segment 0 is at 0-180°, middle at 90°, so we need rotation = 0 to point at 90°
        finalRotationValue = spins * 360 + Math.random() * 180;
      } else if (selectedWinner === player2Name) {
        // Point arrow to Player 2 (lower half)
        // Segment 1 is at 180-360°, middle at 270°, so we need rotation = 180 to point at 270°
        finalRotationValue = spins * 360 + 180 + Math.random() * 180;
      } else {
        finalRotationValue = spins * 360 + Math.random() * 360;
      }
    }

    console.log("🎡 spinWheel called", {
      spinStartTime,
      spinStartTimeRef: spinStartTimeRef?.current,
      now: Date.now(),
      finalRotationValue,
    });

    // CRITICAL SYNCHRONIZATION: Use spinStartTimeRef for immediate access
    // spinStartTimeRef is set synchronously before isSpinning state update
    const executeAnimation = () => {
      // Get spinStartTime from ref (immediate) or fallback to state
      const actualSpinStartTime = spinStartTimeRef?.current || spinStartTime;

      if (!actualSpinStartTime) {
        // If spinStartTime not available yet, wait a bit and retry
        console.log("⏳ Waiting for spinStartTime...");
        setTimeout(() => executeAnimation(), 10);
        return;
      }

      const now = Date.now();
      const delayUntilStart = Math.max(0, actualSpinStartTime - now);

      console.log("🎬 Animation starting", {
        actualSpinStartTime,
        now,
        delayUntilStart,
      });

      // Wait until the exact spinStartTime, then start animation
      setTimeout(() => {
        const animationStartTime = Date.now();

        const animate = () => {
          const now = Date.now();
          // Calculate elapsed time from when animation actually started
          const elapsed = Math.max(0, now - animationStartTime);
          const progress = Math.min(elapsed / spinDuration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const newRotation = finalRotationValue * easeOut;

          setRotation(newRotation);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            const normalizedRotation = finalRotationValue % 360;
            setRotation(normalizedRotation);

            if (onSpinComplete) {
              const winnerToShow = selectedWinner || player1Name;
              onSpinComplete(winnerToShow);
            }
          }
        };

        animate();
      }, delayUntilStart);
    };

    executeAnimation();
  }, [
    selectedWinner,
    player1Name,
    player2Name,
    onSpinComplete,
    finalRotation,
    spinStartTime,
  ]);

  const handleLeaveGame = () => {
    router.push("/home");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right, rgb(3, 7, 18) 0%, rgb(15, 23, 42) 50%, rgb(5, 15, 35) 100%)",
        color: "white",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wheelGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 50px rgba(59, 130, 246, 0.8), 0 0 100px rgba(59, 130, 246, 0.5); }
        }
        @keyframes pointerPulse {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8)); }
          50% { filter: drop-shadow(0 0 16px rgba(255, 215, 0, 1)) drop-shadow(0 0 24px rgba(255, 165, 0, 0.6)); }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .fadeIn { animation: fadeIn 0.5s ease-out; }
        .wheelGlow { animation: wheelGlow 3s ease-in-out infinite; }
        .pointerPulse { animation: pointerPulse 2s ease-in-out infinite; }
        .slideUp { animation: slideUp 0.6s ease-out; }
        .spinIcon { animation: spin 1s linear infinite; }
      `}</style>

      {/* HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background:
            "linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "1rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={() => router.push("/home")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#60A5FA",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "500",
            }}
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div style={{ textAlign: "center", flex: 1 }}>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "900",
                background: "linear-gradient(to right, #60A5FA, #3B82F6)",
                backgroundClip: "text",
                color: "transparent",
                margin: "0 0 0.25rem 0",
              }}
            >
              Spin & Win
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#9CA3AF", margin: 0 }}>
              {roomId}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#D1D5DB",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.875rem",
                fontWeight: "700",
              }}
            >
              {playerCount}
            </div>
            <span style={{ fontSize: "0.875rem" }}>Players</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main
        style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1rem" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          {/* Rotation Indicator */}
          <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {/* Selected Player */}
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.6)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#9CA3AF",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "0.75rem",
                  }}
                >
                  Arrow Pointing To
                </p>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <div style={{ fontSize: "2.5rem" }}>↙️</div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: "#3B82F6",
                          animation: "pulse 2s infinite",
                        }}
                      />
                      <p
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: "700",
                          color: "white",
                          margin: 0,
                        }}
                      >
                        {rotation % 360 < 180 ? player1Name : player2Name}
                      </p>
                    </div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#9CA3AF",
                        margin: 0,
                      }}
                    >
                      Current Player
                    </p>
                  </div>
                </div>
              </div>

              {/* Rotation Angle */}
              <div
                style={{
                  background: "rgba(30, 41, 59, 0.6)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#9CA3AF",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "0.75rem",
                  }}
                >
                  Current Rotation
                </p>
                <div
                  style={{
                    fontSize: "3.5rem",
                    fontWeight: "900",
                    background: "linear-gradient(to right, #60A5FA, #3B82F6)",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {(rotation % 360).toFixed(1)}°
                </div>
              </div>
            </div>
          </div>

          {/* WHEEL */}
          <div
            style={{
              animation: "fadeIn 0.7s ease-out",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  inset: "-2rem",
                  background:
                    "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
                  borderRadius: "50%",
                  filter: "blur(3rem)",
                  animation: "pulse 3s infinite",
                }}
              />
              <canvas
                ref={canvasRef}
                width={canvasSize}
                height={canvasSize}
                style={{
                  border: "8px solid #FBBF24",
                  borderRadius: "50%",
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                  position: "relative",
                  zIndex: 10,
                  cursor: "pointer",
                  transition: "transform 0.3s ease",
                }}
                className={winner ? "pointerPulse" : ""}
              />
            </div>
          </div>

          {/* PLAYER CARDS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
              animation: "fadeIn 0.9s ease-out",
            }}
          >
            {/* Player 1 */}
            <div
              style={{
                background: "rgba(30, 41, 59, 0.6)",
                border: winner?.includes(player1Name)
                  ? "2px solid #FBBF24"
                  : rotation % 360 < 180
                    ? "2px solid rgba(59, 130, 246, 0.6)"
                    : "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(20px)",
                borderRadius: "1rem",
                padding: "1.5rem",
                transform: winner?.includes(player1Name)
                  ? "scale(1.05)"
                  : "scale(1)",
                transition: "all 0.5s ease",
                boxShadow: winner?.includes(player1Name)
                  ? "0 20px 40px rgba(251, 191, 36, 0.3)"
                  : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(to bottom right, rgb(59, 130, 246), rgb(37, 99, 235))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                      fontWeight: "700",
                      color: "white",
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    {player1Name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#9CA3AF",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        margin: 0,
                      }}
                    >
                      Player 1
                    </p>
                    <p
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: "700",
                        color: "white",
                        margin: 0,
                      }}
                    >
                      {player1Name}
                    </p>
                  </div>
                </div>
                {winner?.includes(player1Name) && (
                  <Trophy
                    size={24}
                    color="#FCD34D"
                    style={{ animation: "bounce 2s infinite" }}
                  />
                )}
              </div>

              <div
                style={{
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  marginBottom: "1rem",
                }}
              >
                {oppositeUserReady || winner ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "#4ADE80",
                      fontWeight: "500",
                    }}
                  >
                    <CheckCircle size={20} />
                    <span>Ready</span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "#9CA3AF",
                      fontWeight: "500",
                      animation: "pulse 2s infinite",
                    }}
                  >
                    <Clock
                      size={20}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    <span>Waiting</span>
                  </div>
                )}
              </div>

              <div
                style={{
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#9CA3AF",
                    marginBottom: "0.25rem",
                  }}
                >
                  Score
                </p>
                <p
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "900",
                    color: "white",
                    margin: 0,
                  }}
                >
                  0
                </p>
              </div>

              {winner?.includes(player1Name) && (
                <div
                  style={{
                    marginTop: "1.5rem",
                    paddingTop: "1.5rem",
                    borderTop: "1px solid rgba(251, 191, 36, 0.3)",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "700",
                      color: "#FCD34D",
                      margin: 0,
                    }}
                  >
                    🏆 CHAMPION
                  </p>
                </div>
              )}
            </div>

            {/* Player 2 */}
            <div
              style={{
                background: "rgba(30, 41, 59, 0.6)",
                border: winner?.includes(player2Name)
                  ? "2px solid #FBBF24"
                  : rotation % 360 >= 180
                    ? "2px solid rgba(16, 185, 129, 0.6)"
                    : "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(20px)",
                borderRadius: "1rem",
                padding: "1.5rem",
                transform: winner?.includes(player2Name)
                  ? "scale(1.05)"
                  : "scale(1)",
                transition: "all 0.5s ease",
                boxShadow: winner?.includes(player2Name)
                  ? "0 20px 40px rgba(251, 191, 36, 0.3)"
                  : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(to bottom right, rgb(16, 185, 129), rgb(5, 150, 105))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                      fontWeight: "700",
                      color: "white",
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    {player2Name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#9CA3AF",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        margin: 0,
                      }}
                    >
                      Player 2
                    </p>
                    <p
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: "700",
                        color: "white",
                        margin: 0,
                      }}
                    >
                      {player2Name}
                    </p>
                  </div>
                </div>
                {winner?.includes(player2Name) && (
                  <Trophy
                    size={24}
                    color="#FCD34D"
                    style={{ animation: "bounce 2s infinite" }}
                  />
                )}
              </div>

              <div
                style={{
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  marginBottom: "1rem",
                }}
              >
                {oppositeUserReady || winner ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "#4ADE80",
                      fontWeight: "500",
                    }}
                  >
                    <CheckCircle size={20} />
                    <span>Ready</span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "#9CA3AF",
                      fontWeight: "500",
                      animation: "pulse 2s infinite",
                    }}
                  >
                    <Clock
                      size={20}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    <span>Waiting</span>
                  </div>
                )}
              </div>

              <div
                style={{
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#9CA3AF",
                    marginBottom: "0.25rem",
                  }}
                >
                  Score
                </p>
                <p
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "900",
                    color: "white",
                    margin: 0,
                  }}
                >
                  0
                </p>
              </div>

              {winner?.includes(player2Name) && (
                <div
                  style={{
                    marginTop: "1.5rem",
                    paddingTop: "1.5rem",
                    borderTop: "1px solid rgba(251, 191, 36, 0.3)",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "700",
                      color: "#FCD34D",
                      margin: 0,
                    }}
                  >
                    🏆 CHAMPION
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* STATUS BANNER */}
          <div style={{ animation: "fadeIn 1.1s ease-out" }}>
            {winner ? (
              <div
                style={{
                  borderRadius: "1rem",
                  padding: "2.5rem",
                  textAlign: "center",
                  border: "2px solid rgb(234, 179, 8)",
                  background: "rgba(120, 53, 15, 0.2)",
                  boxShadow: "0 20px 40px rgba(251, 191, 36, 0.3)",
                  backdropFilter: "blur(20px)",
                  animation: "slideUp 0.6s ease-out",
                }}
              >
                <p
                  style={{
                    fontSize: "2rem",
                    fontWeight: "900",
                    color: "#FCD34D",
                    margin: "0 0 0.5rem 0",
                  }}
                >
                  🏆 {winner} Wins!
                </p>
                <p
                  style={{
                    fontSize: "1rem",
                    color: "#FEF3C7",
                    fontWeight: "500",
                    margin: 0,
                  }}
                >
                  Congratulations on the victory!
                </p>
              </div>
            ) : isSpinning ? (
              <div
                style={{
                  borderRadius: "1rem",
                  padding: "2.5rem",
                  textAlign: "center",
                  border: "2px solid rgb(59, 130, 246)",
                  background: "rgba(30, 58, 138, 0.2)",
                  boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                  backdropFilter: "blur(20px)",
                  animation: "slideUp 0.6s ease-out",
                }}
              >
                <p
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    margin: 0,
                  }}
                >
                  <Zap size={24} color="#FCD34D" className="spinIcon" />
                  Game in progress! Watch the wheel...
                </p>
              </div>
            ) : isWaitingForOpponent ? (
              <div
                style={{
                  borderRadius: "1rem",
                  padding: "2.5rem",
                  textAlign: "center",
                  border: "2px solid rgb(245, 158, 11)",
                  background: "rgba(120, 53, 15, 0.2)",
                  boxShadow: "0 20px 40px rgba(245, 158, 11, 0.3)",
                  backdropFilter: "blur(20px)",
                  animation: "slideUp 0.6s ease-out",
                }}
              >
                <p
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    margin: 0,
                  }}
                >
                  <Clock size={24} color="#FCD34D" className="spinIcon" />
                  Waiting for opponent...
                </p>
              </div>
            ) : oppositeUserReady ? (
              <div
                style={{
                  borderRadius: "1rem",
                  padding: "2.5rem",
                  textAlign: "center",
                  border: "2px solid rgb(34, 197, 94)",
                  background: "rgba(20, 83, 41, 0.2)",
                  boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)",
                  backdropFilter: "blur(20px)",
                  animation: "slideUp 0.6s ease-out",
                }}
              >
                <p
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    margin: 0,
                  }}
                >
                  <CheckCircle size={24} color="#4ADE80" />
                  Both players ready! Get ready to spin!
                </p>
              </div>
            ) : null}
          </div>

          {/* BUTTONS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1rem",
              animation: "fadeIn 1.3s ease-out",
            }}
          >
            {(canShowStartButton || oppositeUserReady || winner) && (
              <button
                onClick={() =>
                  winner && onResetGame ? onResetGame() : onStartSpin?.()
                }
                disabled={isSpinning && !winner}
                style={{
                  background:
                    winner && onResetGame
                      ? "linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 100%)"
                      : "linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 100%)",
                  color: "white",
                  fontWeight: "700",
                  padding: "1rem 1.5rem",
                  borderRadius: "0.75rem",
                  border: "none",
                  cursor: isSpinning && !winner ? "not-allowed" : "pointer",
                  opacity: isSpinning && !winner ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  fontSize: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!(isSpinning && !winner)) {
                    (e.currentTarget as HTMLButtonElement).style.transform =
                      "scale(1.05)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 20px 40px rgba(59, 130, 246, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "scale(1)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "none";
                }}
              >
                {winner ? (
                  <>
                    <RotateCcw size={20} />
                    <span>Play Again</span>
                  </>
                ) : isSpinning ? (
                  <>
                    <Zap size={20} />
                    <span>Spinning...</span>
                  </>
                ) : oppositeUserReady && !canShowStartButton ? (
                  <>
                    <Zap size={20} />
                    <span>Spin Now!</span>
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    <span>Spin Now</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setShowLeaveConfirm(true)}
              style={{
                background: "rgba(107, 114, 128, 0.8)",
                color: "white",
                fontWeight: "700",
                padding: "1rem 1.5rem",
                borderRadius: "0.75rem",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                fontSize: "1rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "scale(1.05)";
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(107, 114, 128, 1)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 15px 30px rgba(0, 0, 0, 0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "scale(1)";
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(107, 114, 128, 0.8)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              <LogOut size={20} />
              <span>Leave Game</span>
            </button>
          </div>
        </div>
      </main>

      {/* LEAVE CONFIRMATION MODAL */}
      {showLeaveConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <div
            style={{
              background: "rgba(30, 41, 59, 0.9)",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(20px)",
              borderRadius: "1rem",
              padding: "2rem",
              maxWidth: "400px",
              width: "100%",
              animation: "slideUp 0.3s ease-out",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "white",
                marginBottom: "1rem",
                margin: 0,
              }}
            >
              Leave Game?
            </h2>
            <p
              style={{
                color: "#D1D5DB",
                marginBottom: "1.5rem",
                margin: "0 0 1.5rem 0",
              }}
            >
              Are you sure you want to leave this game? This action cannot be
              undone.
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setShowLeaveConfirm(false)}
                style={{
                  flex: 1,
                  background: "rgba(107, 114, 128, 0.8)",
                  color: "white",
                  fontWeight: "700",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(107, 114, 128, 1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(107, 114, 128, 0.8)";
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveGame}
                style={{
                  flex: 1,
                  background:
                    "linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 100%)",
                  color: "white",
                  fontWeight: "700",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "scale(1)";
                }}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

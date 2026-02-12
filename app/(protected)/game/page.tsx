"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Trophy,
  Zap,
  Loader2,
  Volume2,
  VolumeX,
} from "lucide-react";

interface Player {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  isCurrentPlayer: boolean;
  isCurrentTurn: boolean;
}

interface GameState {
  round: number;
  totalRounds: number;
  players: Player[];
  gameStatus: "idle" | "spinning" | "finished";
  winner?: string;
}

const WHEEL_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#FFA502", // Orange
  "#9B59B6", // Purple
  "#1ABC9C", // Turquoise
];

export default function SpinningWheelGamePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    round: 1,
    totalRounds: 5,
    players: [
      {
        id: "1",
        name: "You",
        score: 250,
        isCurrentPlayer: true,
        isCurrentTurn: true,
      },
      {
        id: "2",
        name: "Opponent",
        score: 180,
        isCurrentPlayer: false,
        isCurrentTurn: false,
      },
    ],
    gameStatus: "idle",
  });

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [resultCard, setResultCard] = useState<{
    visible: boolean;
    winner: string;
    points: number;
  }>({
    visible: false,
    winner: "",
    points: 0,
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [canvasSize, setCanvasSize] = useState(400);

  // Responsive canvas sizing
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        if (width < 640) {
          setCanvasSize(Math.min(300, width - 40));
        } else if (width < 1024) {
          setCanvasSize(350);
        } else {
          setCanvasSize(400);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Draw spinning wheel
  const drawWheel = useCallback(
    (currentRotation: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) * 0.85;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save context state
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((currentRotation * Math.PI) / 180);

      // Draw wheel segments
      const segmentAngle = 360 / gameState.players.length;

      gameState.players.forEach((player, index) => {
        // Draw segment
        ctx.fillStyle = WHEEL_COLORS[index % WHEEL_COLORS.length];
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, (segmentAngle * Math.PI) / 180);
        ctx.lineTo(0, 0);
        ctx.fill();

        // Draw segment border
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw player name in segment
        ctx.save();
        ctx.rotate((segmentAngle * Math.PI) / 360);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 16px Inter, sans-serif";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(player.name, radius * 0.7, 0);
        ctx.restore();

        ctx.rotate((segmentAngle * Math.PI) / 180);
      });

      // Draw golden border
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw inner circle (golden glow)
      ctx.shadowColor = "rgba(255, 215, 0, 0.5)";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
      ctx.fill();

      ctx.restore();

      // Draw pointer at top
      ctx.fillStyle = "#FFD700";
      ctx.shadowColor = "rgba(255, 215, 0, 0.6)";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius - 25);
      ctx.lineTo(centerX - 15, centerY - radius);
      ctx.lineTo(centerX + 15, centerY - radius);
      ctx.closePath();
      ctx.fill();
    },
    [gameState.players.length],
  );

  // Animation loop
  useEffect(() => {
    drawWheel(rotation);
  }, [rotation, drawWheel]);

  // Handle spin animation
  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    const spinDuration = 3500; // 3.5 seconds
    const totalRotation = 360 * 5 + Math.random() * 360; // 5+ full rotations
    const startTime = Date.now();
    const startRotation = rotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Easing function (ease-out cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + totalRotation * easeProgress;

      setRotation(currentRotation % 360);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Spin complete
        setIsSpinning(false);

        // Determine winner
        const normalizedRotation = (360 - (currentRotation % 360)) % 360;
        const segmentAngle = 360 / gameState.players.length;
        const winnerIndex =
          Math.floor(normalizedRotation / segmentAngle) %
          gameState.players.length;
        const winner = gameState.players[winnerIndex];

        // Show result card
        setResultCard({
          visible: true,
          winner: winner.name,
          points: 10,
        });

        if (!isMuted) {
          playWinSound();
        }

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const playWinSound = () => {
    try {
      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Audio context not available
    }
  };

  // Confetti animation
  const ConfettiPiece = ({
    delay,
    duration,
  }: {
    delay: number;
    duration: number;
  }) => (
    <div
      className="fixed pointer-events-none"
      style={{
        left: Math.random() * 100 + "%",
        top: "-10px",
        animation: `fall ${duration}s linear ${delay}s forwards`,
      }}
    >
      <div className="text-2xl">
        {["🎉", "🏆", "⭐", "✨", "🎊"][Math.floor(Math.random() * 5)]}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Confetti */}
      {showConfetti &&
        Array.from({ length: 20 }).map((_, i) => (
          <ConfettiPiece
            key={i}
            delay={Math.random() * 0.2}
            duration={2 + Math.random() * 1}
          />
        ))}

      {/* Header */}
      <header className="relative z-10 backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Spin & Win</h1>
                <p className="text-sm text-gray-400">
                  Round {gameState.round} of {gameState.totalRounds}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Users className="w-4 h-4" />
                <span className="font-semibold">
                  {gameState.players.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Player Info */}
          <div className="space-y-6">
            {/* Current Player Card */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl font-bold">
                  {gameState.players[0]?.name?.[0] || "U"}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    {gameState.players[0]?.name}
                  </h3>
                  {gameState.players[0]?.isCurrentTurn && (
                    <span className="inline-block mt-1 px-3 py-1 bg-blue-500/30 border border-blue-400/50 rounded-full text-xs font-semibold text-blue-300">
                      Your Turn
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Score</span>
                  <span className="font-bold text-xl text-yellow-400">
                    {gameState.players[0]?.score}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all"
                    style={{
                      width: `${(gameState.players[0]?.score / 300) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Other Players */}
            {gameState.players.slice(1).map((player) => (
              <div
                key={player.id}
                className={`backdrop-blur-md border rounded-2xl p-4 transition-all ${
                  player.isCurrentTurn
                    ? "bg-blue-500/20 border-blue-400/50"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-sm font-bold">
                      {player.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{player.name}</p>
                      <p className="text-xs text-gray-400">
                        {player.score} pts
                      </p>
                    </div>
                  </div>
                  {player.isCurrentTurn && (
                    <Zap className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Center - Spinning Wheel */}
          <div className="flex flex-col items-center justify-center gap-8">
            {/* Game Info Card */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-4 w-full max-w-xs">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Status</span>
                  <span className="px-3 py-1 bg-green-500/20 border border-green-400/50 rounded-full text-xs font-semibold text-green-300">
                    In Progress
                  </span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Players in Game</span>
                  <div className="flex -space-x-2">
                    {gameState.players.map((p, i) => (
                      <div
                        key={p.id}
                        className="w-6 h-6 rounded-full bg-gradient-to-br border border-white/20"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${WHEEL_COLORS[i % WHEEL_COLORS.length]}, ${WHEEL_COLORS[(i + 1) % WHEEL_COLORS.length]})`,
                        }}
                        title={p.name}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Spinning Wheel Canvas */}
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-50 animate-pulse"
                style={{
                  background: `linear-gradient(135deg, ${WHEEL_COLORS[0]}, ${WHEEL_COLORS[3]})`,
                }}
              ></div>
              <canvas
                ref={canvasRef}
                width={canvasSize}
                height={canvasSize}
                className="relative rounded-full shadow-2xl"
              />
            </div>

            {/* Spin Button */}
            <button
              onClick={spinWheel}
              disabled={isSpinning}
              className={`relative px-8 py-4 rounded-xl font-bold text-lg transition-all transform ${
                isSpinning
                  ? "bg-gray-600 cursor-not-allowed scale-95"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/50"
              }`}
            >
              {isSpinning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                  Spinning...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 inline mr-2" />
                  Spin the Wheel
                </>
              )}
            </button>
          </div>

          {/* Right Sidebar - Leaderboard */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Leaderboard
            </h2>

            {gameState.players
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div
                  key={player.id}
                  className={`backdrop-blur-md border rounded-xl p-4 transition-all ${
                    player.isCurrentPlayer
                      ? "bg-gradient-to-r from-yellow-500/20 to-yellow-400/10 border-yellow-400/50"
                      : player.isCurrentTurn
                        ? "bg-blue-500/20 border-blue-400/50"
                        : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{player.name}</p>
                      <p className="text-xs text-gray-400">
                        {player.isCurrentPlayer ? "You" : "Opponent"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-yellow-400">
                        {player.score}
                      </p>
                      <p className="text-xs text-gray-400">points</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>

      {/* Result Card */}
      {resultCard.visible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
          <div
            className="backdrop-blur-md bg-gradient-to-t from-gray-900 to-gray-800/50 border border-white/20 rounded-t-3xl p-8 max-w-md w-full animate-in slide-in-from-bottom-10 duration-500"
            style={{
              pointerEvents: "auto",
            }}
          >
            <div className="text-center space-y-4">
              <div className="text-6xl animate-bounce">🏆</div>
              <h3 className="text-2xl font-bold">{resultCard.winner} Wins!</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-yellow-400">
                  +{resultCard.points}
                </span>
                <span className="text-gray-400">Points</span>
              </div>
              <button
                onClick={() => setResultCard({ ...resultCard, visible: false })}
                className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-600 transition-all"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for confetti animation */}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

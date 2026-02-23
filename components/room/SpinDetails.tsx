"use client";

import { Clock, Coins } from "lucide-react";

interface SpinDetailsProps {
  spinStartTime?: number | null;
  spinDuration?: number;
  creatorName: string;
  creatorEntryPrice: number;
  oppositeUserName?: string | null;
  oppositeUserEntryPrice?: number | null;
  totalPrizePool: number;
}

export default function SpinDetails({
  spinStartTime,
  spinDuration = 5000,
  creatorName,
  creatorEntryPrice,
  oppositeUserName,
  oppositeUserEntryPrice,
  totalPrizePool,
}: SpinDetailsProps) {
  const calculateTimeElapsed = () => {
    if (!spinStartTime) return 0;
    const elapsed = Date.now() - spinStartTime;
    return Math.max(0, Math.min(elapsed, spinDuration || 5000));
  };

  const elapsedTime = calculateTimeElapsed();
  const durationSeconds = (spinDuration || 5000) / 1000;
  const elapsedSeconds = elapsedTime / 1000;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1.5rem",
        padding: "2rem",
        background:
          "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.1))",
        borderRadius: "1rem",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Spin Timer */}
      {spinStartTime && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem",
            background: "rgba(31, 41, 55, 0.5)",
            borderRadius: "0.75rem",
            border: "1px solid rgba(59, 130, 246, 0.3)",
          }}
        >
          <Clock
            style={{
              width: "1.5rem",
              height: "1.5rem",
              color: "#3b82f6",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.875rem",
                fontWeight: "600",
                margin: 0,
                marginBottom: "0.25rem",
              }}
            >
              SPIN TIME
            </p>
            <p
              style={{
                color: "#3b82f6",
                fontSize: "1.5rem",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              {elapsedSeconds.toFixed(1)}s / {durationSeconds.toFixed(1)}s
            </p>
          </div>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(59, 130, 246, 0.2)",
              border: "3px solid #3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <svg
              style={{
                width: "100%",
                height: "100%",
                transform: "rotate(-90deg)",
              }}
            >
              <circle
                cx="30"
                cy="30"
                r="27"
                fill="none"
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="3"
              />
              <circle
                cx="30"
                cy="30"
                r="27"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray={`${
                  (elapsedTime / (spinDuration || 5000)) * 169.65
                } 169.65`}
                style={{ transition: "stroke-dasharray 0.1s linear" }}
              />
            </svg>
            <span
              style={{
                position: "absolute",
                color: "#3b82f6",
                fontWeight: "bold",
                fontSize: "0.75rem",
              }}
            >
              {Math.round((elapsedTime / (spinDuration || 5000)) * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Creator Entry Fee */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem",
          background: "rgba(31, 41, 55, 0.5)",
          borderRadius: "0.75rem",
          border: "1px solid rgba(249, 158, 11, 0.3)",
        }}
      >
        <Coins
          style={{
            width: "1.5rem",
            height: "1.5rem",
            color: "#fbbf24",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.875rem",
              fontWeight: "600",
              margin: 0,
              marginBottom: "0.25rem",
            }}
          >
            {creatorName}'S ENTRY
          </p>
          <p
            style={{
              color: "#fbbf24",
              fontSize: "1.5rem",
              fontWeight: "bold",
              margin: 0,
            }}
          >
            {creatorEntryPrice.toLocaleString()} Credits
          </p>
        </div>
      </div>

      {/* Opponent Entry Fee (if available) */}
      {oppositeUserName && oppositeUserEntryPrice && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem",
            background: "rgba(31, 41, 55, 0.5)",
            borderRadius: "0.75rem",
            border: "1px solid rgba(34, 197, 94, 0.3)",
          }}
        >
          <Coins
            style={{
              width: "1.5rem",
              height: "1.5rem",
              color: "#22c55e",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.875rem",
                fontWeight: "600",
                margin: 0,
                marginBottom: "0.25rem",
              }}
            >
              {oppositeUserName}'S ENTRY
            </p>
            <p
              style={{
                color: "#22c55e",
                fontSize: "1.5rem",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              {oppositeUserEntryPrice.toLocaleString()} Credits
            </p>
          </div>
        </div>
      )}

      {/* Total Prize Pool */}
      {totalPrizePool > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem",
            background:
              "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))",
            borderRadius: "0.75rem",
            border: "1px solid rgba(168, 85, 247, 0.4)",
          }}
        >
          <div
            style={{
              width: "1.5rem",
              height: "1.5rem",
              background: "linear-gradient(135deg, #a855f7, #ec4899)",
              borderRadius: "50%",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.875rem",
                fontWeight: "600",
                margin: 0,
                marginBottom: "0.25rem",
              }}
            >
              TOTAL PRIZE POOL
            </p>
            <p
              style={{
                background: "linear-gradient(to right, #a855f7, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "1.5rem",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              {totalPrizePool.toLocaleString()} Credits
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

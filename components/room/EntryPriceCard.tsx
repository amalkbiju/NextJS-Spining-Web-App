"use client";

interface EntryPriceCardProps {
  entryPrice: number;
  rewards?: {
    icon: string;
    amount: number;
    label: string;
  }[];
}

export default function EntryPriceCard({
  entryPrice,
  rewards = [
    { icon: "🪙", amount: entryPrice * 4, label: "Coins" },
    { icon: "🏆", amount: 3, label: "Points" },
    { icon: "⭐", amount: entryPrice / 10, label: "Bonus" },
    { icon: "💫", amount: 200, label: "Extra" },
  ],
}: EntryPriceCardProps) {
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(180, 83, 9, 0.3), rgba(217, 119, 6, 0.2))",
        backdropFilter: "blur(40px)",
        borderRadius: "1rem",
        padding: "1.5rem",
        border: "1px solid rgba(249, 158, 11, 0.3)",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: "bold",
            color: "#fbbf24",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          🎯 Game Mode
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "0.5rem",
                height: "0.5rem",
                background: "#fbbf24",
                borderRadius: "50%",
              }}
            />
          ))}
        </div>
      </div>

      {/* Rewards Section */}
      <div
        style={{
          background: "rgba(31, 41, 55, 0.5)",
          borderRadius: "0.75rem",
          padding: "1rem",
          marginBottom: "1rem",
          border: "1px solid rgba(249, 158, 11, 0.2)",
        }}
      >
        <p
          style={{
            color: "#f59e0b",
            fontSize: "0.875rem",
            fontWeight: "600",
            marginBottom: "0.75rem",
          }}
        >
          Rewards
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0.5rem",
          }}
        >
          {rewards.map((reward, idx) => (
            <div
              key={idx}
              style={{
                textAlign: "center",
                padding: "0.75rem 0.5rem",
                background: "rgba(0, 0, 0, 0.3)",
                borderRadius: "0.5rem",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
                {reward.icon}
              </div>
              <p
                style={{
                  color: "#fbbf24",
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                }}
              >
                +{Math.round(reward.amount)}
              </p>
              <p style={{ color: "#9ca3af", fontSize: "0.625rem" }}>
                {reward.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div
        style={{
          background: "rgba(31, 41, 55, 0.3)",
          borderRadius: "0.5rem",
          padding: "0.75rem 1rem",
          marginBottom: "1rem",
          borderLeft: "3px solid #fbbf24",
        }}
      >
        <p
          style={{ color: "#d1d5db", fontSize: "0.875rem", lineHeight: "1.5" }}
        >
          📌 Join the leaderboard for this striker.
        </p>
      </div>

      {/* Entry Fee */}
      <div
        style={{
          background: "rgba(107, 114, 128, 0.3)",
          borderRadius: "0.75rem",
          padding: "1rem",
          marginBottom: "1rem",
          textAlign: "center",
          border: "1px solid rgba(249, 158, 11, 0.3)",
        }}
      >
        <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.875rem" }}>
          Entry Fee
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "0.5rem",
          }}
        >
          <span
            style={{ fontSize: "2rem", fontWeight: "bold", color: "#fbbf24" }}
          >
            {entryPrice}
          </span>
          <span style={{ fontSize: "1.5rem" }}>🪙</span>
        </div>
      </div>

      {/* Status Badge */}
      <button
        style={{
          width: "100%",
          padding: "0.75rem",
          background: "linear-gradient(to right, #fbbf24, #f59e0b)",
          color: "#111827",
          fontWeight: "bold",
          borderRadius: "0.5rem",
          border: "none",
          cursor: "pointer",
          transition: "all 0.3s ease",
          fontSize: "0.875rem",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.transform = "scale(1.02)";
          (e.target as HTMLButtonElement).style.boxShadow =
            "0 10px 15px -3px rgba(251, 191, 36, 0.3)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.transform = "scale(1)";
          (e.target as HTMLButtonElement).style.boxShadow = "none";
        }}
      >
        🎮 Get Ready to Play
      </button>
    </div>
  );
}

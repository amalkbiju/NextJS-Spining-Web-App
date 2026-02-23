"use client";

import { useState } from "react";

interface EntryPriceSelectorProps {
  onSelect: (price: number) => void;
  onCancel: () => void;
}

const ENTRY_PRICES = [
  { price: 100, color: "#fbbf24", icon: "🥈" },
  { price: 200, color: "#d4af37", icon: "🏆" },
  { price: 500, color: "#c0c0c0", icon: "💎" },
  { price: 1000, color: "#ff6b6b", icon: "👑" },
];

export default function EntryPriceSelector({
  onSelect,
  onCancel,
}: EntryPriceSelectorProps) {
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelect = async (price: number) => {
    setSelectedPrice(price);
    setIsSelecting(true);

    // Simulate selection delay
    setTimeout(() => {
      onSelect(price);
    }, 300);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        backdropFilter: "blur(10px)",
        animation: "fadeIn 0.3s ease-out",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1f2937, #111827)",
          borderRadius: "1.5rem",
          padding: "2.5rem",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          maxWidth: "600px",
          width: "90%",
          animation: "slideUp 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: "1.875rem",
            fontWeight: "bold",
            color: "white",
            marginBottom: "0.5rem",
            textAlign: "center",
          }}
        >
          💰 Select Entry Price
        </h2>
        <p
          style={{
            color: "#9ca3af",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          Choose the entry fee for this room
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {ENTRY_PRICES.map(({ price, color, icon }) => (
            <button
              key={price}
              onClick={() => handleSelect(price)}
              disabled={isSelecting && selectedPrice !== price}
              style={{
                position: "relative",
                padding: "1px",
                borderRadius: "1rem",
                background: `linear-gradient(135deg, ${color}, ${color}99)`,
                border: "none",
                cursor:
                  isSelecting && selectedPrice !== price
                    ? "not-allowed"
                    : "pointer",
                transition: "all 0.3s ease",
                transform: selectedPrice === price ? "scale(1.05)" : "scale(1)",
                opacity: isSelecting && selectedPrice !== price ? 0.3 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSelecting || selectedPrice === price) {
                  (e.target as HTMLButtonElement).style.transform =
                    "scale(1.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPrice === price) {
                  (e.target as HTMLButtonElement).style.transform =
                    "scale(1.05)";
                } else {
                  (e.target as HTMLButtonElement).style.transform = "scale(1)";
                }
              }}
            >
              <div
                style={{
                  background: "#111827",
                  borderRadius: "1rem",
                  padding: "1.5rem 1rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div style={{ fontSize: "2rem" }}>{icon}</div>
                <div
                  style={{
                    color: color,
                    fontWeight: "bold",
                    fontSize: "1.25rem",
                  }}
                >
                  {price}
                </div>
                <div style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
                  Coins
                </div>
              </div>
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
          }}
        >
          <button
            onClick={onCancel}
            disabled={isSelecting}
            style={{
              flex: 1,
              padding: "0.875rem 1.5rem",
              background: "rgba(107, 114, 128, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "white",
              fontWeight: "bold",
              borderRadius: "0.75rem",
              cursor: isSelecting ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              opacity: isSelecting ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isSelecting) {
                (e.target as HTMLButtonElement).style.background =
                  "rgba(107, 114, 128, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelecting) {
                (e.target as HTMLButtonElement).style.background =
                  "rgba(107, 114, 128, 0.2)";
              }
            }}
          >
            Cancel
          </button>
          <button
            disabled={selectedPrice === null || isSelecting}
            style={{
              flex: 1,
              padding: "0.875rem 1.5rem",
              background: "linear-gradient(to right, #3b82f6, #2563eb)",
              border: "none",
              color: "white",
              fontWeight: "bold",
              borderRadius: "0.75rem",
              cursor:
                selectedPrice === null || isSelecting
                  ? "not-allowed"
                  : "pointer",
              transition: "all 0.3s ease",
              opacity: selectedPrice === null || isSelecting ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (selectedPrice !== null && !isSelecting) {
                (e.target as HTMLButtonElement).style.background =
                  "linear-gradient(to right, #2563eb, #1d4ed8)";
                (e.target as HTMLButtonElement).style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedPrice !== null && !isSelecting) {
                (e.target as HTMLButtonElement).style.background =
                  "linear-gradient(to right, #3b82f6, #2563eb)";
                (e.target as HTMLButtonElement).style.transform = "scale(1)";
              }
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

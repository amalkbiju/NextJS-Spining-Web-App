"use client";

import { User as UserIcon, LogOut, Coins } from "lucide-react";

interface UserHeaderProps {
  userName: string;
  userEmail: string;
  credits: number;
  onLogout: () => void;
}

export default function UserHeader({
  userName,
  userEmail,
  credits,
  onLogout,
}: UserHeaderProps) {
  return (
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
        {/* Left Side - Title */}
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
              {userName}
            </span>
            !
          </p>
        </div>

        {/* Center - Credits Display */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem 1.5rem",
            background:
              "linear-gradient(135deg, rgba(249, 158, 11, 0.2), rgba(217, 119, 6, 0.2))",
            borderRadius: "0.75rem",
            border: "1px solid rgba(249, 158, 11, 0.4)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Coins
            style={{
              width: "1.5rem",
              height: "1.5rem",
              color: "#fbbf24",
            }}
          />
          <div>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.75rem",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: 0,
              }}
            >
              Available Credits
            </p>
            <p
              style={{
                color: "#fbbf24",
                fontSize: "1.5rem",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              {credits.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Right Side - User Info and Logout */}
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
            <UserIcon
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
              {userEmail}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
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
              (e.target as HTMLButtonElement).style.transform = "scale(1.05)";
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
  );
}

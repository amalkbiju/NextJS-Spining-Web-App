"use client";

import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right, #111827, #1f2937, #111827)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Elements */}
      <div
        style={{
          position: "absolute",
          top: "-16rem",
          right: "-16rem",
          width: "24rem",
          height: "24rem",
          background: "rgba(37, 99, 235, 0.2)",
          borderRadius: "50%",
          filter: "blur(60px)",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: "-16rem",
          left: "-16rem",
          width: "24rem",
          height: "24rem",
          background: "rgba(59, 130, 246, 0.2)",
          borderRadius: "50%",
          filter: "blur(60px)",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          animationDelay: "2s",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "24rem",
          height: "24rem",
          background: "rgba(99, 102, 241, 0.1)",
          borderRadius: "50%",
          filter: "blur(60px)",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          animationDelay: "4s",
          pointerEvents: "none",
        }}
      ></div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <RegisterForm />
      </div>

      {/* Decorative Bottom Gradient */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "8rem",
          background: "linear-gradient(to top, #111827, transparent)",
          pointerEvents: "none",
        }}
      ></div>
    </div>
  );
}
